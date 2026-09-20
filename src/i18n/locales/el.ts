import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Ρίζα',
    loading: 'Φόρτωση…',
    empty: 'Δεν υπάρχει ακόμη τίποτα εδώ.',
    loadMore: 'Περισσότερα',
    uploadFile: 'Μεταφόρτωση αρχείου',
    urlPlaceholder: 'Επικολλήστε έναν σύνδεσμο αρχείου…',
    addUrl: 'Προσθήκη',
    searchPlaceholder: 'Αναζήτηση αρχείων…',
    filter: {
      all: 'Όλοι οι τύποι',
    },
    settings: 'Ρυθμίσεις',
    refresh: 'Ανανέωση',
    selectedCount: '{count} επιλέχθηκαν',
    cancelSelection: 'Ακύρωση',
    insertSelected: 'Εισαγωγή ({count})',
    openInTab: 'Άνοιγμα σε νέα καρτέλα',
    delete: 'Διαγραφή',
    deleteConfirm: 'Επιβεβαίωση διαγραφής;',
    viewGrid: 'Προβολή πλέγματος',
    viewTable: 'Προβολή πίνακα',
    viewTree: 'Προβολή δέντρου',
    columnName: 'Όνομα',
    columnType: 'Τύπος',
    columnSize: 'Μέγεθος',
    columnModified: 'Τροποποιήθηκε',
    type: {
      image: 'Εικόνα',
      video: 'Βίντεο',
      audio: 'Ήχος',
      document: 'Έγγραφο',
      folder: 'Φάκελος',
      other: 'Αρχείο',
    },
    error: {
      generic: 'Αποτυχία φόρτωσης της λίστας αρχείων',
      insertFailed: 'Δεν ήταν δυνατή η εισαγωγή αυτού του αρχείου',
    },
    dropzone: {
      active: 'Αφήστε για μεταφόρτωση',
    },
    upload: {
      queueTitle: 'Μεταφόρτωση {done}/{total}',
      uploading: 'Μεταφόρτωση…',
      done: 'Ολοκληρώθηκε',
      error: 'Απέτυχε',
      close: 'Κλείσιμο',
    },
    tree: {
      expandAll: 'Ανάπτυξη όλων',
      collapseAll: 'Σύμπτυξη όλων',
      expandFolder: 'Ανάπτυξη φακέλου',
      collapseFolder: 'Σύμπτυξη φακέλου',
    },
    addConnection: 'Προσθήκη σύνδεσης',
    moreTabs: 'Περισσότερες καρτέλες',
    removeConnection: 'Αφαίρεση',
    removeConnectionConfirm: 'Επιβεβαίωση αφαίρεσης;',
  },
  auth: {
    connectPrompt: 'Συνδέστε το {provider} για να επιλέγετε αρχεία από εδώ.',
    loginButton: 'Σύνδεση στο {provider}',
    loggingIn: 'Άνοιγμα παραθύρου εξουσιοδότησης…',
    loginFailed: 'Η σύνδεση απέτυχε.',
    changeAppKey: 'Αλλαγή App Key',
    logout: 'Αποσύνδεση',
    logoutConfirm: 'Επιβεβαίωση αποσύνδεσης;',
  },
  setup: {
    missingInfo: 'Το {provider} χρειάζεται ρύθμιση, αλλά δεν υπάρχουν διαθέσιμες οδηγίες.',
    intro: 'Για να συνδέσετε το {provider}, δημιουργήστε πρώτα μια εφαρμογή στην κονσόλα προγραμματιστών: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Αποθήκευση',
    saveFailed: 'Αποτυχία αποθήκευσης του App Key.',
    copy: 'Αντιγραφή',
    copied: 'Αντιγράφηκε',
    selected: 'Επιλέχθηκε, πατήστε Ctrl+C',
    uploadHint: 'Μόλις συνδεθείτε, μπορείτε επίσης να μεταφορτώσετε αρχεία σύροντάς τα (ή έναν ολόκληρο φάκελο) στη λίστα, ή με το κουμπί Μεταφόρτωση παραπάνω.',
  },
  block: {
    label: 'Πολυμέσα στο cloud',
    category: 'Αποθήκευση',
  },
  button: {
    label: 'Εισαγωγή από το cloud',
  },
  modal: {
    title: 'Εισαγωγή από το cloud',
  },
  local: {
    tabLabel: 'Τα αρχεία μου',
    error: {
      emptyUrl: 'Εισαγάγετε έναν σύνδεσμο αρχείου',
      readFile: 'Αποτυχία ανάγνωσης του αρχείου',
    },
  },
  settings: {
    tabButton: 'Συνδεδεμένοι λογαριασμοί',
    title: 'Συνδεδεμένοι λογαριασμοί',
    empty: 'Κανένας πάροχος εδώ δεν υποστηρίζει ακόμη σύνδεση μέσω App Key/Client ID.',
    authenticatedAt: 'Εξουσιοδοτήθηκε στις {date}',
    authenticatedAtUnknown: 'Άγνωστη ημερομηνία εξουσιοδότησης',
    notConnected: 'Δεν είναι συνδεδεμένο',
    tokenExpiresIn: 'Το token λήγει σε {time}',
    tokenExpired: 'Το token έληξε — θα ανανεωθεί αυτόματα στην επόμενη ενέργεια',
    close: 'Κλείσιμο',
  },
  dropbox: {
    setup: {
      step1: 'Ανοίξτε το Dropbox App Console και κάντε κλικ στο «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Εισαγάγετε οποιοδήποτε όνομα εφαρμογής και κάντε κλικ στο Create app.',
      step3: 'Στην καρτέλα Permissions, επιλέξτε files.metadata.read, files.content.read και files.content.write, και κάντε κλικ στο Submit.',
      step4WithRedirect: 'Στην καρτέλα Settings, στο Redirect URIs, επικολλήστε αυτό και κάντε κλικ στο Add:',
      step4NoRedirect:
        'Στην καρτέλα Settings, στο Redirect URIs, προσθέστε την πλήρη διεύθυνση URL της σελίδας public/dropbox-callback.html στον τομέα σας — δεν ήταν δυνατός ο αυτόματος εντοπισμός της (δείτε το redirectUri στις επιλογές του παρόχου).',
      step5: 'Στην ίδια καρτέλα Settings, αντιγράψτε το App key και επικολλήστε το στο παρακάτω πεδίο.',
    },
    error: {
      exchangeCode: 'Dropbox: αποτυχία ανταλλαγής του code για token (κατάσταση {status})',
      requireAppKey: 'Αποθηκεύστε πρώτα ένα App Key (δείτε τον οδηγό ρύθμισης).',
      requireRedirectUri:
        'Δεν ήταν δυνατός ο αυτόματος προσδιορισμός του redirectUri. Ορίστε το ρητά στις επιλογές του DropboxProvider (απαιτείται αν το plugin φορτώνεται μέσω <script type="module"> ή bundler).',
      notConnected: 'Το Dropbox δεν είναι συνδεδεμένο.',
      sessionExpired: 'Η περίοδος σύνδεσης του Dropbox έληξε, συνδεθείτε ξανά.',
      refreshFailed: 'Dropbox: αποτυχία ανανέωσης του token (κατάσταση {status})',
      uploadFailed: 'Dropbox: η μεταφόρτωση απέτυχε (κατάσταση {status})',
      uploadNetworkError: 'Dropbox: σφάλμα δικτύου κατά τη μεταφόρτωση του αρχείου',
    },
    sessionNote: 'Η περίοδος σύνδεσης του Dropbox δεν έχει χρονικό όριο: παραμένει έγκυρη μέχρι να αποσυνδεθείτε ή να ανακαλέσετε την πρόσβαση από τις ίδιες τις ρυθμίσεις του Dropbox.',
  },
  google: {
    setup: {
      step1: 'Ανοίξτε το Google Cloud Console, δημιουργήστε ένα έργο (ή επιλέξτε ένα υπάρχον) και μετά ανοίξτε το «APIs & Services».',
      step2: 'Στο Library, βρείτε και ενεργοποιήστε το «Google Drive API».',
      step3:
        'Στο «OAuth consent screen», ορίστε το User type σε External, προσθέστε το scope .../auth/drive.readonly και προσθέστε τον δικό σας λογαριασμό Google ως test user (μια μη επαληθευμένη εφαρμογή περιορίζεται σε δοκιμαστικούς χρήστες και εμφανίζει προειδοποιητική οθόνη — η δημοσίευση για πολλούς χρήστες απαιτεί έλεγχο επαλήθευσης από την Google).',
      step4WithOrigin:
        'Στο Credentials → Create Credentials → OAuth client ID, επιλέξτε Application type «Web application» και στο Authorized JavaScript origins επικολλήστε αυτό και κάντε κλικ στο Add:',
      step4NoOrigin:
        'Στο Credentials → Create Credentials → OAuth client ID, επιλέξτε Application type «Web application» και στο Authorized JavaScript origins προσθέστε τον ακριβή origin (πρωτόκολλο + τομέα + θύρα) από τον οποίο σερβίρεται αυτός ο ιστότοπος — δεν ήταν δυνατός ο αυτόματος εντοπισμός του.',
      step5: 'Στην ίδια οθόνη, αντιγράψτε το Client ID (τελειώνει σε .apps.googleusercontent.com) και επικολλήστε το στο παρακάτω πεδίο.',
    },
    error: {
      gisLoadFailed: 'Αποτυχία φόρτωσης του Google Identity Services (accounts.google.com/gsi/client) — ελέγξτε τη σύνδεσή σας στο δίκτυο ή έναν αποκλειστή διαφημίσεων/σεναρίων.',
      tokenFailed: 'Το Google δεν επέστρεψε token πρόσβασης. Δοκιμάστε να συνδεθείτε ξανά.',
      requireClientId: 'Αποθηκεύστε πρώτα ένα Client ID (δείτε τον οδηγό ρύθμισης).',
      notConnected: 'Το Google Drive δεν είναι συνδεδεμένο.',
      sessionExpired: 'Η περίοδος σύνδεσης του Google έληξε, συνδεθείτε ξανά.',
      fileTooLarge:
        'Το αρχείο είναι μεγαλύτερο από {maxMb} MB — τα αρχεία του Google Drive ενσωματώνονται ως data URL καθώς δεν υπάρχει διακομιστής, οπότε αυτό το αρχείο είναι πολύ μεγάλο για εισαγωγή.',
      uploadFailed: 'Google Drive: η μεταφόρτωση απέτυχε (κατάσταση {status})',
      uploadNetworkError: 'Google Drive: σφάλμα δικτύου κατά τη μεταφόρτωση του αρχείου',
    },
    sessionNote: 'Η περίοδος σύνδεσης του Google Drive ανανεώνεται αυτόματα (περίπου κάθε ώρα), όσο παραμένετε συνδεδεμένοι στον λογαριασμό Google σε αυτό το πρόγραμμα περιήγησης.',
  },
  microsoft: {
    setup: {
      step1: 'Ανοίξτε το Azure Portal → Microsoft Entra ID → App registrations και κάντε κλικ στο «New registration».',
      step2: 'Στο Supported account types, επιλέξτε «Accounts in any organizational directory and personal Microsoft accounts», και κάντε κλικ στο Register.',
      step3:
        'Στο API permissions → Add a permission → Microsoft Graph → Delegated permissions, προσθέστε Files.ReadWrite και offline_access, και κάντε κλικ στο Add permissions.',
      step4WithRedirect:
        'Στο Authentication → Add a platform → Single-page application, επικολλήστε αυτό στο Redirect URIs και κάντε κλικ στο Configure:',
      step4NoRedirect:
        'Στο Authentication → Add a platform → Single-page application, προσθέστε την πλήρη διεύθυνση URL της σελίδας public/microsoft-callback.html στον τομέα σας στο Redirect URIs — δεν ήταν δυνατός ο αυτόματος εντοπισμός της (δείτε το redirectUri στις επιλογές του παρόχου).',
      step5: 'Στη σελίδα Overview, αντιγράψτε το Application (client) ID και επικολλήστε το στο παρακάτω πεδίο.',
    },
    error: {
      exchangeCode: 'Microsoft: αποτυχία ανταλλαγής του code για token (κατάσταση {status})',
      requireClientId: 'Αποθηκεύστε πρώτα ένα Application (client) ID (δείτε τον οδηγό ρύθμισης).',
      requireRedirectUri:
        'Δεν ήταν δυνατός ο αυτόματος προσδιορισμός του redirectUri. Ορίστε το ρητά στις επιλογές του OneDriveProvider (απαιτείται αν το plugin φορτώνεται μέσω <script type="module"> ή bundler).',
      notConnected: 'Το OneDrive δεν είναι συνδεδεμένο.',
      sessionExpired: 'Η περίοδος σύνδεσης του Microsoft έληξε, συνδεθείτε ξανά.',
      refreshFailed: 'Microsoft: αποτυχία ανανέωσης του token (κατάσταση {status})',
      noSpoLicense:
        'Ο οργανισμός αυτού του λογαριασμού Microsoft δεν διαθέτει άδεια χρήσης για το OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). Συνδεθείτε με προσωπικό λογαριασμό Microsoft (outlook.com/hotmail/live) ή με λογαριασμό εργασίας του οποίου ο οργανισμός έχει ενεργοποιημένο το OneDrive for Business.',
      noDownloadableContent:
        'Το «{name}» δεν διαθέτει περιεχόμενο για λήψη — συνήθως πρόκειται για σημειωματάριο OneNote ή άλλον τύπο στοιχείου που το OneDrive δεν μπορεί να παραδώσει ως απλό αρχείο.',
      downloadUrlUnavailable:
        'Το «{name}» δεν έχει ακόμη σύνδεσμο λήψης — αυτό μπορεί να συμβεί αμέσως μετά τη μεταφόρτωση, ή αν ο οργανισμός σας αποκλείει τη λήψη αυτού του αρχείου. Δοκιμάστε ξανά σε λίγο.',
      uploadFailed: 'OneDrive: η μεταφόρτωση απέτυχε (κατάσταση {status})',
      uploadNetworkError: 'OneDrive: σφάλμα δικτύου κατά τη μεταφόρτωση του αρχείου',
    },
    sessionNote: 'Η Microsoft περιορίζει τη σύνδεση για εφαρμογές που εκτελούνται στο πρόγραμμα περιήγησης (SPA) σε 24 ώρες το πολύ — μετά απαιτείται νέα σύνδεση. Αυτός είναι περιορισμός της ίδιας της πλατφόρμας Microsoft, όχι του plugin.',
  },
  box: {
    setup: {
      step1: 'Ανοίξτε το Box Developer Console και δημιουργήστε μια νέα εφαρμογή με έλεγχο ταυτότητας OAuth 2.0 (User) — όχι Server Authentication (JWT/CCG), που δεν μπορεί να αλλάξει αργότερα.',
      step2Server: 'Σε αντίθεση με το Dropbox, το Google Drive και το OneDrive, το Box απαιτεί υποχρεωτικά Client Secret για τη σύνδεση, και το ίδιο το Box προειδοποιεί ότι αυτό το μυστικό δεν πρέπει ποτέ να βρίσκεται σε κώδικα του browser — γι’ αυτό ο συγκεκριμένος πάροχος χρειάζεται έναν δικό σας μικρό server που θα το φυλάει (επιλογή tokenEndpoint παρακάτω· ένα έτοιμο παράδειγμα υπάρχει στο README, ενότητα «Box»).',
      step3: 'Στη σελίδα Configuration της εφαρμογής, αντιγράψτε το Client ID και το Client Secret. Επικολλήστε το Client ID παρακάτω — κρατήστε το Client Secret μόνο στις μεταβλητές περιβάλλοντος του server σας, ποτέ εδώ.',
      step4WithRedirect: 'Στην ίδια σελίδα Configuration, στο Redirect URIs, επικολλήστε αυτό και κάντε κλικ στο Save:',
      step4NoRedirect: 'Στην ίδια σελίδα Configuration, στο Redirect URIs, προσθέστε την πλήρη διεύθυνση URL της σελίδας public/box-callback.html στον τομέα σας — δεν ήταν δυνατή η αυτόματη ανίχνευσή της (δείτε το redirectUri στις επιλογές του παρόχου).',
      step5WithOrigin: 'Ακόμη στη σελίδα Configuration, μεταβείτε στο CORS Domains και προσθέστε αυτό το origin (απαραίτητο ώστε ο browser να καλεί απευθείας το API του Box):',
      step5NoOrigin: 'Ακόμη στη σελίδα Configuration, μεταβείτε στο CORS Domains και προσθέστε το ακριβές origin (πρωτόκολλο + τομέας + θύρα) από το οποίο σερβίρεται αυτός ο ιστότοπος — δεν ήταν δυνατή η αυτόματη ανίχνευσή του.',
      step6: 'Στο Application Scopes, ενεργοποιήστε το «Read and write all files and folders stored in Box» (ή Read-only, αν δεν χρειάζεστε μεταφόρτωση/διαγραφή).',
      step7: 'Επικολλήστε το Client ID στο παρακάτω πεδίο.',
    },
    error: {
      exchangeCode: 'Box: η ανταλλαγή του code για token απέτυχε (κατάσταση {status})',
      requireClientId: 'Αποθηκεύστε πρώτα ένα Client ID (δείτε τον οδηγό ρύθμισης).',
      requireRedirectUri:
        'Δεν ήταν δυνατός ο αυτόματος προσδιορισμός του redirectUri. Ορίστε το ρητά στις επιλογές του BoxProvider (απαραίτητο αν το plugin φορτώνεται μέσω <script type="module"> ή bundler).',
      requireTokenEndpoint: 'Το BoxProvider απαιτεί την επιλογή tokenEndpoint (έναν δικό σας μικρό server που φυλάει το Client Secret του Box) — δείτε το README, ενότητα «Box».',
      notConnected: 'Το Box δεν είναι συνδεδεμένο.',
      sessionExpired: 'Η σύνοδος του Box έληξε, συνδεθείτε ξανά.',
      refreshFailed: 'Box: η ανανέωση του token απέτυχε (κατάσταση {status})',
      downloadFailed: 'Box: αποτυχία λήψης του «{name}» (σφάλμα δικτύου/CORS) — δείτε το README, ενότητα «Box»',
      fileTooLarge:
        'Το αρχείο ξεπερνά τα {maxMb} MB — τα αρχεία Box ενσωματώνονται ως data URL επειδή δεν υπάρχει proxy λήψης, και αυτό το αρχείο είναι πολύ μεγάλο για κάτι τέτοιο.',
      uploadFailed: 'Box: η μεταφόρτωση απέτυχε (κατάσταση {status})',
      uploadNetworkError: 'Box: σφάλμα δικτύου κατά τη μεταφόρτωση του αρχείου',
    },
    sessionNote: 'Τα refresh tokens του Box ισχύουν έως 60 ημέρες και αντικαθίστανται με νέο σε κάθε χρήση — αν δεν χρησιμοποιήσετε αυτόν τον ιστότοπο για 60 συνεχόμενες ημέρες, θα χρειαστεί να συνδεθείτε ξανά. Αυτός ο πάροχος εξαρτάται επίσης από έναν δικό σας μικρό server ώστε το Client Secret του Box να μην φτάνει στον browser.',
  },
  s3: {
    connectMenuItem: 'Σύνδεση S3',
    modalTitle: 'Σύνδεση αποθηκευτικού χώρου συμβατού με S3',
    nameLabel: 'Όνομα καρτέλας',
    namePlaceholder: 'π.χ. Ο κάδος μου',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Περιοχή',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Προσαρμοσμένο endpoint (προαιρετικό)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Αφήστε το κενό για AWS S3. Συμπληρώστε το για υπηρεσίες συμβατές με S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Χρήση URL τύπου path (απαραίτητο για τα περισσότερα self-hosted/συμβατά με S3 endpoints)',
    corsHint: 'Ο κάδος πρέπει να επιτρέπει αιτήματα CORS από αυτόν τον ιστότοπο (GET, PUT, DELETE, HEAD) — ρυθμίστε το στις ρυθμίσεις CORS του κάδου.',
    connect: 'Σύνδεση',
    cancel: 'Ακύρωση',
    connecting: 'Σύνδεση…',
    error: {
      required: 'Συμπληρώστε όλα τα υποχρεωτικά πεδία.',
      duplicateName: 'Υπάρχει ήδη καρτέλα με αυτό το όνομα.',
      connectFailed: 'Αποτυχία σύνδεσης: {message}',
      listFailed: 'S3: αποτυχία λήψης λίστας αντικειμένων (κατάσταση {status})',
      uploadFailed: 'S3: η μεταφόρτωση απέτυχε (κατάσταση {status})',
      uploadNetworkError: 'S3: σφάλμα δικτύου κατά τη μεταφόρτωση του αρχείου',
      deleteFailed: 'S3: η διαγραφή απέτυχε (κατάσταση {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Η σύνδεση OAuth μέσω PKCE απαιτεί το Web Crypto API (crypto.subtle), το οποίο τα προγράμματα περιήγησης απενεργοποιούν σε μη ασφαλή προέλευση (απλό http, εκτός από localhost). Ανοίξτε τον ιστότοπο μέσω https:// ή, για δοκιμή, μέσω http://localhost.',
      popupBlocked: 'Το πρόγραμμα περιήγησης απέκλεισε το αναδυόμενο παράθυρο εξουσιοδότησης. Επιτρέψτε τα αναδυόμενα παράθυρα για αυτόν τον ιστότοπο.',
      stateMismatch: 'Η απόκριση εξουσιοδότησης απέτυχε στην επαλήθευση (το state δεν ταιριάζει).',
      popupClosed: 'Το παράθυρο εξουσιοδότησης έκλεισε πριν ολοκληρωθεί η σύνδεση.',
    },
  },
};

export default messages;
