import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Корень',
    loading: 'Загрузка…',
    empty: 'Здесь пока пусто.',
    loadMore: 'Ещё',
    uploadFile: 'Загрузить файл',
    urlPlaceholder: 'Вставить ссылку на файл…',
    addUrl: 'Добавить',
    searchPlaceholder: 'Поиск по файлам…',
    filter: {
      all: 'Все типы',
    },
    settings: 'Настройки',
    refresh: 'Обновить',
    selectedCount: 'Выбрано: {count}',
    cancelSelection: 'Отмена',
    insertSelected: 'Вставить ({count})',
    openInTab: 'Открыть в отдельной вкладке',
    delete: 'Удалить',
    deleteConfirm: 'Точно удалить?',
    viewGrid: 'Вид плиткой',
    viewTable: 'Вид таблицей',
    viewTree: 'Вид деревом',
    columnName: 'Имя',
    columnType: 'Тип',
    columnSize: 'Размер',
    columnModified: 'Изменён',
    type: {
      image: 'Изображение',
      video: 'Видео',
      audio: 'Аудио',
      document: 'Документ',
      folder: 'Папка',
      other: 'Файл',
    },
    error: {
      generic: 'Не удалось загрузить список файлов',
    },
    dropzone: {
      active: 'Отпустите, чтобы загрузить',
    },
    upload: {
      queueTitle: 'Загрузка {done}/{total}',
      uploading: 'Загрузка…',
      done: 'Готово',
      error: 'Ошибка',
      close: 'Закрыть',
    },
    tree: {
      expandAll: 'Развернуть всё',
      collapseAll: 'Свернуть всё',
      expandFolder: 'Развернуть папку',
      collapseFolder: 'Свернуть папку',
    },
    addConnection: 'Добавить подключение',
    moreTabs: 'Ещё вкладки',
    removeConnection: 'Удалить подключение',
    removeConnectionConfirm: 'Точно удалить?',
  },
  auth: {
    connectPrompt: 'Подключите {provider}, чтобы выбирать файлы отсюда.',
    loginButton: 'Войти в {provider}',
    loggingIn: 'Открываем окно авторизации…',
    loginFailed: 'Не удалось войти.',
    changeAppKey: 'Изменить App Key',
    logout: 'Выйти',
    logoutConfirm: 'Точно выйти?',
  },
  setup: {
    missingInfo: '{provider} требует настройки, но инструкция недоступна.',
    intro: 'Чтобы подключить {provider}, сначала создайте приложение в консоли разработчика: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Сохранить',
    saveFailed: 'Не удалось сохранить App Key.',
    copy: 'Скопировать',
    copied: 'Скопировано',
    selected: 'Выделено, нажмите Ctrl+C',
    uploadHint: 'После подключения файлы можно будет также загружать перетаскиванием (файла или целой папки) прямо в список, или кнопкой «Загрузить файл» выше.',
  },
  block: {
    label: 'Облачные медиа',
    category: 'Хранилище',
  },
  button: {
    label: 'Вставить из облака',
  },
  modal: {
    title: 'Вставить из облака',
  },
  local: {
    tabLabel: 'Свои файлы',
    error: {
      emptyUrl: 'Вставьте ссылку на файл',
      readFile: 'Не удалось прочитать файл',
    },
  },
  dropbox: {
    setup: {
      step1: 'Откройте Dropbox App Console и нажмите «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Введите любое имя приложения и нажмите Create app.',
      step3: 'На вкладке Permissions отметьте files.metadata.read, files.content.read и files.content.write, затем нажмите Submit.',
      step4WithRedirect: 'На вкладке Settings, в разделе Redirect URIs, вставьте и нажмите Add:',
      step4NoRedirect:
        'На вкладке Settings, в разделе Redirect URIs, добавьте полный URL страницы public/dropbox-callback.html на вашем домене — автоматически определить его не удалось (см. redirectUri в опциях провайдера).',
      step5: 'На той же вкладке Settings скопируйте App key и вставьте его в поле ниже.',
    },
    error: {
      exchangeCode: 'Dropbox: не удалось обменять code на токен (код {status})',
      requireAppKey: 'Сначала сохраните App Key (см. мастер настройки).',
      requireRedirectUri:
        'Не удалось определить redirectUri автоматически. Передайте его явно в опциях DropboxProvider (нужно, если плагин подключён через <script type="module"> или бандлер).',
      notConnected: 'Dropbox не подключён.',
      sessionExpired: 'Сессия Dropbox истекла, войдите снова.',
      refreshFailed: 'Dropbox: не удалось обновить токен (код {status})',
      uploadFailed: 'Dropbox: загрузка не удалась (код {status})',
      uploadNetworkError: 'Dropbox: сетевая ошибка при загрузке файла',
    },
  },
  google: {
    setup: {
      step1: 'Откройте Google Cloud Console, создайте проект (или выберите существующий), затем откройте «APIs & Services».',
      step2: 'В разделе Library найдите и включите «Google Drive API».',
      step3:
        'В разделе «OAuth consent screen» выберите User type → External, добавьте scope .../auth/drive.readonly и добавьте свой Google-аккаунт в test users (неверифицированное приложение доступно только тестовым пользователям и показывает предупреждение — для публикации на многих пользователей нужна верификация Google).',
      step4WithOrigin:
        'В разделе Credentials → Create Credentials → OAuth client ID выберите Application type «Web application» и в Authorized JavaScript origins вставьте это и нажмите Add:',
      step4NoOrigin:
        'В разделе Credentials → Create Credentials → OAuth client ID выберите Application type «Web application» и в Authorized JavaScript origins добавьте точный origin (протокол + домен + порт), с которого отдаётся сайт — автоматически определить его не удалось.',
      step5: 'На том же экране скопируйте Client ID (заканчивается на .apps.googleusercontent.com) и вставьте его в поле ниже.',
    },
    error: {
      gisLoadFailed: 'Не удалось загрузить Google Identity Services (accounts.google.com/gsi/client) — проверьте соединение или блокировщик рекламы/скриптов.',
      tokenFailed: 'Google не вернул токен доступа. Попробуйте войти снова.',
      requireClientId: 'Сначала сохраните Client ID (см. мастер настройки).',
      notConnected: 'Google Drive не подключён.',
      sessionExpired: 'Сессия Google истекла, войдите снова.',
      fileTooLarge:
        'Файл больше {maxMb} МБ — файлы Google Drive вставляются как data URL, поскольку сервера нет, а этот файл для этого слишком большой.',
      uploadFailed: 'Google Drive: загрузка не удалась (код {status})',
      uploadNetworkError: 'Google Drive: сетевая ошибка при загрузке файла',
    },
  },
  microsoft: {
    setup: {
      step1: 'Откройте Azure Portal → Microsoft Entra ID → App registrations и нажмите «New registration».',
      step2: 'В Supported account types выберите «Accounts in any organizational directory and personal Microsoft accounts», затем нажмите Register.',
      step3:
        'В API permissions → Add a permission → Microsoft Graph → Delegated permissions добавьте Files.ReadWrite и offline_access, затем нажмите Add permissions.',
      step4WithRedirect:
        'В Authentication → Add a platform → Single-page application вставьте это в Redirect URIs и нажмите Configure:',
      step4NoRedirect:
        'В Authentication → Add a platform → Single-page application добавьте в Redirect URIs полный URL страницы public/microsoft-callback.html на вашем домене — автоматически определить его не удалось (см. redirectUri в опциях провайдера).',
      step5: 'На странице Overview скопируйте Application (client) ID и вставьте его в поле ниже.',
    },
    error: {
      exchangeCode: 'Microsoft: не удалось обменять code на токен (код {status})',
      requireClientId: 'Сначала сохраните Application (client) ID (см. мастер настройки).',
      requireRedirectUri:
        'Не удалось определить redirectUri автоматически. Передайте его явно в опциях OneDriveProvider (нужно, если плагин подключён через <script type="module"> или бандлер).',
      notConnected: 'OneDrive не подключён.',
      sessionExpired: 'Сессия Microsoft истекла, войдите снова.',
      refreshFailed: 'Microsoft: не удалось обновить токен (код {status})',
      noSpoLicense:
        'У организации этого аккаунта Microsoft не лицензирован OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). Войдите под личным аккаунтом Microsoft (outlook.com/hotmail/live) или под рабочим аккаунтом, в организации которого включён OneDrive for Business.',
      noDownloadableContent:
        '«{name}» нельзя вставить — обычно так бывает у блокнотов OneNote или у других элементов, которые OneDrive не может отдать как обычный файл.',
      uploadFailed: 'OneDrive: загрузка не удалась (код {status})',
      uploadNetworkError: 'OneDrive: сетевая ошибка при загрузке файла',
    },
  },
  s3: {
    connectMenuItem: 'Подключить S3',
    modalTitle: 'Подключение S3-совместимого хранилища',
    nameLabel: 'Название вкладки',
    namePlaceholder: 'например, Мой бакет',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Регион',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Свой endpoint (необязательно)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Оставьте пустым для AWS S3. Заполните для S3-совместимых сервисов (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Использовать path-style URL (нужно для большинства self-hosted/S3-совместимых сервисов)',
    corsHint: 'Бакет должен разрешать CORS-запросы с этого сайта (GET, PUT, DELETE, HEAD) — настройте это в CORS-правилах бакета.',
    connect: 'Подключить',
    cancel: 'Отмена',
    connecting: 'Подключение…',
    error: {
      required: 'Заполните все обязательные поля.',
      duplicateName: 'Вкладка с таким названием уже существует.',
      connectFailed: 'Не удалось подключиться: {message}',
      listFailed: 'S3: не удалось получить список объектов (код {status})',
      uploadFailed: 'S3: загрузка не удалась (код {status})',
      uploadNetworkError: 'S3: сетевая ошибка при загрузке файла',
      deleteFailed: 'S3: не удалось удалить (код {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'OAuth-вход по PKCE требует Web Crypto API (crypto.subtle), который браузер отключает на незащищённом источнике — обычном http, если это не localhost. Откройте сайт по https:// или, для проверки, через http://localhost.',
      popupBlocked: 'Браузер заблокировал всплывающее окно авторизации. Разрешите попапы для этого сайта.',
      stateMismatch: 'Ответ авторизации не прошёл проверку (несовпадение state).',
      popupClosed: 'Окно авторизации было закрыто до завершения входа.',
    },
  },
};

export default messages;
