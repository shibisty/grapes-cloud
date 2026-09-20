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
import { generateCodeChallenge, generateCodeVerifier, randomState, runPopupAuth } from '../pkce';
import { guessAssetType, guessMimeType } from '../../utils/assetType';
import { OWN_SCRIPT_URL } from '../ownScript';
import { GcaError } from '../../i18n/errors';

const AUTHORIZE_URL = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
const API_URL = 'https://api.dropboxapi.com/2';
const CONTENT_URL = 'https://content.dropboxapi.com/2';
const CREATE_APP_URL = 'https://www.dropbox.com/developers/apps/create';
const APP_KEY_STORAGE_SUFFIX = '_app_key';
/** Максимум записей в одном вызове `files/get_thumbnail_batch` — ограничение самого Dropbox API. */
const THUMBNAIL_BATCH_SIZE = 25;

export interface DropboxProviderOptions {
  /**
   * Полный URL `public/dropbox-callback.html`, зарегистрированный в
   * Dropbox как Redirect URI. Необязательно — по умолчанию
   * вычисляется из расположения самого скрипта плагина (соседняя с
   * `dist/` папка `public/`, см. `ownScript.ts`). Передайте явно,
   * если разложили файлы иначе или подключаете ESM-сборку через
   * `<script type="module">`/бандлер (там автоопределение не
   * работает — `document.currentScript` для модулей всегда `null`).
   */
  redirectUri?: string;
  /** Ключ в localStorage — поменяйте, если на странице несколько инстансов плагина. */
  storageKey?: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
  accountLabel?: string;
  /**
   * epoch ms — когда пользователь ПЕРВЫЙ РАЗ прошёл `authenticate()`
   * (не путать с `expiresAt` — тем истечения ТЕКУЩЕГО access-токена,
   * который тихо обновляется каждые ~4 часа). Нужно только для
   * отображения в "Подключённые аккаунты" (см. `getSessionInfo()`) —
   * сам провайдер это поле никак не использует. `undefined` у токенов,
   * сохранённых до появления этого поля (более старая версия плагина) —
   * тогда просто показываем "неизвестно" вместо даты, а не 1970 год.
   */
  authenticatedAt?: number;
}

interface DropboxMetadata {
  '.tag': 'file' | 'folder';
  name: string;
  id: string;
  path_lower: string;
  path_display: string;
  size?: number;
  server_modified?: string;
}

/**
 * У Dropbox Files API нет способа получить прямую ссылку на файл в
 * самом dropbox.com (в отличие от `webUrl`/`webViewLink` у
 * Microsoft Graph/Google Drive) без дополнительного вызова
 * sharing-эндпоинтов — вместо этого используется полуофициальный,
 * но давно стабильный паттерн `dropbox.com/home<path>`, который
 * открывает файл в веб-интерфейсе залогиненному пользователю. Не
 * задокументирован Dropbox официально — если когда-нибудь
 * перестанет работать, чинить только этот хелпер.
 */
function dropboxWebUrl(pathDisplay: string): string {
  const encoded = pathDisplay
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://www.dropbox.com/home${encoded}`;
}

function defaultRedirectUri(): string | null {
  if (!OWN_SCRIPT_URL) return null;
  // .../dist/grapesjs-cloud-assets.umd.cjs → .../public/dropbox-callback.html
  return OWN_SCRIPT_URL.replace(/\/dist\/[^/]*$/, '/public/dropbox-callback.html');
}

/**
 * Реализация StorageProvider для Dropbox через прямые вызовы Files
 * API v2 (НЕ через Dropbox Chooser) — так у нас один и тот же
 * AssetBrowser UI для всех хранилищ. Плата за это: приложение
 * должно быть типа "Full Dropbox" и, при большом числе
 * пользователей, проходит ревью Dropbox (в отличие от Chooser,
 * которому ревью не нужно — см. документ анализа, раздел Dropbox).
 *
 * Ни Dropbox, ни Google, ни Microsoft не позволяют одному общему App
 * Key работать на произвольном чужом домене без его
 * предрегистрации — это защита самих провайдеров, а не что-то, что
 * можно обойти в коде. Поэтому App Key здесь — не опция конструктора
 * (её пришлось бы задавать в коде сайта заранее), а вводится
 * владельцем сайта прямо в интерфейсе, через мастер настройки
 * (`getSetupInfo()`/`setCredential()`) — и сохраняется в его
 * браузере. Токены и сам ключ живут только в localStorage.
 */
export class DropboxProvider implements StorageProvider {
  readonly id = 'dropbox';
  readonly label = 'Dropbox';
  readonly icon =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 6 6.2 12 10.4 6 14.6 12 18.8l6-4.2-6-4.2 6-4.2Zm-6 14 6 4 6-4-6-4Z"/></svg>';

  private readonly storageKey: string;
  private readonly redirectUri: string | null;
  private appKey: string | null;
  private tokens: StoredTokens | null = null;

  constructor(options: DropboxProviderOptions = {}) {
    this.storageKey = options.storageKey ?? 'gca_dropbox_tokens';
    this.redirectUri = options.redirectUri ?? defaultRedirectUri();
    this.appKey = this.readAppKey();
    this.tokens = this.readTokens();
  }

  // ------------------------------------------------------------------
  // Настройка (App Key) и Auth
  // ------------------------------------------------------------------

  getAuthState(): AuthState {
    return {
      configured: !!this.appKey,
      authenticated: !!this.appKey && !!this.tokens && this.tokens.expiresAt > Date.now() - 5 * 60 * 1000,
      accountLabel: this.tokens?.accountLabel,
    };
  }

  getSetupInfo(): ProviderSetupInfo {
    // Текст шагов не хранится тут литералом ни на одном языке — все
    // 22 перевода (столько же, сколько поддерживает сама GrapesJS,
    // см. `src/i18n/index.ts`) уже зарегистрированы в editor.I18n, и
    // AssetBrowser.renderSetupWizard() сам резолвит i18nKey на нужный
    // язык при рендере (см. `ProviderSetupStep.i18nKey` в types.ts).
    return {
      createAppUrl: CREATE_APP_URL,
      steps: [
        { i18nKey: 'dropbox.setup.step1' },
        { i18nKey: 'dropbox.setup.step2' },
        { i18nKey: 'dropbox.setup.step3' },
        this.redirectUri
          ? { i18nKey: 'dropbox.setup.step4WithRedirect', copyValue: this.redirectUri }
          : { i18nKey: 'dropbox.setup.step4NoRedirect' },
        { i18nKey: 'dropbox.setup.step5' },
      ],
    };
  }

  setCredential(value: string): void {
    const trimmed = value.trim();
    this.appKey = trimmed || null;
    try {
      if (this.appKey) {
        localStorage.setItem(this.appKeyStorageKey, this.appKey);
      } else {
        localStorage.removeItem(this.appKeyStorageKey);
      }
    } catch {
      // localStorage может быть недоступен (приватный режим) — ключ просто не переживёт перезагрузку.
    }
  }

  async authenticate(): Promise<AuthState> {
    const appKey = this.requireAppKey();
    const redirectUri = this.requireRedirectUri();

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = randomState();

    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('client_id', appKey);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('token_access_type', 'offline');
    url.searchParams.set('state', state);

    const { code } = await runPopupAuth(url.toString(), state);

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: appKey,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new GcaError(
        'dropbox.error.exchangeCode',
        `Dropbox: failed to exchange the code for a token (status ${res.status})`,
        { status: res.status },
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      account_id?: string;
    };

    this.tokens = {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: Date.now() + json.expires_in * 1000,
      authenticatedAt: Date.now(),
    };
    this.writeTokens(this.tokens);

    return this.getAuthState();
  }

  /** См. `ProviderSessionInfo` — данные для вкладки "Подключённые аккаунты" (AssetBrowser.openSettingsModal). Чисто информационные, ничем не управляют. */
  getSessionInfo(): ProviderSessionInfo {
    return {
      authenticatedAt: this.tokens?.authenticatedAt,
      expiresAt: this.tokens?.expiresAt,
      credential: this.appKey ?? undefined,
      sessionNoteKey: 'dropbox.sessionNote',
    };
  }

  disconnect(): void {
    this.tokens = null;
    localStorage.removeItem(this.storageKey);
  }

  private requireAppKey(): string {
    if (!this.appKey) {
      throw new GcaError('dropbox.error.requireAppKey', 'Save an App Key first (see the setup wizard).');
    }
    return this.appKey;
  }

  private requireRedirectUri(): string {
    if (!this.redirectUri) {
      throw new GcaError(
        'dropbox.error.requireRedirectUri',
        'Could not determine redirectUri automatically. Pass it explicitly in the DropboxProvider options ' +
          '(needed when the plugin is loaded via <script type="module"> or a bundler).',
      );
    }
    return this.redirectUri;
  }

  private get appKeyStorageKey(): string {
    return `${this.storageKey}${APP_KEY_STORAGE_SUFFIX}`;
  }

  private readAppKey(): string | null {
    try {
      return localStorage.getItem(this.appKeyStorageKey);
    } catch {
      return null;
    }
  }

  private async ensureAccessToken(): Promise<string> {
    if (!this.tokens) throw new GcaError('dropbox.error.notConnected', 'Dropbox is not connected.');

    if (this.tokens.expiresAt > Date.now() + 60 * 1000) {
      return this.tokens.accessToken;
    }
    if (!this.tokens.refreshToken) {
      // Токен истёк, а offline-refresh не запрашивался (или Dropbox его не выдал) — просим войти снова.
      this.tokens = null;
      throw new GcaError('dropbox.error.sessionExpired', 'The Dropbox session expired, please log in again.');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refreshToken,
      client_id: this.requireAppKey(),
    });
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new GcaError('dropbox.error.refreshFailed', `Dropbox: failed to refresh the token (status ${res.status})`, {
        status: res.status,
      });
    }
    const json = (await res.json()) as { access_token: string; expires_in: number };

    this.tokens = {
      ...this.tokens,
      accessToken: json.access_token,
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
  // Files API
  // ------------------------------------------------------------------

  async list(folderPath: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();

    const endpoint = opts.cursor ? `${API_URL}/files/list_folder/continue` : `${API_URL}/files/list_folder`;
    const payload = opts.cursor
      ? { cursor: opts.cursor }
      : { path: folderPath, limit: opts.pageSize ?? 50 };

    const res = await this.callApi(endpoint, payload, token, opts.signal);
    const json = (await res.json()) as { entries: DropboxMetadata[]; cursor: string; has_more: boolean };

    const items: StorageItem[] = json.entries
      .filter((entry) => entry['.tag'] === 'file' || entry['.tag'] === 'folder')
      .map((entry) => toStorageItem(entry, folderPath));

    // "Превью для картинок по возможности" — best effort, не должно
    // ронять список файлов, если не получилось (лимиты API, сеть).
    await this.attachThumbnails(items, opts.signal);

    return { items, cursor: json.cursor, hasMore: json.has_more };
  }

  /**
   * Подгружает превью для файлов-картинок текущей страницы через
   * `files/get_thumbnail_batch` (до 25 файлов за один запрос — а не
   * по одному `get_thumbnail_v2` на файл, как раньше сознательно не
   * делали из-за лимитов API, см. README). Результат — data: URL
   * прямо в `item.thumbnailUrl`, так что дальше рендер грида/таблицы
   * ничего не знает о провайдере — как и с `LocalAssetsProvider`.
   */
  private async attachThumbnails(items: StorageItem[], signal?: AbortSignal): Promise<void> {
    const imageItems = items.filter(
      (item) => item.kind === 'file' && guessAssetType(item.mimeType, item.name) === 'image',
    );
    if (!imageItems.length) return;

    for (let i = 0; i < imageItems.length; i += THUMBNAIL_BATCH_SIZE) {
      const chunk = imageItems.slice(i, i + THUMBNAIL_BATCH_SIZE);
      try {
        const token = await this.ensureAccessToken();
        const res = await this.callApi(
          `${CONTENT_URL}/files/get_thumbnail_batch`,
          {
            entries: chunk.map((item) => ({ path: item.path, format: 'jpeg', size: 'w128h128', mode: 'bestfit' })),
          },
          token,
          signal,
        );
        const json = (await res.json()) as {
          entries: Array<{ '.tag': 'success' | 'failure'; thumbnail?: string }>;
        };
        json.entries.forEach((entry, idx) => {
          if (entry['.tag'] === 'success' && entry.thumbnail) {
            chunk[idx].thumbnailUrl = `data:image/jpeg;base64,${entry.thumbnail}`;
          }
        });
      } catch {
        // Не критично — просто останутся без превью (иконка по типу файла).
      }
    }
  }

  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    const token = await this.ensureAccessToken();
    const res = await this.callApi(`${API_URL}/files/get_temporary_link`, { path: item.path }, token);
    const json = (await res.json()) as { link: string; metadata: DropboxMetadata };

    return {
      src: json.link,
      name: item.name,
      type: guessAssetType(item.mimeType, item.name),
      mimeType: item.mimeType,
      provider: this.id,
      // Временные ссылки Dropbox живут порядка 4 часов.
      expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    };
  }

  async upload(file: File, folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const token = await this.ensureAccessToken();
    const targetPath = `${folderPath === '' ? '' : folderPath}/${file.name}`;

    const metadata = await new Promise<DropboxMetadata>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${CONTENT_URL}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader(
        'Dropbox-API-Arg',
        JSON.stringify({ path: targetPath, mode: 'add', autorename: true, mute: false }),
      );
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as DropboxMetadata);
        } else {
          reject(
            new GcaError('dropbox.error.uploadFailed', `Dropbox: upload failed (status ${xhr.status})`, {
              status: xhr.status,
            }),
          );
        }
      };
      xhr.onerror = () =>
        reject(new GcaError('dropbox.error.uploadNetworkError', 'Dropbox: network error while uploading the file'));
      xhr.send(file);
    });

    return toStorageItem(metadata, folderPath);
  }

  /**
   * Поиск по ВСЕМУ Dropbox (а не только текущей папке) через
   * `files/search_v2` — так и просили: "поиск по хранилищу", не по
   * текущей директории. `filename_only: true` — ищем по имени, не по
   * содержимому файлов (полнотекстовый поиск был бы куда медленнее и
   * шумнее для файлового пикера).
   */
  async search(query: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();

    const endpoint = opts.cursor ? `${API_URL}/files/search_v2/continue` : `${API_URL}/files/search_v2`;
    const payload = opts.cursor
      ? { cursor: opts.cursor }
      : {
          query,
          options: {
            max_results: opts.pageSize ?? 50,
            file_status: 'active',
            filename_only: true,
          },
        };

    const res = await this.callApi(endpoint, payload, token, opts.signal);
    const json = (await res.json()) as {
      matches: Array<{ metadata: { metadata: DropboxMetadata } }>;
      cursor?: string;
      has_more: boolean;
    };

    const items: StorageItem[] = json.matches
      .map((match) => match.metadata.metadata)
      .filter((entry) => entry['.tag'] === 'file' || entry['.tag'] === 'folder')
      .map((entry) => toStorageItem(entry, parentDirOf(entry.path_display)));

    await this.attachThumbnails(items, opts.signal);

    return { items, cursor: json.cursor, hasMore: json.has_more };
  }

  async delete(item: StorageItem): Promise<void> {
    const token = await this.ensureAccessToken();
    await this.callApi(`${API_URL}/files/delete_v2`, { path: item.path }, token);
  }

  private async callApi(url: string, payload: unknown, token: string, signal?: AbortSignal): Promise<Response> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Dropbox API ${res.status}: ${text || res.statusText}`);
    }
    return res;
  }
}

/** Родительская директория `path_display` — нужна только для результатов search_v2 (list() уже знает свою folderPath). */
function parentDirOf(pathDisplay: string): string {
  const idx = pathDisplay.lastIndexOf('/');
  return idx <= 0 ? '' : pathDisplay.slice(0, idx);
}

function toStorageItem(entry: DropboxMetadata, parentPath: string): StorageItem {
  return {
    id: entry.id,
    name: entry.name,
    kind: entry['.tag'] === 'folder' ? 'folder' : 'file',
    size: entry.size,
    modifiedAt: entry.server_modified,
    mimeType: guessMimeType(entry.name),
    path: entry.path_lower,
    parentPath,
    webUrl: dropboxWebUrl(entry.path_display),
    raw: entry,
  };
}
