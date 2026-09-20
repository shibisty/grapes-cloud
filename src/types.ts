/**
 * Единый контракт, который реализует КАЖДОЕ облачное хранилище
 * (Dropbox, Google Drive, OneDrive, S3-совместимое...).
 *
 * Важно: у Dropbox/Google/OneDrive есть свои готовые "пикеры" со
 * своим внешним видом, но мы их не используем. Мы рисуем один
 * собственный UI (AssetBrowser) для всех провайдеров, а провайдер —
 * это только источник данных: список файлов, ссылка на файл,
 * загрузка. Поэтому интерфейс намеренно НЕ содержит ничего похожего
 * на "open native picker" — только list/resolve/upload.
 */

export type StorageItemKind = 'file' | 'folder';

export interface StorageItem {
  /** Стабильный id в рамках провайдера (не обязательно путь). */
  id: string;
  name: string;
  kind: StorageItemKind;
  /** MIME-тип, если известен (для файлов). */
  mimeType?: string;
  /** Размер в байтах, если известен. */
  size?: number;
  /** ISO 8601. */
  modifiedAt?: string;
  /** Превью-картинка для грида, если провайдер её отдаёт. */
  thumbnailUrl?: string;
  /**
   * Путь/идентификатор, который провайдер использует для навигации —
   * то, что нужно передать в list() чтобы зайти в папку, или в
   * resolve() чтобы получить готовый asset.
   */
  path: string;
  /** Родительский путь — для кнопки "назад" без похода к провайдеру. */
  parentPath: string;
  /**
   * Ссылка на файл/папку в собственном веб-интерфейсе провайдера
   * (dropbox.com, drive.google.com, office.com) — если он её отдаёт.
   * Используется контекстным меню ("Открыть в отдельной вкладке").
   * Необязательно: не у каждого провайдера/элемента такая ссылка
   * вообще существует или доступна без лишнего запроса.
   */
  webUrl?: string;
  /** Оригинальный ответ провайдера — для отладки/расширения. */
  raw?: unknown;
}

export interface ListResult {
  items: StorageItem[];
  /** Курсор для следующей страницы, если провайдер поддерживает пагинацию. */
  cursor?: string;
  hasMore: boolean;
}

export interface ListOptions {
  cursor?: string;
  pageSize?: number;
  /** AbortSignal — AssetBrowser отменяет предыдущий запрос при быстрой навигации. */
  signal?: AbortSignal;
}

export type ResolvedAssetType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface ResolvedAsset {
  /** URL, который можно подставить в src/href компонента GrapesJS. */
  src: string;
  name: string;
  type: ResolvedAssetType;
  mimeType?: string;
  /** Провайдер, из которого пришёл asset — сохраняем в GrapesJS asset. */
  provider: string;
  /**
   * epoch ms, если src — временная ссылка (у Dropbox/Google/OneDrive
   * почти всегда так). AssetBrowser не хранит such ссылки как
   * постоянные — только на момент вставки.
   */
  expiresAt?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export interface AuthState {
  authenticated: boolean;
  /** Имя аккаунта/почта для отображения в UI ("Подключено как ..."). */
  accountLabel?: string;
  /**
   * `false` — провайдеру ещё не хватает пользовательских данных,
   * чтобы вообще пытаться войти (например, у Dropbox не введён App
   * Key). AssetBrowser в этом случае показывает мастер настройки
   * (`getSetupInfo()`) вместо обычной кнопки "Войти". Необязательно:
   * провайдеры без этого понятия (LocalAssetsProvider) поле просто
   * не выставляют — тогда ведёт себя как `true`.
   */
  configured?: boolean;
}

/**
 * Информация для вкладки "Подключённые аккаунты" (шестерёнка в ряду
 * вкладок рядом с "+", см. `AssetBrowser.openSettingsModal`) — ЧИСТО
 * информационная (см. `StorageProvider.getSessionInfo`): показывает,
 * что уже происходит с сессией, но не даёт ничем управлять — ни
 * "временем жизни токена", ни принудительным сбросом раньше времени.
 * Именно так и было запрошено (см. историю проекта): "либо авто от
 * токена, либо логаут от клиента, сами ничего не делаем" — то есть
 * плагин не должен добавлять свою собственную политику истечения
 * сессии поверх настоящего OAuth-механизма провайдера.
 */
export interface ProviderSessionInfo {
  /**
   * epoch ms — когда был выполнен ПЕРВЫЙ явный вход (`authenticate()`),
   * а не последнее тихое обновление токена (`ensureAccessToken()`).
   * `undefined` — либо провайдер ещё не реализует это поле (авторизация
   * состоялась до появления этой функции в более старой версии
   * плагина), либо ещё не разу не логинился.
   */
  authenticatedAt?: number;
  /** epoch ms — когда истекает ТЕКУЩИЙ access-токен (для живого обратного отсчёта в UI). */
  expiresAt?: number;
  /**
   * Сохранённый App Key/Client ID/Application ID — тот же, что ввели
   * в мастере настройки (`setCredential`). Не секрет: это публичный
   * идентификатор OAuth-приложения, а не пользовательский токен, и
   * его и так видно/копируется в самом мастере настройки.
   */
  credential?: string;
  /**
   * i18n-ключ короткой информационной заметки про то, как в принципе
   * ведёт себя сессия у ЭТОГО провайдера (например, у OneDrive —
   * жёсткий потолок в 24 часа, задокументированный самим Microsoft
   * для SPA-приложений без бэкенда, см. `OneDriveProvider`). Просто
   * текст для UI, не настройка — обойти то, что описывает эта заметка,
   * на стороне клиента нельзя.
   */
  sessionNoteKey?: string;
}

/** Один шаг мастера настройки провайдера — см. `StorageProvider.getSetupInfo`. */
export interface ProviderSetupStep {
  /**
   * Готовый текст шага на каком-то одном языке. Нужен провайдерам,
   * которые не участвуют в системе локализации плагина (см.
   * `i18nKey`) — например, собственному провайдеру сайта. Игнорируется,
   * если задан `i18nKey`.
   */
  text?: string;
  /**
   * Ключ сообщения в общем каталоге плагина (`src/i18n/types.ts`, без
   * префикса `cloudAssets.`) — так шаг переводится на все языки, что
   * и остальной интерфейс `AssetBrowser`, вместо текста на одном
   * языке. Именно так это сделано в `DropboxProvider.getSetupInfo()`.
   */
  i18nKey?: string;
  /** Параметры интерполяции `{param}` для перевода по `i18nKey`. */
  i18nParams?: Record<string, unknown>;
  /**
   * Если задано — под текстом рисуется поле только для чтения с
   * этим значением и кнопкой "Скопировать" (например, redirect URI,
   * который нужно вставить в консоль провайдера).
   */
  copyValue?: string;
}

/**
 * Инструкция для мастера настройки — что показать вместо обычной
 * кнопки "Войти", пока провайдер `!getAuthState().configured`.
 */
export interface ProviderSetupInfo {
  /** Ссылка "Create app"/аналог в консоли провайдера, открывается в новой вкладке. */
  createAppUrl: string;
  steps: ProviderSetupStep[];
  /**
   * i18n-ключ подписи поля ввода credential'а в мастере настройки.
   * У разных провайдеров это поле называется по-разному (у Dropbox —
   * "App Key", у Google — "Client ID", у Microsoft — "Application
   * (client) ID") — не одно и то же поле, хоть и играет одну роль.
   * Необязательно: по умолчанию используется общий `setup.appKeyPlaceholder`
   * (как у Dropbox, для обратной совместимости).
   */
  credentialLabelKey?: string;
}

/**
 * Провайдер хранилища. `upload` и `search` необязательны — не у
 * всех хранилищ они нужны в MVP (например, для S3 в первой версии
 * можно обойтись без search).
 */
export interface StorageProvider {
  readonly id: string;
  readonly label: string;
  /** Инлайновый SVG (строка) — рисуется как иконка вкладки провайдера. */
  readonly icon: string;

  getAuthState(): AuthState;
  /** Запускает вход (OAuth-попап и т.п.). Резолвится, когда токен получен. */
  authenticate(): Promise<AuthState>;
  disconnect(): Promise<void> | void;

  /** folderPath === '' — корень хранилища. */
  list(folderPath: string, opts?: ListOptions): Promise<ListResult>;

  /** Готовит asset к вставке в холст (получает пригодный для <img>/<a> URL). */
  resolve(item: StorageItem): Promise<ResolvedAsset>;

  upload?(
    file: File,
    folderPath: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<StorageItem>;

  search?(query: string, opts?: ListOptions): Promise<ListResult>;

  /**
   * Удалить файл/папку из хранилища провайдера (не из редактора —
   * это про сам облачный аккаунт). Необязательно: провайдер без
   * поддержки удаления (или намеренно read-only) может его не
   * иметь — тогда AssetBrowser не показывает пункт "Удалить" в
   * контекстном меню вовсе.
   */
  delete?(item: StorageItem): Promise<void>;

  /**
   * Добавить файл по прямой ссылке (без загрузки файла) — то, что в
   * стандартном Asset Manager GrapesJS называется полем "Add image".
   * Необязательно: провайдер без своего файлового хранилища (S3 c
   * произвольными bucket'ами, публичные ссылки) может его не иметь.
   */
  addByUrl?(url: string): Promise<StorageItem>;

  /**
   * Инструкция для мастера настройки — реализуют только провайдеры,
   * которым нужен пользовательский App Key/Client ID (Dropbox
   * сейчас). Показывается в AssetBrowser, когда
   * `getAuthState().configured === false`.
   */
  getSetupInfo?(): ProviderSetupInfo;
  /** Сохраняет введённый в мастере настройки ключ (пустая строка — сбросить). */
  setCredential?(value: string): void;

  /**
   * Данные для вкладки "Подключённые аккаунты" — см. `ProviderSessionInfo`.
   * Необязательно: провайдеры без понятия "сессия с истечением"
   * (LocalAssetsProvider, S3 — там доступ по постоянной паре ключей,
   * а не по OAuth-токену) его не реализуют, и тогда в этой вкладке
   * такой провайдер просто не показывается (см. AssetBrowser).
   */
  getSessionInfo?(): ProviderSessionInfo;
}

/**
 * Одно подключение к S3-совместимому хранилищу, введённое
 * пользователем через попап "Подключить S3" (см.
 * `AssetBrowser.openConnectS3Modal`/`S3Provider`) — в отличие от
 * Dropbox/Google/OneDrive, у S3 нет OAuth и общего App Key: доступ
 * даётся напрямую через пару ключей конкретного bucket'а, так что
 * весь набор параметров вводится и хранится (в localStorage браузера,
 * ключ `gca_s3_connections`) целиком на стороне AssetBrowser, а не
 * передаётся владельцем сайта через `pluginsOpts.providers` (хотя
 * ничто не мешает и так — `S3Provider` принимает этот же тип в
 * конструкторе, см. README).
 */
export interface S3ConnectionConfig {
  /** Стабильный id соединения — из него строится `StorageProvider.id` (см. `S3Provider`), не зависит от имени вкладки. */
  id: string;
  /** Имя вкладки, которое ввёл пользователь при подключении. */
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  /**
   * Свой endpoint для S3-совместимых сервисов (MinIO, Wasabi,
   * DigitalOcean Spaces, Cloudflare R2...). Пусто/undefined — обычный
   * AWS S3 (`https://s3.<region>.amazonaws.com`).
   */
  endpoint?: string;
  /**
   * path-style URL (`https://<endpoint>/<bucket>/<key>`) вместо
   * virtual-hosted (`https://<bucket>.<endpoint>/<key>`) — нужно
   * почти всем self-hosted эндпоинтам и большинству S3-совместимых
   * сервисов кроме самого AWS.
   */
  forcePathStyle?: boolean;
}

/** Опции плагина, которые задаёт владелец сайта в pluginsOpts. */
export interface CloudAssetsPluginOptions {
  /** Список подключённых облачных провайдеров — плагин их не создаёт сам. */
  providers: StorageProvider[];
  /**
   * Первой вкладкой, перед облачными хранилищами, по умолчанию
   * добавляется "Свои файлы" — локальный менеджер (файлы, уже
   * добавленные в редактор, загрузка с диска, вставка по прямой
   * ссылке). Поставьте `false`, если на сайте это не нужно (например,
   * все ассеты сайта обязаны идти только из корпоративного хранилища).
   */
  includeLocalTab?: boolean;
  /**
   * Заголовок модального окна выбора файла у кнопки на тулбаре (см.
   * `registerCloudMediaButton`). У каждого блока в Block Manager
   * своё окно — там заголовком всегда служит имя провайдера (см.
   * `blockLabel` ниже).
   */
  modalTitle?: string;
  /**
   * @deprecated Больше не используется. Раньше подписывал общий блок
   * "Cloud media" в Block Manager — этот блок убрали: он визуально
   * дублировал блок первого провайдера (обычно "Свои файлы"), оба
   * открывали одно и то же окно, только с разной начальной вкладкой.
   * Теперь в Block Manager по одному блоку на каждый провайдер, и его
   * подпись — это `provider.label`. Поле оставлено ради обратной
   * совместимости `pluginsOpts`, значение игнорируется.
   */
  blockLabel?: string;
  /**
   * Категория (группа) блоков провайдеров в Block Manager — отдельная
   * секция, а не общий список блоков вперемешку с блоками других
   * плагинов.
   */
  blockCategory?: string;
  /** title кнопки на верхней панели редактора. */
  buttonLabel?: string;
}
