import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Korijen',
    loading: 'Učitavanje…',
    empty: 'Ovdje još nema ničega.',
    loadMore: 'Više',
    uploadFile: 'Otpremi datoteku',
    urlPlaceholder: 'Zalijepite link do datoteke…',
    addUrl: 'Dodaj',
    searchPlaceholder: 'Pretraži datoteke…',
    filter: {
      all: 'Sve vrste',
    },
    settings: 'Podešavanja',
    refresh: 'Osvježi',
    selectedCount: 'Odabrano: {count}',
    cancelSelection: 'Otkaži',
    insertSelected: 'Umetni ({count})',
    openInTab: 'Otvori u novoj kartici',
    delete: 'Obriši',
    deleteConfirm: 'Potvrdi brisanje?',
    viewGrid: 'Prikaz mreže',
    viewTable: 'Prikaz tabele',
    viewTree: 'Prikaz stabla',
    columnName: 'Naziv',
    columnType: 'Vrsta',
    columnSize: 'Veličina',
    columnModified: 'Izmijenjeno',
    type: {
      image: 'Slika',
      video: 'Video',
      audio: 'Audio',
      document: 'Dokument',
      folder: 'Fascikla',
      other: 'Datoteka',
    },
    error: {
      generic: 'Nije uspjelo učitavanje liste datoteka',
      insertFailed: 'Nije moguće umetnuti ovu datoteku',
    },
    dropzone: {
      active: 'Ispustite za otpremanje',
    },
    upload: {
      queueTitle: 'Otpremanje {done}/{total}',
      uploading: 'Otpremanje…',
      done: 'Završeno',
      error: 'Nije uspjelo',
      close: 'Zatvori',
    },
    tree: {
      expandAll: 'Proširi sve',
      collapseAll: 'Skupi sve',
      expandFolder: 'Proširi fasciklu',
      collapseFolder: 'Skupi fasciklu',
    },
    addConnection: 'Dodaj vezu',
    moreTabs: 'Više kartica',
    removeConnection: 'Ukloni',
    removeConnectionConfirm: 'Potvrdi uklanjanje?',
  },
  auth: {
    connectPrompt: 'Povežite {provider} da biste odavde birali datoteke.',
    loginButton: 'Prijavite se na {provider}',
    loggingIn: 'Otvaranje prozora za autorizaciju…',
    loginFailed: 'Prijava nije uspjela.',
    changeAppKey: 'Promijeni App Key',
    logout: 'Odjava',
    logoutConfirm: 'Potvrdi odjavu?',
  },
  setup: {
    missingInfo: '{provider} zahtijeva podešavanje, ali uputstva nisu dostupna.',
    intro: 'Da biste povezali {provider}, prvo kreirajte aplikaciju u njegovoj konzoli za programere: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Sačuvaj',
    saveFailed: 'Nije uspjelo čuvanje App Key-a.',
    copy: 'Kopiraj',
    copied: 'Kopirano',
    selected: 'Označeno, pritisnite Ctrl+C',
    uploadHint: 'Nakon povezivanja, datoteke možete otpremiti i tako što ćete ih prevući (ili cijelu fasciklu) na listu, ili pomoću dugmeta Otpremi iznad.',
  },
  block: {
    label: 'Sadržaji iz oblaka',
    category: 'Skladištenje',
  },
  button: {
    label: 'Umetni iz oblaka',
  },
  modal: {
    title: 'Umetni iz oblaka',
  },
  local: {
    tabLabel: 'Moje datoteke',
    error: {
      emptyUrl: 'Unesite link do datoteke',
      readFile: 'Nije uspjelo čitanje datoteke',
    },
  },
  dropbox: {
    setup: {
      step1: 'Otvorite Dropbox App Console i kliknite „Create app”.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Unesite bilo koji naziv aplikacije i kliknite Create app.',
      step3: 'Na kartici Permissions označite files.metadata.read, files.content.read i files.content.write, zatim kliknite Submit.',
      step4WithRedirect: 'Na kartici Settings, u odjeljku Redirect URIs, zalijepite ovo i kliknite Add:',
      step4NoRedirect:
        'Na kartici Settings, u odjeljku Redirect URIs, dodajte punu URL adresu stranice public/dropbox-callback.html na vašoj domeni — nije je bilo moguće automatski otkriti (pogledajte redirectUri u opcijama provajdera).',
      step5: 'Na istoj kartici Settings kopirajte App key i zalijepite ga u polje ispod.',
    },
    error: {
      exchangeCode: 'Dropbox: nije uspjela razmjena koda za token (status {status})',
      requireAppKey: 'Prvo sačuvajte App Key (pogledajte čarobnjak za podešavanje).',
      requireRedirectUri:
        'Nije uspjelo automatsko utvrđivanje redirectUri. Navedite ga eksplicitno u opcijama DropboxProvider-a (potrebno ako se dodatak učitava putem <script type="module"> ili bundlera).',
      notConnected: 'Dropbox nije povezan.',
      sessionExpired: 'Dropbox sesija je istekla, prijavite se ponovo.',
      refreshFailed: 'Dropbox: nije uspjelo obnavljanje tokena (status {status})',
      uploadFailed: 'Dropbox: otpremanje nije uspjelo (status {status})',
      uploadNetworkError: 'Dropbox: mrežna greška prilikom otpremanja datoteke',
    },
  },
  google: {
    setup: {
      step1: 'Otvorite Google Cloud Console, kreirajte projekat (ili odaberite postojeći), zatim otvorite „APIs & Services”.',
      step2: 'U odjeljku Library pronađite i omogućite „Google Drive API”.',
      step3:
        'U „OAuth consent screen” postavite User type na External, dodajte scope .../auth/drive.readonly i dodajte svoj Google nalog kao test user (neverifikovana aplikacija je ograničena na test korisnike i prikazuje upozorenje — objavljivanje za veći broj korisnika zahtijeva Googleovu verifikaciju).',
      step4WithOrigin:
        'U Credentials → Create Credentials → OAuth client ID odaberite Application type „Web application”, a u Authorized JavaScript origins zalijepite ovo i kliknite Add:',
      step4NoOrigin:
        'U Credentials → Create Credentials → OAuth client ID odaberite Application type „Web application”, a u Authorized JavaScript origins dodajte tačan origin (protokol + domenu + port) sa kojeg se ova stranica servira — nije ga bilo moguće automatski otkriti.',
      step5: 'Na istom ekranu kopirajte Client ID (završava na .apps.googleusercontent.com) i zalijepite ga u polje ispod.',
    },
    error: {
      gisLoadFailed: 'Nije uspjelo učitavanje Google Identity Services (accounts.google.com/gsi/client) — provjerite internetsku vezu ili blokator oglasa/skripti.',
      tokenFailed: 'Google nije vratio pristupni token. Pokušajte se ponovo prijaviti.',
      requireClientId: 'Prvo sačuvajte Client ID (pogledajte čarobnjak za podešavanje).',
      notConnected: 'Google Drive nije povezan.',
      sessionExpired: 'Google sesija je istekla, prijavite se ponovo.',
      fileTooLarge:
        'Datoteka je veća od {maxMb} MB — datoteke Google Drive-a se umeću kao data URL jer nema servera, pa je ova datoteka prevelika za umetanje.',
      uploadFailed: 'Google Drive: otpremanje nije uspjelo (status {status})',
      uploadNetworkError: 'Google Drive: mrežna greška prilikom otpremanja datoteke',
    },
  },
  microsoft: {
    setup: {
      step1: 'Otvorite Azure Portal → Microsoft Entra ID → App registrations i kliknite „New registration”.',
      step2: 'U Supported account types odaberite „Accounts in any organizational directory and personal Microsoft accounts”, zatim kliknite Register.',
      step3:
        'U API permissions → Add a permission → Microsoft Graph → Delegated permissions dodajte Files.ReadWrite i offline_access, zatim kliknite Add permissions.',
      step4WithRedirect:
        'U Authentication → Add a platform → Single-page application zalijepite ovo u Redirect URIs i kliknite Configure:',
      step4NoRedirect:
        'U Authentication → Add a platform → Single-page application dodajte punu URL adresu stranice public/microsoft-callback.html na vašoj domeni u Redirect URIs — nije je bilo moguće automatski otkriti (pogledajte redirectUri u opcijama provajdera).',
      step5: 'Na stranici Overview kopirajte Application (client) ID i zalijepite ga u polje ispod.',
    },
    error: {
      exchangeCode: 'Microsoft: nije uspjela razmjena koda za token (status {status})',
      requireClientId: 'Prvo sačuvajte Application (client) ID (pogledajte čarobnjak za podešavanje).',
      requireRedirectUri:
        'Nije uspjelo automatsko utvrđivanje redirectUri. Navedite ga eksplicitno u opcijama OneDriveProvider-a (potrebno ako se dodatak učitava putem <script type="module"> ili bundlera).',
      notConnected: 'OneDrive nije povezan.',
      sessionExpired: 'Microsoft sesija je istekla, prijavite se ponovo.',
      refreshFailed: 'Microsoft: nije uspjelo obnavljanje tokena (status {status})',
      noSpoLicense:
        'Organizacija ovog Microsoft naloga nema licenciran OneDrive/SharePoint (Microsoft Graph: „Tenant does not have a SPO license”). Prijavite se ličnim Microsoft nalogom (outlook.com/hotmail/live) ili poslovnim nalogom čija organizacija ima omogućen OneDrive for Business.',
      noDownloadableContent:
        '„{name}” nema sadržaj koji se može preuzeti — obično se to dešava kod OneNote bilježnica ili drugih vrsta stavki koje OneDrive ne može poslužiti kao obična datoteka.',
      downloadUrlUnavailable:
        '„{name}” još nema poveznicu za preuzimanje — to se može desiti odmah nakon otpremanja, ili ako vaša organizacija blokira preuzimanje ove datoteke. Pokušajte ponovo za trenutak.',
      uploadFailed: 'OneDrive: otpremanje nije uspjelo (status {status})',
      uploadNetworkError: 'OneDrive: mrežna greška prilikom otpremanja datoteke',
    },
  },
  s3: {
    connectMenuItem: 'Poveži S3',
    modalTitle: 'Poveži S3-kompatibilno skladište',
    nameLabel: 'Naziv kartice',
    namePlaceholder: 'npr. Moj bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Regija',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Prilagođeni endpoint (opciono)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Ostavite prazno za AWS S3. Popunite za S3-kompatibilne servise (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Koristi URL-ove u path stilu (potrebno za većinu self-hosted/S3-kompatibilnih endpointa)',
    corsHint: 'Bucket mora dozvoliti CORS zahtjeve sa ove stranice (GET, PUT, DELETE, HEAD) — podesite to u CORS postavkama bucketa.',
    connect: 'Poveži',
    cancel: 'Otkaži',
    connecting: 'Povezivanje…',
    error: {
      required: 'Popunite sva obavezna polja.',
      duplicateName: 'Kartica s ovim nazivom već postoji.',
      connectFailed: 'Povezivanje nije uspjelo: {message}',
      listFailed: 'S3: preuzimanje liste objekata nije uspjelo (status {status})',
      uploadFailed: 'S3: otpremanje nije uspjelo (status {status})',
      uploadNetworkError: 'S3: mrežna greška prilikom otpremanja datoteke',
      deleteFailed: 'S3: brisanje nije uspjelo (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'OAuth prijava putem PKCE-a zahtijeva Web Crypto API (crypto.subtle), koji preglednici onemogućavaju na nesigurnom izvoru (obični http, osim localhost). Otvorite stranicu putem https:// ili, radi testiranja, putem http://localhost.',
      popupBlocked: 'Preglednik je blokirao skočni prozor za autorizaciju. Dozvolite skočne prozore za ovu stranicu.',
      stateMismatch: 'Odgovor autorizacije nije prošao provjeru (state se ne poklapa).',
      popupClosed: 'Prozor za autorizaciju je zatvoren prije nego što je prijava završena.',
    },
  },
};

export default messages;
