import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Katalog główny',
    loading: 'Ładowanie…',
    empty: 'Tu jeszcze nic nie ma.',
    loadMore: 'Więcej',
    uploadFile: 'Prześlij plik',
    urlPlaceholder: 'Wklej link do pliku…',
    addUrl: 'Dodaj',
    searchPlaceholder: 'Szukaj plików…',
    filter: {
      all: 'Wszystkie typy',
    },
    settings: 'Ustawienia',
    refresh: 'Odśwież',
    selectedCount: 'Wybrano: {count}',
    cancelSelection: 'Anuluj',
    insertSelected: 'Wstaw ({count})',
    openInTab: 'Otwórz w nowej karcie',
    delete: 'Usuń',
    deleteConfirm: 'Na pewno usunąć?',
    viewGrid: 'Widok siatki',
    viewTable: 'Widok tabeli',
    viewTree: 'Widok drzewa',
    columnName: 'Nazwa',
    columnType: 'Typ',
    columnSize: 'Rozmiar',
    columnModified: 'Zmodyfikowano',
    type: {
      image: 'Obraz',
      video: 'Wideo',
      audio: 'Audio',
      document: 'Dokument',
      folder: 'Folder',
      other: 'Plik',
    },
    error: {
      generic: 'Nie udało się wczytać listy plików',
      insertFailed: 'Nie udało się wstawić tego pliku',
    },
    dropzone: {
      active: 'Upuść, aby przesłać',
    },
    upload: {
      queueTitle: 'Przesyłanie {done}/{total}',
      uploading: 'Przesyłanie…',
      done: 'Gotowe',
      error: 'Niepowodzenie',
      close: 'Zamknij',
    },
    tree: {
      expandAll: 'Rozwiń wszystko',
      collapseAll: 'Zwiń wszystko',
      expandFolder: 'Rozwiń folder',
      collapseFolder: 'Zwiń folder',
    },
    addConnection: 'Dodaj połączenie',
    moreTabs: 'Więcej zakładek',
    removeConnection: 'Usuń',
    removeConnectionConfirm: 'Na pewno usunąć?',
  },
  auth: {
    connectPrompt: 'Połącz {provider}, aby wybierać stąd pliki.',
    loginButton: 'Zaloguj się do {provider}',
    loggingIn: 'Otwieranie okna autoryzacji…',
    loginFailed: 'Logowanie nie powiodło się.',
    changeAppKey: 'Zmień App Key',
    logout: 'Wyloguj się',
    logoutConfirm: 'Na pewno się wylogować?',
  },
  setup: {
    missingInfo: '{provider} wymaga konfiguracji, ale instrukcje są niedostępne.',
    intro: 'Aby połączyć {provider}, najpierw utwórz aplikację w jego konsoli deweloperskiej: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Zapisz',
    saveFailed: 'Nie udało się zapisać App Key.',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    selected: 'Zaznaczono, naciśnij Ctrl+C',
    uploadHint: 'Po połączeniu możesz też przesyłać pliki, przeciągając je (lub cały folder) na listę, albo za pomocą przycisku Prześlij powyżej.',
  },
  block: {
    label: 'Multimedia w chmurze',
    category: 'Magazyn',
  },
  button: {
    label: 'Wstaw z chmury',
  },
  modal: {
    title: 'Wstaw z chmury',
  },
  local: {
    tabLabel: 'Moje pliki',
    error: {
      emptyUrl: 'Wprowadź link do pliku',
      readFile: 'Nie udało się odczytać pliku',
    },
  },
  settings: {
    tabButton: 'Połączone konta',
    title: 'Połączone konta',
    empty: 'Żaden dostawca nie obsługuje tu jeszcze logowania przez App Key/Client ID.',
    authenticatedAt: 'Autoryzowano {date}',
    authenticatedAtUnknown: 'Data autoryzacji nieznana',
    notConnected: 'Niepołączono',
    tokenExpiresIn: 'Token wygasa za {time}',
    tokenExpired: 'Token wygasł — odnowi się automatycznie przy następnej akcji',
    close: 'Zamknij',
  },
  dropbox: {
    setup: {
      step1: 'Otwórz Dropbox App Console i kliknij „Create app”.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Wpisz dowolną nazwę aplikacji i kliknij Create app.',
      step3: 'Na karcie Permissions zaznacz files.metadata.read, files.content.read i files.content.write, a następnie kliknij Submit.',
      step4WithRedirect: 'Na karcie Settings, w sekcji Redirect URIs, wklej to i kliknij Add:',
      step4NoRedirect:
        'Na karcie Settings, w sekcji Redirect URIs, dodaj pełny adres URL strony public/dropbox-callback.html w Twojej domenie — nie udało się go wykryć automatycznie (zobacz redirectUri w opcjach dostawcy).',
      step5: 'Na tej samej karcie Settings skopiuj App key i wklej je w polu poniżej.',
    },
    error: {
      exchangeCode: 'Dropbox: nie udało się wymienić kodu na token (status {status})',
      requireAppKey: 'Najpierw zapisz App Key (zobacz kreator konfiguracji).',
      requireRedirectUri:
        'Nie udało się automatycznie ustalić redirectUri. Podaj go jawnie w opcjach DropboxProvider (wymagane, jeśli wtyczka jest ładowana przez <script type="module"> lub bundler).',
      notConnected: 'Dropbox nie jest połączony.',
      sessionExpired: 'Sesja Dropbox wygasła, zaloguj się ponownie.',
      refreshFailed: 'Dropbox: nie udało się odświeżyć tokenu (status {status})',
      uploadFailed: 'Dropbox: przesyłanie nie powiodło się (status {status})',
      uploadNetworkError: 'Dropbox: błąd sieci podczas przesyłania pliku',
    },
    sessionNote: 'Sesja Dropbox nie ma limitu czasu: pozostaje ważna, dopóki się nie wylogujesz lub nie odwołasz dostępu w ustawieniach samego Dropboxa.',
  },
  google: {
    setup: {
      step1: 'Otwórz Google Cloud Console, utwórz projekt (lub wybierz istniejący), a następnie otwórz „APIs & Services”.',
      step2: 'W sekcji Library znajdź i włącz „Google Drive API”.',
      step3:
        'W sekcji „OAuth consent screen” ustaw User type na External, dodaj scope .../auth/drive.readonly i dodaj swoje konto Google jako test user (niezweryfikowana aplikacja jest ograniczona do test users i wyświetla ekran ostrzeżenia — publikacja dla wielu użytkowników wymaga weryfikacji Google).',
      step4WithOrigin:
        'W sekcji Credentials → Create Credentials → OAuth client ID wybierz Application type „Web application”, a w Authorized JavaScript origins wklej to i kliknij Add:',
      step4NoOrigin:
        'W sekcji Credentials → Create Credentials → OAuth client ID wybierz Application type „Web application”, a w Authorized JavaScript origins dodaj dokładny origin (protokół + domena + port), z którego serwowana jest ta strona — nie udało się go wykryć automatycznie.',
      step5: 'Na tym samym ekranie skopiuj Client ID (kończy się na .apps.googleusercontent.com) i wklej go w polu poniżej.',
    },
    error: {
      gisLoadFailed: 'Nie udało się załadować Google Identity Services (accounts.google.com/gsi/client) — sprawdź połączenie sieciowe lub blokadę reklam/skryptów.',
      tokenFailed: 'Google nie zwrócił tokenu dostępu. Spróbuj zalogować się ponownie.',
      requireClientId: 'Najpierw zapisz Client ID (zobacz kreator konfiguracji).',
      notConnected: 'Google Drive nie jest połączony.',
      sessionExpired: 'Sesja Google wygasła, zaloguj się ponownie.',
      fileTooLarge:
        'Plik jest większy niż {maxMb} MB — pliki Google Drive są osadzane jako data URL, ponieważ nie ma serwera, więc ten plik jest zbyt duży, aby go wstawić.',
      uploadFailed: 'Google Drive: przesyłanie nie powiodło się (status {status})',
      uploadNetworkError: 'Google Drive: błąd sieci podczas przesyłania pliku',
    },
    sessionNote: 'Sesja Google Drive odnawia się automatycznie (mniej więcej co godzinę), dopóki pozostajesz zalogowany na konto Google w tej przeglądarce.',
  },
  microsoft: {
    setup: {
      step1: 'Otwórz Azure Portal → Microsoft Entra ID → App registrations i kliknij „New registration”.',
      step2: 'W sekcji Supported account types wybierz „Accounts in any organizational directory and personal Microsoft accounts”, a następnie kliknij Register.',
      step3:
        'W sekcji API permissions → Add a permission → Microsoft Graph → Delegated permissions dodaj Files.ReadWrite i offline_access, a następnie kliknij Add permissions.',
      step4WithRedirect:
        'W sekcji Authentication → Add a platform → Single-page application wklej to w Redirect URIs i kliknij Configure:',
      step4NoRedirect:
        'W sekcji Authentication → Add a platform → Single-page application dodaj w Redirect URIs pełny adres URL strony public/microsoft-callback.html w Twojej domenie — nie udało się go wykryć automatycznie (zobacz redirectUri w opcjach dostawcy).',
      step5: 'Na stronie Overview skopiuj Application (client) ID i wklej je w polu poniżej.',
    },
    error: {
      exchangeCode: 'Microsoft: nie udało się wymienić kodu na token (status {status})',
      requireClientId: 'Najpierw zapisz Application (client) ID (zobacz kreator konfiguracji).',
      requireRedirectUri:
        'Nie udało się automatycznie ustalić redirectUri. Podaj go jawnie w opcjach OneDriveProvider (wymagane, jeśli wtyczka jest ładowana przez <script type="module"> lub bundler).',
      notConnected: 'OneDrive nie jest połączony.',
      sessionExpired: 'Sesja Microsoft wygasła, zaloguj się ponownie.',
      refreshFailed: 'Microsoft: nie udało się odświeżyć tokenu (status {status})',
      noSpoLicense:
        'Organizacja tego konta Microsoft nie ma wykupionej licencji na OneDrive/SharePoint (Microsoft Graph: „Tenant does not have a SPO license”). Zaloguj się na osobiste konto Microsoft (outlook.com/hotmail/live) lub na konto służbowe, którego organizacja ma włączone OneDrive for Business.',
      noDownloadableContent:
        '„{name}” nie ma zawartości do pobrania i nie można go wstawić — zwykle dotyczy to notatników OneNote lub innych typów elementów, których OneDrive nie może udostępnić jako zwykłego pliku.',
      downloadUrlUnavailable:
        '„{name}” nie ma jeszcze linku do pobrania — może się to zdarzyć zaraz po przesłaniu pliku lub jeśli organizacja blokuje jego pobieranie. Spróbuj ponownie za chwilę.',
      uploadFailed: 'OneDrive: przesyłanie nie powiodło się (status {status})',
      uploadNetworkError: 'OneDrive: błąd sieci podczas przesyłania pliku',
    },
    sessionNote: 'Microsoft ogranicza sesję aplikacji działających w przeglądarce (SPA) do maksymalnie 24 godzin — po tym czasie trzeba zalogować się ponownie. To ograniczenie samej platformy Microsoft, nie wtyczki.',
  },
  box: {
    setup: {
      step1: 'Otwórz Box Developer Console i utwórz nową aplikację z uwierzytelnianiem OAuth 2.0 (User) — nie Server Authentication (JWT/CCG), którego później nie da się zmienić.',
      step2Server: 'W przeciwieństwie do Dropbox, Google Drive i OneDrive, Box wymaga Client Secret do zalogowania, a sam Box ostrzega, że ten sekret nigdy nie może znaleźć się w kodzie przeglądarki — dlatego ten dostawca potrzebuje własnego, niewielkiego serwera, który go przechowa (opcja tokenEndpoint poniżej; gotowy przykład znajduje się w README, sekcja „Box”).',
      step3: 'Na stronie Configuration aplikacji skopiuj Client ID i Client Secret. Wklej Client ID poniżej — Client Secret trzymaj wyłącznie w zmiennych środowiskowych swojego serwera, nigdy tutaj.',
      step4WithRedirect: 'Na tej samej stronie Configuration, w sekcji Redirect URIs, wklej to i kliknij Save:',
      step4NoRedirect: 'Na tej samej stronie Configuration, w sekcji Redirect URIs, dodaj pełny adres URL strony public/box-callback.html w Twojej domenie — nie udało się go wykryć automatycznie (zobacz redirectUri w opcjach dostawcy).',
      step5WithOrigin: 'Na tej samej stronie Configuration przewiń do CORS Domains i dodaj ten origin (potrzebny, aby przeglądarka mogła wywoływać API Box bezpośrednio):',
      step5NoOrigin: 'Na tej samej stronie Configuration przewiń do CORS Domains i dodaj dokładny origin (protokół + domena + port), z którego serwowana jest ta strona — nie udało się go wykryć automatycznie.',
      step6: 'W sekcji Application Scopes włącz „Read and write all files and folders stored in Box” (lub Read-only, jeśli nie potrzebujesz przesyłania/usuwania plików).',
      step7: 'Wklej Client ID w polu poniżej.',
    },
    error: {
      exchangeCode: 'Box: nie udało się wymienić kodu na token (status {status})',
      requireClientId: 'Najpierw zapisz Client ID (zobacz kreator konfiguracji).',
      requireRedirectUri:
        'Nie udało się automatycznie ustalić redirectUri. Podaj go jawnie w opcjach BoxProvider (wymagane, jeśli wtyczka jest ładowana przez <script type="module"> lub bundler).',
      requireTokenEndpoint: 'BoxProvider wymaga opcji tokenEndpoint (własnego, niewielkiego serwera przechowującego Client Secret Box) — zobacz README, sekcja „Box”.',
      notConnected: 'Box nie jest połączony.',
      sessionExpired: 'Sesja Box wygasła, zaloguj się ponownie.',
      refreshFailed: 'Box: nie udało się odświeżyć tokenu (status {status})',
      downloadFailed: 'Box: nie udało się pobrać „{name}” (błąd sieci/CORS) — zobacz README, sekcja „Box”',
      fileTooLarge:
        'Plik jest większy niż {maxMb} MB — pliki Box są wstawiane jako URL data, ponieważ nie ma serwera proxy do pobierania, a ten plik jest na to za duży.',
      uploadFailed: 'Box: przesyłanie nie powiodło się (status {status})',
      uploadNetworkError: 'Box: błąd sieci podczas przesyłania pliku',
    },
    sessionNote: 'Tokeny odświeżania Box są ważne maksymalnie 60 dni i przy każdym użyciu są zastępowane nowymi — jeśli nie skorzystasz z tej strony przez 60 dni z rzędu, trzeba będzie zalogować się ponownie. Ten dostawca wymaga też własnego, niewielkiego serwera, aby Client Secret Box nie trafiał do przeglądarki.',
  },
  s3: {
    connectMenuItem: 'Połącz z S3',
    modalTitle: 'Połącz magazyn kompatybilny z S3',
    nameLabel: 'Nazwa zakładki',
    namePlaceholder: 'np. Mój bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Region',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Własny endpoint (opcjonalnie)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Pozostaw puste dla AWS S3. Wypełnij dla usług kompatybilnych z S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Użyj adresów URL w stylu "path" (wymagane dla większości self-hosted/kompatybilnych z S3 endpointów)',
    corsHint: 'Bucket musi zezwalać na żądania CORS z tej witryny (GET, PUT, DELETE, HEAD) — skonfiguruj to w ustawieniach CORS bucketu.',
    connect: 'Połącz',
    cancel: 'Anuluj',
    connecting: 'Łączenie…',
    error: {
      required: 'Wypełnij wszystkie wymagane pola.',
      duplicateName: 'Zakładka z tą nazwą już istnieje.',
      connectFailed: 'Nie udało się połączyć: {message}',
      listFailed: 'S3: nie udało się pobrać listy obiektów (status {status})',
      uploadFailed: 'S3: przesyłanie nie powiodło się (status {status})',
      uploadNetworkError: 'S3: błąd sieci podczas przesyłania pliku',
      deleteFailed: 'S3: usuwanie nie powiodło się (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Logowanie OAuth przez PKCE wymaga Web Crypto API (crypto.subtle), które przeglądarki wyłączają w niezabezpieczonym źródle (zwykłe http, poza localhost). Otwórz witrynę przez https:// lub, w celach testowych, przez http://localhost.',
      popupBlocked: 'Przeglądarka zablokowała wyskakujące okno autoryzacji. Zezwól na wyskakujące okna dla tej witryny.',
      stateMismatch: 'Odpowiedź autoryzacji nie przeszła weryfikacji (niezgodność state).',
      popupClosed: 'Okno autoryzacji zostało zamknięte przed zakończeniem logowania.',
    },
  },
};

export default messages;
