import type {
  AuthState,
  ListOptions,
  ListResult,
  ResolvedAsset,
  S3ConnectionConfig,
  StorageItem,
  StorageProvider,
  UploadProgress,
} from '../../types';
import { guessAssetType, guessMimeType } from '../../utils/assetType';
import { GcaError } from '../../i18n/errors';
import { presignUrl, signedHeaders, type S3Endpoint } from './sigv4';

/** Ссылка на файл (GET) живёт час — на вставку в холст этого с большим запасом хватает (сравнимо с 4 часами у Dropbox). */
const RESOLVE_EXPIRES_SECONDS = 60 * 60;
/** Ссылка на загрузку (PUT) — короче: используется сразу же самим XHR, а не сохраняется никуда. */
const UPLOAD_EXPIRES_SECONDS = 15 * 60;

/** '/Docs/Sub' → 'Docs/Sub' (ключ S3 без ведущего слэша, которым PROD пути помечены в остальном UI — см. `AssetBrowser`/tree-тесты). */
function toKey(uiPath: string): string {
  return uiPath.startsWith('/') ? uiPath.slice(1) : uiPath;
}

/** '' → '' (корень бакета), '/Docs' → 'Docs/' (префикс для ListObjectsV2 — с завершающим слэшем). */
function toPrefix(uiFolderPath: string): string {
  const key = toKey(uiFolderPath);
  return key === '' ? '' : `${key}/`;
}

function textOf(el: Element, tag: string): string {
  return el.getElementsByTagName(tag)[0]?.textContent ?? '';
}

/**
 * Иконка "ведро" — используется и как `StorageProvider.icon` каждого
 * инстанса (вкладка), и как `S3Provider.ICON` (статика) в пункте
 * меню "Подключить S3" ДО того, как вообще появился хоть один
 * инстанс — см. `AssetBrowser.renderAddConnectionButton`.
 */
const S3_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7"/>' +
  '<path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>';

/**
 * `StorageProvider` для прямого доступа к S3-совместимому бакету
 * (настоящий AWS S3 или MinIO/Wasabi/DigitalOcean Spaces/Cloudflare
 * R2 и т.п. — см. `S3ConnectionConfig.endpoint`/`forcePathStyle`) —
 * без сервера, напрямую из браузера через подписанные запросы
 * (`../s3/sigv4.ts`).
 *
 * В отличие от Dropbox/Google/OneDrive здесь нет OAuth: доступ у
 * пользователя уже есть в момент, когда он вводит пару ключей в
 * попапе "Подключить S3" (`AssetBrowser.openConnectS3Modal`), поэтому
 * `getAuthState()` всегда `authenticated: true` — экран входа/мастер
 * настройки для этого провайдера в принципе не показывается
 * (AssetBrowser создаёт инстанс, только когда все параметры уже
 * известны).
 *
 * Требование к самому бакету — CORS должен разрешать запросы с
 * origin'а сайта (методы GET/PUT/DELETE/HEAD) — без этого браузер не
 * даст прочитать ответ ни на один вызов ниже, никакая подпись тут не
 * поможет. Текст-подсказка об этом — `s3.corsHint` в мастере
 * подключения.
 */
export class S3Provider implements StorageProvider {
  /** См. doc-комментарий у `S3_ICON` выше. */
  static readonly ICON = S3_ICON;

  readonly id: string;
  readonly label: string;
  readonly icon = S3_ICON;

  constructor(private readonly config: S3ConnectionConfig) {
    this.id = `s3:${config.id}`;
    this.label = config.name;
  }

  private get endpoint(): S3Endpoint {
    return {
      bucket: this.config.bucket,
      region: this.config.region,
      endpoint: this.config.endpoint,
      forcePathStyle: this.config.forcePathStyle,
    };
  }

  // ------------------------------------------------------------------
  // Auth — здесь фактически нет: ключи вводятся один раз в попапе
  // подключения (см. doc-комментарий класса) и живут вместе с
  // остальным конфигом соединения (persist — забота AssetBrowser).
  // ------------------------------------------------------------------

  getAuthState(): AuthState {
    return { authenticated: true, configured: true, accountLabel: this.config.bucket };
  }

  async authenticate(): Promise<AuthState> {
    return this.getAuthState();
  }

  disconnect(): void {
    // Нечего сбрасывать локально — само соединение (и его ключи)
    // удаляет AssetBrowser.removeS3Connection() вместе с записью в
    // localStorage, когда пользователь нажимает "×" на вкладке.
  }

  // ------------------------------------------------------------------
  // S3 REST API (ListObjectsV2 / GetObject / PutObject / DeleteObject)
  // ------------------------------------------------------------------

  async list(folderPath: string, opts: ListOptions = {}): Promise<ListResult> {
    const prefix = toPrefix(folderPath);
    const query: Record<string, string> = {
      'list-type': '2',
      delimiter: '/',
      'max-keys': String(opts.pageSize ?? 1000),
    };
    if (prefix) query.prefix = prefix;
    if (opts.cursor) query['continuation-token'] = opts.cursor;

    const { headers, url } = await signedHeaders({
      method: 'GET',
      endpoint: this.endpoint,
      key: '',
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      query,
    });

    const res = await fetch(url, { method: 'GET', headers, signal: opts.signal });
    if (!res.ok) {
      throw new GcaError('s3.error.listFailed', `S3: failed to list objects (status ${res.status})`, {
        status: res.status,
      });
    }

    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const root = doc.documentElement;

    const folders: StorageItem[] = [...doc.getElementsByTagName('CommonPrefixes')].map((el) => {
      const rawPrefix = textOf(el, 'Prefix'); // например "Docs/Sub/"
      const trimmed = rawPrefix.replace(/\/$/, '');
      const name = trimmed.slice(prefix.length) || trimmed;
      return {
        id: `folder:${trimmed}`,
        name,
        kind: 'folder',
        path: `/${trimmed}`,
        parentPath: folderPath,
        raw: rawPrefix,
      };
    });

    const files: StorageItem[] = [...doc.getElementsByTagName('Contents')]
      .map((el) => ({
        key: textOf(el, 'Key'),
        size: Number(textOf(el, 'Size') || '0'),
        lastModified: textOf(el, 'LastModified'),
      }))
      // "Маркер папки" — нулевой объект, чей ключ заканчивается на "/"
      // (ровно текущий префикс — для самой этой папки, ИЛИ префикс
      // какой-то вложенной — та же папка, что уже пришла отдельной
      // записью в CommonPrefixes). Некоторые консоли/клиенты создают
      // такой объект при явном "создании папки" — ListObjectsV2 с
      // delimiter всё равно возвращает его в Contents отдельной
      // строкой ПОМИМО CommonPrefixes, так что без этого фильтра папка
      // задваивалась бы файлом с пустым либо оканчивающимся на "/" именем.
      .filter((entry) => {
        const relative = entry.key.slice(prefix.length);
        return relative !== '' && !relative.endsWith('/');
      })
      .map((entry) => {
        const name = entry.key.slice(prefix.length);
        return {
          id: `file:${entry.key}`,
          name,
          kind: 'file' as const,
          size: entry.size,
          modifiedAt: entry.lastModified || undefined,
          mimeType: guessMimeType(name),
          path: `/${entry.key}`,
          parentPath: folderPath,
          raw: entry,
        };
      });

    const isTruncated = textOf(root, 'IsTruncated') === 'true';
    const nextToken = textOf(root, 'NextContinuationToken') || undefined;

    return { items: [...folders, ...files], cursor: isTruncated ? nextToken : undefined, hasMore: isTruncated };
  }

  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    const src = await presignUrl({
      method: 'GET',
      endpoint: this.endpoint,
      key: toKey(item.path),
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      expiresSeconds: RESOLVE_EXPIRES_SECONDS,
    });

    return {
      src,
      name: item.name,
      type: guessAssetType(item.mimeType, item.name),
      mimeType: item.mimeType,
      provider: this.id,
      expiresAt: Date.now() + RESOLVE_EXPIRES_SECONDS * 1000,
    };
  }

  async upload(file: File, folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const key = `${toPrefix(folderPath)}${file.name}`;
    const url = await presignUrl({
      method: 'PUT',
      endpoint: this.endpoint,
      key,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      expiresSeconds: UPLOAD_EXPIRES_SECONDS,
    });

    // XMLHttpRequest, не fetch — как и у остальных провайдеров, ради
    // xhr.upload.onprogress (см. комментарий в DropboxProvider.upload).
    // Content-Type НЕ входит в подписанные заголовки presigned URL
    // (SignedHeaders=host) — это стандартная практика для
    // presigned-загрузок из браузера, S3 её не отвергает.
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new GcaError('s3.error.uploadFailed', `S3: upload failed (status ${xhr.status})`, { status: xhr.status }));
        }
      };
      xhr.onerror = () => reject(new GcaError('s3.error.uploadNetworkError', 'S3: network error while uploading the file'));
      xhr.send(file);
    });

    return {
      id: `file:${key}`,
      name: file.name,
      kind: 'file',
      size: file.size,
      mimeType: file.type || guessMimeType(file.name),
      modifiedAt: new Date().toISOString(),
      path: `/${key}`,
      parentPath: folderPath,
    };
  }

  async delete(item: StorageItem): Promise<void> {
    const { headers, url } = await signedHeaders({
      method: 'DELETE',
      endpoint: this.endpoint,
      key: toKey(item.path),
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
    });
    const res = await fetch(url, { method: 'DELETE', headers });
    // S3 отвечает 204 No Content на успешный DELETE (в т.ч. если
    // ключа уже не было — операция идемпотентна), поэтому именно
    // 204/2xx — критерий успеха, а не наличие тела ответа.
    if (!res.ok) {
      throw new GcaError('s3.error.deleteFailed', `S3: failed to delete (status ${res.status})`, { status: res.status });
    }
  }
}
