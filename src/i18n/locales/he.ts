import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'שורש',
    loading: 'טוען…',
    empty: 'אין כאן עדיין כלום.',
    loadMore: 'עוד',
    uploadFile: 'העלאת קובץ',
    urlPlaceholder: 'הדבק קישור לקובץ…',
    addUrl: 'הוספה',
    searchPlaceholder: 'חיפוש קבצים…',
    filter: {
      all: 'כל הסוגים',
    },
    settings: 'הגדרות',
    refresh: 'רענון',
    selectedCount: '{count} נבחרו',
    cancelSelection: 'ביטול',
    insertSelected: 'הוספה ({count})',
    openInTab: 'פתיחה בכרטיסייה חדשה',
    delete: 'מחיקה',
    deleteConfirm: 'לאשר מחיקה?',
    viewGrid: 'תצוגת רשת',
    viewTable: 'תצוגת טבלה',
    viewTree: 'תצוגת עץ',
    columnName: 'שם',
    columnType: 'סוג',
    columnSize: 'גודל',
    columnModified: 'שונה',
    type: {
      image: 'תמונה',
      video: 'וידאו',
      audio: 'אודיו',
      document: 'מסמך',
      folder: 'תיקייה',
      other: 'קובץ',
    },
    error: {
      generic: 'טעינת רשימת הקבצים נכשלה',
    },
    dropzone: {
      active: 'שחררו להעלאה',
    },
    upload: {
      queueTitle: 'מעלה {done}/{total}',
      uploading: 'מעלה…',
      done: 'הושלם',
      error: 'נכשל',
      close: 'סגירה',
    },
    tree: {
      expandAll: 'הרחבת הכול',
      collapseAll: 'כיווץ הכול',
      expandFolder: 'הרחבת תיקייה',
      collapseFolder: 'כיווץ תיקייה',
    },
    addConnection: 'הוספת חיבור',
    moreTabs: 'עוד לשוניות',
    removeConnection: 'הסרה',
    removeConnectionConfirm: 'לאשר הסרה?',
  },
  auth: {
    connectPrompt: 'חברו את {provider} כדי לבחור קבצים מכאן.',
    loginButton: 'התחברות אל {provider}',
    loggingIn: 'פותח את חלון ההרשאה…',
    loginFailed: 'ההתחברות נכשלה.',
    changeAppKey: 'שינוי App Key',
    logout: 'התנתקות',
    logoutConfirm: 'לאשר התנתקות?',
  },
  setup: {
    missingInfo: 'יש להגדיר את {provider}, אך אין הוראות זמינות.',
    intro: 'כדי לחבר את {provider}, צרו תחילה אפליקציה במסוף המפתחים שלו: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'שמירה',
    saveFailed: 'שמירת ה-App Key נכשלה.',
    copy: 'העתקה',
    copied: 'הועתק',
    selected: 'נבחר, הקישו Ctrl+C',
    uploadHint: 'לאחר החיבור, תוכלו גם להעלות קבצים על ידי גרירתם (או גרירת תיקייה שלמה) לתוך הרשימה, או באמצעות כפתור ההעלאה שלמעלה.',
  },
  block: {
    label: 'מדיה מהענן',
    category: 'אחסון',
  },
  button: {
    label: 'הוספה מהענן',
  },
  modal: {
    title: 'הוספה מהענן',
  },
  local: {
    tabLabel: 'הקבצים שלי',
    error: {
      emptyUrl: 'הזינו קישור לקובץ',
      readFile: 'קריאת הקובץ נכשלה',
    },
  },
  dropbox: {
    setup: {
      step1: 'פתחו את Dropbox App Console ולחצו על "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. הזינו שם אפליקציה כלשהו ולחצו על Create app.',
      step3: 'בלשונית Permissions סמנו את files.metadata.read,‏ files.content.read ו-files.content.write, ולאחר מכן לחצו על Submit.',
      step4WithRedirect: 'בלשונית Settings, תחת Redirect URIs, הדביקו את הכתובת הזו ולחצו על Add:',
      step4NoRedirect:
        'בלשונית Settings, תחת Redirect URIs, הוסיפו את הכתובת המלאה של הדף public/dropbox-callback.html בדומיין שלכם — לא ניתן היה לזהות אותה אוטומטית (ראו redirectUri באפשרויות הספק).',
      step5: 'באותה לשונית Settings העתיקו את App key והדביקו אותו בשדה שלמטה.',
    },
    error: {
      exchangeCode: 'Dropbox: החלפת הקוד לאסימון נכשלה (סטטוס {status})',
      requireAppKey: 'שמרו תחילה App Key (ראו את אשף ההגדרה).',
      requireRedirectUri:
        'לא ניתן היה לקבוע את redirectUri באופן אוטומטי. ציינו אותו במפורש באפשרויות DropboxProvider (נדרש אם התוסף נטען דרך <script type="module"> או באמצעות bundler).',
      notConnected: 'Dropbox אינו מחובר.',
      sessionExpired: 'פג תוקף החיבור ל-Dropbox, יש להתחבר שוב.',
      refreshFailed: 'Dropbox: חידוש האסימון נכשל (סטטוס {status})',
      uploadFailed: 'Dropbox: ההעלאה נכשלה (סטטוס {status})',
      uploadNetworkError: 'Dropbox: שגיאת רשת בעת העלאת הקובץ',
    },
  },
  google: {
    setup: {
      step1: 'פתחו את Google Cloud Console, צרו פרויקט (או בחרו פרויקט קיים), ולאחר מכן פתחו את "APIs & Services".',
      step2: 'ב-Library, מצאו והפעילו את "Google Drive API".',
      step3:
        'ב-"OAuth consent screen", הגדירו את User type כ-External, הוסיפו את ה-scope .../auth/drive.readonly, והוסיפו את חשבון ה-Google שלכם כ-test user (אפליקציה לא מאומתת מוגבלת למשתמשי בדיקה ומציגה מסך אזהרה — פרסום עבור משתמשים רבים דורש בדיקת אימות של Google).',
      step4WithOrigin:
        'ב-Credentials → Create Credentials → OAuth client ID, בחרו Application type "Web application", ותחת Authorized JavaScript origins הדביקו את הכתובת הזו ולחצו על Add:',
      step4NoOrigin:
        'ב-Credentials → Create Credentials → OAuth client ID, בחרו Application type "Web application", ותחת Authorized JavaScript origins הוסיפו את ה-origin המדויק (פרוטוקול + דומיין + פורט) שממנו מוגש אתר זה — לא ניתן היה לזהות אותו אוטומטית.',
      step5: 'באותו מסך, העתיקו את ה-Client ID (מסתיים ב-.apps.googleusercontent.com) והדביקו אותו בשדה שלמטה.',
    },
    error: {
      gisLoadFailed: 'טעינת Google Identity Services (accounts.google.com/gsi/client) נכשלה — בדקו את חיבור הרשת או חוסם מודעות/סקריפטים.',
      tokenFailed: 'Google לא החזיר אסימון גישה. נסו להתחבר שוב.',
      requireClientId: 'שמרו תחילה Client ID (ראו את אשף ההגדרה).',
      notConnected: 'Google Drive אינו מחובר.',
      sessionExpired: 'פג תוקף החיבור ל-Google, יש להתחבר שוב.',
      fileTooLarge:
        'הקובץ גדול מ-{maxMb} MB — קבצי Google Drive מוטמעים כ-data URL מכיוון שאין שרת, וקובץ זה גדול מדי להוספה.',
      uploadFailed: 'Google Drive: ההעלאה נכשלה (סטטוס {status})',
      uploadNetworkError: 'Google Drive: שגיאת רשת בעת העלאת הקובץ',
    },
  },
  microsoft: {
    setup: {
      step1: 'פתחו את Azure Portal → Microsoft Entra ID → App registrations, ולחצו על "New registration".',
      step2: 'ב-Supported account types, בחרו "Accounts in any organizational directory and personal Microsoft accounts", ולאחר מכן לחצו על Register.',
      step3:
        'ב-API permissions → Add a permission → Microsoft Graph → Delegated permissions, הוסיפו את Files.ReadWrite ואת offline_access, ולאחר מכן לחצו על Add permissions.',
      step4WithRedirect:
        'ב-Authentication → Add a platform → Single-page application, הדביקו את הכתובת הזו תחת Redirect URIs ולחצו על Configure:',
      step4NoRedirect:
        'ב-Authentication → Add a platform → Single-page application, הוסיפו את הכתובת המלאה של הדף public/microsoft-callback.html בדומיין שלכם תחת Redirect URIs — לא ניתן היה לזהות אותה אוטומטית (ראו redirectUri באפשרויות הספק).',
      step5: 'בדף Overview, העתיקו את ה-Application (client) ID והדביקו אותו בשדה שלמטה.',
    },
    error: {
      exchangeCode: 'Microsoft: החלפת הקוד לאסימון נכשלה (סטטוס {status})',
      requireClientId: 'שמרו תחילה Application (client) ID (ראו את אשף ההגדרה).',
      requireRedirectUri:
        'לא ניתן היה לקבוע את redirectUri באופן אוטומטי. ציינו אותו במפורש באפשרויות OneDriveProvider (נדרש אם התוסף נטען דרך <script type="module"> או באמצעות bundler).',
      notConnected: 'OneDrive אינו מחובר.',
      sessionExpired: 'פג תוקף החיבור ל-Microsoft, יש להתחבר שוב.',
      refreshFailed: 'Microsoft: חידוש האסימון נכשל (סטטוס {status})',
      noSpoLicense:
        'לארגון של חשבון Microsoft זה אין רישיון עבור OneDrive/SharePoint (Microsoft Graph: "Tenant does not have a SPO license"). התחברו עם חשבון Microsoft אישי (outlook.com/hotmail/live) או עם חשבון עבודה שהארגון שלו הפעיל את OneDrive for Business.',
      noDownloadableContent:
        '"{name}" אינו כולל תוכן הניתן להורדה — בדרך כלל זהו מחברת OneNote או סוג פריט אחר שאותו OneDrive אינו יכול לספק כקובץ רגיל.',
      uploadFailed: 'OneDrive: ההעלאה נכשלה (סטטוס {status})',
      uploadNetworkError: 'OneDrive: שגיאת רשת בעת העלאת הקובץ',
    },
  },
  s3: {
    connectMenuItem: 'חיבור S3',
    modalTitle: 'חיבור אחסון תואם S3',
    nameLabel: 'שם הלשונית',
    namePlaceholder: 'למשל, הדלי שלי',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'אזור',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'נקודת קצה מותאמת (אופציונלי)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'השאירו ריק עבור AWS S3. מלאו עבור שירותים תואמי S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'שימוש בכתובות בסגנון path (נדרש עבור רוב נקודות הקצה המתארחות עצמאית/תואמות S3)',
    corsHint: 'על הדלי לאפשר בקשות CORS מאתר זה (GET, PUT, DELETE, HEAD) — הגדירו זאת בהגדרות ה-CORS של הדלי.',
    connect: 'חיבור',
    cancel: 'ביטול',
    connecting: 'מתחבר…',
    error: {
      required: 'יש למלא את כל השדות הנדרשים.',
      duplicateName: 'לשונית בשם זה קיימת כבר.',
      connectFailed: 'החיבור נכשל: {message}',
      listFailed: 'S3: אחזור רשימת האובייקטים נכשל (סטטוס {status})',
      uploadFailed: 'S3: ההעלאה נכשלה (סטטוס {status})',
      uploadNetworkError: 'S3: שגיאת רשת בעת העלאת הקובץ',
      deleteFailed: 'S3: המחיקה נכשלה (סטטוס {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'התחברות OAuth באמצעות PKCE דורשת את Web Crypto API‏ (crypto.subtle), שדפדפנים משביתים במקור לא מאובטח (http רגיל, פרט ל-localhost). פתחו את האתר דרך https:// או, לצורך בדיקה, דרך http://localhost.',
      popupBlocked: 'הדפדפן חסם את חלון ההרשאה הקופץ. אפשרו חלונות קופצים עבור אתר זה.',
      stateMismatch: 'תגובת ההרשאה לא עברה את האימות (אי-התאמה ב-state).',
      popupClosed: 'חלון ההרשאה נסגר לפני שההתחברות הושלמה.',
    },
  },
};

export default messages;
