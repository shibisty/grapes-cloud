import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Racine',
    loading: 'Chargement…',
    empty: 'Rien ici pour le moment.',
    loadMore: 'Plus',
    uploadFile: 'Téléverser un fichier',
    urlPlaceholder: 'Coller un lien vers un fichier…',
    addUrl: 'Ajouter',
    searchPlaceholder: 'Rechercher des fichiers…',
    filter: {
      all: 'Tous les types',
    },
    settings: 'Paramètres',
    refresh: 'Actualiser',
    selectedCount: '{count} sélectionné(s)',
    cancelSelection: 'Annuler',
    insertSelected: 'Insérer ({count})',
    openInTab: 'Ouvrir dans un nouvel onglet',
    delete: 'Supprimer',
    deleteConfirm: 'Confirmer la suppression ?',
    viewGrid: 'Vue en grille',
    viewTable: 'Vue en tableau',
    viewTree: 'Vue en arborescence',
    columnName: 'Nom',
    columnType: 'Type',
    columnSize: 'Taille',
    columnModified: 'Modifié',
    type: {
      image: 'Image',
      video: 'Vidéo',
      audio: 'Audio',
      document: 'Document',
      folder: 'Dossier',
      other: 'Fichier',
    },
    error: {
      generic: 'Impossible de charger la liste des fichiers',
      insertFailed: 'Impossible d\'insérer ce fichier',
    },
    dropzone: {
      active: 'Déposez pour téléverser',
    },
    upload: {
      queueTitle: 'Téléversement {done}/{total}',
      uploading: 'Téléversement…',
      done: 'Terminé',
      error: 'Échec',
      close: 'Fermer',
    },
    tree: {
      expandAll: 'Tout développer',
      collapseAll: 'Tout réduire',
      expandFolder: 'Développer le dossier',
      collapseFolder: 'Réduire le dossier',
    },
    addConnection: 'Ajouter une connexion',
    moreTabs: 'Plus d’onglets',
    removeConnection: 'Supprimer',
    removeConnectionConfirm: 'Confirmer la suppression ?',
  },
  auth: {
    connectPrompt: 'Connectez {provider} pour choisir des fichiers depuis ici.',
    loginButton: 'Se connecter à {provider}',
    loggingIn: 'Ouverture de la fenêtre d’autorisation…',
    loginFailed: 'Échec de la connexion.',
    changeAppKey: 'Modifier l’App Key',
    logout: 'Se déconnecter',
    logoutConfirm: 'Confirmer la déconnexion ?',
  },
  setup: {
    missingInfo: '{provider} doit être configuré, mais aucune instruction n’est disponible.',
    intro: 'Pour connecter {provider}, créez d’abord une application dans sa console développeur : ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Enregistrer',
    saveFailed: 'Impossible d’enregistrer l’App Key.',
    copy: 'Copier',
    copied: 'Copié',
    selected: 'Sélectionné, appuyez sur Ctrl+C',
    uploadHint: 'Une fois connecté, vous pouvez aussi téléverser des fichiers en les faisant glisser (ou un dossier entier) dans la liste, ou avec le bouton Téléverser un fichier ci-dessus.',
  },
  block: {
    label: 'Médias cloud',
    category: 'Stockage',
  },
  button: {
    label: 'Insérer depuis le cloud',
  },
  modal: {
    title: 'Insérer depuis le cloud',
  },
  local: {
    tabLabel: 'Mes fichiers',
    error: {
      emptyUrl: 'Saisissez un lien vers un fichier',
      readFile: 'Impossible de lire le fichier',
    },
  },
  dropbox: {
    setup: {
      step1: 'Ouvrez la Dropbox App Console et cliquez sur « Create app ».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Saisissez un nom d’application quelconque et cliquez sur Create app.',
      step3: 'Dans l’onglet Permissions, cochez files.metadata.read, files.content.read et files.content.write, puis cliquez sur Submit.',
      step4WithRedirect: 'Dans l’onglet Settings, sous Redirect URIs, collez ceci et cliquez sur Add :',
      step4NoRedirect:
        'Dans l’onglet Settings, sous Redirect URIs, ajoutez l’URL complète de la page public/dropbox-callback.html sur votre domaine — elle n’a pas pu être détectée automatiquement (voir redirectUri dans les options du fournisseur).',
      step5: 'Dans ce même onglet Settings, copiez l’App key et collez-la dans le champ ci-dessous.',
    },
    error: {
      exchangeCode: 'Dropbox : échec de l’échange du code contre un jeton (statut {status})',
      requireAppKey: 'Enregistrez d’abord un App Key (voir l’assistant de configuration).',
      requireRedirectUri:
        'Impossible de déterminer automatiquement redirectUri. Indiquez-la explicitement dans les options de DropboxProvider (nécessaire si le plugin est chargé via <script type="module"> ou un bundler).',
      notConnected: 'Dropbox n’est pas connecté.',
      sessionExpired: 'La session Dropbox a expiré, veuillez vous reconnecter.',
      refreshFailed: 'Dropbox : échec du renouvellement du jeton (statut {status})',
      uploadFailed: 'Dropbox : échec de l’envoi (statut {status})',
      uploadNetworkError: 'Dropbox : erreur réseau lors de l’envoi du fichier',
    },
  },
  google: {
    setup: {
      step1: 'Ouvrez la Google Cloud Console, créez un projet (ou sélectionnez-en un existant), puis ouvrez « APIs & Services ».',
      step2: 'Dans Library, trouvez et activez la « Google Drive API ».',
      step3:
        'Dans « OAuth consent screen », définissez User type sur External, ajoutez le scope .../auth/drive.readonly et ajoutez votre propre compte Google en tant que test user (une application non vérifiée est limitée aux utilisateurs de test et affiche un écran d’avertissement — la publier pour de nombreux utilisateurs nécessite une vérification par Google).',
      step4WithOrigin:
        'Dans Credentials → Create Credentials → OAuth client ID, choisissez Application type « Web application », puis dans Authorized JavaScript origins, collez ceci et cliquez sur Add :',
      step4NoOrigin:
        'Dans Credentials → Create Credentials → OAuth client ID, choisissez Application type « Web application », puis dans Authorized JavaScript origins, ajoutez l’origin exact (protocole + domaine + port) depuis lequel ce site est servi — il n’a pas pu être détecté automatiquement.',
      step5: 'Sur le même écran, copiez le Client ID (se termine par .apps.googleusercontent.com) et collez-le dans le champ ci-dessous.',
    },
    error: {
      gisLoadFailed: 'Échec du chargement de Google Identity Services (accounts.google.com/gsi/client) — vérifiez votre connexion réseau ou un bloqueur de publicités/scripts.',
      tokenFailed: 'Google n’a pas renvoyé de jeton d’accès. Essayez de vous reconnecter.',
      requireClientId: 'Enregistrez d’abord un Client ID (voir l’assistant de configuration).',
      notConnected: 'Google Drive n’est pas connecté.',
      sessionExpired: 'La session Google a expiré, veuillez vous reconnecter.',
      fileTooLarge:
        'Le fichier dépasse {maxMb} Mo — les fichiers Google Drive sont intégrés sous forme de data URL faute de serveur, et ce fichier est trop volumineux pour être inséré.',
      uploadFailed: 'Google Drive : échec de l’envoi (statut {status})',
      uploadNetworkError: 'Google Drive : erreur réseau lors de l’envoi du fichier',
    },
  },
  microsoft: {
    setup: {
      step1: 'Ouvrez l’Azure Portal → Microsoft Entra ID → App registrations, et cliquez sur « New registration ».',
      step2: 'Dans Supported account types, choisissez « Accounts in any organizational directory and personal Microsoft accounts », puis cliquez sur Register.',
      step3:
        'Dans API permissions → Add a permission → Microsoft Graph → Delegated permissions, ajoutez Files.ReadWrite et offline_access, puis cliquez sur Add permissions.',
      step4WithRedirect:
        'Dans Authentication → Add a platform → Single-page application, collez ceci sous Redirect URIs et cliquez sur Configure :',
      step4NoRedirect:
        'Dans Authentication → Add a platform → Single-page application, ajoutez l’URL complète de la page public/microsoft-callback.html sur votre domaine sous Redirect URIs — elle n’a pas pu être détectée automatiquement (voir redirectUri dans les options du fournisseur).',
      step5: 'Sur la page Overview, copiez l’Application (client) ID et collez-le dans le champ ci-dessous.',
    },
    error: {
      exchangeCode: 'Microsoft : échec de l’échange du code contre un jeton (statut {status})',
      requireClientId: 'Enregistrez d’abord un Application (client) ID (voir l’assistant de configuration).',
      requireRedirectUri:
        'Impossible de déterminer automatiquement redirectUri. Indiquez-le explicitement dans les options de OneDriveProvider (nécessaire si le plugin est chargé via <script type="module"> ou un bundler).',
      notConnected: 'OneDrive n’est pas connecté.',
      sessionExpired: 'La session Microsoft a expiré, veuillez vous reconnecter.',
      refreshFailed: 'Microsoft : échec du renouvellement du jeton (statut {status})',
      noSpoLicense:
        'L’organisation de ce compte Microsoft n’a pas de licence OneDrive/SharePoint (Microsoft Graph : « Tenant does not have a SPO license »). Connectez-vous avec un compte Microsoft personnel (outlook.com/hotmail/live) ou avec un compte professionnel dont l’organisation a activé OneDrive for Business.',
      noDownloadableContent:
        '« {name} » n’a pas de contenu téléchargeable — il s’agit généralement d’un bloc-notes OneNote ou d’un autre type d’élément qu’OneDrive ne peut pas fournir comme fichier normal.',
      uploadFailed: 'OneDrive : échec de l’envoi (statut {status})',
      uploadNetworkError: 'OneDrive : erreur réseau lors de l’envoi du fichier',
    },
  },
  s3: {
    connectMenuItem: 'Connecter S3',
    modalTitle: 'Connecter un stockage compatible S3',
    nameLabel: 'Nom de l’onglet',
    namePlaceholder: 'ex. Mon bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Région',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint personnalisé (optionnel)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Laissez vide pour AWS S3. Renseignez ce champ pour les services compatibles S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Utiliser des URL de style « path » (nécessaire pour la plupart des endpoints auto-hébergés/compatibles S3)',
    corsHint: 'Le bucket doit autoriser les requêtes CORS depuis ce site (GET, PUT, DELETE, HEAD) — configurez cela dans les règles CORS du bucket.',
    connect: 'Connecter',
    cancel: 'Annuler',
    connecting: 'Connexion…',
    error: {
      required: 'Remplissez tous les champs obligatoires.',
      duplicateName: 'Un onglet avec ce nom existe déjà.',
      connectFailed: 'Connexion impossible : {message}',
      listFailed: 'S3 : échec de la liste des objets (statut {status})',
      uploadFailed: 'S3 : échec de l’envoi (statut {status})',
      uploadNetworkError: 'S3 : erreur réseau lors de l’envoi du fichier',
      deleteFailed: 'S3 : échec de la suppression (statut {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'La connexion OAuth par PKCE nécessite l’API Web Crypto (crypto.subtle), que les navigateurs désactivent sur une origine non sécurisée (http simple, hors localhost). Ouvrez le site en https:// ou, pour tester, en http://localhost.',
      popupBlocked: 'Le navigateur a bloqué la fenêtre d’autorisation. Autorisez les fenêtres pop-up pour ce site.',
      stateMismatch: 'La réponse d’autorisation n’a pas passé la vérification (state ne correspond pas).',
      popupClosed: 'La fenêtre d’autorisation a été fermée avant la fin de la connexion.',
    },
  },
};

export default messages;
