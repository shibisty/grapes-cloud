import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Raíz',
    loading: 'Cargando…',
    empty: 'Aún no hay nada aquí.',
    loadMore: 'Más',
    uploadFile: 'Subir archivo',
    urlPlaceholder: 'Pegar un enlace a un archivo…',
    addUrl: 'Añadir',
    searchPlaceholder: 'Buscar archivos…',
    filter: {
      all: 'Todos los tipos',
    },
    settings: 'Configuración',
    refresh: 'Actualizar',
    selectedCount: '{count} seleccionados',
    cancelSelection: 'Cancelar',
    insertSelected: 'Insertar ({count})',
    openInTab: 'Abrir en una pestaña nueva',
    delete: 'Eliminar',
    deleteConfirm: '¿Confirmar eliminación?',
    viewGrid: 'Vista de cuadrícula',
    viewTable: 'Vista de tabla',
    viewTree: 'Vista de árbol',
    columnName: 'Nombre',
    columnType: 'Tipo',
    columnSize: 'Tamaño',
    columnModified: 'Modificado',
    type: {
      image: 'Imagen',
      video: 'Vídeo',
      audio: 'Audio',
      document: 'Documento',
      folder: 'Carpeta',
      other: 'Archivo',
    },
    error: {
      generic: 'No se pudo cargar la lista de archivos',
      insertFailed: 'No se pudo insertar este archivo',
    },
    dropzone: {
      active: 'Suelta para subir',
    },
    upload: {
      queueTitle: 'Subiendo {done}/{total}',
      uploading: 'Subiendo…',
      done: 'Listo',
      error: 'Fallido',
      close: 'Cerrar',
    },
    tree: {
      expandAll: 'Expandir todo',
      collapseAll: 'Contraer todo',
      expandFolder: 'Expandir carpeta',
      collapseFolder: 'Contraer carpeta',
    },
    addConnection: 'Añadir conexión',
    moreTabs: 'Más pestañas',
    removeConnection: 'Eliminar',
    removeConnectionConfirm: '¿Confirmar eliminación?',
  },
  auth: {
    connectPrompt: 'Conecta {provider} para elegir archivos desde aquí.',
    loginButton: 'Iniciar sesión en {provider}',
    loggingIn: 'Abriendo la ventana de autorización…',
    loginFailed: 'No se pudo iniciar sesión.',
    changeAppKey: 'Cambiar App Key',
    logout: 'Cerrar sesión',
    logoutConfirm: '¿Confirmar cierre de sesión?',
  },
  setup: {
    missingInfo: '{provider} necesita configuración, pero no hay instrucciones disponibles.',
    intro: 'Para conectar {provider}, primero crea una aplicación en su consola de desarrollador: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Guardar',
    saveFailed: 'No se pudo guardar el App Key.',
    copy: 'Copiar',
    copied: 'Copiado',
    selected: 'Seleccionado, pulsa Ctrl+C',
    uploadHint: 'Una vez conectado, también puedes subir archivos arrastrándolos (o una carpeta completa) a la lista, o con el botón Subir archivo de arriba.',
  },
  block: {
    label: 'Medios en la nube',
    category: 'Almacenamiento',
  },
  button: {
    label: 'Insertar desde la nube',
  },
  modal: {
    title: 'Insertar desde la nube',
  },
  local: {
    tabLabel: 'Mis archivos',
    error: {
      emptyUrl: 'Introduce un enlace a un archivo',
      readFile: 'No se pudo leer el archivo',
    },
  },
  dropbox: {
    setup: {
      step1: 'Abre la Dropbox App Console y haz clic en «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Introduce cualquier nombre de aplicación y haz clic en Create app.',
      step3: 'En la pestaña Permissions, marca files.metadata.read, files.content.read y files.content.write, y haz clic en Submit.',
      step4WithRedirect: 'En la pestaña Settings, en Redirect URIs, pega esto y haz clic en Add:',
      step4NoRedirect:
        'En la pestaña Settings, en Redirect URIs, añade la URL completa de la página public/dropbox-callback.html en tu dominio — no se pudo detectar automáticamente (consulta redirectUri en las opciones del proveedor).',
      step5: 'En esa misma pestaña Settings, copia el App key y pégalo en el campo de abajo.',
    },
    error: {
      exchangeCode: 'Dropbox: no se pudo intercambiar el code por un token (estado {status})',
      requireAppKey: 'Primero guarda un App Key (consulta el asistente de configuración).',
      requireRedirectUri:
        'No se pudo determinar redirectUri automáticamente. Indícalo explícitamente en las opciones de DropboxProvider (necesario si el plugin se carga mediante <script type="module"> o un bundler).',
      notConnected: 'Dropbox no está conectado.',
      sessionExpired: 'La sesión de Dropbox ha caducado, inicia sesión de nuevo.',
      refreshFailed: 'Dropbox: no se pudo renovar el token (estado {status})',
      uploadFailed: 'Dropbox: la subida ha fallado (estado {status})',
      uploadNetworkError: 'Dropbox: error de red al subir el archivo',
    },
  },
  google: {
    setup: {
      step1: 'Abre la Google Cloud Console, crea un proyecto (o elige uno existente) y después abre «APIs & Services».',
      step2: 'En Library, busca y activa la «Google Drive API».',
      step3:
        'En «OAuth consent screen», establece User type en External, añade el scope .../auth/drive.readonly y añade tu propia cuenta de Google como test user (una aplicación no verificada está limitada a usuarios de prueba y muestra una pantalla de advertencia — publicarla para muchos usuarios requiere la verificación de Google).',
      step4WithOrigin:
        'En Credentials → Create Credentials → OAuth client ID, elige Application type «Web application» y en Authorized JavaScript origins pega esto y haz clic en Add:',
      step4NoOrigin:
        'En Credentials → Create Credentials → OAuth client ID, elige Application type «Web application» y en Authorized JavaScript origins añade el origin exacto (protocolo + dominio + puerto) desde el que se sirve este sitio — no se pudo detectar automáticamente.',
      step5: 'En esa misma pantalla, copia el Client ID (termina en .apps.googleusercontent.com) y pégalo en el campo de abajo.',
    },
    error: {
      gisLoadFailed: 'No se pudo cargar Google Identity Services (accounts.google.com/gsi/client) — comprueba tu conexión de red o un bloqueador de anuncios/scripts.',
      tokenFailed: 'Google no devolvió un token de acceso. Intenta iniciar sesión de nuevo.',
      requireClientId: 'Primero guarda un Client ID (consulta el asistente de configuración).',
      notConnected: 'Google Drive no está conectado.',
      sessionExpired: 'La sesión de Google ha caducado, inicia sesión de nuevo.',
      fileTooLarge:
        'El archivo pesa más de {maxMb} MB — los archivos de Google Drive se insertan como data URL porque no hay servidor, y este archivo es demasiado grande para insertarlo.',
      uploadFailed: 'Google Drive: la subida ha fallado (estado {status})',
      uploadNetworkError: 'Google Drive: error de red al subir el archivo',
    },
  },
  microsoft: {
    setup: {
      step1: 'Abre el Azure Portal → Microsoft Entra ID → App registrations y haz clic en «New registration».',
      step2: 'En Supported account types, elige «Accounts in any organizational directory and personal Microsoft accounts» y haz clic en Register.',
      step3:
        'En API permissions → Add a permission → Microsoft Graph → Delegated permissions, añade Files.ReadWrite y offline_access, y haz clic en Add permissions.',
      step4WithRedirect:
        'En Authentication → Add a platform → Single-page application, pega esto en Redirect URIs y haz clic en Configure:',
      step4NoRedirect:
        'En Authentication → Add a platform → Single-page application, añade la URL completa de la página public/microsoft-callback.html en tu dominio en Redirect URIs — no se pudo detectar automáticamente (consulta redirectUri en las opciones del proveedor).',
      step5: 'En la página Overview, copia el Application (client) ID y pégalo en el campo de abajo.',
    },
    error: {
      exchangeCode: 'Microsoft: no se pudo intercambiar el code por un token (estado {status})',
      requireClientId: 'Primero guarda un Application (client) ID (consulta el asistente de configuración).',
      requireRedirectUri:
        'No se pudo determinar redirectUri automáticamente. Indícalo explícitamente en las opciones de OneDriveProvider (necesario si el plugin se carga mediante <script type="module"> o un bundler).',
      notConnected: 'OneDrive no está conectado.',
      sessionExpired: 'La sesión de Microsoft ha caducado, inicia sesión de nuevo.',
      refreshFailed: 'Microsoft: no se pudo renovar el token (estado {status})',
      noSpoLicense:
        'La organización de esta cuenta de Microsoft no tiene licencia para OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). Inicia sesión con una cuenta de Microsoft personal (outlook.com/hotmail/live) o con una cuenta de trabajo cuya organización tenga OneDrive for Business habilitado.',
      noDownloadableContent:
        '«{name}» no tiene contenido descargable — normalmente esto ocurre con los blocs de notas de OneNote u otro tipo de elemento que OneDrive no puede servir como archivo normal.',
      downloadUrlUnavailable:
        '«{name}» todavía no tiene un enlace de descarga — esto puede ocurrir justo después de subir el archivo, o si tu organización bloquea su descarga. Inténtalo de nuevo en un momento.',
      uploadFailed: 'OneDrive: la subida ha fallado (estado {status})',
      uploadNetworkError: 'OneDrive: error de red al subir el archivo',
    },
  },
  s3: {
    connectMenuItem: 'Conectar S3',
    modalTitle: 'Conectar almacenamiento compatible con S3',
    nameLabel: 'Nombre de la pestaña',
    namePlaceholder: 'p. ej. Mi bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Región',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint personalizado (opcional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Déjelo vacío para AWS S3. Rellénelo para servicios compatibles con S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Usar URLs de estilo «path» (necesario para la mayoría de endpoints autoalojados/compatibles con S3)',
    corsHint: 'El bucket debe permitir solicitudes CORS desde este sitio (GET, PUT, DELETE, HEAD); configúrelo en las reglas CORS del bucket.',
    connect: 'Conectar',
    cancel: 'Cancelar',
    connecting: 'Conectando…',
    error: {
      required: 'Complete todos los campos obligatorios.',
      duplicateName: 'Ya existe una pestaña con ese nombre.',
      connectFailed: 'No se pudo conectar: {message}',
      listFailed: 'S3: no se pudo listar los objetos (estado {status})',
      uploadFailed: 'S3: la subida ha fallado (estado {status})',
      uploadNetworkError: 'S3: error de red al subir el archivo',
      deleteFailed: 'S3: no se pudo eliminar (estado {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'El inicio de sesión OAuth mediante PKCE requiere la Web Crypto API (crypto.subtle), que los navegadores desactivan en un origen no seguro (http simple, salvo localhost). Abre el sitio con https:// o, para probar, con http://localhost.',
      popupBlocked: 'El navegador bloqueó la ventana emergente de autorización. Permite las ventanas emergentes para este sitio.',
      stateMismatch: 'La respuesta de autorización no superó la verificación (state no coincide).',
      popupClosed: 'La ventana de autorización se cerró antes de completar el inicio de sesión.',
    },
  },
};

export default messages;
