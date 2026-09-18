import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Stammverzeichnis',
    loading: 'Wird geladen…',
    empty: 'Hier ist noch nichts.',
    loadMore: 'Mehr',
    uploadFile: 'Datei hochladen',
    urlPlaceholder: 'Link zu einer Datei einfügen…',
    addUrl: 'Hinzufügen',
    searchPlaceholder: 'Dateien durchsuchen…',
    filter: {
      all: 'Alle Typen',
    },
    settings: 'Einstellungen',
    refresh: 'Aktualisieren',
    selectedCount: '{count} ausgewählt',
    cancelSelection: 'Abbrechen',
    insertSelected: 'Einfügen ({count})',
    openInTab: 'In neuem Tab öffnen',
    delete: 'Löschen',
    deleteConfirm: 'Löschen bestätigen?',
    viewGrid: 'Kachelansicht',
    viewTable: 'Tabellenansicht',
    viewTree: 'Baumansicht',
    columnName: 'Name',
    columnType: 'Typ',
    columnSize: 'Größe',
    columnModified: 'Geändert',
    type: {
      image: 'Bild',
      video: 'Video',
      audio: 'Audio',
      document: 'Dokument',
      folder: 'Ordner',
      other: 'Datei',
    },
    error: {
      generic: 'Dateiliste konnte nicht geladen werden',
      insertFailed: 'Diese Datei konnte nicht eingefügt werden',
    },
    dropzone: {
      active: 'Zum Hochladen hier ablegen',
    },
    upload: {
      queueTitle: 'Wird hochgeladen {done}/{total}',
      uploading: 'Wird hochgeladen…',
      done: 'Fertig',
      error: 'Fehlgeschlagen',
      close: 'Schließen',
    },
    tree: {
      expandAll: 'Alle erweitern',
      collapseAll: 'Alle einklappen',
      expandFolder: 'Ordner erweitern',
      collapseFolder: 'Ordner einklappen',
    },
    addConnection: 'Verbindung hinzufügen',
    moreTabs: 'Weitere Tabs',
    removeConnection: 'Entfernen',
    removeConnectionConfirm: 'Entfernen bestätigen?',
  },
  auth: {
    connectPrompt: 'Verbinden Sie {provider}, um von hier Dateien auszuwählen.',
    loginButton: 'Bei {provider} anmelden',
    loggingIn: 'Anmeldefenster wird geöffnet…',
    loginFailed: 'Anmeldung fehlgeschlagen.',
    changeAppKey: 'App Key ändern',
    logout: 'Abmelden',
    logoutConfirm: 'Abmeldung bestätigen?',
  },
  setup: {
    missingInfo: '{provider} muss eingerichtet werden, aber es liegt keine Anleitung vor.',
    intro: 'Um {provider} zu verbinden, erstellen Sie zuerst eine App in der Entwicklerkonsole: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Speichern',
    saveFailed: 'App Key konnte nicht gespeichert werden.',
    copy: 'Kopieren',
    copied: 'Kopiert',
    selected: 'Markiert, drücken Sie Strg+C',
    uploadHint: 'Nach dem Verbinden können Sie Dateien auch hochladen, indem Sie sie (oder einen ganzen Ordner) in die Liste ziehen, oder über die Schaltfläche „Hochladen“ oben.',
  },
  block: {
    label: 'Cloud-Medien',
    category: 'Speicher',
  },
  button: {
    label: 'Aus der Cloud einfügen',
  },
  modal: {
    title: 'Aus der Cloud einfügen',
  },
  local: {
    tabLabel: 'Eigene Dateien',
    error: {
      emptyUrl: 'Geben Sie einen Link zu einer Datei ein',
      readFile: 'Datei konnte nicht gelesen werden',
    },
  },
  dropbox: {
    setup: {
      step1: 'Öffnen Sie die Dropbox App Console und klicken Sie auf „Create app“.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Geben Sie einen beliebigen App-Namen ein und klicken Sie auf Create app.',
      step3: 'Aktivieren Sie im Tab Permissions die Optionen files.metadata.read, files.content.read und files.content.write und klicken Sie auf Submit.',
      step4WithRedirect: 'Fügen Sie im Tab Settings unter Redirect URIs Folgendes ein und klicken Sie auf Add:',
      step4NoRedirect:
        'Fügen Sie im Tab Settings unter Redirect URIs die vollständige URL der Seite public/dropbox-callback.html auf Ihrer Domain hinzu — sie konnte nicht automatisch erkannt werden (siehe redirectUri in den Provider-Optionen).',
      step5: 'Kopieren Sie im selben Tab Settings den App key und fügen Sie ihn unten in das Feld ein.',
    },
    error: {
      exchangeCode: 'Dropbox: Code konnte nicht gegen ein Token eingetauscht werden (Status {status})',
      requireAppKey: 'Speichern Sie zuerst einen App Key (siehe Einrichtungsassistent).',
      requireRedirectUri:
        'redirectUri konnte nicht automatisch ermittelt werden. Geben Sie sie explizit in den DropboxProvider-Optionen an (nötig, wenn das Plugin über <script type="module"> oder einen Bundler geladen wird).',
      notConnected: 'Dropbox ist nicht verbunden.',
      sessionExpired: 'Die Dropbox-Sitzung ist abgelaufen, bitte erneut anmelden.',
      refreshFailed: 'Dropbox: Token konnte nicht erneuert werden (Status {status})',
      uploadFailed: 'Dropbox: Hochladen fehlgeschlagen (Status {status})',
      uploadNetworkError: 'Dropbox: Netzwerkfehler beim Hochladen der Datei',
    },
  },
  google: {
    setup: {
      step1: 'Öffnen Sie die Google Cloud Console, erstellen Sie ein Projekt (oder wählen Sie ein vorhandenes aus) und öffnen Sie dann „APIs & Services“.',
      step2: 'Suchen Sie unter Library nach der „Google Drive API“ und aktivieren Sie sie.',
      step3:
        'Setzen Sie unter „OAuth consent screen“ den User type auf External, fügen Sie den Scope .../auth/drive.readonly hinzu und fügen Sie Ihr eigenes Google-Konto als test user hinzu (eine nicht verifizierte App ist auf Testnutzer beschränkt und zeigt einen Warnbildschirm — für die Veröffentlichung für viele Nutzer ist eine Verifizierung durch Google erforderlich).',
      step4WithOrigin:
        'Wählen Sie unter Credentials → Create Credentials → OAuth client ID den Application type „Web application“ und fügen Sie unter Authorized JavaScript origins Folgendes ein und klicken Sie auf Add:',
      step4NoOrigin:
        'Wählen Sie unter Credentials → Create Credentials → OAuth client ID den Application type „Web application“ und fügen Sie unter Authorized JavaScript origins den genauen Origin (Protokoll + Domain + Port) hinzu, von dem diese Website bereitgestellt wird — er konnte nicht automatisch erkannt werden.',
      step5: 'Kopieren Sie auf demselben Bildschirm die Client ID (endet mit .apps.googleusercontent.com) und fügen Sie sie unten in das Feld ein.',
    },
    error: {
      gisLoadFailed: 'Google Identity Services (accounts.google.com/gsi/client) konnte nicht geladen werden — prüfen Sie Ihre Netzwerkverbindung oder einen Werbe-/Skriptblocker.',
      tokenFailed: 'Google hat kein Zugriffstoken zurückgegeben. Versuchen Sie, sich erneut anzumelden.',
      requireClientId: 'Speichern Sie zuerst eine Client ID (siehe Einrichtungsassistent).',
      notConnected: 'Google Drive ist nicht verbunden.',
      sessionExpired: 'Die Google-Sitzung ist abgelaufen, bitte erneut anmelden.',
      fileTooLarge:
        'Die Datei ist größer als {maxMb} MB — Google-Drive-Dateien werden als Data-URL eingebettet, da es keinen Server gibt, und diese Datei ist dafür zu groß.',
      uploadFailed: 'Google Drive: Hochladen fehlgeschlagen (Status {status})',
      uploadNetworkError: 'Google Drive: Netzwerkfehler beim Hochladen der Datei',
    },
  },
  microsoft: {
    setup: {
      step1: 'Öffnen Sie das Azure Portal → Microsoft Entra ID → App registrations und klicken Sie auf „New registration“.',
      step2: 'Wählen Sie unter Supported account types „Accounts in any organizational directory and personal Microsoft accounts“ und klicken Sie dann auf Register.',
      step3:
        'Fügen Sie unter API permissions → Add a permission → Microsoft Graph → Delegated permissions die Berechtigungen Files.ReadWrite und offline_access hinzu und klicken Sie dann auf Add permissions.',
      step4WithRedirect:
        'Fügen Sie unter Authentication → Add a platform → Single-page application Folgendes unter Redirect URIs ein und klicken Sie auf Configure:',
      step4NoRedirect:
        'Fügen Sie unter Authentication → Add a platform → Single-page application die vollständige URL der Seite public/microsoft-callback.html auf Ihrer Domain unter Redirect URIs hinzu — sie konnte nicht automatisch erkannt werden (siehe redirectUri in den Provider-Optionen).',
      step5: 'Kopieren Sie auf der Overview-Seite die Application (client) ID und fügen Sie sie unten in das Feld ein.',
    },
    error: {
      exchangeCode: 'Microsoft: Code konnte nicht gegen ein Token eingetauscht werden (Status {status})',
      requireClientId: 'Speichern Sie zuerst eine Application (client) ID (siehe Einrichtungsassistent).',
      requireRedirectUri:
        'redirectUri konnte nicht automatisch ermittelt werden. Geben Sie sie explizit in den OneDriveProvider-Optionen an (nötig, wenn das Plugin über <script type="module"> oder einen Bundler geladen wird).',
      notConnected: 'OneDrive ist nicht verbunden.',
      sessionExpired: 'Die Microsoft-Sitzung ist abgelaufen, bitte erneut anmelden.',
      refreshFailed: 'Microsoft: Token konnte nicht erneuert werden (Status {status})',
      noSpoLicense:
        'Die Organisation dieses Microsoft-Kontos hat OneDrive/SharePoint nicht lizenziert (Microsoft Graph: „Tenant does not have a SPO license“). Melden Sie sich mit einem privaten Microsoft-Konto (outlook.com/hotmail/live) an oder mit einem Geschäftskonto, dessen Organisation OneDrive for Business aktiviert hat.',
      noDownloadableContent:
        '„{name}“ hat keinen herunterladbaren Inhalt – dabei handelt es sich meist um ein OneNote-Notizbuch oder einen anderen Elementtyp, den OneDrive nicht als normale Datei bereitstellen kann.',
      uploadFailed: 'OneDrive: Hochladen fehlgeschlagen (Status {status})',
      uploadNetworkError: 'OneDrive: Netzwerkfehler beim Hochladen der Datei',
    },
  },
  s3: {
    connectMenuItem: 'S3 verbinden',
    modalTitle: 'S3-kompatiblen Speicher verbinden',
    nameLabel: 'Tab-Name',
    namePlaceholder: 'z. B. Mein Bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Region',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Eigener Endpoint (optional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Leer lassen für AWS S3. Für S3-kompatible Dienste (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…) hier eintragen.',
    forcePathStyleLabel: 'Path-Style-URLs verwenden (für die meisten selbst gehosteten/S3-kompatiblen Endpoints nötig)',
    corsHint: 'Der Bucket muss CORS-Anfragen von dieser Seite erlauben (GET, PUT, DELETE, HEAD) — richten Sie das in den CORS-Einstellungen des Buckets ein.',
    connect: 'Verbinden',
    cancel: 'Abbrechen',
    connecting: 'Verbinde…',
    error: {
      required: 'Füllen Sie alle Pflichtfelder aus.',
      duplicateName: 'Ein Tab mit diesem Namen existiert bereits.',
      connectFailed: 'Verbindung fehlgeschlagen: {message}',
      listFailed: 'S3: Auflisten der Objekte fehlgeschlagen (Status {status})',
      uploadFailed: 'S3: Hochladen fehlgeschlagen (Status {status})',
      uploadNetworkError: 'S3: Netzwerkfehler beim Hochladen der Datei',
      deleteFailed: 'S3: Löschen fehlgeschlagen (Status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Die OAuth-Anmeldung per PKCE benötigt die Web Crypto API (crypto.subtle), die Browser auf unsicheren Origins deaktivieren (einfaches http, außer localhost). Öffnen Sie die Seite über https:// oder, zum Testen, über http://localhost.',
      popupBlocked: 'Der Browser hat das Anmelde-Popup blockiert. Erlauben Sie Popups für diese Seite.',
      stateMismatch: 'Die Antwort der Autorisierung konnte nicht verifiziert werden (state stimmt nicht überein).',
      popupClosed: 'Das Anmeldefenster wurde geschlossen, bevor die Anmeldung abgeschlossen war.',
    },
  },
};

export default messages;
