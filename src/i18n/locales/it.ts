import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Radice',
    loading: 'Caricamento…',
    empty: 'Non c’è ancora nulla qui.',
    loadMore: 'Altro',
    uploadFile: 'Carica file',
    urlPlaceholder: 'Incolla un link a un file…',
    addUrl: 'Aggiungi',
    searchPlaceholder: 'Cerca file…',
    filter: {
      all: 'Tutti i tipi',
    },
    settings: 'Impostazioni',
    refresh: 'Aggiorna',
    selectedCount: '{count} selezionati',
    cancelSelection: 'Annulla',
    insertSelected: 'Inserisci ({count})',
    openInTab: 'Apri in una nuova scheda',
    delete: 'Elimina',
    deleteConfirm: 'Confermi l’eliminazione?',
    viewGrid: 'Vista griglia',
    viewTable: 'Vista tabella',
    viewTree: 'Vista albero',
    columnName: 'Nome',
    columnType: 'Tipo',
    columnSize: 'Dimensione',
    columnModified: 'Modificato',
    type: {
      image: 'Immagine',
      video: 'Video',
      audio: 'Audio',
      document: 'Documento',
      folder: 'Cartella',
      other: 'File',
    },
    error: {
      generic: 'Impossibile caricare l’elenco dei file',
      insertFailed: 'Impossibile inserire questo file',
    },
    dropzone: {
      active: 'Rilascia per caricare',
    },
    upload: {
      queueTitle: 'Caricamento {done}/{total}',
      uploading: 'Caricamento…',
      done: 'Completato',
      error: 'Non riuscito',
      close: 'Chiudi',
    },
    tree: {
      expandAll: 'Espandi tutto',
      collapseAll: 'Comprimi tutto',
      expandFolder: 'Espandi cartella',
      collapseFolder: 'Comprimi cartella',
    },
    addConnection: 'Aggiungi connessione',
    moreTabs: 'Altre schede',
    removeConnection: 'Rimuovi',
    removeConnectionConfirm: 'Confermi la rimozione?',
  },
  auth: {
    connectPrompt: 'Collega {provider} per scegliere i file da qui.',
    loginButton: 'Accedi a {provider}',
    loggingIn: 'Apertura della finestra di autorizzazione…',
    loginFailed: 'Accesso non riuscito.',
    changeAppKey: 'Cambia App Key',
    logout: 'Esci',
    logoutConfirm: 'Confermi l’uscita?',
  },
  setup: {
    missingInfo: '{provider} richiede una configurazione, ma non sono disponibili istruzioni.',
    intro: 'Per collegare {provider}, crea prima un’app nella relativa console sviluppatori: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Salva',
    saveFailed: 'Impossibile salvare l’App Key.',
    copy: 'Copia',
    copied: 'Copiato',
    selected: 'Selezionato, premi Ctrl+C',
    uploadHint: 'Una volta collegato, puoi anche caricare i file trascinandoli (o un’intera cartella) nell’elenco, oppure tramite il pulsante Carica file qui sopra.',
  },
  block: {
    label: 'Media cloud',
    category: 'Archiviazione',
  },
  button: {
    label: 'Inserisci dal cloud',
  },
  modal: {
    title: 'Inserisci dal cloud',
  },
  local: {
    tabLabel: 'I miei file',
    error: {
      emptyUrl: 'Inserisci un link a un file',
      readFile: 'Impossibile leggere il file',
    },
  },
  dropbox: {
    setup: {
      step1: 'Apri la Dropbox App Console e clicca su «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Inserisci un nome app qualsiasi e clicca su Create app.',
      step3: 'Nella scheda Permissions, seleziona files.metadata.read, files.content.read e files.content.write, poi clicca su Submit.',
      step4WithRedirect: 'Nella scheda Settings, in Redirect URIs, incolla questo e clicca su Add:',
      step4NoRedirect:
        'Nella scheda Settings, in Redirect URIs, aggiungi l’URL completo della pagina public/dropbox-callback.html sul tuo dominio — non è stato possibile rilevarlo automaticamente (vedi redirectUri nelle opzioni del provider).',
      step5: 'Nella stessa scheda Settings, copia l’App key e incollalo nel campo sottostante.',
    },
    error: {
      exchangeCode: 'Dropbox: impossibile scambiare il code con un token (stato {status})',
      requireAppKey: 'Salva prima un App Key (vedi la procedura guidata di configurazione).',
      requireRedirectUri:
        'Impossibile determinare automaticamente redirectUri. Specificalo esplicitamente nelle opzioni di DropboxProvider (necessario se il plugin viene caricato tramite <script type="module"> o un bundler).',
      notConnected: 'Dropbox non è collegato.',
      sessionExpired: 'La sessione Dropbox è scaduta, accedi di nuovo.',
      refreshFailed: 'Dropbox: impossibile rinnovare il token (stato {status})',
      uploadFailed: 'Dropbox: caricamento non riuscito (stato {status})',
      uploadNetworkError: 'Dropbox: errore di rete durante il caricamento del file',
    },
  },
  google: {
    setup: {
      step1: 'Apri la Google Cloud Console, crea un progetto (o selezionane uno esistente), poi apri «APIs & Services».',
      step2: 'In Library, trova e abilita la «Google Drive API».',
      step3:
        'In «OAuth consent screen», imposta User type su External, aggiungi lo scope .../auth/drive.readonly e aggiungi il tuo account Google come test user (un’app non verificata è limitata ai test user e mostra una schermata di avviso — la pubblicazione per molti utenti richiede la verifica di Google).',
      step4WithOrigin:
        'In Credentials → Create Credentials → OAuth client ID, scegli Application type «Web application» e in Authorized JavaScript origins incolla questo e clicca su Add:',
      step4NoOrigin:
        'In Credentials → Create Credentials → OAuth client ID, scegli Application type «Web application» e in Authorized JavaScript origins aggiungi l’origin esatto (protocollo + dominio + porta) da cui viene servito questo sito — non è stato possibile rilevarlo automaticamente.',
      step5: 'Nella stessa schermata, copia il Client ID (termina con .apps.googleusercontent.com) e incollalo nel campo sottostante.',
    },
    error: {
      gisLoadFailed: 'Impossibile caricare Google Identity Services (accounts.google.com/gsi/client) — controlla la connessione di rete o un blocco annunci/script.',
      tokenFailed: 'Google non ha restituito un token di accesso. Prova ad accedere di nuovo.',
      requireClientId: 'Salva prima un Client ID (vedi la procedura guidata di configurazione).',
      notConnected: 'Google Drive non è collegato.',
      sessionExpired: 'La sessione Google è scaduta, accedi di nuovo.',
      fileTooLarge:
        'Il file supera {maxMb} MB — i file di Google Drive vengono inseriti come data URL poiché non esiste un server, quindi questo file è troppo grande per essere inserito.',
      uploadFailed: 'Google Drive: caricamento non riuscito (stato {status})',
      uploadNetworkError: 'Google Drive: errore di rete durante il caricamento del file',
    },
  },
  microsoft: {
    setup: {
      step1: 'Apri Azure Portal → Microsoft Entra ID → App registrations, e clicca su «New registration».',
      step2: 'In Supported account types, scegli «Accounts in any organizational directory and personal Microsoft accounts», poi clicca su Register.',
      step3:
        'In API permissions → Add a permission → Microsoft Graph → Delegated permissions, aggiungi Files.ReadWrite e offline_access, poi clicca su Add permissions.',
      step4WithRedirect:
        'In Authentication → Add a platform → Single-page application, incolla questo in Redirect URIs e clicca su Configure:',
      step4NoRedirect:
        'In Authentication → Add a platform → Single-page application, aggiungi l’URL completo della pagina public/microsoft-callback.html sul tuo dominio in Redirect URIs — non è stato possibile rilevarlo automaticamente (vedi redirectUri nelle opzioni del provider).',
      step5: 'Nella pagina Overview, copia l’Application (client) ID e incollalo nel campo sottostante.',
    },
    error: {
      exchangeCode: 'Microsoft: impossibile scambiare il code con un token (stato {status})',
      requireClientId: 'Salva prima un Application (client) ID (vedi la procedura guidata di configurazione).',
      requireRedirectUri:
        'Impossibile determinare automaticamente redirectUri. Specificalo esplicitamente nelle opzioni di OneDriveProvider (necessario se il plugin viene caricato tramite <script type="module"> o un bundler).',
      notConnected: 'OneDrive non è collegato.',
      sessionExpired: 'La sessione Microsoft è scaduta, accedi di nuovo.',
      refreshFailed: 'Microsoft: impossibile rinnovare il token (stato {status})',
      noSpoLicense:
        'L’organizzazione di questo account Microsoft non ha una licenza per OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). Accedi con un account Microsoft personale (outlook.com/hotmail/live) oppure con un account di lavoro la cui organizzazione ha OneDrive for Business abilitato.',
      noDownloadableContent:
        '«{name}» non ha contenuto scaricabile — di solito succede con i blocchi appunti di OneNote o con altri tipi di elemento che OneDrive non può fornire come file normale.',
      uploadFailed: 'OneDrive: caricamento non riuscito (stato {status})',
      uploadNetworkError: 'OneDrive: errore di rete durante il caricamento del file',
    },
  },
  s3: {
    connectMenuItem: 'Connetti S3',
    modalTitle: 'Connetti un archivio compatibile con S3',
    nameLabel: 'Nome della scheda',
    namePlaceholder: 'es. Il mio bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Regione',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint personalizzato (opzionale)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Lascia vuoto per AWS S3. Compila per servizi compatibili con S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Usa URL in stile "path" (necessario per la maggior parte degli endpoint self-hosted/compatibili con S3)',
    corsHint: 'Il bucket deve consentire richieste CORS da questo sito (GET, PUT, DELETE, HEAD): configuralo nelle impostazioni CORS del bucket.',
    connect: 'Connetti',
    cancel: 'Annulla',
    connecting: 'Connessione…',
    error: {
      required: 'Compila tutti i campi obbligatori.',
      duplicateName: 'Esiste già una scheda con questo nome.',
      connectFailed: 'Connessione non riuscita: {message}',
      listFailed: 'S3: recupero degli oggetti non riuscito (stato {status})',
      uploadFailed: 'S3: caricamento non riuscito (stato {status})',
      uploadNetworkError: 'S3: errore di rete durante il caricamento del file',
      deleteFailed: 'S3: eliminazione non riuscita (stato {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'L’accesso OAuth tramite PKCE richiede la Web Crypto API (crypto.subtle), che i browser disattivano su un’origine non sicura (http semplice, tranne localhost). Apri il sito con https:// oppure, per testare, con http://localhost.',
      popupBlocked: 'Il browser ha bloccato il popup di autorizzazione. Consenti i popup per questo sito.',
      stateMismatch: 'La risposta di autorizzazione non ha superato la verifica (state non corrisponde).',
      popupClosed: 'La finestra di autorizzazione è stata chiusa prima del completamento dell’accesso.',
    },
  },
};

export default messages;
