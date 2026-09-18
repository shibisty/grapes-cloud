/**
 * Минимальная реализация AWS Signature Version 4 для прямых запросов
 * из браузера к S3/S3-совместимому эндпоинту — без aws-sdk (там речь
 * о десятках килобайт в бандл ради того, что укладывается в
 * ~150 строк через `crypto.subtle`, который и так нужен PKCE, см.
 * `providers/pkce.ts`). Используется только `S3Provider.ts`.
 *
 * Два режима подписи, как и в самом протоколе:
 *  - `presignUrl()` — подпись в query-параметрах (`X-Amz-Signature=...`),
 *    для GET (просмотр/вставка файла — идёт прямо в `<img src>`) и PUT
 *    (загрузка через XMLHttpRequest, чтобы был `xhr.upload.onprogress`
 *    — у presigned PUT это единственный способ получить прогресс,
 *    fetch его не отдаёт).
 *  - `signedHeaders()` — подпись в заголовке `Authorization`, для
 *    остальных запросов (`GET`/`ListObjectsV2`, `DELETE`) через обычный
 *    `fetch`, где прогресс не нужен.
 *
 * Важное условие для обоих режимов — бакет должен разрешать CORS с
 * origin'а сайта (см. `s3.corsHint` в мастере подключения): без этого
 * браузер просто не даст прочитать ответ, сама подпись тут ни при
 * чём.
 */

const SERVICE = 's3';
const ALGORITHM = 'AWS4-HMAC-SHA256';
/** sha256('') — используется как payload hash для запросов без тела (GET/DELETE/ListObjectsV2). */
const EMPTY_PAYLOAD_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return toHex(digest);
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key: ArrayBuffer | Uint8Array, data: string): Promise<string> {
  return toHex(await hmac(key, data));
}

/** Цепочка HMAC AWS4<secret> → date → region → service → "aws4_request" — см. спецификацию SigV4. */
async function signingKey(secretAccessKey: string, dateStamp: string, region: string): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode('AWS4' + secretAccessKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

function formatAmzDate(now: Date): { amzDate: string; dateStamp: string } {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // 20240101T120000Z
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

/** Кодирование пути/значений по правилам SigV4 (шире, чем encodeURIComponent — не трогает `/` в путях, но кодирует остальное строго по RFC 3986). */
function uriEncode(value: string, keepSlash: boolean): string {
  const encoded = encodeURIComponent(value).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  return keepSlash ? encoded.replace(/%2F/g, '/') : encoded;
}

function canonicalUriPath(pathSegments: string[]): string {
  return '/' + pathSegments.map((s) => uriEncode(s, false)).join('/');
}

export interface S3Endpoint {
  bucket: string;
  region: string;
  /** Свой эндпоинт (без протокола обязателен хост, схема опциональна — по умолчанию https). Пусто — настоящий AWS S3. */
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface S3RequestUrl {
  /** Хост для заголовка Host/подписи — ОБЯЗАТЕЛЬНО совпадает с хостом итогового URL. */
  host: string;
  /** Абсолютный `https://...` URL без query. */
  baseUrl: string;
  /** Путь запроса (с ведущим `/`) — часть канонического запроса. */
  canonicalPath: string;
}

/**
 * Строит хост/URL для бакета — virtual-hosted (`bucket.s3.region.amazonaws.com`
 * или `bucket.<кастомный-хост>`) или path-style (`<хост>/bucket`),
 * плюс сам путь к объекту (`key` — не кодируется здесь, кодирование
 * происходит в `canonicalUriPath`/при сборке итогового URL).
 */
export function buildRequestUrl(endpoint: S3Endpoint, key: string): S3RequestUrl {
  const keySegments = key === '' ? [] : key.split('/');

  if (endpoint.endpoint) {
    const withScheme = /^https?:\/\//.test(endpoint.endpoint) ? endpoint.endpoint : `https://${endpoint.endpoint}`;
    const url = new URL(withScheme);
    const customHost = url.host;
    const basePath = url.pathname.replace(/\/+$/, ''); // на случай, если в endpoint зашит префикс пути

    if (endpoint.forcePathStyle) {
      const host = customHost;
      const canonicalPath = canonicalUriPath([...basePath.split('/').filter(Boolean), endpoint.bucket, ...keySegments]);
      return { host, baseUrl: `${url.protocol}//${host}${canonicalPath}`, canonicalPath };
    }
    const host = `${endpoint.bucket}.${customHost}`;
    const canonicalPath = canonicalUriPath([...basePath.split('/').filter(Boolean), ...keySegments]);
    return { host, baseUrl: `${url.protocol}//${host}${canonicalPath}`, canonicalPath };
  }

  // Настоящий AWS S3 — всегда virtual-hosted, всегда https.
  const host = `${endpoint.bucket}.s3.${endpoint.region}.amazonaws.com`;
  const canonicalPath = canonicalUriPath(keySegments);
  return { host, baseUrl: `https://${host}${canonicalPath}`, canonicalPath };
}

export interface SignedHeadersResult {
  headers: Record<string, string>;
  /** Готовый URL (с query, если был) — гарантированно та же кодировка, что участвовала в подписи. */
  url: string;
}

interface BaseSignOptions {
  method: string;
  endpoint: S3Endpoint;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Query-параметры запроса (например `list-type=2&prefix=...`) — БЕЗ параметров самой подписи. */
  query?: Record<string, string>;
}

function canonicalQueryString(query: Record<string, string>): string {
  return Object.keys(query)
    .sort()
    .map((k) => `${uriEncode(k, false)}=${uriEncode(query[k], false)}`)
    .join('&');
}

/**
 * Подпись через заголовок Authorization — для ListObjectsV2/DELETE
 * через `fetch`. Тело запроса у обоих либо нет, либо не участвует в
 * подписи содержательно (DELETE без тела) — поэтому здесь всегда
 * `UNSIGNED-PAYLOAD`-эквивалент через sha256('') и НЕ поддерживается
 * подписанное тело (не нужно ни одному из вызовов `S3Provider`).
 */
export async function signedHeaders(opts: BaseSignOptions): Promise<SignedHeadersResult> {
  const now = new Date();
  const { amzDate, dateStamp } = formatAmzDate(now);
  const { host, baseUrl, canonicalPath } = buildRequestUrl(opts.endpoint, opts.key);
  const query = opts.query ?? {};

  const payloadHash = EMPTY_PAYLOAD_HASH;
  const signedHeaderNames = ['host', 'x-amz-content-sha256', 'x-amz-date'];
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;

  const canonicalRequest = [
    opts.method,
    canonicalPath,
    canonicalQueryString(query),
    canonicalHeaders,
    signedHeaderNames.join(';'),
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${opts.endpoint.region}/${SERVICE}/aws4_request`;
  const stringToSign = [ALGORITHM, amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n');

  const key = await signingKey(opts.secretAccessKey, dateStamp, opts.endpoint.region);
  const signature = await hmacHex(key, stringToSign);

  const authorization =
    `${ALGORITHM} Credential=${opts.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaderNames.join(';')}, Signature=${signature}`;

  const qs = canonicalQueryString(query);
  return {
    headers: {
      Authorization: authorization,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
    },
    url: qs ? `${baseUrl}?${qs}` : baseUrl,
  };
}

interface PresignOptions extends BaseSignOptions {
  expiresSeconds: number;
}

/**
 * Подпись в query-параметрах — для GET (превью/вставка файла,
 * подставляется прямо в `src`) и PUT (загрузка через XMLHttpRequest,
 * ради `upload.onprogress`). `UNSIGNED-PAYLOAD` — тело не участвует в
 * подписи (иначе для PUT пришлось бы заранее знать sha256 всего
 * файла, а для GET тела нет вовсе) — стандартная практика для
 * presigned-загрузок из браузера.
 */
export async function presignUrl(opts: PresignOptions): Promise<string> {
  const now = new Date();
  const { amzDate, dateStamp } = formatAmzDate(now);
  const { host, baseUrl, canonicalPath } = buildRequestUrl(opts.endpoint, opts.key);
  const credentialScope = `${dateStamp}/${opts.endpoint.region}/${SERVICE}/aws4_request`;

  const query: Record<string, string> = {
    ...(opts.query ?? {}),
    'X-Amz-Algorithm': ALGORITHM,
    'X-Amz-Credential': `${opts.accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(opts.expiresSeconds),
    'X-Amz-SignedHeaders': 'host',
  };

  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = [
    opts.method,
    canonicalPath,
    canonicalQueryString(query),
    canonicalHeaders,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [ALGORITHM, amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n');
  const key = await signingKey(opts.secretAccessKey, dateStamp, opts.endpoint.region);
  const signature = await hmacHex(key, stringToSign);

  const finalQuery = canonicalQueryString(query) + `&X-Amz-Signature=${signature}`;
  return `${baseUrl}?${finalQuery}`;
}
