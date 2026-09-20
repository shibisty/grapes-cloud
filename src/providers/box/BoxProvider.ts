import type {
  AuthState,
  ListOptions,
  ListResult,
  ProviderSessionInfo,
  ProviderSetupInfo,
  ResolvedAsset,
  StorageItem,
  StorageProvider,
  UploadProgress,
} from '../../types';
import { randomState, runPopupAuth } from '../pkce';
import { guessAssetType, guessMimeType } from '../../utils/assetType';
import { OWN_SCRIPT_URL } from '../ownScript';
import { GcaError } from '../../i18n/errors';

const AUTHORIZE_URL = 'https://account.box.com/api/oauth2/authorize';
const API_URL = 'https://api.box.com/2.0';
const UPLOAD_URL = 'https://upload.box.com/api/2.0/files/content';
const CREATE_APP_URL = 'https://app.box.com/developers/console';
const CLIENT_ID_STORAGE_SUFFIX = '_client_id';
/** ID корневой папки в Box — фиксированная константа самого API, а не "" как у Dropbox/пустая строка. */
const ROOT_FOLDER_ID = '0';
const ITEM_FIELDS = 'id,type,name,size,modified_at,parent';
/**
 * См. `resolve()` — как и у Google Drive, вставка идёт через
 * авторизованный fetch + data: URL (а не голую http(s)-ссылку), так
 * что тот же защитный лимит по тем же причинам (см. README, раздел
 * "Google Drive" и новый раздел "Box").
 */
const MAX_INLINE_BYTES = 10 * 1024 * 1024;
/** Столько параллельных запросов превью — у Box, как и у Google Drive, нет batch-эндпоинта для миниатюр. */
const THUMBNAIL_CONCURRENCY = 6;

export interface BoxProviderOptions {
  /**
   * URL собственного серверного эндпоинта владельца сайта, который
   * делает обмен code→token / refresh_token→token с Box, храня
   * Client Secret приложения только на сервере.
   *
   * ОБЯЗАТЕЛЬНОЕ поле, без значения по умолчанию — и в этом
   * принципиальное отличие BoxProvider от Dropbox/Google/OneDrive
   * выше. Проверено по официальной документации Box
   * (developer.box.com), а не предположено:
   *   - `GET /authorize` принимает `response_type` только со
   *     значением `code` — implicit-flow (`token`) не поддерживается;
   *   - `POST /oauth2/token` требует `client_secret` для ЛЮБОГО
   *     обмена — и authorization_code, и refresh_token — Box нигде
   *     не предлагает PKCE (`code_challenge`/`code_verifier`) как
   *     альтернативу для публичных клиентов без бэкенда (в отличие
   *     от Dropbox и Microsoft-SPA, которые PKCE поддерживают, — см.
   *     `pkce.ts`).
   * Сам Box явно предупреждает в документации: client_secret нельзя
   * держать в клиентском (браузерном) коде. Значит, "вписать его в
   * бандл" — не обходной путь, а дыра в безопасности (любой
   * посетитель сайта сможет вытащить секрет и действовать от имени
   * приложения), и этот путь был явно отклонён (см. историю проекта:
   * пользователь выбрал "добавить, но с собственным сервером", а не
   * "с секретом в браузере"). Поэтому единственный правильный способ
   * добавить Box в этот целиком клиентский плагин — маленький
   * сервер-посредник, который владелец сайта разворачивает сам.
   *
   * Контракт эндпоинта — `POST tokenEndpoint`, тело JSON:
   *   - `{ grant_type: 'authorization_code', code, redirect_uri }`
   *   - `{ grant_type: 'refresh_token', refresh_token }`
   * В обоих случаях сервер должен подставить свои `client_id` +
   * `client_secret` и переслать запрос как есть на
   * `https://api.box.com/oauth2/token`, а ответ Box (JSON с
   * `access_token`/`refresh_token`/`expires_in`) вернуть КАК ЕСТЬ
   * (тем же статусом). Это буквально проксирование в несколько
   * строк — пример на Node.js/Express есть в README, раздел "Box".
   * Refresh-токен у Box одноразовый и каждый раз меняется — сервер
   * не должен ничего "запоминать": он просто пересылает то, что
   * получил, назад в ответе, а хранением новой пары токенов в
   * браузере занимается уже сам `BoxProvider` (см. `StoredTokens`).
   */
  tokenEndpoint: string;
  /**
   * Полный URL `public/box-callback.html`, зарегистрированный в Box
   * как Redirect URI. Необязательно — по умолчанию вычисляется из
   * расположения самого скрипта плагина (см. `ownScript.ts`), как и
   * у Dropbox/OneDrive.
   */
  redirectUri?: string;
  /** Ключ в localStorage — поменяйте, если на странице несколько инстансов плагина. */
  storageKey?: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
  /**
   * epoch ms — когда пользователь ПЕРВЫЙ РАЗ прошёл `authenticate()`.
   * Только для "Подключённые аккаунты" (см. `getSessionInfo()`) — см.
   * аналогичное поле у Dropbox/Google/OneDrive.
   */
  authenticatedAt?: number;
}

interface BoxItem {
  id: string;
  type: 'file' | 'folder' | 'web_link';
  name: string;
  size?: number;
  modified_at?: string;
  parent?: { id: string } | null;
}

interface BoxItemsResponse {
  entries: BoxItem[];
  total_count: number;
  offset: number;
  limit: number;
}

/**
 * Веб-URL вида `app.box.com/file/<id>`/`app.box.com/folder/<id>` —
 * как и `dropboxWebUrl` в `DropboxProvider.ts`, это НЕ
 * задокументированный официально Box API-контракт (в справочнике
 * developer.box.com такого поля нет), а подтверждённый сообществом
 * Box (support.box.com) устойчивый паттерн собственного веб-клиента.
 * Используется только для пункта контекстного меню "Открыть в
 * отдельной вкладке" — если он вдруг перестанет работать, чинить
 * только этот хелпер.
 */
function boxWebUrl(item: BoxItem): string {
  return item.type === 'folder' ? `https://app.box.com/folder/${item.id}` : `https://app.box.com/file/${item.id}`;
}

function defaultRedirectUri(): string | null {
  if (!OWN_SCRIPT_URL) return null;
  return OWN_SCRIPT_URL.replace(/\/dist\/[^/]*$/, '/public/box-callback.html');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read the downloaded file'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Реализация StorageProvider для Box — единственная из четырёх
 * облачных, которой НУЖЕН собственный бэкенд владельца сайта (см.
 * doc-комментарий `BoxProviderOptions.tokenEndpoint` выше: у Box нет
 * ни PKCE, ни implicit-flow, обмен code/refresh на токен обязательно
 * требует client_secret). Всё остальное в этом файле устроено так же,
 * как у остальных трёх провайдеров: Client ID — не опция конструктора
 * (вводится через мастер настройки, `getSetupInfo()`/`setCredential()`,
 * и хранится в localStorage), OAuth-попап — тот же `runPopupAuth()`
 * из `pkce.ts`, что и у Dropbox (без генерации code_verifier/
 * code_challenge — Box их не принимает).
 *
 * Иерархия файлов у Box — по id, а не по пути (как у Google Drive, а
 * не как у Dropbox/OneDrive): `StorageItem.path`/`parentPath` здесь
 * хранят id папки/файла, а не строку пути.
 *
 * `resolve()` (вставка файла) сделан так же, как у Google Drive —
 * авторизованный fetch + `data:` URL с тем же лимитом
 * `MAX_INLINE_BYTES` — а не через "временную ссылку", как у
 * Dropbox/OneDrive. Так решили по двум причинам, обе — по итогам
 * проверки документации Box, не предположений:
 *   1. `GET /files/{id}/content` требует заголовок Authorization на
 *      каждый запрос (в отличие от `get_temporary_link`
 *      Dropbox/`downloadUrl` OneDrive, которые отдают самодостаточную
 *      ссылку) и отвечает редиректом на `dl.boxcloud.com` — Box
 *      официально документирует поддержку CORS только для
 *      `api.box.com` (см. `getSetupInfo()`, шаг про CORS Domains), а
 *      передаёт ли эти CORS-заголовки конечный редирект на
 *      `dl.boxcloud.com` — НЕ задокументировано нигде. Если у
 *      конкретного файла это всё же ломается с ошибкой CORS именно
 *      на вставке (не на самом списке файлов) — см. README, раздел
 *      "Box", там описан обходной путь (расширить тот же
 *      `tokenEndpoint`-сервер до простого прокси скачивания).
 *   2. Альтернатива — Box Shared Links (`PUT /files/{id}` с
 *      `shared_link.access: 'open'`) — была рассмотрена и
 *      отклонена: это не "временная ссылка", а самостоятельный
 *      публичный доступ к файлу, который остаётся открытым
 *      бессрочно, если явно не выключить (`unshared_at` для
 *      автоистечения Box разрешает ставить только платным аккаунтам —
 *      подтверждено документацией). Делать приватный файл публичным
 *      только чтобы превью показать пользователю в его собственном
 *      редакторе — куда более серьёзный побочный эффект, чем у
 *      остальных провайдеров, поэтому не используется.
 */
export class BoxProvider implements StorageProvider {
  readonly id = 'box';
  readonly label = 'Box';
  readonly icon =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 3 6.5V17.5L12 22l9-4.5V6.5L12 2Zm0 2.24 5.76 2.88L12 10 6.24 7.12 12 4.24ZM5 8.3l6 3v8.16l-6-3V8.3Zm8 11.16V11.3l6-3v8.16l-6 3Z"/></svg>';

  private readonly storageKey: string;
  private readonly redirectUri: string | null;
  private readonly tokenEndpoint: string;
  private clientId: string | null;
  private tokens: StoredTokens | null = null;

  constructor(options: BoxProviderOptions) {
    // `options` типизирован как обязательный (см. `BoxProviderOptions.tokenEndpoint`
    // выше), но на практике плагин часто используют из чистого JS/HTML без
    // проверки типов (см. историю багов — `new BoxProvider()` без аргумента
    // вообще уронил бы весь редактор `TypeError: Cannot read properties of
    // undefined` прямо на инициализации). Здесь — защита от этого: если
    // options не передали или в нём нет tokenEndpoint, конструктор не падает,
    // а откладывает ошибку до реальной попытки использовать провайдер
    // (см. `requireTokenEndpoint()`, вызывается из `authenticate()`/
    // `exchangeToken()`) — так же, как уже устроено с отсутствующим Client ID.
    const opts = options ?? ({} as BoxProviderOptions);
    this.tokenEndpoint = opts.tokenEndpoint ?? '';
    this.storageKey = opts.storageKey ?? 'gca_box_tokens';
    this.redirectUri = opts.redirectUri ?? defaultRedirectUri();
    this.clientId = this.readClientId();
    this.tokens = this.readTokens();
  }

  // ------------------------------------------------------------------
  // Настройка (Client ID) и Auth
  // ------------------------------------------------------------------

  getAuthState(): AuthState {
    return {
      configured: !!this.clientId,
      authenticated: !!this.clientId && !!this.tokens && this.tokens.expiresAt > Date.now() - 5 * 60 * 1000,
    };
  }

  getSetupInfo(): ProviderSetupInfo {
    const origin = typeof window !== 'undefined' ? window.location.origin : null;
    return {
      createAppUrl: CREATE_APP_URL,
      credentialLabelKey: 'setup.clientIdPlaceholder',
      steps: [
        { i18nKey: 'box.setup.step1' },
        { i18nKey: 'box.setup.step2Server' },
        { i18nKey: 'box.setup.step3' },
        this.redirectUri
          ? { i18nKey: 'box.setup.step4WithRedirect', copyValue: this.redirectUri }
          : { i18nKey: 'box.setup.step4NoRedirect' },
        origin
          ? { i18nKey: 'box.setup.step5WithOrigin', copyValue: origin }
          : { i18nKey: 'box.setup.step5NoOrigin' },
        { i18nKey: 'box.setup.step6' },
        { i18nKey: 'box.setup.step7' },
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
    this.requireTokenEndpoint();
    const state = randomState();

    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);

    const { code } = await runPopupAuth(url.toString(), state);
    const json = await this.exchangeToken({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });

    this.tokens = {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: Date.now() + json.expires_in * 1000,
      authenticatedAt: Date.now(),
    };
    this.writeTokens(this.tokens);

    return this.getAuthState();
  }

  /** См. `ProviderSessionInfo` — данные для вкладки "Подключённые аккаунты". Чисто информационные, ничем не управляют. */
  getSessionInfo(): ProviderSessionInfo {
    return {
      authenticatedAt: this.tokens?.authenticatedAt,
      expiresAt: this.tokens?.expiresAt,
      credential: this.clientId ?? undefined,
      sessionNoteKey: 'box.sessionNote',
    };
  }

  disconnect(): void {
    this.tokens = null;
    localStorage.removeItem(this.storageKey);
  }

  private requireClientId(): string {
    if (!this.clientId) {
      throw new GcaError('box.error.requireClientId', 'Save a Client ID first (see the setup wizard).');
    }
    return this.clientId;
  }

  private requireRedirectUri(): string {
    if (!this.redirectUri) {
      throw new GcaError(
        'box.error.requireRedirectUri',
        'Could not determine redirectUri automatically. Pass it explicitly in the BoxProvider options ' +
          '(needed when the plugin is loaded via <script type="module"> or a bundler).',
      );
    }
    return this.redirectUri;
  }

  private requireTokenEndpoint(): string {
    if (!this.tokenEndpoint) {
      throw new GcaError(
        'box.error.requireTokenEndpoint',
        'BoxProvider needs a tokenEndpoint option (a small server of your own that keeps the Box Client Secret) — see README, section "Box".',
      );
    }
    return this.tokenEndpoint;
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

  /**
   * POST на `tokenEndpoint` владельца сайта — см. подробный контракт
   * в doc-комментарии `BoxProviderOptions.tokenEndpoint`. Используется
   * и для authorization_code (в `authenticate()`), и для refresh_token
   * (в `ensureAccessToken()`) — тело запроса отличается только
   * `grant_type` и сопутствующими полями.
   */
  private async exchangeToken(
    payload: { grant_type: 'authorization_code'; code: string; redirect_uri: string } | { grant_type: 'refresh_token'; refresh_token: string },
  ): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
    const res = await fetch(this.requireTokenEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const key = payload.grant_type === 'authorization_code' ? 'box.error.exchangeCode' : 'box.error.refreshFailed';
      throw new GcaError(key, `Box: failed to ${payload.grant_type === 'authorization_code' ? 'exchange the code for' : 'refresh'} a token (status ${res.status})`, {
        status: res.status,
      });
    }
    return (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  }

  private async ensureAccessToken(): Promise<string> {
    if (!this.tokens) throw new GcaError('box.error.notConnected', 'Box is not connected.');

    if (this.tokens.expiresAt > Date.now() + 60 * 1000) {
      return this.tokens.accessToken;
    }
    if (!this.tokens.refreshToken) {
      this.tokens = null;
      throw new GcaError('box.error.sessionExpired', 'The Box session expired, please log in again.');
    }

    // Box отдаёт НОВУЮ refresh_token на каждый обмен (одноразовые,
    // ротируются) — обязательно сохраняем именно её, а не переиспользуем
    // старую: старая уже недействительна после этого запроса.
    const json = await this.exchangeToken({ grant_type: 'refresh_token', refresh_token: this.tokens.refreshToken });

    this.tokens = {
      ...this.tokens,
      accessToken: json.access_token,
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
  // Box Content API
  // ------------------------------------------------------------------

  async list(folderPath: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();
    const folderId = folderPath === '' ? ROOT_FOLDER_ID : folderPath;
    const limit = opts.pageSize ?? 50;
    const offset = opts.cursor ? Number(opts.cursor) : 0;

    const params = new URLSearchParams({ fields: ITEM_FIELDS, limit: String(limit), offset: String(offset) });
    const res = await fetch(`${API_URL}/folders/${encodeURIComponent(folderId)}/items?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Box API ${res.status}: ${text || res.statusText}`);
    }
    const json = (await res.json()) as BoxItemsResponse;

    const items: StorageItem[] = json.entries
      .filter((entry) => entry.type === 'file' || entry.type === 'folder')
      .map((entry) => toStorageItem(entry, folderId));

    await this.attachThumbnails(items, token, opts.signal);

    const nextOffset = offset + json.entries.length;
    const hasMore = nextOffset < json.total_count;
    return { items, cursor: hasMore ? String(nextOffset) : undefined, hasMore };
  }

  /**
   * Превью — best effort, как у Google Drive: у Box нет
   * batch-эндпоинта для миниатюр (в отличие от Dropbox), только
   * `files/{id}/thumbnail.png` по одному файлу — поэтому
   * ограниченно-параллельный fetch с Authorization-заголовком, как у
   * `GoogleDriveProvider.attachThumbnails`. `200` — реальная
   * миниатюра; `202` (ещё генерируется) и `302` (недоступна для
   * этого типа файла) намеренно пропускаются, а не читаются как
   * готовая картинка — оба статуса отдают Location на
   * заглушку/плейсхолдер, а не сам превью.
   */
  private async attachThumbnails(items: StorageItem[], token: string, signal?: AbortSignal): Promise<void> {
    const imageItems = items.filter(
      (item) => item.kind === 'file' && guessAssetType(item.mimeType, item.name) === 'image',
    );
    if (!imageItems.length) return;

    let cursor = 0;
    const worker = async () => {
      while (cursor < imageItems.length) {
        const item = imageItems[cursor++];
        try {
          const res = await fetch(`${API_URL}/files/${encodeURIComponent(item.path)}/thumbnail.png?min_height=32&min_width=32`, {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          });
          if (res.status !== 200) continue; // 202 pending / 302 unsupported — просто без превью, не заглушка
          const blob = await res.blob();
          item.thumbnailUrl = URL.createObjectURL(blob);
        } catch {
          // Не критично — просто останется без превью (иконка по типу файла).
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(THUMBNAIL_CONCURRENCY, imageItems.length) }, worker));
  }

  /**
   * См. doc-комментарий класса выше — вставка через авторизованный
   * fetch + `data:` URL (как у Google Drive), не через временную
   * ссылку, и с тем же ограничением по размеру.
   */
  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    const token = await this.ensureAccessToken();

    let res: Response;
    try {
      res = await fetch(`${API_URL}/files/${encodeURIComponent(item.path)}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Чаще всего это как раз недокументированный случай из
      // doc-комментария класса — редирект на dl.boxcloud.com не
      // проходит CORS. Сообщаем понятно, а не глотаем как обычный TypeError.
      throw new GcaError(
        'box.error.downloadFailed',
        `Box: could not download "${item.name}" (network/CORS error) — see README, section "Box"`,
        { name: item.name },
      );
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Box API ${res.status}: ${text || res.statusText}`);
    }

    const blob = await res.blob();
    if (blob.size > MAX_INLINE_BYTES) {
      throw new GcaError(
        'box.error.fileTooLarge',
        `The file is larger than ${Math.round(MAX_INLINE_BYTES / (1024 * 1024))} MB`,
        { maxMb: Math.round(MAX_INLINE_BYTES / (1024 * 1024)) },
      );
    }

    const dataUrl = await blobToDataUrl(blob);
    return {
      src: dataUrl,
      name: item.name,
      type: guessAssetType(item.mimeType, item.name),
      mimeType: item.mimeType,
      provider: this.id,
      // data: URL не истекает — как и у Google Drive, expiresAt тут не нужен.
    };
  }

  async upload(file: File, folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const token = await this.ensureAccessToken();
    const parentId = folderPath === '' ? ROOT_FOLDER_ID : folderPath;

    const created = await new Promise<BoxItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', UPLOAD_URL);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // `attributes` ДОЛЖНО идти раньше `file` в теле multipart —
      // иначе Box отвечает 400 `metadata_after_file_contents`.
      // Порядок полей FormData при сериализации сохраняется — этого
      // достаточно, руками собирать multipart-тело не нужно (в
      // отличие от Dropbox/Google, у которых бинарный или
      // multipart/related формат других API вынуждает делать это
      // самостоятельно).
      const form = new FormData();
      form.append('attributes', JSON.stringify({ name: file.name, parent: { id: parentId } }));
      form.append('file', file);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const json = JSON.parse(xhr.responseText) as { entries: BoxItem[] };
          resolve(json.entries[0]);
        } else {
          reject(
            new GcaError('box.error.uploadFailed', `Box: upload failed (status ${xhr.status})`, { status: xhr.status }),
          );
        }
      };
      xhr.onerror = () => reject(new GcaError('box.error.uploadNetworkError', 'Box: network error while uploading the file'));
      xhr.send(form);
    });

    return toStorageItem(created, parentId);
  }

  /**
   * Поиск по ВСЕМУ Box (не только текущей папке) — как и у
   * Dropbox/Google Drive. `type` не ограничивается: сервер сам вернёт
   * files/folders/web_links, лишнее (web_link) отфильтровывается тут же.
   */
  async search(query: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();
    const limit = opts.pageSize ?? 50;
    const offset = opts.cursor ? Number(opts.cursor) : 0;

    const params = new URLSearchParams({ query, fields: ITEM_FIELDS, limit: String(limit), offset: String(offset) });
    const res = await fetch(`${API_URL}/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Box API ${res.status}: ${text || res.statusText}`);
    }
    const json = (await res.json()) as BoxItemsResponse;

    const items: StorageItem[] = json.entries
      .filter((entry) => entry.type === 'file' || entry.type === 'folder')
      .map((entry) => toStorageItem(entry, entry.parent?.id ?? ROOT_FOLDER_ID));

    await this.attachThumbnails(items, token, opts.signal);

    const nextOffset = offset + json.entries.length;
    const hasMore = nextOffset < json.total_count;
    return { items, cursor: hasMore ? String(nextOffset) : undefined, hasMore };
  }

  async delete(item: StorageItem): Promise<void> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${API_URL}/files/${encodeURIComponent(item.path)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Box API ${res.status}: ${text || res.statusText}`);
    }
  }
}

function toStorageItem(entry: BoxItem, parentPath: string): StorageItem {
  return {
    id: entry.id,
    name: entry.name,
    kind: entry.type === 'folder' ? 'folder' : 'file',
    size: entry.size,
    modifiedAt: entry.modified_at,
    mimeType: entry.type === 'file' ? guessMimeType(entry.name) : undefined,
    path: entry.id,
    parentPath,
    webUrl: boxWebUrl(entry),
    raw: entry,
  };
}
