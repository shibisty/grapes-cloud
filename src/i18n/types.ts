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
       * У элемента нет `@microsoft.graph.downloadUrl` — обычно это
       * "пакет" вроде блокнота OneNote, либо ярлык на чужой файл,
       * содержимое которого не удалось получить даже из его
       * настоящего drive. {name} — имя элемента.
       */
      noDownloadableContent: string;
      /** {status} — HTTP-код ответа. */
      uploadFailed: string;
      uploadNetworkError: string;
    };
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
