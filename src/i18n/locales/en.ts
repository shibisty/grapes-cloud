import type { CloudAssetsMessages } from '../types';

/**
 * Канонический источник переводов — остальные языки переводят
 * отсюда. Заодно это же значение используется как `localeFallback`
 * GrapesJS по умолчанию, так что при опечатке ключа или неполном
 * переводе в другом языке пользователь увидит английский текст, а
 * не пустую строку или сам ключ.
 */
const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Root',
    loading: 'Loading…',
    empty: 'Nothing here yet.',
    loadMore: 'More',
    uploadFile: 'Upload file',
    urlPlaceholder: 'Paste a file link…',
    addUrl: 'Add',
    searchPlaceholder: 'Search files…',
    filter: {
      all: 'All types',
    },
    settings: 'Settings',
    refresh: 'Refresh',
    selectedCount: '{count} selected',
    cancelSelection: 'Cancel',
    insertSelected: 'Insert ({count})',
    openInTab: 'Open in a new tab',
    delete: 'Delete',
    deleteConfirm: 'Confirm delete?',
    viewGrid: 'Grid view',
    viewTable: 'Table view',
    viewTree: 'Tree view',
    columnName: 'Name',
    columnType: 'Type',
    columnSize: 'Size',
    columnModified: 'Modified',
    type: {
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      document: 'Document',
      folder: 'Folder',
      other: 'File',
    },
    error: {
      generic: 'Failed to load the file list',
      insertFailed: 'Couldn\'t insert this file',
    },
    dropzone: {
      active: 'Drop to upload',
    },
    upload: {
      queueTitle: 'Uploading {done}/{total}',
      uploading: 'Uploading…',
      done: 'Done',
      error: 'Failed',
      close: 'Close',
    },
    tree: {
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      expandFolder: 'Expand folder',
      collapseFolder: 'Collapse folder',
    },
    addConnection: 'Add connection',
    moreTabs: 'More tabs',
    removeConnection: 'Remove',
    removeConnectionConfirm: 'Remove?',
  },
  auth: {
    connectPrompt: 'Connect {provider} to pick files from here.',
    loginButton: 'Log in to {provider}',
    loggingIn: 'Opening the authorization window…',
    loginFailed: 'Login failed.',
    changeAppKey: 'Change App Key',
    logout: 'Log out',
    logoutConfirm: 'Confirm log out?',
  },
  setup: {
    missingInfo: '{provider} needs setup, but no instructions are available.',
    intro: 'To connect {provider}, first create an app in its developer console: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Save',
    saveFailed: 'Failed to save the App Key.',
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected, press Ctrl+C',
    uploadHint: 'Once connected, you can also upload files by dragging them (or a whole folder) into the list, or with the Upload button above.',
  },
  block: {
    label: 'Cloud media',
    category: 'Storage',
  },
  button: {
    label: 'Insert from cloud',
  },
  modal: {
    title: 'Insert from cloud',
  },
  local: {
    tabLabel: 'My files',
    error: {
      emptyUrl: 'Enter a file link',
      readFile: 'Failed to read the file',
    },
  },
  settings: {
    tabButton: 'Connected accounts',
    title: 'Connected accounts',
    empty: 'No provider here supports logging in with an App Key/Client ID yet.',
    authenticatedAt: 'Authorized on {date}',
    authenticatedAtUnknown: 'Authorization date unknown',
    notConnected: 'Not connected',
    tokenExpiresIn: 'Token expires in {time}',
    tokenExpired: 'Token expired — it will refresh automatically on the next action',
    close: 'Close',
  },
  dropbox: {
    setup: {
      step1: 'Open the Dropbox App Console and click "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Enter any app name and click Create app.',
      step3: 'On the Permissions tab, check files.metadata.read, files.content.read and files.content.write, then click Submit.',
      step4WithRedirect: 'On the Settings tab, under Redirect URIs, paste this and click Add:',
      step4NoRedirect:
        'On the Settings tab, under Redirect URIs, add the full URL of the public/dropbox-callback.html page on your domain — it could not be detected automatically (see redirectUri in the provider options).',
      step5: 'On the same Settings tab, copy the App key and paste it into the field below.',
    },
    error: {
      exchangeCode: 'Dropbox: failed to exchange the code for a token (status {status})',
      requireAppKey: 'Save an App Key first (see the setup wizard).',
      requireRedirectUri:
        'Could not determine redirectUri automatically. Pass it explicitly in the DropboxProvider options (needed when the plugin is loaded via <script type="module"> or a bundler).',
      notConnected: 'Dropbox is not connected.',
      sessionExpired: 'The Dropbox session expired, please log in again.',
      refreshFailed: 'Dropbox: failed to refresh the token (status {status})',
      uploadFailed: 'Dropbox: upload failed (status {status})',
      uploadNetworkError: 'Dropbox: network error while uploading the file',
    },
    sessionNote: 'The Dropbox session has no time limit: it stays valid until you log out or revoke access in Dropbox’s own settings.',
  },
  google: {
    setup: {
      step1: 'Open the Google Cloud Console, create a project (or pick an existing one), then open "APIs & Services".',
      step2: 'Under Library, find and enable the "Google Drive API".',
      step3:
        'Under "OAuth consent screen", set User type to External, add the scope .../auth/drive.readonly, and add your own Google account as a test user (an unverified app is limited to test users and shows a warning screen — publishing for many users requires Google\'s verification review).',
      step4WithOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, choose Application type "Web application", and under Authorized JavaScript origins paste this and click Add:',
      step4NoOrigin:
        'Under Credentials → Create Credentials → OAuth client ID, choose Application type "Web application", and under Authorized JavaScript origins add the exact origin (protocol + domain + port) this site is served from — it could not be detected automatically.',
      step5: 'On the same screen, copy the Client ID (ends with .apps.googleusercontent.com) and paste it into the field below.',
    },
    error: {
      gisLoadFailed: 'Failed to load Google Identity Services (accounts.google.com/gsi/client) — check your network connection or an ad/script blocker.',
      tokenFailed: 'Google did not return an access token. Try logging in again.',
      requireClientId: 'Save a Client ID first (see the setup wizard).',
      notConnected: 'Google Drive is not connected.',
      sessionExpired: 'The Google session expired, please log in again.',
      fileTooLarge:
        'The file is larger than {maxMb} MB — Google Drive files are inlined as a data URL since there is no server, so this file is too large to insert.',
      uploadFailed: 'Google Drive: upload failed (status {status})',
      uploadNetworkError: 'Google Drive: network error while uploading the file',
    },
    sessionNote: 'The Google Drive session renews itself automatically (roughly every hour) as long as you stay signed in to your Google account in this browser.',
  },
  microsoft: {
    setup: {
      step1: 'Open the Azure Portal → Microsoft Entra ID → App registrations, and click "New registration".',
      step2: 'Under Supported account types, choose "Accounts in any organizational directory and personal Microsoft accounts", then click Register.',
      step3:
        'Under API permissions → Add a permission → Microsoft Graph → Delegated permissions, add Files.ReadWrite and offline_access, then click Add permissions.',
      step4WithRedirect:
        'Under Authentication → Add a platform → Single-page application, paste this under Redirect URIs and click Configure:',
      step4NoRedirect:
        'Under Authentication → Add a platform → Single-page application, add the full URL of the public/microsoft-callback.html page on your domain under Redirect URIs — it could not be detected automatically (see redirectUri in the provider options).',
      step5: 'On the Overview page, copy the Application (client) ID and paste it into the field below.',
    },
    error: {
      exchangeCode: 'Microsoft: failed to exchange the code for a token (status {status})',
      requireClientId: 'Save an Application (client) ID first (see the setup wizard).',
      requireRedirectUri:
        'Could not determine redirectUri automatically. Pass it explicitly in the OneDriveProvider options (needed when the plugin is loaded via <script type="module"> or a bundler).',
      notConnected: 'OneDrive is not connected.',
      sessionExpired: 'The Microsoft session expired, please log in again.',
      refreshFailed: 'Microsoft: failed to refresh the token (status {status})',
      noSpoLicense:
        "This Microsoft account's organization does not have OneDrive/SharePoint licensed (Microsoft Graph: \"Tenant does not have a SPO license\"). Sign in with a personal Microsoft account (outlook.com/hotmail/live) or a work account whose organization has OneDrive for Business enabled.",
      noDownloadableContent:
        '"{name}" has no downloadable content — this is usually a OneNote notebook or another item type OneDrive cannot serve as a plain file.',
      downloadUrlUnavailable:
        '"{name}" doesn\'t have a download link yet — this can happen right after uploading, or if your organization blocks downloading this file. Please try again in a moment.',
      uploadFailed: 'OneDrive: upload failed (status {status})',
      uploadNetworkError: 'OneDrive: network error while uploading the file',
    },
    sessionNote: 'Microsoft caps the session for browser-based apps (SPA) at 24 hours — after that you’ll need to log in again. This is a limitation of Microsoft’s own platform, not the plugin.',
  },
  box: {
    setup: {
      step1: 'Open the Box Developer Console and create a new app using OAuth 2.0 (user) authentication — not Server Authentication (JWT/CCG), which cannot be changed later.',
      step2Server: 'Unlike Dropbox, Google Drive and OneDrive, Box requires a Client Secret to complete login, and Box itself warns that secret must never live in browser code — so this provider needs a small server of your own to hold it (the tokenEndpoint option below; see the README section "Box" for a copy-pasteable example).',
      step3: 'On the app\'s Configuration page, copy the Client ID and Client Secret. Paste the Client ID below — put the Client Secret only in your server\'s environment, never here.',
      step4WithRedirect: 'On the same Configuration page, under Redirect URIs, paste this and click Save:',
      step4NoRedirect: 'On the same Configuration page, under Redirect URIs, add the full URL of the public/box-callback.html page on your domain — it could not be detected automatically (see redirectUri in the provider options).',
      step5WithOrigin: 'Still on the Configuration page, scroll down to CORS Domains and add this origin (needed for the browser to call the Box API directly):',
      step5NoOrigin: 'Still on the Configuration page, scroll down to CORS Domains and add the exact origin (protocol + domain + port) this site is served from — it could not be detected automatically.',
      step6: 'Under Application Scopes, enable "Read and write all files and folders stored in Box" (or Read-only, if you don\'t need upload/delete).',
      step7: 'Paste the Client ID into the field below.',
    },
    error: {
      exchangeCode: 'Box: failed to exchange the code for a token (status {status})',
      requireClientId: 'Save a Client ID first (see the setup wizard).',
      requireRedirectUri:
        'Could not determine redirectUri automatically. Pass it explicitly in the BoxProvider options (needed when the plugin is loaded via <script type="module"> or a bundler).',
      requireTokenEndpoint: 'BoxProvider needs a tokenEndpoint option (a small server of your own that keeps the Box Client Secret) — see README, section "Box".',
      notConnected: 'Box is not connected.',
      sessionExpired: 'The Box session expired, please log in again.',
      refreshFailed: 'Box: failed to refresh the token (status {status})',
      downloadFailed: 'Box: could not download "{name}" (network/CORS error) — see README, section "Box"',
      fileTooLarge:
        'The file is larger than {maxMb} MB — Box files are inlined as a data URL since there is no download proxy, so this file is too large to insert.',
      uploadFailed: 'Box: upload failed (status {status})',
      uploadNetworkError: 'Box: network error while uploading the file',
    },
    sessionNote: 'Box refresh tokens are valid for up to 60 days and are replaced every time they\'re used — if you don\'t use this site for 60 days straight you\'ll need to log in again. This provider also relies on your own small server to keep the Box Client Secret out of the browser.',
  },
  s3: {
    connectMenuItem: 'Connect S3',
    modalTitle: 'Connect S3-compatible storage',
    nameLabel: 'Tab name',
    namePlaceholder: 'e.g. My bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Region',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Custom endpoint (optional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Leave empty for AWS S3. Set this for S3-compatible services (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Use path-style URLs (needed for most self-hosted/S3-compatible endpoints)',
    corsHint: 'The bucket must allow CORS requests from this site (GET, PUT, DELETE, HEAD) — configure this in the bucket’s CORS settings.',
    connect: 'Connect',
    cancel: 'Cancel',
    connecting: 'Connecting…',
    error: {
      required: 'Fill in all required fields.',
      duplicateName: 'A tab with this name already exists.',
      connectFailed: 'Could not connect: {message}',
      listFailed: 'S3: failed to list objects (status {status})',
      uploadFailed: 'S3: upload failed (status {status})',
      uploadNetworkError: 'S3: network error while uploading the file',
      deleteFailed: 'S3: failed to delete (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'PKCE OAuth login requires the Web Crypto API (crypto.subtle), which browsers disable on an insecure origin (plain http, other than localhost). Open the site over https:// or, for testing, over http://localhost.',
      popupBlocked: 'The browser blocked the authorization pop-up. Allow pop-ups for this site.',
      stateMismatch: 'The authorization response failed verification (state mismatch).',
      popupClosed: 'The authorization window was closed before login finished.',
    },
  },
};

export default messages;
