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
import { guessAssetType } from '../../utils/assetType';
import { GcaError } from '../../i18n/errors';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const CREATE_CREDENTIALS_URL = 'https://console.cloud.google.com/apis/credentials';
const CLIENT_ID_STORAGE_SUFFIX = '_client_id';
/**
 * `drive.readonly` — единственный scope, которым можно "просто
 * просматривать" произвольные папки/файлы пользователя (не только
 * созданные самим приложением, как у более узкого `drive.file`).
 * Google относит его к "sensitive scopes" — для продакшена на много
 * пользователей нужна верификация приложения в Google (см.
 * `getSetupInfo()`/README); пока не пройдена, вход работает только
 * для аккаунтов, добавленных в test users в OAuth consent screen.
 */
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
/**
 * Файлы вставляются как data: URL (см. `resolve()`) — в отличие от
 * Dropbox/OneDrive, у Google Drive REST API нет способа выдать
 * готовую, встраиваемую БЕЗ заголовка Authorization ссылку на
 * произвольный (не публично расшаренный) файл без собственного
 * бэкенда-прокси (см. README, раздел про Google). Поэтому вставка
 * большого видео/архива через этот провайдер не предусмотрена —
 * лимит защищает и вкладку браузера, и создаваемую HTML-страницу от
 * многомегабайтной base64-строки внутри неё.
 */
const MAX_INLINE_BYTES = 10 * 1024 * 1024;
/** Столько параллельных запросов превью — компромисс между скоростью и тем, чтобы не запускать полсотни fetch разом. */
const THUMBNAIL_CONCURRENCY = 6;

export interface GoogleDriveProviderOptions {
  /** Ключ в localStorage — поменяйте, если на странице несколько инстансов плагина. */
  storageKey?: string;
}

interface StoredToken {
  accessToken: string;
  expiresAt: number; // epoch ms
  /**
   * epoch ms — когда пользователь ПЕРВЫЙ РАЗ явно вошёл (не silent-
   * переспрос через `requestToken(true)` в `ensureAccessToken()`).
   * Только для отображения в "Подключённые аккаунты" (см.
   * `getSessionInfo()`) — `undefined` у токенов, сохранённых до
   * появления этого поля.
   */
  authenticatedAt?: number;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  parents?: string[];
  /** Ссылка на просмотр файла в веб-интерфейсе drive.google.com — для контекстного меню "Открыть в отдельной вкладке". */
  webViewLink?: string;
}

const LIST_FIELDS = 'id,name,mimeType,size,modifiedTime,thumbnailLink,parents,webViewLink';

/** Экранирует `'` и `\` в значении, которое подставляется в одинарные кавычки Drive-запроса `q=`. */
function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

interface DriveFileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

/**
 * Минимальная часть API Google Identity Services (GIS), которой
 * пользуется этот файл — полных типов `@types/google.accounts` в
 * проекте нет. `callback` — намеренно мутируемое поле: это
 * задокументированный самим Google паттерн переиспользования одного
 * token client между несколькими вызовами `requestAccessToken()` —
 * callback переприсваивается перед каждым вызовом (см. `requestToken()`).
 */
interface GisTokenClient {
  callback: (response: GisTokenResponse) => void;
  requestAccessToken(overridableParams?: { prompt?: string }): void;
}
interface GisTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}
interface GisGlobal {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GisTokenResponse) => void;
        error_callback?: (error: { type?: string; message?: string }) => void;
      }): GisTokenClient;
      revoke(token: string, done?: () => void): void;
    };
  };
}

declare global {
  interface Window {
    google?: GisGlobal;
  }
}

let gisLoadPromise: Promise<GisGlobal> | null = null;

/**
 * Грузит `accounts.google.com/gsi/client` один раз на страницу
 * (даже если на ней несколько инстансов плагина/GoogleDriveProvider)
 * и резолвится готовым `window.google`.
 */
function loadGis(): Promise<GisGlobal> {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) resolve(window.google);
      else reject(new GcaError('google.error.gisLoadFailed', 'Failed to load Google Identity Services'));
    };
    script.onerror = () => reject(new GcaError('google.error.gisLoadFailed', 'Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

/**
 * Реализация StorageProvider для Google Drive — единственная из
 * трёх облачных, которая НЕ использует ручной PKCE-попап (как
 * Dropbox/OneDrive). Google не даёт публичному клиенту без backend'а
 * обменять code на токен без client_secret (проверено отдельным
 * технически исследованием документации Google, не предположением) —
 * поэтому вместо этого используется официальный клиентский путь
 * Google Identity Services (GIS), "Token client": он выдаёт access
 * token напрямую в браузере, без code/PKCE/redirect URI вообще — за
 * это платим отсутствием refresh-токена (Google его в этой схеме не
 * выдаёт), поэтому раз в ~час `ensureAccessToken()` тихо переспрашивает
 * токен через тот же GIS, и если тихо не получилось — просит войти
 * заново тем же экраном, что и у остальных провайдеров.
 *
 * Второе отличие от Dropbox/OneDrive: у Google Drive REST API нет
 * способа отдать готовую embeddable-ссылку на приватный файл без
 * заголовка Authorization — поэтому `resolve()` сам скачивает файл
 * через авторизованный fetch и превращает его в data: URL (см.
 * `MAX_INLINE_BYTES` и README).
 */
export class GoogleDriveProvider implements StorageProvider {
  readonly id = 'google-drive';
  readonly label = 'Google Drive';
  readonly icon =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8.1 2.6 2 13.3l3 5.2 6.1-10.7-3-5.2Zm2.6 15.9h9.8l-3-5.2H7.7l3 5.2ZM15.4 2.6h-6l6.1 10.7 3-5.2-3.1-5.5Z"/></svg>';

  private readonly storageKey: string;
  private clientId: string | null;
  private token: StoredToken | null = null;
  private tokenClient: GisTokenClient | null = null;

  constructor(options: GoogleDriveProviderOptions = {}) {
    this.storageKey = options.storageKey ?? 'gca_google_token';
    this.clientId = this.readClientId();
    this.token = this.readToken();
  }

  // ------------------------------------------------------------------
  // Настройка (Client ID) и Auth
  // ------------------------------------------------------------------

  getAuthState(): AuthState {
    return {
      configured: !!this.clientId,
      authenticated: !!this.clientId && !!this.token && this.token.expiresAt > Date.now() + 60 * 1000,
    };
  }

  getSetupInfo(): ProviderSetupInfo {
    const origin = typeof window !== 'undefined' ? window.location.origin : null;
    return {
      createAppUrl: CREATE_CREDENTIALS_URL,
      credentialLabelKey: 'setup.clientIdPlaceholder',
      steps: [
        { i18nKey: 'google.setup.step1' },
        { i18nKey: 'google.setup.step2' },
        { i18nKey: 'google.setup.step3' },
        origin
          ? { i18nKey: 'google.setup.step4WithOrigin', copyValue: origin }
          : { i18nKey: 'google.setup.step4NoOrigin' },
        { i18nKey: 'google.setup.step5' },
      ],
    };
  }

  setCredential(value: string): void {
    const trimmed = value.trim();
    this.clientId = trimmed || null;
    this.tokenClient = null; // пересоздастся под новый client_id при следующем authenticate()
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
    await this.requestToken(); // без prompt: '' — первый вход всегда с явным согласием пользователя
    return this.getAuthState();
  }

  disconnect(): void {
    const token = this.token?.accessToken;
    this.token = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
    if (token) window.google?.accounts?.oauth2?.revoke(token);
  }

  private requireClientId(): string {
    if (!this.clientId) {
      throw new GcaError('google.error.requireClientId', 'Save a Client ID first (see the setup wizard).');
    }
    return this.clientId;
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

  private async getTokenClient(): Promise<GisTokenClient> {
    const clientId = this.requireClientId();
    if (this.tokenClient) return this.tokenClient;

    const gis = await loadGis();
    this.tokenClient = gis.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      // Реальная обработка ответа подписывается заново на каждый вызов
      // requestAccessToken() внутри requestToken() — этот callback тут
      // только заглушка на случай, если GIS дёрнет его вне такого вызова.
      callback: () => {},
    });
    return this.tokenClient;
  }

  /**
   * Запрашивает access token через GIS. `silent: true` — попытка без
   * UI (`prompt: ''`): срабатывает, если пользователь уже давал
   * согласие и его сессия Google жива; если GIS не смог показать
   * (или пользователь закрыл) — переиспользуем ту же ошибку
   * `sessionExpired`, что и у остальных провайдеров, чтобы UI
   * одинаково падал обратно на экран "Войти".
   */
  private requestToken(silent = false): Promise<string> {
    return new Promise((resolve, reject) => {
      void this.getTokenClient()
        .then((client) => {
          // Переопределяем callback на этот конкретный вызов — тот, что
          // задан в initTokenClient(), нужен только как заглушка на
          // случай вызова GIS вне текущего requestToken() (см. комментарий там).
          client.callback = (response: GisTokenResponse) => {
            if (response.error || !response.access_token) {
              if (silent) {
                reject(new GcaError('google.error.sessionExpired', 'The Google session expired, please log in again.'));
              } else {
                reject(new GcaError('google.error.tokenFailed', 'Google did not return an access token.'));
              }
              return;
            }
            this.token = {
              accessToken: response.access_token,
              expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
              // silent (ensureAccessToken()) — переносим дату первого
              // явного входа как есть; не-silent (authenticate()) —
              // это он и есть, фиксируем заново.
              authenticatedAt: silent ? this.token?.authenticatedAt : Date.now(),
            };
            this.writeToken(this.token);
            resolve(response.access_token);
          };
          // Явный (не silent) вызов — с select_account, иначе GIS может
          // молча переиспользовать последний выбранный в этом браузере
          // Google-аккаунт, даже после disconnect() (тот отзывает только
          // наш access token, а не сессию accounts.google.com), что
          // мешает войти под другим аккаунтом через кнопку "Выйти".
          client.requestAccessToken(silent ? { prompt: '' } : { prompt: 'select_account' });
        })
        .catch(reject);
    });
  }

  private async ensureAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 60 * 1000) return this.token.accessToken;
    // Токена нет или истёк — пробуем тихо переполучить (без всплывающего окна), не роняя список файлов на пустом месте.
    return this.requestToken(true);
  }

  /** См. `ProviderSessionInfo` — данные для вкладки "Подключённые аккаунты" (AssetBrowser.openSettingsModal). Чисто информационные, ничем не управляют. */
  getSessionInfo(): ProviderSessionInfo {
    return {
      authenticatedAt: this.token?.authenticatedAt,
      expiresAt: this.token?.expiresAt,
      credential: this.clientId ?? undefined,
      sessionNoteKey: 'google.sessionNote',
    };
  }

  private readToken(): StoredToken | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as StoredToken) : null;
    } catch {
      return null;
    }
  }

  private writeToken(token: StoredToken): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(token));
    } catch {
      // localStorage может быть недоступен (приватный режим) — просто не персистим между сессиями.
    }
  }

  // ------------------------------------------------------------------
  // Drive API
  // ------------------------------------------------------------------

  async list(folderPath: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();
    const folderId = folderPath === '' ? 'root' : folderPath;

    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: `files(${LIST_FIELDS}),nextPageToken`,
      pageSize: String(opts.pageSize ?? 50),
      orderBy: 'folder,name',
    });
    if (opts.cursor) params.set('pageToken', opts.cursor);

    const res = await fetch(`${API_URL}/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Google Drive API ${res.status}: ${text || res.statusText}`);
    }
    const json = (await res.json()) as DriveFileListResponse;

    // Гугл-документы/таблицы/презентации (application/vnd.google-apps.*,
    // кроме самой папки) — не бинарный файл, вставить как src/href
    // через этот провайдер нельзя (нет содержимого для alt=media в
    // привычном формате) — не показываем их в списке вовсе, чтобы не
    // предлагать пользователю выбрать то, что потом упадёт в resolve().
    const items: StorageItem[] = json.files
      .filter((entry) => entry.mimeType === FOLDER_MIME || !entry.mimeType.startsWith('application/vnd.google-apps.'))
      .map((entry) => toStorageItem(entry, folderId));

    await this.attachThumbnails(items, token, opts.signal);

    return { items, cursor: json.nextPageToken, hasMore: !!json.nextPageToken };
  }

  /**
   * Превью — best effort, как и у Dropbox/OneDrive: у Google Drive
   * REST API нет batch-эндпоинта для миниатюр (в отличие от
   * Dropbox'а и `$expand` у Graph), а сам `thumbnailLink` требует
   * авторизованный запрос для приватных файлов — поэтому тут
   * ограниченно-параллельный per-файл fetch с Authorization header,
   * результат — object URL (годится, это только превью в самом UI
   * браузера файлов, не финальный src вставляемого asset'а — тот
   * собирается в `resolve()` отдельно, как data: URL).
   */
  private async attachThumbnails(items: StorageItem[], token: string, signal?: AbortSignal): Promise<void> {
    const imageItems = items.filter(
      (item) => item.kind === 'file' && (item.raw as DriveFile).thumbnailLink && guessAssetType(item.mimeType, item.name) === 'image',
    );
    if (!imageItems.length) return;

    let cursor = 0;
    const worker = async () => {
      while (cursor < imageItems.length) {
        const item = imageItems[cursor++];
        const link = (item.raw as DriveFile).thumbnailLink!;
        try {
          const res = await fetch(link, { headers: { Authorization: `Bearer ${token}` }, signal });
          if (!res.ok) continue;
          const blob = await res.blob();
          item.thumbnailUrl = URL.createObjectURL(blob);
        } catch {
          // Не критично — просто останется без превью (иконка по типу файла).
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(THUMBNAIL_CONCURRENCY, imageItems.length) }, worker));
  }

  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${API_URL}/files/${encodeURIComponent(item.path)}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Google Drive API ${res.status}: ${text || res.statusText}`);
    }
    const blob = await res.blob();
    if (blob.size > MAX_INLINE_BYTES) {
      throw new GcaError(
        'google.error.fileTooLarge',
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
      // data: URL не истекает — в отличие от Dropbox/OneDrive, expiresAt тут не нужен.
    };
  }

  async upload(file: File, folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const token = await this.ensureAccessToken();
    const parentId = folderPath === '' ? 'root' : folderPath;

    const boundary = `gca-${Math.random().toString(36).slice(2)}`;
    const metadata = JSON.stringify({ name: file.name, parents: [parentId] });
    const body = await buildMultipartBody(boundary, metadata, file);

    const created = await new Promise<DriveFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${UPLOAD_URL}?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,thumbnailLink,parents`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', `multipart/related; boundary=${boundary}`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as DriveFile);
        } else {
          reject(
            new GcaError('google.error.uploadFailed', `Google Drive: upload failed (status ${xhr.status})`, {
              status: xhr.status,
            }),
          );
        }
      };
      xhr.onerror = () => reject(new GcaError('google.error.uploadNetworkError', 'Google Drive: network error while uploading the file'));
      xhr.send(body);
    });

    return toStorageItem(created, parentId);
  }

  /**
   * Поиск по ВСЕМУ Google Drive пользователя (не только текущей
   * папке) — по имени файла (`name contains`), а не по содержимому:
   * полнотекстовый `fullText contains` шумит результатами (совпадения
   * внутри документов) и не то, чего ждут от строки поиска в файловом
   * пикере.
   */
  async search(query: string, opts: ListOptions = {}): Promise<ListResult> {
    const token = await this.ensureAccessToken();
    const escaped = escapeDriveQueryValue(query);

    const params = new URLSearchParams({
      q: `name contains '${escaped}' and trashed = false`,
      fields: `files(${LIST_FIELDS}),nextPageToken`,
      pageSize: String(opts.pageSize ?? 50),
      orderBy: 'folder,name',
    });
    if (opts.cursor) params.set('pageToken', opts.cursor);

    const res = await fetch(`${API_URL}/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Google Drive API ${res.status}: ${text || res.statusText}`);
    }
    const json = (await res.json()) as DriveFileListResponse;

    const items: StorageItem[] = json.files
      .filter((entry) => entry.mimeType === FOLDER_MIME || !entry.mimeType.startsWith('application/vnd.google-apps.'))
      .map((entry) => toStorageItem(entry, entry.parents?.[0] ?? ''));

    await this.attachThumbnails(items, token, opts.signal);

    return { items, cursor: json.nextPageToken, hasMore: !!json.nextPageToken };
  }

  /**
   * Отправляет файл в корзину Google Drive (`trashed: true`) вместо
   * необратимого `DELETE` — пользователь может ещё 30 дней
   * восстановить его через сам drive.google.com, если удалил не то.
   */
  async delete(item: StorageItem): Promise<void> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${API_URL}/files/${encodeURIComponent(item.path)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Google Drive API ${res.status}: ${text || res.statusText}`);
    }
  }
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

function toStorageItem(entry: DriveFile, parentPath: string): StorageItem {
  const isFolder = entry.mimeType === FOLDER_MIME;
  return {
    id: entry.id,
    name: entry.name,
    kind: isFolder ? 'folder' : 'file',
    mimeType: isFolder ? undefined : entry.mimeType,
    size: entry.size !== undefined ? Number(entry.size) : undefined,
    modifiedAt: entry.modifiedTime,
    path: entry.id,
    parentPath,
    webUrl: entry.webViewLink,
    raw: entry,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read the downloaded file'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function buildMultipartBody(boundary: string, metadataJson: string, file: File): Promise<Blob> {
  const fileBytes = await file.arrayBuffer();
  const parts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataJson}\r\n`,
    `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  ];
  return new Blob([parts[0], parts[1], fileBytes, `\r\n--${boundary}--`], { type: `multipart/related; boundary=${boundary}` });
}
