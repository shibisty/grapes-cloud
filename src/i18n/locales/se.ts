import type { CloudAssetsMessages } from '../types';

/**
 * Локаль `se` — код неверный по ISO 639-1 (должен быть `sv`), но так
 * исторически называется файл шведского языка в самом
 * `grapesjs/locale/se.js` (проверено — там реально шведский текст).
 * Используем тот же код, что и ядро GrapesJS, чтобы совпадать с ним,
 * если сайт когда-нибудь явно укажет `i18n.locale: 'se'`.
 */
const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Rot',
    loading: 'Läser in…',
    empty: 'Inget här än.',
    loadMore: 'Fler',
    uploadFile: 'Ladda upp fil',
    urlPlaceholder: 'Klistra in en länk till en fil…',
    addUrl: 'Lägg till',
    searchPlaceholder: 'Sök bland filer…',
    filter: {
      all: 'Alla typer',
    },
    settings: 'Inställningar',
    refresh: 'Uppdatera',
    selectedCount: '{count} markerade',
    cancelSelection: 'Avbryt',
    insertSelected: 'Infoga ({count})',
    openInTab: 'Öppna i en ny flik',
    delete: 'Ta bort',
    deleteConfirm: 'Bekräfta borttagning?',
    viewGrid: 'Rutnätsvy',
    viewTable: 'Tabellvy',
    viewTree: 'Trädvy',
    columnName: 'Namn',
    columnType: 'Typ',
    columnSize: 'Storlek',
    columnModified: 'Ändrad',
    type: {
      image: 'Bild',
      video: 'Video',
      audio: 'Ljud',
      document: 'Dokument',
      folder: 'Mapp',
      other: 'Fil',
    },
    error: {
      generic: 'Det gick inte att läsa in fillistan',
      insertFailed: 'Det gick inte att infoga den här filen',
    },
    dropzone: {
      active: 'Släpp för att ladda upp',
    },
    upload: {
      queueTitle: 'Laddar upp {done}/{total}',
      uploading: 'Laddar upp…',
      done: 'Klart',
      error: 'Misslyckades',
      close: 'Stäng',
    },
    tree: {
      expandAll: 'Expandera alla',
      collapseAll: 'Fäll ihop alla',
      expandFolder: 'Expandera mapp',
      collapseFolder: 'Fäll ihop mapp',
    },
    addConnection: 'Lägg till anslutning',
    moreTabs: 'Fler flikar',
    removeConnection: 'Ta bort',
    removeConnectionConfirm: 'Bekräfta borttagning?',
  },
  auth: {
    connectPrompt: 'Anslut {provider} för att välja filer härifrån.',
    loginButton: 'Logga in på {provider}',
    loggingIn: 'Öppnar auktoriseringsfönstret…',
    loginFailed: 'Inloggningen misslyckades.',
    changeAppKey: 'Ändra App Key',
    logout: 'Logga ut',
    logoutConfirm: 'Bekräfta utloggning?',
  },
  setup: {
    missingInfo: '{provider} behöver konfigureras, men ingen instruktion finns tillgänglig.',
    intro: 'För att ansluta {provider} skapar du först en app i dess utvecklarkonsol: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Spara',
    saveFailed: 'Det gick inte att spara App Key.',
    copy: 'Kopiera',
    copied: 'Kopierad',
    selected: 'Markerad, tryck Ctrl+C',
    uploadHint: 'När du har anslutit kan du också ladda upp filer genom att dra dem (eller en hel mapp) till listan, eller med knappen Ladda upp ovan.',
  },
  block: {
    label: 'Molnmedia',
    category: 'Lagring',
  },
  button: {
    label: 'Infoga från molnet',
  },
  modal: {
    title: 'Infoga från molnet',
  },
  local: {
    tabLabel: 'Mina filer',
    error: {
      emptyUrl: 'Ange en länk till en fil',
      readFile: 'Det gick inte att läsa filen',
    },
  },
  settings: {
    tabButton: 'Anslutna konton',
    title: 'Anslutna konton',
    empty: 'Ingen leverantör här stöder ännu inloggning med App Key/Client ID.',
    authenticatedAt: 'Auktoriserad {date}',
    authenticatedAtUnknown: 'Auktoriseringsdatum okänt',
    notConnected: 'Inte ansluten',
    tokenExpiresIn: 'Token upphör om {time}',
    tokenExpired: 'Token har gått ut — förnyas automatiskt vid nästa åtgärd',
    close: 'Stäng',
  },
  dropbox: {
    setup: {
      step1: 'Öppna Dropbox App Console och klicka på "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Ange valfritt appnamn och klicka på Create app.',
      step3: 'Markera files.metadata.read, files.content.read och files.content.write på fliken Permissions och klicka sedan på Submit.',
      step4WithRedirect: 'Klistra in detta under Redirect URIs på fliken Settings och klicka på Add:',
      step4NoRedirect:
        'Lägg till hela webbadressen till sidan public/dropbox-callback.html på din domän under Redirect URIs på fliken Settings — den kunde inte identifieras automatiskt (se redirectUri i providerns alternativ).',
      step5: 'Kopiera App key på samma flik Settings och klistra in den i fältet nedan.',
    },
    error: {
      exchangeCode: 'Dropbox: det gick inte att växla in koden mot en token (status {status})',
      requireAppKey: 'Spara en App Key först (se konfigurationsguiden).',
      requireRedirectUri:
        'Det gick inte att fastställa redirectUri automatiskt. Ange den uttryckligen i DropboxProvider-alternativen (krävs om tillägget laddas via <script type="module"> eller en bundlare).',
      notConnected: 'Dropbox är inte anslutet.',
      sessionExpired: 'Dropbox-sessionen har gått ut, logga in igen.',
      refreshFailed: 'Dropbox: det gick inte att förnya token (status {status})',
      uploadFailed: 'Dropbox: uppladdningen misslyckades (status {status})',
      uploadNetworkError: 'Dropbox: nätverksfel vid uppladdning av filen',
    },
    sessionNote: 'Dropbox-sessionen har ingen tidsgräns: den förblir giltig tills du loggar ut eller återkallar åtkomsten i Dropboxs egna inställningar.',
  },
  google: {
    setup: {
      step1: 'Öppna Google Cloud Console, skapa ett projekt (eller välj ett befintligt) och öppna sedan "APIs & Services".',
      step2: 'Under Library, hitta och aktivera "Google Drive API".',
      step3:
        'Under "OAuth consent screen", ställ in User type till External, lägg till scopet .../auth/drive.readonly och lägg till ditt eget Google-konto som test user (en overifierad app är begränsad till test users och visar en varningsskärm — publicering för många användare kräver Googles verifieringsgranskning).',
      step4WithOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, välj Application type "Web application", klistra in detta under Authorized JavaScript origins och klicka på Add:',
      step4NoOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, välj Application type "Web application", och lägg till den exakta origin (protokoll + domän + port) som webbplatsen levereras från under Authorized JavaScript origins — den kunde inte identifieras automatiskt.',
      step5: 'På samma skärm, kopiera Client ID (slutar på .apps.googleusercontent.com) och klistra in den i fältet nedan.',
    },
    error: {
      gisLoadFailed: 'Det gick inte att läsa in Google Identity Services (accounts.google.com/gsi/client) — kontrollera din nätverksanslutning eller en annons-/skriptblockerare.',
      tokenFailed: 'Google returnerade inget åtkomsttoken. Försök logga in igen.',
      requireClientId: 'Spara ett Client ID först (se konfigurationsguiden).',
      notConnected: 'Google Drive är inte anslutet.',
      sessionExpired: 'Google-sessionen har gått ut, logga in igen.',
      fileTooLarge:
        'Filen är större än {maxMb} MB — Google Drive-filer infogas som en data-URL eftersom det inte finns någon server, så den här filen är för stor för att infogas.',
      uploadFailed: 'Google Drive: uppladdningen misslyckades (status {status})',
      uploadNetworkError: 'Google Drive: nätverksfel vid uppladdning av filen',
    },
    sessionNote: 'Google Drive-sessionen förnyas automatiskt (ungefär varje timme) så länge du förblir inloggad på ditt Google-konto i den här webbläsaren.',
  },
  microsoft: {
    setup: {
      step1: 'Öppna Azure Portal → Microsoft Entra ID → App registrations och klicka på "New registration".',
      step2: 'Under Supported account types, välj "Accounts in any organizational directory and personal Microsoft accounts" och klicka sedan på Register.',
      step3:
        'Under API permissions → Add a permission → Microsoft Graph → Delegated permissions, lägg till Files.ReadWrite och offline_access, och klicka sedan på Add permissions.',
      step4WithRedirect:
        'Under Authentication → Add a platform → Single-page application, klistra in detta under Redirect URIs och klicka på Configure:',
      step4NoRedirect:
        'Under Authentication → Add a platform → Single-page application, lägg till hela webbadressen till sidan public/microsoft-callback.html på din domän under Redirect URIs — den kunde inte identifieras automatiskt (se redirectUri i providerns alternativ).',
      step5: 'På sidan Overview, kopiera Application (client) ID och klistra in den i fältet nedan.',
    },
    error: {
      exchangeCode: 'Microsoft: det gick inte att växla in koden mot en token (status {status})',
      requireClientId: 'Spara ett Application (client) ID först (se konfigurationsguiden).',
      requireRedirectUri:
        'Det gick inte att fastställa redirectUri automatiskt. Ange den uttryckligen i OneDriveProvider-alternativen (krävs om tillägget laddas via <script type="module"> eller en bundlare).',
      notConnected: 'OneDrive är inte anslutet.',
      sessionExpired: 'Microsoft-sessionen har gått ut, logga in igen.',
      refreshFailed: 'Microsoft: det gick inte att förnya token (status {status})',
      noSpoLicense:
        'Organisationen för det här Microsoft-kontot har inte OneDrive/SharePoint licensierat (Microsoft Graph: "Tenant does not have a SPO license"). Logga in med ett personligt Microsoft-konto (outlook.com/hotmail/live) eller ett jobbkonto vars organisation har OneDrive for Business aktiverat.',
      noDownloadableContent:
        '"{name}" har inget nedladdningsbart innehåll och kan inte infogas — det här beror oftast på att det är en OneNote-anteckningsbok eller en annan objekttyp som OneDrive inte kan leverera som en vanlig fil.',
      downloadUrlUnavailable:
        '"{name}" har ännu ingen nedladdningslänk — det kan hända direkt efter uppladdning, eller om din organisation blockerar nedladdning av filen. Försök igen om en liten stund.',
      uploadFailed: 'OneDrive: uppladdningen misslyckades (status {status})',
      uploadNetworkError: 'OneDrive: nätverksfel vid uppladdning av filen',
    },
    sessionNote: 'Microsoft begränsar sessionen för appar som körs i webbläsaren (SPA) till högst 24 timmar — därefter måste du logga in igen. Det är en begränsning i själva Microsoft-plattformen, inte i tillägget.',
  },
  box: {
    setup: {
      step1: 'Raba Box Developer Console ja ráhkat ođđa app OAuth 2.0 (User) autentiserema bokte — ii Server Authentication (JWT/CCG), maid ii sáhte rievdadit maŋŋel.',
      step2Server: 'Earáláganin go Dropbox, Google Drive ja OneDrive, Box gáibida bearrái Client Secret čatnasit — ja Box ieš várrida ahte dán čiegus ii oaččo leat cuiggodeaddji kodas — danin dát bálvái dárbbaša unna iežas serverama mii dan seailluha (molssaeaktu tokenEndpoint vulos; ovdamearka gávdno README fiillas, oassi "Box").',
      step3: 'App Configuration siiddus máŋge Client ID ja Client Secret. Bija Client ID vulos — Client Secret seailut dušše iežat servera birasvariábeliin, ii goassege dása.',
      step4WithRedirect: 'Seamma Configuration siiddus, Redirect URIs vuolde, liibme dán ja coahkkal Save:',
      step4NoRedirect: 'Seamma Configuration siiddus, Redirect URIs vuolde, lasit ollislaš URL siidui public/box-callback.html iežat domenas — dan ii sáhttán automáhtalaččat gávdnat (geahča redirectUri bálvá molssaeavttuin).',
      step5WithOrigin: 'Ain Configuration siiddus, jorgal CORS Domains rádjái ja lasit dán origin (dárbbašuvvo vai fierpmádatlogan sáhttá riekta gohčodit Box API):',
      step5NoOrigin: 'Ain Configuration siiddus, jorgal CORS Domains rádjái ja lasit dárkilis origin (protokolla + domena + poarta) mas dát siidu bálvaluvvo — dan ii sáhttán automáhtalaččat gávdnat.',
      step6: 'Application Scopes vuolde, ala "Read and write all files and folders stored in Box" (dahje Read-only, jos it dárbbaš uploadet/sihkkut).',
      step7: 'Bija Client ID vulobealde gieddái.',
    },
    error: {
      exchangeCode: 'Box: ii lihkostuvvan lonuhit code token vuostá (stáhtus {status})',
      requireClientId: 'Vurke vuos Client ID (geahča ásaheami veahkkeprográmma).',
      requireRedirectUri:
        'Ii lihkostuvvan automáhtalaččat gávdnat redirectUri. Cealkke dan čielgasit BoxProvider molssaeavttuin.',
      requireTokenEndpoint: 'BoxProvider dárbbaša tokenEndpoint molssaeavttu (unna iežas server mii seailluha Box Client Secret) — geahča README, oassi "Box".',
      notConnected: 'Box ii leat čatnasan.',
      sessionExpired: 'Box bargobadji nogai, čálit sisa fas.',
      refreshFailed: 'Box: ii lihkostuvvan ođasmahttit token (stáhtus {status})',
      downloadFailed: 'Box: ii lihkostuvvan viežžat "{name}" (fierpmádat-/CORS meattáhus) — geahča README, oassi "Box"',
      fileTooLarge:
        'Fiila lea stuorát go {maxMb} MB — Box fiillat biddjojuvvojit data URL:n go ii gávdno viežžanproxy, ja dát fiila lea beare stuoris dasa.',
      uploadFailed: 'Box: uploadeapmi ii lihkostuvvan (stáhtus {status})',
      uploadNetworkError: 'Box: fierpmádatmeattáhus fiilla uploadeamis',
    },
    sessionNote: 'Box ođasmahttinseavvamat leat fámus eanemustá 60 beaivvi ja lonuhuvvojit ođđasin juohke geavaheamis — jos it geavat dán siiddu 60 beaivvi maŋimuš, fertet čálit sisa fas. Dát bálvái maiddái dárbbaša unna iežas servera vai Box Client Secret ii joavdda fierpmádatlogamii.',
  },
  s3: {
    connectMenuItem: 'Anslut S3',
    modalTitle: 'Anslut S3-kompatibel lagring',
    nameLabel: 'Fliknamn',
    namePlaceholder: 't.ex. Min bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Region',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Egen endpoint (valfritt)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Lämna tomt för AWS S3. Fyll i för S3-kompatibla tjänster (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Använd path-style-URL:er (behövs för de flesta självhostade/S3-kompatibla endpoints)',
    corsHint: 'Bucketen måste tillåta CORS-förfrågningar från den här webbplatsen (GET, PUT, DELETE, HEAD) — konfigurera detta i bucketens CORS-inställningar.',
    connect: 'Anslut',
    cancel: 'Avbryt',
    connecting: 'Ansluter…',
    error: {
      required: 'Fyll i alla obligatoriska fält.',
      duplicateName: 'En flik med detta namn finns redan.',
      connectFailed: 'Kunde inte ansluta: {message}',
      listFailed: 'S3: det gick inte att hämta objektlistan (status {status})',
      uploadFailed: 'S3: uppladdningen misslyckades (status {status})',
      uploadNetworkError: 'S3: nätverksfel vid uppladdning av filen',
      deleteFailed: 'S3: det gick inte att ta bort (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'OAuth-inloggning via PKCE kräver Web Crypto API (crypto.subtle), som webbläsare inaktiverar på en osäker ursprungskälla (vanlig http, förutom localhost). Öppna webbplatsen via https:// eller, för test, via http://localhost.',
      popupBlocked: 'Webbläsaren blockerade popup-fönstret för auktorisering. Tillåt popup-fönster för den här webbplatsen.',
      stateMismatch: 'Auktoriseringssvaret klarade inte verifieringen (state matchar inte).',
      popupClosed: 'Auktoriseringsfönstret stängdes innan inloggningen slutfördes.',
    },
  },
};

export default messages;
