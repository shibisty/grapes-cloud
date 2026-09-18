import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Rot',
    loading: 'Laster…',
    empty: 'Ingenting her ennå.',
    loadMore: 'Mer',
    uploadFile: 'Last opp fil',
    urlPlaceholder: 'Lim inn en lenke til en fil…',
    addUrl: 'Legg til',
    searchPlaceholder: 'Søk i filer…',
    filter: {
      all: 'Alle typer',
    },
    settings: 'Innstillinger',
    refresh: 'Oppdater',
    selectedCount: '{count} valgt',
    cancelSelection: 'Avbryt',
    insertSelected: 'Sett inn ({count})',
    openInTab: 'Åpne i ny fane',
    delete: 'Slett',
    deleteConfirm: 'Bekreft sletting?',
    viewGrid: 'Rutenettvisning',
    viewTable: 'Tabellvisning',
    viewTree: 'Trevisning',
    columnName: 'Navn',
    columnType: 'Type',
    columnSize: 'Størrelse',
    columnModified: 'Endret',
    type: {
      image: 'Bilde',
      video: 'Video',
      audio: 'Lyd',
      document: 'Dokument',
      folder: 'Mappe',
      other: 'Fil',
    },
    error: {
      generic: 'Kunne ikke laste filisten',
      insertFailed: 'Kunne ikke sette inn denne filen',
    },
    dropzone: {
      active: 'Slipp for å laste opp',
    },
    upload: {
      queueTitle: 'Laster opp {done}/{total}',
      uploading: 'Laster opp…',
      done: 'Ferdig',
      error: 'Mislyktes',
      close: 'Lukk',
    },
    tree: {
      expandAll: 'Utvid alle',
      collapseAll: 'Skjul alle',
      expandFolder: 'Utvid mappe',
      collapseFolder: 'Skjul mappe',
    },
    addConnection: 'Legg til tilkobling',
    moreTabs: 'Flere faner',
    removeConnection: 'Fjern',
    removeConnectionConfirm: 'Bekreft fjerning?',
  },
  auth: {
    connectPrompt: 'Koble til {provider} for å velge filer herfra.',
    loginButton: 'Logg inn på {provider}',
    loggingIn: 'Åpner autorisasjonsvinduet…',
    loginFailed: 'Innlogging mislyktes.',
    changeAppKey: 'Endre App Key',
    logout: 'Logg ut',
    logoutConfirm: 'Bekreft utlogging?',
  },
  setup: {
    missingInfo: '{provider} må konfigureres, men ingen instruksjoner er tilgjengelige.',
    intro: 'For å koble til {provider}, opprett først en app i utviklerkonsollen: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Lagre',
    saveFailed: 'Kunne ikke lagre App Key.',
    copy: 'Kopier',
    copied: 'Kopiert',
    selected: 'Merket, trykk Ctrl+C',
    uploadHint: 'Når tilkoblingen er satt opp, kan du også laste opp filer ved å dra dem (eller en hel mappe) inn i listen, eller med Last opp-knappen ovenfor.',
  },
  block: {
    label: 'Skymedier',
    category: 'Lagring',
  },
  button: {
    label: 'Sett inn fra skyen',
  },
  modal: {
    title: 'Sett inn fra skyen',
  },
  local: {
    tabLabel: 'Mine filer',
    error: {
      emptyUrl: 'Angi en lenke til en fil',
      readFile: 'Kunne ikke lese filen',
    },
  },
  dropbox: {
    setup: {
      step1: 'Åpne Dropbox App Console og klikk «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Skriv inn et hvilket som helst appnavn og klikk Create app.',
      step3: 'Kryss av for files.metadata.read, files.content.read og files.content.write på fanen Permissions, og klikk Submit.',
      step4WithRedirect: 'Lim inn dette under Redirect URIs på fanen Settings, og klikk Add:',
      step4NoRedirect:
        'Legg til hele URL-en til siden public/dropbox-callback.html på domenet ditt under Redirect URIs på fanen Settings — den kunne ikke oppdages automatisk (se redirectUri i leverandøralternativene).',
      step5: 'Kopier App key fra samme Settings-fane og lim den inn i feltet nedenfor.',
    },
    error: {
      exchangeCode: 'Dropbox: kunne ikke veksle inn koden mot et token (status {status})',
      requireAppKey: 'Lagre en App Key først (se oppsettsveiviseren).',
      requireRedirectUri:
        'Kunne ikke fastsette redirectUri automatisk. Angi den eksplisitt i DropboxProvider-alternativene (nødvendig hvis programtillegget lastes via <script type="module"> eller en bundler).',
      notConnected: 'Dropbox er ikke koblet til.',
      sessionExpired: 'Dropbox-økten er utløpt, logg inn på nytt.',
      refreshFailed: 'Dropbox: kunne ikke fornye token (status {status})',
      uploadFailed: 'Dropbox: opplasting mislyktes (status {status})',
      uploadNetworkError: 'Dropbox: nettverksfeil under opplasting av filen',
    },
  },
  google: {
    setup: {
      step1: 'Åpne Google Cloud Console, opprett et prosjekt (eller velg et eksisterende), og åpne deretter «APIs & Services».',
      step2: 'Under Library, finn og aktiver «Google Drive API».',
      step3:
        'Under «OAuth consent screen», sett User type til External, legg til scopet .../auth/drive.readonly, og legg til din egen Google-konto som test user (en uverifisert app er begrenset til test users og viser en advarsel — publisering for mange brukere krever Googles verifiseringsgjennomgang).',
      step4WithOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, velg Application type «Web application», og lim inn dette under Authorized JavaScript origins og klikk Add:',
      step4NoOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, velg Application type «Web application», og legg til den nøyaktige origin (protokoll + domene + port) dette nettstedet blir servert fra under Authorized JavaScript origins — den kunne ikke oppdages automatisk.',
      step5: 'På samme skjerm, kopier Client ID (slutter på .apps.googleusercontent.com) og lim den inn i feltet nedenfor.',
    },
    error: {
      gisLoadFailed: 'Kunne ikke laste Google Identity Services (accounts.google.com/gsi/client) — sjekk nettverkstilkoblingen eller en annonse-/skriptblokkering.',
      tokenFailed: 'Google returnerte ikke et tilgangstoken. Prøv å logge inn på nytt.',
      requireClientId: 'Lagre en Client ID først (se oppsettsveiviseren).',
      notConnected: 'Google Drive er ikke koblet til.',
      sessionExpired: 'Google-økten er utløpt, logg inn på nytt.',
      fileTooLarge:
        'Filen er større enn {maxMb} MB — Google Drive-filer settes inn som en data-URL siden det ikke finnes noen server, så denne filen er for stor til å settes inn.',
      uploadFailed: 'Google Drive: opplasting mislyktes (status {status})',
      uploadNetworkError: 'Google Drive: nettverksfeil under opplasting av filen',
    },
  },
  microsoft: {
    setup: {
      step1: 'Åpne Azure Portal → Microsoft Entra ID → App registrations, og klikk «New registration».',
      step2: 'Under Supported account types, velg «Accounts in any organizational directory and personal Microsoft accounts», og klikk deretter Register.',
      step3:
        'Under API permissions → Add a permission → Microsoft Graph → Delegated permissions, legg til Files.ReadWrite og offline_access, og klikk deretter Add permissions.',
      step4WithRedirect:
        'Under Authentication → Add a platform → Single-page application, lim inn dette under Redirect URIs og klikk Configure:',
      step4NoRedirect:
        'Under Authentication → Add a platform → Single-page application, legg til hele URL-en til siden public/microsoft-callback.html på domenet ditt under Redirect URIs — den kunne ikke oppdages automatisk (se redirectUri i leverandøralternativene).',
      step5: 'På Overview-siden, kopier Application (client) ID og lim den inn i feltet nedenfor.',
    },
    error: {
      exchangeCode: 'Microsoft: kunne ikke veksle inn koden mot et token (status {status})',
      requireClientId: 'Lagre en Application (client) ID først (se oppsettsveiviseren).',
      requireRedirectUri:
        'Kunne ikke fastsette redirectUri automatisk. Angi den eksplisitt i OneDriveProvider-alternativene (nødvendig hvis programtillegget lastes via <script type="module"> eller en bundler).',
      notConnected: 'OneDrive er ikke koblet til.',
      sessionExpired: 'Microsoft-økten er utløpt, logg inn på nytt.',
      refreshFailed: 'Microsoft: kunne ikke fornye token (status {status})',
      noSpoLicense:
        'Organisasjonen til denne Microsoft-kontoen har ikke OneDrive/SharePoint lisensiert (Microsoft Graph: «Tenant does not have a SPO license»). Logg inn med en personlig Microsoft-konto (outlook.com/hotmail/live) eller en jobbkonto der organisasjonen har OneDrive for Business aktivert.',
      noDownloadableContent:
        '«{name}» har ikke nedlastbart innhold og kan ikke settes inn — dette skjer som regel med OneNote-notatblokker eller andre elementtyper som OneDrive ikke kan levere som en vanlig fil.',
      uploadFailed: 'OneDrive: opplasting mislyktes (status {status})',
      uploadNetworkError: 'OneDrive: nettverksfeil under opplasting av filen',
    },
  },
  s3: {
    connectMenuItem: 'Koble til S3',
    modalTitle: 'Koble til S3-kompatibel lagring',
    nameLabel: 'Fanenavn',
    namePlaceholder: 'f.eks. Min bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Region',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Egendefinert endpoint (valgfritt)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'La stå tomt for AWS S3. Fyll ut for S3-kompatible tjenester (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Bruk path-style-URL-er (nødvendig for de fleste selvhostede/S3-kompatible endepunkter)',
    corsHint: 'Bucketen må tillate CORS-forespørsler fra dette nettstedet (GET, PUT, DELETE, HEAD) — sett dette opp i bucketens CORS-innstillinger.',
    connect: 'Koble til',
    cancel: 'Avbryt',
    connecting: 'Kobler til…',
    error: {
      required: 'Fyll ut alle obligatoriske felt.',
      duplicateName: 'En fane med dette navnet finnes allerede.',
      connectFailed: 'Kunne ikke koble til: {message}',
      listFailed: 'S3: kunne ikke hente objektlisten (status {status})',
      uploadFailed: 'S3: opplasting mislyktes (status {status})',
      uploadNetworkError: 'S3: nettverksfeil under opplasting av filen',
      deleteFailed: 'S3: kunne ikke slette (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'OAuth-innlogging med PKCE krever Web Crypto API (crypto.subtle), som nettlesere deaktiverer på en usikker opprinnelse (vanlig http, unntatt localhost). Åpne nettstedet via https:// eller, for testing, via http://localhost.',
      popupBlocked: 'Nettleseren blokkerte autorisasjonsvinduet. Tillat popup-vinduer for dette nettstedet.',
      stateMismatch: 'Autorisasjonssvaret besto ikke verifiseringen (state stemmer ikke).',
      popupClosed: 'Autorisasjonsvinduet ble lukket før innloggingen var fullført.',
    },
  },
};

export default messages;
