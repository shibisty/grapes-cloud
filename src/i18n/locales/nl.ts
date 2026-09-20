import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Basismap',
    loading: 'Laden…',
    empty: 'Hier staat nog niets.',
    loadMore: 'Meer',
    uploadFile: 'Bestand uploaden',
    urlPlaceholder: 'Plak een link naar een bestand…',
    addUrl: 'Toevoegen',
    searchPlaceholder: 'Bestanden zoeken…',
    filter: {
      all: 'Alle typen',
    },
    settings: 'Instellingen',
    refresh: 'Vernieuwen',
    selectedCount: '{count} geselecteerd',
    cancelSelection: 'Annuleren',
    insertSelected: 'Invoegen ({count})',
    openInTab: 'Openen in nieuw tabblad',
    delete: 'Verwijderen',
    deleteConfirm: 'Verwijderen bevestigen?',
    viewGrid: 'Rasterweergave',
    viewTable: 'Tabelweergave',
    viewTree: 'Boomweergave',
    columnName: 'Naam',
    columnType: 'Type',
    columnSize: 'Grootte',
    columnModified: 'Gewijzigd',
    type: {
      image: 'Afbeelding',
      video: 'Video',
      audio: 'Audio',
      document: 'Document',
      folder: 'Map',
      other: 'Bestand',
    },
    error: {
      generic: 'Bestandslijst kon niet worden geladen',
      insertFailed: 'Dit bestand kon niet worden ingevoegd',
    },
    dropzone: {
      active: 'Zet hier neer om te uploaden',
    },
    upload: {
      queueTitle: 'Uploaden {done}/{total}',
      uploading: 'Uploaden…',
      done: 'Voltooid',
      error: 'Mislukt',
      close: 'Sluiten',
    },
    tree: {
      expandAll: 'Alles uitvouwen',
      collapseAll: 'Alles samenvouwen',
      expandFolder: 'Map uitvouwen',
      collapseFolder: 'Map samenvouwen',
    },
    addConnection: 'Verbinding toevoegen',
    moreTabs: 'Meer tabs',
    removeConnection: 'Verwijderen',
    removeConnectionConfirm: 'Verwijderen bevestigen?',
  },
  auth: {
    connectPrompt: 'Verbind {provider} om hier bestanden te kiezen.',
    loginButton: 'Inloggen bij {provider}',
    loggingIn: 'Autorisatievenster wordt geopend…',
    loginFailed: 'Inloggen mislukt.',
    changeAppKey: 'App Key wijzigen',
    logout: 'Uitloggen',
    logoutConfirm: 'Uitloggen bevestigen?',
  },
  setup: {
    missingInfo: '{provider} moet worden ingesteld, maar er zijn geen instructies beschikbaar.',
    intro: 'Om {provider} te verbinden, maakt u eerst een app aan in de ontwikkelaarsconsole: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Opslaan',
    saveFailed: 'App Key kon niet worden opgeslagen.',
    copy: 'Kopiëren',
    copied: 'Gekopieerd',
    selected: 'Geselecteerd, druk op Ctrl+C',
    uploadHint: 'Eenmaal verbonden kunt u ook bestanden uploaden door ze (of een hele map) naar de lijst te slepen, of met de knop Uploaden hierboven.',
  },
  block: {
    label: 'Cloudmedia',
    category: 'Opslag',
  },
  button: {
    label: 'Invoegen vanuit de cloud',
  },
  modal: {
    title: 'Invoegen vanuit de cloud',
  },
  local: {
    tabLabel: 'Mijn bestanden',
    error: {
      emptyUrl: 'Voer een link naar een bestand in',
      readFile: 'Bestand kon niet worden gelezen',
    },
  },
  settings: {
    tabButton: 'Gekoppelde accounts',
    title: 'Gekoppelde accounts',
    empty: 'Geen enkele provider hier ondersteunt nog inloggen met een App Key/Client ID.',
    authenticatedAt: 'Geautoriseerd op {date}',
    authenticatedAtUnknown: 'Autorisatiedatum onbekend',
    notConnected: 'Niet verbonden',
    tokenExpiresIn: 'Token verloopt over {time}',
    tokenExpired: 'Token is verlopen — wordt automatisch vernieuwd bij de volgende actie',
    close: 'Sluiten',
  },
  dropbox: {
    setup: {
      step1: 'Open de Dropbox App Console en klik op "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Voer een willekeurige appnaam in en klik op Create app.',
      step3: 'Vink op het tabblad Permissions files.metadata.read, files.content.read en files.content.write aan en klik op Submit.',
      step4WithRedirect: 'Plak dit op het tabblad Settings, onder Redirect URIs, en klik op Add:',
      step4NoRedirect:
        'Voeg op het tabblad Settings, onder Redirect URIs, de volledige URL van de pagina public/dropbox-callback.html op uw domein toe — deze kon niet automatisch worden gedetecteerd (zie redirectUri in de provideropties).',
      step5: 'Kopieer op datzelfde tabblad Settings de App key en plak deze in het veld hieronder.',
    },
    error: {
      exchangeCode: 'Dropbox: kon de code niet inwisselen voor een token (status {status})',
      requireAppKey: 'Sla eerst een App Key op (zie de installatiewizard).',
      requireRedirectUri:
        'Kon redirectUri niet automatisch bepalen. Geef deze expliciet op in de DropboxProvider-opties (nodig als de plugin via <script type="module"> of een bundler wordt geladen).',
      notConnected: 'Dropbox is niet verbonden.',
      sessionExpired: 'De Dropbox-sessie is verlopen, log opnieuw in.',
      refreshFailed: 'Dropbox: token kon niet worden vernieuwd (status {status})',
      uploadFailed: 'Dropbox: uploaden is mislukt (status {status})',
      uploadNetworkError: 'Dropbox: netwerkfout tijdens het uploaden van het bestand',
    },
    sessionNote: 'De Dropbox-sessie heeft geen tijdslimiet: deze blijft geldig totdat je uitlogt of de toegang intrekt in de instellingen van Dropbox zelf.',
  },
  google: {
    setup: {
      step1: 'Open de Google Cloud Console, maak een project aan (of kies een bestaand project) en open vervolgens "APIs & Services".',
      step2: 'Zoek en schakel onder Library de "Google Drive API" in.',
      step3:
        'Stel onder "OAuth consent screen" User type in op External, voeg de scope .../auth/drive.readonly toe en voeg uw eigen Google-account toe als test user (een niet-geverifieerde app is beperkt tot test users en toont een waarschuwingsscherm — voor publicatie naar veel gebruikers is verificatie door Google vereist).',
      step4WithOrigin:
        'Kies onder Credentials → Create Credentials → OAuth client ID het Application type "Web application" en plak dit onder Authorized JavaScript origins en klik op Add:',
      step4NoOrigin:
        'Kies onder Credentials → Create Credentials → OAuth client ID het Application type "Web application" en voeg onder Authorized JavaScript origins de exacte origin (protocol + domein + poort) toe waarvandaan deze site wordt bediend — deze kon niet automatisch worden gedetecteerd.',
      step5: 'Kopieer op hetzelfde scherm de Client ID (eindigt op .apps.googleusercontent.com) en plak deze in het veld hieronder.',
    },
    error: {
      gisLoadFailed: 'Kon Google Identity Services (accounts.google.com/gsi/client) niet laden — controleer uw netwerkverbinding of een advertentie-/scriptblokkering.',
      tokenFailed: 'Google heeft geen toegangstoken geretourneerd. Probeer opnieuw in te loggen.',
      requireClientId: 'Sla eerst een Client ID op (zie de installatiewizard).',
      notConnected: 'Google Drive is niet verbonden.',
      sessionExpired: 'De Google-sessie is verlopen, log opnieuw in.',
      fileTooLarge:
        'Het bestand is groter dan {maxMb} MB — Google Drive-bestanden worden ingevoegd als een data-URL omdat er geen server is, dus dit bestand is te groot om in te voegen.',
      uploadFailed: 'Google Drive: uploaden is mislukt (status {status})',
      uploadNetworkError: 'Google Drive: netwerkfout tijdens het uploaden van het bestand',
    },
    sessionNote: 'De Google Drive-sessie wordt automatisch vernieuwd (ongeveer elk uur) zolang je in deze browser ingelogd blijft bij je Google-account.',
  },
  microsoft: {
    setup: {
      step1: 'Open de Azure Portal → Microsoft Entra ID → App registrations en klik op "New registration".',
      step2: 'Kies onder Supported account types "Accounts in any organizational directory and personal Microsoft accounts" en klik vervolgens op Register.',
      step3:
        'Voeg onder API permissions → Add a permission → Microsoft Graph → Delegated permissions Files.ReadWrite en offline_access toe en klik vervolgens op Add permissions.',
      step4WithRedirect:
        'Plak dit onder Authentication → Add a platform → Single-page application, onder Redirect URIs, en klik op Configure:',
      step4NoRedirect:
        'Voeg onder Authentication → Add a platform → Single-page application, onder Redirect URIs, de volledige URL toe van de pagina public/microsoft-callback.html op uw domein — deze kon niet automatisch worden gedetecteerd (zie redirectUri in de provideropties).',
      step5: 'Kopieer op de pagina Overview de Application (client) ID en plak deze in het veld hieronder.',
    },
    error: {
      exchangeCode: 'Microsoft: kon de code niet inwisselen voor een token (status {status})',
      requireClientId: 'Sla eerst een Application (client) ID op (zie de installatiewizard).',
      requireRedirectUri:
        'Kon redirectUri niet automatisch bepalen. Geef deze expliciet op in de OneDriveProvider-opties (nodig als de plugin via <script type="module"> of een bundler wordt geladen).',
      notConnected: 'OneDrive is niet verbonden.',
      sessionExpired: 'De Microsoft-sessie is verlopen, log opnieuw in.',
      refreshFailed: 'Microsoft: token kon niet worden vernieuwd (status {status})',
      noSpoLicense:
        'De organisatie van dit Microsoft-account heeft geen licentie voor OneDrive/SharePoint (Microsoft Graph: "Tenant does not have a SPO license"). Log in met een persoonlijk Microsoft-account (outlook.com/hotmail/live) of een werkaccount waarvan de organisatie OneDrive for Business heeft ingeschakeld.',
      noDownloadableContent:
        '"{name}" heeft geen downloadbare inhoud en kan niet worden ingevoegd — dit komt meestal voor bij een OneNote-notitieblok of een ander itemtype dat OneDrive niet als gewoon bestand kan leveren.',
      downloadUrlUnavailable:
        '"{name}" heeft nog geen downloadlink — dit kan gebeuren direct na het uploaden, of als je organisatie het downloaden van dit bestand blokkeert. Probeer het straks opnieuw.',
      uploadFailed: 'OneDrive: uploaden is mislukt (status {status})',
      uploadNetworkError: 'OneDrive: netwerkfout tijdens het uploaden van het bestand',
    },
    sessionNote: 'Microsoft beperkt de sessie voor apps die in de browser draaien (SPA) tot maximaal 24 uur — daarna moet je opnieuw inloggen. Dit is een beperking van het Microsoft-platform zelf, niet van de plugin.',
  },
  box: {
    setup: {
      step1: 'Open de Box Developer Console en maak een nieuwe app met OAuth 2.0-(User-)authenticatie — niet Server Authentication (JWT/CCG), dat kan later niet meer worden gewijzigd.',
      step2Server: 'Anders dan Dropbox, Google Drive en OneDrive vereist Box een Client Secret om in te loggen, en Box zelf waarschuwt dat dit geheim nooit in browsercode mag staan — daarom heeft deze provider een eigen kleine server nodig die het bewaart (optie tokenEndpoint hieronder; een kant-en-klaar voorbeeld staat in de README, sectie "Box").',
      step3: 'Kopieer op de Configuration-pagina van de app de Client ID en het Client Secret. Plak de Client ID hieronder — bewaar het Client Secret alleen in de omgevingsvariabelen van uw server, nooit hier.',
      step4WithRedirect: 'Plak dit op dezelfde Configuration-pagina onder Redirect URIs en klik op Save:',
      step4NoRedirect: 'Voeg op dezelfde Configuration-pagina onder Redirect URIs de volledige URL toe van de pagina public/box-callback.html op uw domein — deze kon niet automatisch worden gedetecteerd (zie redirectUri in de provideropties).',
      step5WithOrigin: 'Scroll op dezelfde Configuration-pagina naar CORS Domains en voeg deze origin toe (nodig zodat de browser de Box-API rechtstreeks kan aanroepen):',
      step5NoOrigin: 'Scroll op dezelfde Configuration-pagina naar CORS Domains en voeg de exacte origin (protocol + domein + poort) toe waarvandaan deze site wordt geserveerd — deze kon niet automatisch worden gedetecteerd.',
      step6: 'Schakel onder Application Scopes "Read and write all files and folders stored in Box" in (of Read-only, als u geen upload/verwijderen nodig heeft).',
      step7: 'Plak de Client ID in het veld hieronder.',
    },
    error: {
      exchangeCode: 'Box: kon de code niet inwisselen voor een token (status {status})',
      requireClientId: 'Sla eerst een Client ID op (zie de installatiewizard).',
      requireRedirectUri:
        'Kon redirectUri niet automatisch bepalen. Geef deze expliciet op in de BoxProvider-opties (nodig als de plugin via <script type="module"> of een bundler wordt geladen).',
      requireTokenEndpoint: 'BoxProvider vereist de optie tokenEndpoint (een eigen kleine server die het Box Client Secret bewaart) — zie de README, sectie "Box".',
      notConnected: 'Box is niet verbonden.',
      sessionExpired: 'De Box-sessie is verlopen, log opnieuw in.',
      refreshFailed: 'Box: token kon niet worden vernieuwd (status {status})',
      downloadFailed: 'Box: kon "{name}" niet downloaden (netwerk-/CORS-fout) — zie de README, sectie "Box"',
      fileTooLarge:
        'Het bestand is groter dan {maxMb} MB — Box-bestanden worden ingevoegd als data-URL omdat er geen downloadproxy is, en dit bestand is daarvoor te groot.',
      uploadFailed: 'Box: uploaden is mislukt (status {status})',
      uploadNetworkError: 'Box: netwerkfout tijdens het uploaden van het bestand',
    },
    sessionNote: 'Box-refreshtokens zijn maximaal 60 dagen geldig en worden bij elk gebruik vervangen door een nieuwe — als u deze site 60 dagen achtereen niet gebruikt, moet u opnieuw inloggen. Deze provider is ook afhankelijk van een eigen kleine server om het Box Client Secret buiten de browser te houden.',
  },
  s3: {
    connectMenuItem: 'S3 verbinden',
    modalTitle: 'S3-compatibele opslag verbinden',
    nameLabel: 'Tabnaam',
    namePlaceholder: 'bijv. Mijn bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Regio',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Aangepast endpoint (optioneel)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Laat leeg voor AWS S3. Vul dit in voor S3-compatibele diensten (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Path-style URL’s gebruiken (nodig voor de meeste self-hosted/S3-compatibele endpoints)',
    corsHint: 'De bucket moet CORS-verzoeken van deze site toestaan (GET, PUT, DELETE, HEAD) — stel dit in bij de CORS-instellingen van de bucket.',
    connect: 'Verbinden',
    cancel: 'Annuleren',
    connecting: 'Verbinden…',
    error: {
      required: 'Vul alle verplichte velden in.',
      duplicateName: 'Er bestaat al een tab met deze naam.',
      connectFailed: 'Verbinden mislukt: {message}',
      listFailed: 'S3: ophalen van objecten mislukt (status {status})',
      uploadFailed: 'S3: uploaden is mislukt (status {status})',
      uploadNetworkError: 'S3: netwerkfout tijdens het uploaden van het bestand',
      deleteFailed: 'S3: verwijderen is mislukt (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Inloggen via OAuth/PKCE vereist de Web Crypto API (crypto.subtle), die browsers uitschakelen op een onbeveiligde origin (gewoon http, behalve localhost). Open de site via https:// of, om te testen, via http://localhost.',
      popupBlocked: 'De browser heeft het autorisatievenster geblokkeerd. Sta pop-ups toe voor deze site.',
      stateMismatch: 'De autorisatierespons kon niet worden geverifieerd (state komt niet overeen).',
      popupClosed: 'Het autorisatievenster werd gesloten voordat het inloggen was voltooid.',
    },
  },
};

export default messages;
