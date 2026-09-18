import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Arrel',
    loading: 'Carregant…',
    empty: 'Encara no hi ha res aquí.',
    loadMore: 'Més',
    uploadFile: 'Puja un fitxer',
    urlPlaceholder: 'Enganxa un enllaç a un fitxer…',
    addUrl: 'Afegeix',
    searchPlaceholder: 'Cerca fitxers…',
    filter: {
      all: 'Tots els tipus',
    },
    settings: 'Configuració',
    refresh: 'Actualitza',
    selectedCount: '{count} seleccionats',
    cancelSelection: 'Cancel·la',
    insertSelected: 'Insereix ({count})',
    openInTab: 'Obre en una pestanya nova',
    delete: 'Elimina',
    deleteConfirm: 'Confirmes l’eliminació?',
    viewGrid: 'Vista de graella',
    viewTable: 'Vista de taula',
    viewTree: 'Vista d’arbre',
    columnName: 'Nom',
    columnType: 'Tipus',
    columnSize: 'Mida',
    columnModified: 'Modificat',
    type: {
      image: 'Imatge',
      video: 'Vídeo',
      audio: 'Àudio',
      document: 'Document',
      folder: 'Carpeta',
      other: 'Fitxer',
    },
    error: {
      generic: 'No s’ha pogut carregar la llista de fitxers',
      insertFailed: 'No s’ha pogut inserir aquest fitxer',
    },
    dropzone: {
      active: 'Deixa anar per pujar',
    },
    upload: {
      queueTitle: 'Pujant {done}/{total}',
      uploading: 'Pujant…',
      done: 'Fet',
      error: 'Ha fallat',
      close: 'Tanca',
    },
    tree: {
      expandAll: 'Expandeix-ho tot',
      collapseAll: 'Redueix-ho tot',
      expandFolder: 'Expandeix la carpeta',
      collapseFolder: 'Redueix la carpeta',
    },
    addConnection: 'Afegeix una connexió',
    moreTabs: 'Més pestanyes',
    removeConnection: 'Elimina',
    removeConnectionConfirm: 'Confirmes l’eliminació?',
  },
  auth: {
    connectPrompt: 'Connecta {provider} per triar fitxers des d’aquí.',
    loginButton: 'Inicia sessió a {provider}',
    loggingIn: 'S’està obrint la finestra d’autorització…',
    loginFailed: 'No s’ha pogut iniciar sessió.',
    changeAppKey: 'Canvia l’App Key',
    logout: 'Tanca la sessió',
    logoutConfirm: 'Confirmes que vols tancar la sessió?',
  },
  setup: {
    missingInfo: '{provider} necessita configuració, però no hi ha instruccions disponibles.',
    intro: 'Per connectar {provider}, primer crea una aplicació a la seva consola de desenvolupador: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Desa',
    saveFailed: 'No s’ha pogut desar l’App Key.',
    copy: 'Copia',
    copied: 'Copiat',
    selected: 'Seleccionat, prem Ctrl+C',
    uploadHint: 'Un cop connectat, també pots pujar fitxers arrossegant-los (o una carpeta sencera) a la llista, o amb el botó Puja de dalt.',
  },
  block: {
    label: 'Contingut multimèdia al núvol',
    category: 'Emmagatzematge',
  },
  button: {
    label: 'Insereix des del núvol',
  },
  modal: {
    title: 'Insereix des del núvol',
  },
  local: {
    tabLabel: 'Els meus fitxers',
    error: {
      emptyUrl: 'Introdueix un enllaç a un fitxer',
      readFile: 'No s’ha pogut llegir el fitxer',
    },
  },
  dropbox: {
    setup: {
      step1: 'Obre la Dropbox App Console i fes clic a «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Introdueix qualsevol nom d’aplicació i fes clic a Create app.',
      step3: 'A la pestanya Permissions, marca files.metadata.read, files.content.read i files.content.write, i després fes clic a Submit.',
      step4WithRedirect: 'A la pestanya Settings, a Redirect URIs, enganxa això i fes clic a Add:',
      step4NoRedirect:
        'A la pestanya Settings, a Redirect URIs, afegeix l’URL completa de la pàgina public/dropbox-callback.html al teu domini — no s’ha pogut detectar automàticament (consulta redirectUri a les opcions del proveïdor).',
      step5: 'En aquesta mateixa pestanya Settings, copia l’App key i enganxa’l al camp de sota.',
    },
    error: {
      exchangeCode: 'Dropbox: no s’ha pogut intercanviar el code per un token (estat {status})',
      requireAppKey: 'Desa primer un App Key (consulta l’auxiliar de configuració).',
      requireRedirectUri:
        'No s’ha pogut determinar automàticament redirectUri. Indica’l explícitament a les opcions de DropboxProvider (necessari si el connector es carrega mitjançant <script type="module"> o un bundler).',
      notConnected: 'Dropbox no està connectat.',
      sessionExpired: 'La sessió de Dropbox ha caducat, torna a iniciar sessió.',
      refreshFailed: 'Dropbox: no s’ha pogut renovar el token (estat {status})',
      uploadFailed: 'Dropbox: la pujada ha fallat (estat {status})',
      uploadNetworkError: 'Dropbox: error de xarxa en pujar el fitxer',
    },
  },
  google: {
    setup: {
      step1: 'Obre la Google Cloud Console, crea un projecte (o tria’n un d’existent) i després obre «APIs & Services».',
      step2: 'A Library, busca i activa la «Google Drive API».',
      step3:
        'A «OAuth consent screen», estableix User type a External, afegeix l’scope .../auth/drive.readonly i afegeix el teu propi compte de Google com a test user (una aplicació no verificada està limitada a usuaris de prova i mostra una pantalla d’avís — publicar-la per a molts usuaris requereix la verificació de Google).',
      step4WithOrigin:
        'A Credentials → Create Credentials → OAuth client ID, tria Application type «Web application» i a Authorized JavaScript origins enganxa això i fes clic a Add:',
      step4NoOrigin:
        'A Credentials → Create Credentials → OAuth client ID, tria Application type «Web application» i a Authorized JavaScript origins afegeix l’origin exacte (protocol + domini + port) des d’on se serveix aquest lloc — no s’ha pogut detectar automàticament.',
      step5: 'En aquesta mateixa pantalla, copia el Client ID (acaba amb .apps.googleusercontent.com) i enganxa’l al camp de sota.',
    },
    error: {
      gisLoadFailed: 'No s’ha pogut carregar Google Identity Services (accounts.google.com/gsi/client) — comprova la connexió de xarxa o un bloquejador d’anuncis/scripts.',
      tokenFailed: 'Google no ha retornat cap testimoni d’accés. Torna-ho a provar iniciant sessió de nou.',
      requireClientId: 'Desa primer un Client ID (consulta l’auxiliar de configuració).',
      notConnected: 'Google Drive no està connectat.',
      sessionExpired: 'La sessió de Google ha caducat, torna a iniciar sessió.',
      fileTooLarge:
        'El fitxer supera els {maxMb} MB — els fitxers de Google Drive s’insereixen com a data URL perquè no hi ha servidor, i aquest fitxer és massa gran per inserir-lo.',
      uploadFailed: 'Google Drive: la pujada ha fallat (estat {status})',
      uploadNetworkError: 'Google Drive: error de xarxa en pujar el fitxer',
    },
  },
  microsoft: {
    setup: {
      step1: 'Obre l’Azure Portal → Microsoft Entra ID → App registrations, i fes clic a «New registration».',
      step2: 'A Supported account types, tria «Accounts in any organizational directory and personal Microsoft accounts», i després fes clic a Register.',
      step3:
        'A API permissions → Add a permission → Microsoft Graph → Delegated permissions, afegeix Files.ReadWrite i offline_access, i després fes clic a Add permissions.',
      step4WithRedirect:
        'A Authentication → Add a platform → Single-page application, enganxa això a Redirect URIs i fes clic a Configure:',
      step4NoRedirect:
        'A Authentication → Add a platform → Single-page application, afegeix l’URL completa de la pàgina public/microsoft-callback.html al teu domini a Redirect URIs — no s’ha pogut detectar automàticament (consulta redirectUri a les opcions del proveïdor).',
      step5: 'A la pàgina Overview, copia l’Application (client) ID i enganxa’l al camp de sota.',
    },
    error: {
      exchangeCode: 'Microsoft: no s’ha pogut intercanviar el code per un token (estat {status})',
      requireClientId: 'Desa primer un Application (client) ID (consulta l’auxiliar de configuració).',
      requireRedirectUri:
        'No s’ha pogut determinar automàticament redirectUri. Indica’l explícitament a les opcions de OneDriveProvider (necessari si el connector es carrega mitjançant <script type="module"> o un bundler).',
      notConnected: 'OneDrive no està connectat.',
      sessionExpired: 'La sessió de Microsoft ha caducat, torna a iniciar sessió.',
      refreshFailed: 'Microsoft: no s’ha pogut renovar el token (estat {status})',
      noSpoLicense:
        'L’organització d’aquest compte de Microsoft no té llicència per a OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). Inicia sessió amb un compte de Microsoft personal (outlook.com/hotmail/live) o amb un compte de treball l’organització del qual tingui OneDrive for Business activat.',
      noDownloadableContent:
        '«{name}» no té contingut descarregable — normalment això passa amb blocs de notes del OneNote o amb un altre tipus d’element que OneDrive no pot servir com a fitxer normal.',
      downloadUrlUnavailable:
        '«{name}» encara no té un enllaç de descàrrega — pot passar just després de pujar el fitxer, o si la teva organització bloqueja la seva descàrrega. Torna-ho a provar d’aquí una estona.',
      uploadFailed: 'OneDrive: la pujada ha fallat (estat {status})',
      uploadNetworkError: 'OneDrive: error de xarxa en pujar el fitxer',
    },
  },
  s3: {
    connectMenuItem: 'Connecta S3',
    modalTitle: 'Connecta un emmagatzematge compatible amb S3',
    nameLabel: 'Nom de la pestanya',
    namePlaceholder: 'p. ex. El meu bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Regió',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint personalitzat (opcional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Deixa-ho buit per a AWS S3. Omple-ho per a serveis compatibles amb S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Utilitza URL d’estil «path» (necessari per a la majoria d’endpoints autoallotjats/compatibles amb S3)',
    corsHint: 'El bucket ha de permetre sol·licituds CORS des d’aquest lloc (GET, PUT, DELETE, HEAD) — configureu-ho a les regles CORS del bucket.',
    connect: 'Connecta',
    cancel: 'Cancel·la',
    connecting: 'Connectant…',
    error: {
      required: 'Ompliu tots els camps obligatoris.',
      duplicateName: 'Ja existeix una pestanya amb aquest nom.',
      connectFailed: 'No s’ha pogut connectar: {message}',
      listFailed: 'S3: no s’ha pogut llistar els objectes (estat {status})',
      uploadFailed: 'S3: la pujada ha fallat (estat {status})',
      uploadNetworkError: 'S3: error de xarxa en pujar el fitxer',
      deleteFailed: 'S3: l’eliminació ha fallat (estat {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'L’inici de sessió OAuth per PKCE requereix la Web Crypto API (crypto.subtle), que els navegadors desactiven en un origen no segur (http simple, excepte localhost). Obre el lloc amb https:// o, per provar-ho, amb http://localhost.',
      popupBlocked: 'El navegador ha bloquejat la finestra emergent d’autorització. Permet finestres emergents per a aquest lloc.',
      stateMismatch: 'La resposta d’autorització no ha superat la verificació (state no coincideix).',
      popupClosed: 'La finestra d’autorització s’ha tancat abans de completar l’inici de sessió.',
    },
  },
};

export default messages;
