/**
 * Полный каталог переводимых строк плагина — один объект такой формы
 * на каждый язык (см. `src/i18n/locales/*.ts`). Ключи совпадают с
 * путём, который передаётся в `editor.I18n.t('cloudAssets.<путь>')`
 * (точечная нотация поддерживается самим GrapesJS — см. `t.ts`).
 *
 * Технические термины и названия элементов интерфейса САМОГО Dropbox
 * (App Key, Scoped access, Full Dropbox, files.metadata.read,
 * Settings, Permissions, Redirect URIs, Create app, Submit, Add,
 * Ctrl+C и т.п.) намеренно оставлены как есть во всех языках — это
 * не текст плагина, а точные подписи кнопок/полей в консоли Dropbox,
 * и переводить их было бы не подсказкой, а источником путаницы,
 * ведь на экране пользователя они всё равно останутся на английском
 * (сама консоль Dropbox не обязана быть на том же языке).
 */
export interface CloudAssetsMessages {
  common: {
    /** Название корневой папки в хлебных крошках. */
    rootCrumb: string;
    loading: string;
    /** Пустой список файлов в текущей папке (а также — если ничего не найдено по поиску/фильтру). */
    empty: string;
    /** Короткая подпись кнопки подгрузки следующей страницы — намеренно короткая ("Ещё"/"More"), см. renderLoadMoreButton. */
    loadMore: string;
    uploadFile: string;
    urlPlaceholder: string;
    addUrl: string;
    /** Плейсхолдер поля поиска по хранилищу (см. `StorageProvider.search`). */
    searchPlaceholder: string;
    /** Пункты выпадающего фильтра по типу файла — "Все типы" плюс переиспользуемые `type.image/video/audio/document`. */
    filter: {
      all: string;
    };
    /** Заголовок/aria-label кнопки-шестерёнки с выпадающим меню настроек (сейчас там только "Выйти"). */
    settings: string;
    /** Заголовок/aria-label кнопки "Обновить сейчас" — форсирует обход 15-минутного кеша списка. */
    refresh: string;
    /** {count} — сколько файлов выбрано (множественный выбор shift/ctrl+клик). Панель над списком. */
    selectedCount: string;
    /** Кнопка "Отмена" в панели множественного выбора — снимает весь выбор. */
    cancelSelection: string;
    /** {count} — кнопка "Вставить (N)" в панели множественного выбора. */
    insertSelected: string;
    /** Пункт контекстного меню — открыть элемент в веб-интерфейсе провайдера в новой вкладке (см. `StorageItem.webUrl`). */
    openInTab: string;
    /** Пункт контекстного меню — удалить элемент из хранилища провайдера (см. `StorageProvider.delete`). */
    delete: string;
    /** Текст кнопки удаления после первого клика — второй клик подтверждает (двухшаговое подтверждение вместо window.confirm()). */
    deleteConfirm: string;
    /** Подпись кнопки-переключателя на вид "плитка" в тулбаре. */
    viewGrid: string;
    /** Подпись кнопки-переключателя на вид "таблица" в тулбаре. */
    viewTable: string;
    /** Подпись кнопки-переключателя на древовидный вид в тулбаре. */
    viewTree: string;
    /** Заголовок колонки "Имя" в табличном виде. */
    columnName: string;
    /** Заголовок колонки "Тип" в табличном виде. */
    columnType: string;
    /** Заголовок колонки "Размер" в табличном виде. */
    columnSize: string;
    /** Заголовок колонки "Изменён" в табличном виде. */
    columnModified: string;
    /** Подписи типа файла — в табличном виде и как title у иконки в плитке. */
    type: {
      image: string;
      video: string;
      audio: string;
      document: string;
      folder: string;
      /** Тип, который не подошёл ни под одну из категорий выше. */
      other: string;
    };
    error: {
      /** Общая ошибка загрузки списка файлов (когда у исключения нет собственного ключа). */
      generic: string;
      /** Запасной текст баннера "не удалось вставить файл" (см. AssetBrowser.renderInsertErrorBanner) — когда у исключения нет собственного i18n-ключа/сообщения. */
      insertFailed: string;
    };
    /** Текст в оверлее зоны перетаскивания файлов/папок — см. AssetBrowser.renderDropOverlay. */
    dropzone: {
      active: string;
    };
    /** Панель прогресса загрузки (drag-and-drop и кнопка "Загрузить") — см. AssetBrowser.renderUploadQueue. */
    upload: {
      /** {done}, {total} — сколько файлов из очереди уже обработано (успешно или с ошибкой). */
      queueTitle: string;
      uploading: string;
      done: string;
      error: string;
      /** Кнопка закрытия панели очереди после того, как все файлы обработаны. */
      close: string;
    };
    /** Древовидный вид — тулбар "Развернуть/Свернуть всё" и подписи узлов. См. AssetBrowser.renderTree. */
    tree: {
      expandAll: string;
      collapseAll: string;
      /** aria-label шеврона у свёрнутой папки. */
      expandFolder: string;
      /** aria-label шеврона у раскрытой папки. */
      collapseFolder: string;
    };
    /** title/aria-label кнопки "+" в конце ряда вкладок — см. AssetBrowser.renderShell/openConnectS3Modal. */
    addConnection: string;
    /** title/aria-label шеврона "ещё вкладки", когда часть вкладок не поместилась по ширине — см. AssetBrowser.updateTabsOverflow. */
    moreTabs: string;
    /** title кнопки "×" на вкладке добавленного вручную соединения (сейчас — только S3) — первый клик, до подтверждения. */
    removeConnection: string;
    /** Текст той же кнопки после первого клика — второй клик подтверждает удаление (как auth.logoutConfirm). */
    removeConnectionConfirm: string;
  };
  auth: {
    /** {provider} — `provider.label`, например "Dropbox". */
    connectPrompt: string;
    /** {provider} — `provider.label`. */
    loginButton: string;
    loggingIn: string;
    loginFailed: string;
    changeAppKey: string;
    /** Пункт меню настроек — разлогин из текущего аккаунта (см. AssetBrowser.handleLogout) — сбрасывает только сессию, не App Key/Client ID. */
    logout: string;
    /** Текст того же пункта после первого клика — второй клик подтверждает выход (двухшаговое подтверждение вместо window.confirm()). */
    logoutConfirm: string;
  };
  setup: {
    /** {provider} — `provider.label`. */
    missingInfo: string;
    /** {provider} — `provider.label`. */
    intro: string;
    appKeyPlaceholder: string;
    /** Подпись поля credential'а у Google — см. `ProviderSetupInfo.credentialLabelKey`. */
    clientIdPlaceholder: string;
    /** Подпись поля credential'а у Microsoft — см. `ProviderSetupInfo.credentialLabelKey`. */
    applicationIdPlaceholder: string;
    save: string;
    saveFailed: string;
    copy: string;
    copied: string;
    selected: string;
    /** Показывается в мастере настройки, только если у провайдера есть upload() — подсказка про drag-and-drop после подключения. */
    uploadHint: string;
  };
  block: {
    label: string;
    category: string;
  };
  button: {
    label: string;
  };
  modal: {
    title: string;
  };
  local: {
    tabLabel: string;
    error: {
      emptyUrl: string;
      readFile: string;
    };
  };
  /**
   * Вкладка "Подключённые аккаунты" — шестерёнка в ряду вкладок рядом
   * с "+" (см. `AssetBrowser.openSettingsModal`), НЕ путать с
   * `common.settings` (то — меню "Выйти" у одного конкретного
   * провайдера в тулбаре). Эта вкладка общая — по одной строке на
   * каждого OAuth-провайдера (см. `StorageProvider.getSessionInfo`),
   * и намеренно чисто информационная: без единой настройки, которая
   * бы что-то навязывала поверх настоящего механизма токена (см.
   * doc-комментарий `ProviderSessionInfo` в `types.ts`).
   */
  settings: {
    /** title/aria-label самой кнопки-шестерёнки в ряду вкладок. */
    tabButton: string;
    /** Заголовок модалки. */
    title: string;
    /** Показывается, если ни один подключённый провайдер не поддерживает getSessionInfo (например, только "Свои файлы"/S3). */
    empty: string;
    /** {date} — уже отформatированная локализованная дата первого явного входа (см. AssetBrowser.formatDate). */
    authenticatedAt: string;
    /** Дата первого входа неизвестна — учётка авторизована в более старой версии плагина, ещё до появления этого поля. */
    authenticatedAtUnknown: string;
    /** Провайдер настроен (есть App Key/Client ID), но сейчас не авторизован. */
    notConnected: string;
    /** {time} — локализованная длительность (см. AssetBrowser.formatDuration), например "42 минуты". */
    tokenExpiresIn: string;
    /** Токен уже истёк, но это не проблема — провайдер сам обновит его (или явно попросит войти) при следующем реальном действии. */
    tokenExpired: string;
    close: string;
  };
  dropbox: {
    setup: {
      step1: string;
      step2: string;
      step3: string;
      /** Показывается, когда redirectUri определился автоматически — перед `copyValue`. */
      step4WithRedirect: string;
      /** Показывается, когда redirectUri определить не удалось. */
      step4NoRedirect: string;
      step5: string;
    };
    error: {
      /** {status} — HTTP-код ответа. */
      exchangeCode: string;
      requireAppKey: string;
      requireRedirectUri: string;
      notConnected: string;
      sessionExpired: string;
      /** {status} — HTTP-код ответа. */
      refreshFailed: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
    };
    /** Заметка в "Подключённые аккаунты" — см. `ProviderSessionInfo.sessionNoteKey`/`DropboxProvider.getSessionInfo`. */
    sessionNote: string;
  };
  google: {
    setup: {
      step1: string;
      step2: string;
      step3: string;
      /** Показывается, когда origin определился автоматически — перед `copyValue`. */
      step4WithOrigin: string;
      /** Показывается, когда origin определить не удалось. */
      step4NoOrigin: string;
      step5: string;
    };
    error: {
      /** Не удалось загрузить внешний скрипт Google Identity Services (accounts.google.com/gsi/client). */
      gisLoadFailed: string;
      /** GIS вернул ошибку вместо токена при попытке (молча) получить/обновить доступ. */
      tokenFailed: string;
      requireClientId: string;
      notConnected: string;
      sessionExpired: string;
      /** {maxMb} — предел размера файла для вставки без сервера. */
      fileTooLarge: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
    };
    /** Заметка в "Подключённые аккаунты" — см. `ProviderSessionInfo.sessionNoteKey`/`GoogleDriveProvider.getSessionInfo`. */
    sessionNote: string;
  };
  microsoft: {
    setup: {
      step1: string;
      step2: string;
      step3: string;
      /** Показывается, когда redirectUri определился автоматически — перед `copyValue`. */
      step4WithRedirect: string;
      /** Показывается, когда redirectUri определить не удалось. */
      step4NoRedirect: string;
      step5: string;
    };
    error: {
      /** {status} — HTTP-код ответа. */
      exchangeCode: string;
      requireClientId: string;
      requireRedirectUri: string;
      notConnected: string;
      sessionExpired: string;
      /** {status} — HTTP-код ответа. */
      refreshFailed: string;
      /**
       * Microsoft Graph вернул "Tenant does not have a SPO license" —
       * у tenant'а рабочего/учебного аккаунта не включён SharePoint
       * Online, на котором основан OneDrive for Business.
       */
      noSpoLicense: string;
      /**
       * У элемента нет `@microsoft.graph.downloadUrl`, и у него ТОЧНО
       * нет facet'а `file` (значит это папка/"пакет" вроде блокнота
       * OneNote/ярлык, содержимое которого не удалось получить даже
       * из его настоящего drive) — повторные попытки бессмысленны, см.
       * `OneDriveProvider.resolve()`. {name} — имя элемента.
       */
      noDownloadableContent: string;
      /**
       * У элемента ЕСТЬ facet `file` (это обычный файл, не папка и не
       * пакет), но `@microsoft.graph.downloadUrl` так и не появился
       * даже после нескольких повторных запросов метаданных — Graph
       * иногда досчитывает это поле лениво после недавней загрузки/
       * копирования файла (задокументированное поведение), но постоянное
       * отсутствие может значить и то, что скачивание файла заблокировано
       * политикой организации (метки конфиденциальности, DLP и т.п.).
       * {name} — имя элемента. См. `OneDriveProvider.resolve()`.
       */
      downloadUrlUnavailable: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
    };
    /**
     * Заметка в "Подключённые аккаунты" — см.
     * `ProviderSessionInfo.sessionNoteKey`/`OneDriveProvider.getSessionInfo`.
     * У OneDrive это не просто информационная реплика для симметрии с
     * dropbox/google.sessionNote, а предупреждение о РЕАЛЬНОМ жёстком
     * ограничении: Microsoft ограничивает refresh-токен для SPA
     * (браузерных, без бэкенда/client_secret) приложений 24 часами —
     * задокументировано самим Microsoft
     * (learn.microsoft.com/entra/identity-platform/refresh-tokens),
     * не обходится на стороне клиента и не имеет отношения к этому
     * плагину. Именно это и есть настоящая причина жалобы "токен
     * быстро умирает, приходится перелогиниваться в течения дня" —
     * см. историю проекта.
     */
    sessionNote: string;
  };
  /**
   * Единственный из четырёх облачных провайдеров, которому нужен
   * собственный сервер владельца сайта (`BoxProviderOptions.tokenEndpoint`) —
   * у Box нет ни PKCE, ни implicit-flow, обмен на токен обязательно
   * требует client_secret (проверено по документации developer.box.com,
   * см. doc-комментарий `BoxProvider`/`BoxProviderOptions`).
   */
  box: {
    setup: {
      step1: string;
      /** Объясняет, ЗАЧЕМ нужен свой сервер (tokenEndpoint) — то, чего нет у Dropbox/Google/OneDrive. */
      step2Server: string;
      step3: string;
      /** Показывается, когда redirectUri определился автоматически — перед `copyValue`. */
      step4WithRedirect: string;
      /** Показывается, когда redirectUri определить не удалось. */
      step4NoRedirect: string;
      /** CORS Domains в консоли Box — показывается, когда origin определился автоматически — перед `copyValue`. */
      step5WithOrigin: string;
      /** Показывается, когда origin определить не удалось. */
      step5NoOrigin: string;
      step6: string;
      step7: string;
    };
    error: {
      /** {status} — HTTP-код ответа. */
      exchangeCode: string;
      requireClientId: string;
      requireRedirectUri: string;
      /** tokenEndpoint не задан (или пуст) в опциях BoxProvider. */
      requireTokenEndpoint: string;
      notConnected: string;
      sessionExpired: string;
      /** {status} — HTTP-код ответа собственного tokenEndpoint владельца сайта. */
      refreshFailed: string;
      /** Не удалось скачать файл для вставки — обычно CORS на dl.boxcloud.com, см. doc-комментарий `BoxProvider.resolve()`. {name} — имя файла. */
      downloadFailed: string;
      /** {maxMb} — предел размера файла для вставки без отдельного сервера-прокси для скачивания. */
      fileTooLarge: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
    };
    /** Заметка в "Подключённые аккаунты" — см. `ProviderSessionInfo.sessionNoteKey`/`BoxProvider.getSessionInfo`. */
    sessionNote: string;
  };
  /**
   * Попап "Подключить S3" (см. `AssetBrowser.openConnectS3Modal`) и
   * ошибки самого `S3Provider`. В отличие от dropbox/google/microsoft
   * выше это не мастер настройки (`getSetupInfo`/`setCredential`) — у
   * S3 нет OAuth и общего App Key, пользователь один раз вводит все
   * параметры конкретного bucket'а сразу в этой форме (см.
   * doc-комментарий `S3ConnectionConfig` в `types.ts`).
   */
  s3: {
    /** Пункт выпадающего меню кнопки "+" в ряду вкладок. */
    connectMenuItem: string;
    /** Заголовок попапа. */
    modalTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    /** Технический термин консоли AWS/S3-совместимых сервисов — намеренно НЕ переводится ни в одном языке, см. doc-комментарий CloudAssetsMessages. */
    accessKeyIdLabel: string;
    /** См. accessKeyIdLabel. */
    secretAccessKeyLabel: string;
    /** См. accessKeyIdLabel. */
    bucketLabel: string;
    regionLabel: string;
    /** Пример значения — код региона, не переводится ни в одном языке (сам формат везде одинаковый, "us-east-1"). */
    regionPlaceholder: string;
    endpointLabel: string;
    /** Пример значения — не переводится ни в одном языке. */
    endpointPlaceholder: string;
    endpointHint: string;
    forcePathStyleLabel: string;
    /** Подсказка про обязательную настройку CORS на стороне бакета — без этого браузер не пустит ни один запрос. */
    corsHint: string;
    connect: string;
    cancel: string;
    connecting: string;
    error: {
      required: string;
      duplicateName: string;
      /** {message} — текст ошибки от самой попытки подключения (см. `S3Provider.list`, вызывается на проверку перед сохранением). */
      connectFailed: string;
      /** {status} — HTTP-код ответа. */
      listFailed: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
      /** {status} — HTTP-код ответа. */
      deleteFailed: string;
    };
  };
  /** Общие для всех OAuth/PKCE-провайдеров ошибки (сейчас — Dropbox и Microsoft, но не завязаны на них). */
  shared: {
    error: {
      insecureOrigin: string;
      popupBlocked: string;
      stateMismatch: string;
      popupClosed: string;
    };
  };
}
