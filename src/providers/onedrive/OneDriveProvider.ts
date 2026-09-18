import type {
  AuthState,
  ListOptions,
  ListResult,
  ProviderSetupInfo,
  ResolvedAsset,
  StorageItem,
  StorageProvider,
  UploadProgress,
} from '../../types';
import { generateCodeChallenge, generateCodeVerifier, randomState, runPopupAuth } from '../pkce';
import { guessAssetType } from '../../utils/assetType';
import { OWN_SCRIPT_URL } from '../ownScript';
import { GcaError } from '../../i18n/errors';

// `common` — единственный tenant, под которым принимаются и обычные
// личные Microsoft-аккаунты (личный OneDrive), и рабочие/учебные —
// именно это нужно плагину, который не знает заранее, какой аккаунт
// будет у владельца сайта.
const AUTHORIZE_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH_URL = 'https://graph.microsoft.com/v1.0';
const APP_REGISTRATIONS_URL = 'https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps';
const CLIENT_ID_STORAGE_SUFFIX = '_client_id';
// Files.ReadWrite — читать/писать СВОИ файлы пользователя, без
// admin consent ни для личных, ни для рабочих аккаунтов (в отличие
// от *.All-версий) — ровно то, что нужно браузеру файлов + загрузке.
// offline_access — иначе токен endpoint не вернёт refresh_token.
const SCOPE = 'Files.ReadWrite offline_access';

export interface OneDriveProviderOptions {
  /**
   * Полный URL `public/microsoft-callback.html`, зарегистрированный
   * в Azure как Redirect URI (платформа — Single-page application,
   * см. `getSetupInfo()`). Необязательно — по умолчанию вычисляется
   * из расположения самого скрипта плагина, как и у DropboxProvider
   * (см. комментарий в `ownScript.ts`). Передайте явно при ESM/
   * бандлерной сборке, где автоопределение не работает.
   */
  redirectUri?: string;
  /** Ключ в localStorage — поменяйте, если на странице несколько инстансов плагина. */
  storageKey?: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
}

interface GraphThumbnailSet {
  small?: { url: string };
  medium?: { url: string };
  large?: { url: string };
}

/**
 * "Ярлык" на файл/папку из чужого OneDrive/SharePoint, добавленный
 * через "Добавить ярлык в OneDrive" — физически лежит в ДРУГОМ
 * drive, поэтому его содержимое нельзя получить обычным запросом
 * к /me/drive/items/{id}: нужно идти в /drives/{driveId}/items/{id}
 * этого remoteItem (см. resolve()).
 */
interface GraphRemoteItem {
  id: string;
  file?: { mimeType?: string };
  folder?: { childCount?: number };
  parentReference?: { driveId?: string };
  webUrl?: string;
}

interface GraphDriveItem {
  id: string;
  name: string;
  size?: number;
  lastModifiedDateTime?: string;
  file?: { mimeType?: string };
  folder?: { childCount?: number };
  thumbnails?: GraphThumbnailSet[];
  remoteItem?: GraphRemoteItem;
  /** Ссылка на просмотр элемента в office.com/OneDrive-вебе — для контекстного меню "Открыть в отдельной вкладке". */
  webUrl?: string;
  '@microsoft.graph.downloadUrl'?: string;
  /**
   * Обходной путь для конкретного диагностированного случая (см. п.15
   * истории проекта): у файла с facet'ом `shared` (личный OneDrive,
   * элемент расшарен самим владельцем) `@microsoft.graph.downloadUrl`
   * стабильно отсутствовал даже после ретраев, хотя `file`-facet и
   * хеши контента присутствовали (не гонка, не malware/package —
   * все эти причины были продиагностированы и исключены). Это
   * совпадает с задокументированным на Microsoft Q&A поведением:
   * аннотационное свойство `@microsoft.graph.downloadUrl` в `$select`
   * ненадёжно именно для расшаренных элементов, а РАБОЧАЯ (хоть и не
   * описанная в официальной REST-документации) альтернатива —
   * запросить вложенное свойство `content.downloadUrl` тем же
   * `$select` — оно возвращается как `{ content: { downloadUrl } }`.
   * НЕ официально документировано Microsoft — используется только как
   * fallback, ПОСЛЕ основного `@microsoft.graph.downloadUrl` и после
   * ретраев, а не вместо него.
   */
  content?: { downloadUrl?: string };
  // Ниже — только диагностические facet'ы, запрашиваемые ДОПОЛНИТЕЛЬНО
  // в resolve() (см. DIAGNOSTIC_SELECT_FIELDS), но не в list()/search():
  // сами по себе они на логику не влияют, только логируются в
  // console.error при ошибке downloadUrlUnavailable/noDownloadableContent,
  // чтобы при следующем таком случае не гадать вслепую, а увидеть
  // реальную причину (see resolve()).
  /** "OneNote"/"oneDrive" и т.п. — если есть, элемент точно НЕ обычный файл, даже если `file` тоже присутствует. */
  package?: { type?: string };
  /** Присутствует, если Graph считает файл заражённым/подозрительным — тогда скачивание блокируется намеренно. */
  malware?: { description?: string };
  /** Есть, если элемент — ярлык/доступ "Поделились со мной" (не то же самое, что `remoteItem` — тот именно "Добавить ярлык в OneDrive"). */
  shared?: { scope?: string; owner?: unknown };
  parentReference?: { driveId?: string; driveType?: string };
}

const SELECT_FIELDS = 'id,name,size,lastModifiedDateTime,file,folder,remoteItem,webUrl';

interface GraphChildrenResponse {
  value: GraphDriveItem[];
  '@odata.nextLink'?: string;
}

/**
 * `@microsoft.graph.downloadUrl` — основной, документированный
 * источник ссылки; `content.downloadUrl` — недокументированный,
 * но эмпирически рабочий fallback именно для случая, который
 * `@microsoft.graph.downloadUrl` не покрывает (см. комментарий у
 * `GraphDriveItem.content`). Централизовано в одну функцию, чтобы
 * и основной путь в `resolve()`, и условие остановки ретраев в
 * `fetchItemMetadataWithRetry()` не могли рассинхронизироваться —
 * иначе легко получить баг "перестал ретраить, потому что
 * @microsoft.graph.downloadUrl пуст, хотя content.downloadUrl уже
 * пришёл", то есть лишний ретрай ради поля, которое проверяется
 * дальше в другом месте.
 */
function extractDownloadUrl(json: GraphDriveItem): string | undefined {
  return json['@microsoft.graph.downloadUrl'] ?? json.content?.downloadUrl;
}

function defaultRedirectUri(): string | null {
  if (!OWN_SCRIPT_URL) return null;
  // .../dist/grapesjs-cloud-assets.umd.cjs → .../public/microsoft-callback.html
  return OWN_SCRIPT_URL.replace(/\/dist\/[^/]*$/, '/public/microsoft-callback.html');
}

/**
 * Реализация StorageProvider для OneDrive через Microsoft Graph API
 * (архитектурно почти копия DropboxProvider — тот же PKCE-попап без
 * client secret, см. `providers/pkce.ts`, и тот же одноразовый App
 * Key-стиль настройки). Ключевое отличие от Dropbox: в Azure Portal
 * redirect URI ОБЯЗАТЕЛЬНО регистрируется под платформой
 * "Single-page application", а не "Web" — только у SPA-платформы
 * включён CORS на /token endpoint, иначе browser fetch() до обмена
 * code→token не достучится (см. `getSetupInfo()` и README).
 *
 * Приятная особенность Graph API по сравнению и с Dropbox, и с
 * Google Drive: `?$expand=thumbnails` отдаёт превью сразу в том же
 * запросе списка папки (см. `list()`) — не нужен отдельный batch-
 * запрос, как у Dropbox, и не нужен per-файл авторизованный fetch,
 * как у Google. И `@microsoft.graph.downloadUrl` — уже готовая,
 * преавторизованная прямая ссылка (аналог `get_temporary_link` у
 * Dropbox), которую можно вставлять в `<img src>` без заголовка
 * Authorization — так что `resolve()` тоже не сложнее Dropbox.
 */
export class OneDriveProvider implements StorageProvider {
  readonly id = 'onedrive';
  readonly label = 'OneDrive';
  readonly icon =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 17.5a4 4 0 0 1-.6-7.96 5 5 0 0 1 9.62-1.9 4.25 4.25 0 0 1 .98 8.36c-.15.02-.3.03-.46.03H8c-.17 0-.34-.01-.5-.03Z"/></svg>';

  private readonly storageKey: string;
  private readonly redirectUri: string | null;
  private clientId: string | null;
  private tokens: StoredTokens | null = null;

  constructor(options: OneDriveProviderOptions = {}) {
    this.storageKey = options.storageKey ?? 'gca_onedrive_tokens';
    this.redirectUri = options.redirectUri ?? defaultRedirectUri();
    this.clientId = this.readClientId();
    this.tokens = this.readTokens();
  }

  // ------------------------------------------------------------------
  // Настройка (Application ID) и Auth
  // ------------------------------------------------------------------

  getAuthState(): AuthState {
    return {
      configured: !!this.clientId,
      authenticated: !!this.clientId && !!this.tokens && this.tokens.expiresAt > Date.now() - 5 * 60 * 1000,
    };
  }

  getSetupInfo(): ProviderSetupInfo {
    return {
      createAppUrl: APP_REGISTRATIONS_URL,
      credentialLabelKey: 'setup.applicationIdPlaceholder',
      steps: [
        { i18nKey: 'microsoft.setup.step1' },
        { i18nKey: 'microsoft.setup.step2' },
        { i18nKey: 'microsoft.setup.step3' },
        this.redirectUri
          ? { i18nKey: 'microsoft.setup.step4WithRedirect', copyValue: this.redirectUri }
          : { i18nKey: 'microsoft.setup.step4NoRedirect' },
        { i18nKey: 'microsoft.setup.step5' },
      ],
    };
  }

  setCredential(value: string): void {
    const trimmed = value.trim();
    this.clientId = trimmed || null;
    try {
      if (this.clientId) {
        localStorage.setItem(this.clientIdStorageKey, this.clientId);
      } else {
        localStorage.removeItem(this.clientIdStorageKey);
      }
    } catch {
      // localStorage может быть недоступен (приватный режим) — ключ просто не переживёт перезагрузку.
    }
  }

  async authenticate(): Promise<AuthState> {
    const clientId = this.requireClientId();
    const redirectUri = this.requireRedirectUri();

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = randomState();

    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', 'query');
    url.searchParams.set('scope', SCOPE);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);
    // Без этого Microsoft может молча переиспользовать тот же аккаунт,
    // на который браузер уже залогинен на login.microsoftonline.com —
    // даже после disconnect() (он чистит только наши локальные токены,
    // а не сессию самого Microsoft). select_account всегда показывает
    // выбор аккаунта, что и нужно для кнопки "Выйти"/повторного входа
    // под другим аккаунтом.
    url.searchParams.set('prompt', 'select_account');

    const { code } = await runPopupAuth(url.toString(), state);

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      scope: SCOPE,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new GcaError(
        'microsoft.error.exchangeCode',
        `Microsoft: failed to exchange the code for a token (status ${res.status})`,
        { status: res.status },
      );
    }
    const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };

    this.tokens = {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    };
    this.writeTokens(this.tokens);

    return this.getAuthState();
  }

  disconnect(): void {
    this.tokens = null;
    localStorage.removeItem(this.storageKey);
  }

  private requireClientId(): string {
    if (!this.clientId) {
      throw new GcaError('microsoft.error.requireClientId', 'Save an Application (client) ID first (see the setup wizard).');
    }
    return this.clientId;
  }

  private requireRedirectUri(): string {
    if (!this.redirectUri) {
      throw new GcaError(
        'microsoft.error.requireRedirectUri',
        'Could not determine redirectUri automatically. Pass it explicitly in the OneDriveProvider options ' +
          '(needed when the plugin is loaded via <script type="module"> or a bundler).',
      );
    }
    return this.redirectUri;
  }

  private get clientIdStorageKey(): string {
    return `${this.storageKey}${CLIENT_ID_STORAGE_SUFFIX}`;
  }

  private readClientId(): string | null {
    try {
      return localStorage.getItem(this.clientIdStorageKey);
    } catch {
      return null;
    }
  }

  private async ensureAccessToken(): Promise<string> {
    if (!this.tokens) throw new GcaError('microsoft.error.notConnected', 'OneDrive is not connected.');

    if (this.tokens.expiresAt > Date.now() + 60 * 1000) {
      return this.tokens.accessToken;
    }
    if (!this.tokens.refreshToken) {
      // SPA-токены Microsoft короткоживущие (см. README) — без refresh_token просим войти снова.
      this.tokens = null;
      throw new GcaError('microsoft.error.sessionExpired', 'The Microsoft session expired, please log in again.');
    }

    const body = new URLSearchParams({
      client_id: this.requireClientId(),
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refreshToken,
      scope: SCOPE,
    });
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new GcaError('microsoft.error.refreshFailed', `Microsoft: failed to refresh the token (status ${res.status})`, {
        status: res.status,
      });
    }
    const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };

    this.tokens = {
      accessToken: json.access_token,
      // Microsoft может (но не обязан) вернуть новый refresh_token при обновлении — если не вернул, оставляем старый.
      refreshToken: json.refresh_token ?? this.tokens.refreshToken,
      expiresAt: Date.now() + json.expires_in * 1000,
    };
    this.writeTokens(this.tokens);
    return this.tokens.accessToken;
  }

  private readTokens(): StoredTokens | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as StoredTokens) : null;
    } catch {
      return null;
    }
  }

  private writeTokens(tokens: StoredTokens): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tokens));
    } catch {
      // localStorage может быть недоступен (приватный режим) — просто не персистим между сессиями.
    }
  }

  // ------------------------------------------------------------------
  // Graph API
  // ------------------------------------------------------------------

  /**
   * Резолвит "сырую" ошибку Microsoft Graph в понятное сообщение,
   * где это возможно. Сейчас распознаётся один конкретный случай,
   * с которым реально столкнулись при тестировании: рабочий/учебный
   * аккаунт, у чьего tenant'а не включена лицензия SharePoint Online
   * (на которой основан OneDrive for Business) — Graph в этом случае
   * возвращает `400 BadRequest` с текстом "Tenant does not have a
   * SPO license" вместо какой-либо более специфичной ошибки авторизации,
   * так что без этой проверки пользователь увидел бы малопонятный
   * сырой JSON. Остальные ошибки Graph показываются как есть — их
   * текст и так достаточно информативен (как и у сырых ответов Dropbox).
   */
  private async throwGraphError(res: Response): Promise<never> {
    const text = await res.text().catch(() => '');
    const message = extractGraphErrorMessage(text);
    if (/SPO license/i.test(message)) {
      throw new GcaError(
        'microsoft.error.noSpoLicense',
        `Microsoft Graph: ${message} — this account's tenant has no OneDrive/SharePoint license.`,
      );
    }
    throw new Error(`Microsoft Graph ${res.status}: ${text || res.statusText}`);
  }

  async list(folderPath: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();

    let url: string;
    if (opts.cursor) {
      // `@odata.nextLink` — уже полный URL со всеми нужными query-параметрами.
      url = opts.cursor;
    } else {
      const folderSegment = folderPath === '' ? 'root' : `items/${encodeURIComponent(folderPath)}`;
      const params = new URLSearchParams({
        // remoteItem — чтобы потом в resolve() знать, что это ярлык на
        // чужой файл, и сходить за содержимым в правильный drive.
        $select: SELECT_FIELDS,
        $expand: 'thumbnails',
        $top: String(opts.pageSize ?? 50),
      });
      url = `${GRAPH_URL}/me/drive/${folderSegment}/children?${params.toString()}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) await this.throwGraphError(res);
    const json = (await res.json()) as GraphChildrenResponse;

    const items: StorageItem[] = json.value.map((entry) => toStorageItem(entry, folderPath));

    return { items, cursor: json['@odata.nextLink'], hasMore: !!json['@odata.nextLink'] };
  }

  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    // `@microsoft.graph.downloadUrl` — уже готовая преавторизованная
    // прямая ссылка (сохранена в raw при листинге), живёт около часа
    // (Microsoft не документирует точный TTL — см. README), поэтому
    // на всякий случай перезапрашиваем метаданные свежими, а не
    // полагаемся на то, что уже могло устареть с момента списка.
    const token = await this.ensureAccessToken();
    // Диагностические facet'ы (package/malware/shared/parentReference) —
    // см. комментарий у них в GraphDriveItem — не влияют на логику ниже,
    // только на то, что попадёт в console.error при ошибке. `content.
    // downloadUrl` — доп. запасной путь к ссылке (см. комментарий у
    // GraphDriveItem.content) для конкретного диагностированного случая:
    // расшаренный (`shared`-facet) элемент личного OneDrive, у которого
    // `@microsoft.graph.downloadUrl` стабильно не приходит даже после
    // ретраев, хотя `content.downloadUrl` в том же ответе — приходит.
    const params = new URLSearchParams({
      $select:
        'id,name,size,file,folder,remoteItem,package,malware,shared,parentReference,@microsoft.graph.downloadUrl,content.downloadUrl',
    });

    // Ярлык на файл из чужого OneDrive/SharePoint физически лежит в
    // другом drive — /me/drive/items/{id} для него не отдаёт
    // @microsoft.graph.downloadUrl (это и была причина ошибки "no
    // downloadable content" для таких файлов). Если по данным из
    // list() видно, что это remoteItem, идём сразу в правильный drive.
    const remote = (item.raw as GraphDriveItem | undefined)?.remoteItem;
    const endpoint =
      remote?.parentReference?.driveId && remote.id
        ? `${GRAPH_URL}/drives/${encodeURIComponent(remote.parentReference.driveId)}/items/${encodeURIComponent(remote.id)}`
        : `${GRAPH_URL}/me/drive/items/${encodeURIComponent(item.path)}`;

    const json = await this.fetchItemMetadataWithRetry(endpoint, params, token);
    const downloadUrl = extractDownloadUrl(json);

    if (!downloadUrl) {
      if (json.file) {
        // У элемента ТОЧНО есть facet `file` — это обычный файл, не
        // папка/пакет, и мы уже подождали и переспросили (см.
        // fetchItemMetadataWithRetry) на случай, если Graph просто не
        // успел досчитать это поле сразу после загрузки/копирования
        // файла (задокументированное поведение самой команды OneDrive,
        // см. github.com/OneDrive/onedrive-api-docs issue #1258).
        // Если ссылки всё равно нет — скорее всего постоянная причина
        // (политика организации/метка конфиденциальности блокирует
        // скачивание), а не гонка, но мы не можем отличить одно от
        // другого отсюда — сообщение упоминает оба варианта. Логируем
        // диагностические facet'ы (см. GraphDriveItem) логируем через
        // console.error (не console.warn!) — у части пользователей
        // консоль браузера по умолчанию отфильтровывает уровень
        // "Warnings" и показывает только "Errors", из-за чего первая
        // версия этого лога (на console.warn) не попадала в репорт
        // пользователя, хотя выполнялась. console.error гарантированно
        // виден везде, где виден и сам throw ниже (его тоже логируют
        // через console.error — см. дефолтный onError в AssetBrowser).
        // При повторении этой ошибки открыть DevTools и посмотреть эти
        // данные РЕЗКО сокращает следующий цикл диагностики.
        console.error(
          `[grapesjs-cloud-assets] OneDrive item "${item.name}" has a "file" facet but no @microsoft.graph.downloadUrl even after retrying — diagnostic metadata:`,
          json,
        );
        throw new GcaError(
          'microsoft.error.downloadUrlUnavailable',
          `Microsoft Graph: item "${item.name}" has no download link yet (no @microsoft.graph.downloadUrl even though it has a file content) — this can happen right after upload, or if the organization blocks downloading it.`,
          { name: item.name },
        );
      }
      // Нет facet'а `file` вообще — это папка/"пакет" вроде блокнота
      // OneNote, у которого нет единого бинарного содержимого. Тут
      // повторные попытки бессмысленны (fetchItemMetadataWithRetry их
      // и не делает в этом случае). console.error — см. комментарий
      // в ветке выше про то, почему не console.warn.
      console.error(
        `[grapesjs-cloud-assets] OneDrive item "${item.name}" has no "file" facet (likely folder/package) and no @microsoft.graph.downloadUrl — diagnostic metadata:`,
        json,
      );
      throw new GcaError(
        'microsoft.error.noDownloadableContent',
        `Microsoft Graph: item "${item.name}" has no downloadable content (likely a OneNote notebook or another unsupported item type).`,
        { name: item.name },
      );
    }

    return {
      src: downloadUrl,
      name: item.name,
      type: guessAssetType(item.mimeType, item.name),
      mimeType: item.mimeType,
      provider: this.id,
      // Точный TTL не документирован Microsoft — берём консервативный час.
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
  }

  /**
   * `@microsoft.graph.downloadUrl` у СВЕЖЕ загруженного/скопированного
   * файла иногда отсутствует в первом ответе Graph — по словам самой
   * команды OneDrive, часть метаданных досчитывается лениво "после
   * первых попыток скачивания" (github.com/OneDrive/onedrive-api-docs
   * issue #1258), и повторный запрос через мгновение обычно уже
   * отдаёт её. Ретраим ТОЛЬКО когда у элемента есть facet `file` — то
   * есть это точно обычный файл, а не папка/пакет (для них ссылки не
   * появится в принципе, лишние запросы только замедлят и без того
   * гарантированную ошибку).
   */
  private async fetchItemMetadataWithRetry(endpoint: string, params: URLSearchParams, token: string): Promise<GraphDriveItem> {
    const retryDelaysMs = [400, 900];
    let json = await this.fetchItemMetadata(endpoint, params, token);

    for (const delayMs of retryDelaysMs) {
      if (extractDownloadUrl(json) || !json.file) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      json = await this.fetchItemMetadata(endpoint, params, token);
    }

    return json;
  }

  private async fetchItemMetadata(endpoint: string, params: URLSearchParams, token: string): Promise<GraphDriveItem> {
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) await this.throwGraphError(res);
    return (await res.json()) as GraphDriveItem;
  }

  async upload(file: File, folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const token = await this.ensureAccessToken();
    const parentSegment = folderPath === '' ? 'root' : `items/${encodeURIComponent(folderPath)}`;
    const targetUrl = `${GRAPH_URL}/me/drive/${parentSegment}:/${encodeURIComponent(file.name)}:/content`;

    const item = await new Promise<GraphDriveItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', targetUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as GraphDriveItem);
        } else {
          reject(
            new GcaError('microsoft.error.uploadFailed', `OneDrive: upload failed (status ${xhr.status})`, {
              status: xhr.status,
            }),
          );
        }
      };
      xhr.onerror = () => reject(new GcaError('microsoft.error.uploadNetworkError', 'OneDrive: network error while uploading the file'));
      xhr.send(file);
    });

    return toStorageItem(item, folderPath);
  }

  /**
   * Поиск по ВСЕМУ OneDrive пользователя (не только текущей папке)
   * через `/me/drive/root/search(q='...')` — Graph сам ищет и по
   * имени, и немного по содержимому, но в первую очередь ранжирует
   * совпадения имени файла, что и нужно файловому пикеру.
   */
  async search(query: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();

    let url: string;
    if (opts.cursor) {
      url = opts.cursor;
    } else {
      const params = new URLSearchParams({
        $select: SELECT_FIELDS,
        $expand: 'thumbnails',
        $top: String(opts.pageSize ?? 50),
      });
      // Одинарная кавычка в запросе удваивается (как в OData/SQL) —
      // иначе она преждевременно закроет q='...' и сломает синтаксис.
      const escapedQuery = query.replace(/'/g, "''");
      url = `${GRAPH_URL}/me/drive/root/search(q='${encodeURIComponent(escapedQuery)}')?${params.toString()}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) await this.throwGraphError(res);
    const json = (await res.json()) as GraphChildrenResponse;

    // У результатов поиска нет единого parentPath — каждый может
    // лежать в своей папке; для пикера это не критично (клик всё
    // равно вставляет по id через resolve(), не по пути).
    const items: StorageItem[] = json.value.map((entry) => toStorageItem(entry, ''));

    return { items, cursor: json['@odata.nextLink'], hasMore: !!json['@odata.nextLink'] };
  }

  async delete(item: StorageItem): Promise<void> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${GRAPH_URL}/me/drive/items/${encodeURIComponent(item.path)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    // 204 No Content — успех; DELETE у Graph не всегда возвращает тело.
    if (!res.ok && res.status !== 204) await this.throwGraphError(res);
  }
}

/** Достаёт `error.message` из тела ответа Graph, если оно вообще JSON — иначе пустая строка (сырой text используется отдельно). */
function extractGraphErrorMessage(text: string): string {
  if (!text) return '';
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } };
    return parsed.error?.message ?? '';
  } catch {
    return '';
  }
}

function toStorageItem(entry: GraphDriveItem, parentPath: string): StorageItem {
  const isFolder = !!entry.folder;
  // small/medium/large — `medium` (~176px) достаточно для плитки/таблицы, не тратим трафик на `large`.
  const thumbnailUrl = !isFolder ? entry.thumbnails?.[0]?.medium?.url ?? entry.thumbnails?.[0]?.small?.url : undefined;

  return {
    id: entry.id,
    name: entry.name,
    kind: isFolder ? 'folder' : 'file',
    mimeType: entry.file?.mimeType,
    size: entry.size,
    modifiedAt: entry.lastModifiedDateTime,
    thumbnailUrl,
    path: entry.id,
    parentPath,
    webUrl: entry.webUrl ?? entry.remoteItem?.webUrl,
    raw: entry,
  };
}
