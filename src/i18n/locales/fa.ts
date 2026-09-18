import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'ریشه',
    loading: 'در حال بارگذاری…',
    empty: 'هنوز چیزی اینجا نیست.',
    loadMore: 'بیشتر',
    uploadFile: 'بارگذاری فایل',
    urlPlaceholder: 'پیوند یک فایل را جای‌گذاری کنید…',
    addUrl: 'افزودن',
    searchPlaceholder: 'جستجوی فایل‌ها…',
    filter: {
      all: 'همه انواع',
    },
    settings: 'تنظیمات',
    refresh: 'تازه‌سازی',
    selectedCount: '{count} انتخاب شد',
    cancelSelection: 'لغو',
    insertSelected: 'درج ({count})',
    openInTab: 'باز کردن در برگه جدید',
    delete: 'حذف',
    deleteConfirm: 'حذف تأیید شود؟',
    viewGrid: 'نمای شبکه‌ای',
    viewTable: 'نمای جدولی',
    viewTree: 'نمای درختی',
    columnName: 'نام',
    columnType: 'نوع',
    columnSize: 'اندازه',
    columnModified: 'تغییر یافته',
    type: {
      image: 'تصویر',
      video: 'ویدیو',
      audio: 'صدا',
      document: 'سند',
      folder: 'پوشه',
      other: 'فایل',
    },
    error: {
      generic: 'بارگذاری فهرست فایل‌ها ناموفق بود',
      insertFailed: 'این فایل درج نشد',
    },
    dropzone: {
      active: 'برای بارگذاری رها کنید',
    },
    upload: {
      queueTitle: 'در حال بارگذاری {done}/{total}',
      uploading: 'در حال بارگذاری…',
      done: 'انجام شد',
      error: 'ناموفق',
      close: 'بستن',
    },
    tree: {
      expandAll: 'باز کردن همه',
      collapseAll: 'بستن همه',
      expandFolder: 'باز کردن پوشه',
      collapseFolder: 'بستن پوشه',
    },
    addConnection: 'افزودن اتصال',
    moreTabs: 'برگه‌های بیشتر',
    removeConnection: 'حذف',
    removeConnectionConfirm: 'حذف تأیید شود؟',
  },
  auth: {
    connectPrompt: 'برای انتخاب فایل از اینجا، {provider} را متصل کنید.',
    loginButton: 'ورود به {provider}',
    loggingIn: 'در حال باز کردن پنجره تأیید هویت…',
    loginFailed: 'ورود ناموفق بود.',
    changeAppKey: 'تغییر App Key',
    logout: 'خروج',
    logoutConfirm: 'خروج تأیید شود؟',
  },
  setup: {
    missingInfo: '{provider} نیاز به تنظیم دارد، اما دستورالعملی در دسترس نیست.',
    intro: 'برای اتصال {provider}، ابتدا یک برنامه در کنسول توسعه‌دهندگان آن بسازید: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'ذخیره',
    saveFailed: 'ذخیره App Key ناموفق بود.',
    copy: 'کپی',
    copied: 'کپی شد',
    selected: 'انتخاب شد، Ctrl+C را بزنید',
    uploadHint: 'پس از اتصال، می‌توانید فایل‌ها را با کشیدن و رها کردن آن‌ها (یا کل یک پوشه) در فهرست، یا با دکمه بارگذاری در بالا نیز بارگذاری کنید.',
  },
  block: {
    label: 'رسانه ابری',
    category: 'فضای ذخیره‌سازی',
  },
  button: {
    label: 'درج از فضای ابری',
  },
  modal: {
    title: 'درج از فضای ابری',
  },
  local: {
    tabLabel: 'فایل‌های من',
    error: {
      emptyUrl: 'پیوند یک فایل را وارد کنید',
      readFile: 'خواندن فایل ناموفق بود',
    },
  },
  dropbox: {
    setup: {
      step1: 'Dropbox App Console را باز کنید و روی «Create app» کلیک کنید.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. هر نام دلخواهی برای برنامه وارد کنید و روی Create app کلیک کنید.',
      step3: 'در برگه Permissions گزینه‌های files.metadata.read، files.content.read و files.content.write را علامت بزنید و سپس روی Submit کلیک کنید.',
      step4WithRedirect: 'در برگه Settings، زیر Redirect URIs، این مقدار را جای‌گذاری کرده و روی Add کلیک کنید:',
      step4NoRedirect:
        'در برگه Settings، زیر Redirect URIs، نشانی کامل صفحه public/dropbox-callback.html را در دامنه خود اضافه کنید — تشخیص خودکار آن ممکن نشد (به redirectUri در گزینه‌های ارائه‌دهنده مراجعه کنید).',
      step5: 'در همان برگه Settings، App key را کپی کرده و در فیلد زیر جای‌گذاری کنید.',
    },
    error: {
      exchangeCode: 'Dropbox: تبدیل code به توکن ناموفق بود (وضعیت {status})',
      requireAppKey: 'ابتدا یک App Key ذخیره کنید (به راهنمای تنظیمات مراجعه کنید).',
      requireRedirectUri:
        'تعیین خودکار redirectUri ممکن نشد. آن را به‌صراحت در گزینه‌های DropboxProvider مشخص کنید (در صورتی که افزونه از طریق <script type="module"> یا یک bundler بارگذاری شود لازم است).',
      notConnected: 'Dropbox متصل نیست.',
      sessionExpired: 'نشست Dropbox منقضی شده است، دوباره وارد شوید.',
      refreshFailed: 'Dropbox: تازه‌سازی توکن ناموفق بود (وضعیت {status})',
      uploadFailed: 'Dropbox: بارگذاری ناموفق بود (وضعیت {status})',
      uploadNetworkError: 'Dropbox: خطای شبکه هنگام بارگذاری فایل',
    },
  },
  google: {
    setup: {
      step1: 'Google Cloud Console را باز کنید، یک پروژه بسازید (یا پروژه‌ای موجود را انتخاب کنید)، سپس «APIs & Services» را باز کنید.',
      step2: 'در بخش Library، «Google Drive API» را پیدا کرده و فعال کنید.',
      step3:
        'در «OAuth consent screen»، User type را روی External تنظیم کنید، scope با مقدار .../auth/drive.readonly را اضافه کنید و حساب گوگل خودتان را به‌عنوان test user اضافه کنید (یک برنامه تأییدنشده فقط برای کاربران آزمایشی در دسترس است و صفحه هشدار نشان می‌دهد — انتشار برای کاربران زیاد نیازمند بررسی تأیید گوگل است).',
      step4WithOrigin:
        'در Credentials → Create Credentials → OAuth client ID، Application type «Web application» را انتخاب کنید و زیر Authorized JavaScript origins این مقدار را جای‌گذاری کرده و روی Add کلیک کنید:',
      step4NoOrigin:
        'در Credentials → Create Credentials → OAuth client ID، Application type «Web application» را انتخاب کنید و زیر Authorized JavaScript origins، origin دقیق (پروتکل + دامنه + پورت) که این سایت از آن سرو می‌شود را اضافه کنید — تشخیص خودکار آن ممکن نشد.',
      step5: 'در همان صفحه، Client ID (که به .apps.googleusercontent.com ختم می‌شود) را کپی کرده و در فیلد زیر جای‌گذاری کنید.',
    },
    error: {
      gisLoadFailed: 'بارگذاری Google Identity Services (accounts.google.com/gsi/client) ناموفق بود — اتصال شبکه یا مسدودکننده تبلیغات/اسکریپت را بررسی کنید.',
      tokenFailed: 'Google توکن دسترسی برنگرداند. دوباره وارد شوید.',
      requireClientId: 'ابتدا یک Client ID ذخیره کنید (به راهنمای تنظیمات مراجعه کنید).',
      notConnected: 'Google Drive متصل نیست.',
      sessionExpired: 'نشست Google منقضی شده است، دوباره وارد شوید.',
      fileTooLarge:
        'فایل بزرگ‌تر از {maxMb} مگابایت است — فایل‌های Google Drive به دلیل نبود سرور به‌صورت data URL درج می‌شوند، بنابراین این فایل برای درج بیش از حد بزرگ است.',
      uploadFailed: 'Google Drive: بارگذاری ناموفق بود (وضعیت {status})',
      uploadNetworkError: 'Google Drive: خطای شبکه هنگام بارگذاری فایل',
    },
  },
  microsoft: {
    setup: {
      step1: 'Azure Portal → Microsoft Entra ID → App registrations را باز کنید و روی «New registration» کلیک کنید.',
      step2: 'در Supported account types، گزینه «Accounts in any organizational directory and personal Microsoft accounts» را انتخاب کنید و سپس روی Register کلیک کنید.',
      step3:
        'در API permissions → Add a permission → Microsoft Graph → Delegated permissions، Files.ReadWrite و offline_access را اضافه کنید و سپس روی Add permissions کلیک کنید.',
      step4WithRedirect:
        'در Authentication → Add a platform → Single-page application، این مقدار را زیر Redirect URIs جای‌گذاری کرده و روی Configure کلیک کنید:',
      step4NoRedirect:
        'در Authentication → Add a platform → Single-page application، نشانی کامل صفحه public/microsoft-callback.html در دامنه خود را زیر Redirect URIs اضافه کنید — تشخیص خودکار آن ممکن نشد (به redirectUri در گزینه‌های ارائه‌دهنده مراجعه کنید).',
      step5: 'در صفحه Overview، Application (client) ID را کپی کرده و در فیلد زیر جای‌گذاری کنید.',
    },
    error: {
      exchangeCode: 'Microsoft: تبدیل code به توکن ناموفق بود (وضعیت {status})',
      requireClientId: 'ابتدا یک Application (client) ID ذخیره کنید (به راهنمای تنظیمات مراجعه کنید).',
      requireRedirectUri:
        'تعیین خودکار redirectUri ممکن نشد. آن را به‌صراحت در گزینه‌های OneDriveProvider مشخص کنید (در صورتی که افزونه از طریق <script type="module"> یا یک bundler بارگذاری شود لازم است).',
      notConnected: 'OneDrive متصل نیست.',
      sessionExpired: 'نشست Microsoft منقضی شده است، دوباره وارد شوید.',
      refreshFailed: 'Microsoft: تازه‌سازی توکن ناموفق بود (وضعیت {status})',
      noSpoLicense:
        'سازمانِ این حساب Microsoft مجوز OneDrive/SharePoint را ندارد (Microsoft Graph: «Tenant does not have a SPO license»). با یک حساب شخصی Microsoft (outlook.com/hotmail/live) یا یک حساب کاری که سازمان آن OneDrive for Business را فعال کرده است وارد شوید.',
      noDownloadableContent:
        '«{name}» محتوای قابل دانلودی ندارد — این معمولاً مربوط به یک دفترچه OneNote یا نوع دیگری از مورد است که OneDrive نمی‌تواند آن را به‌صورت یک فایل عادی ارائه دهد.',
      uploadFailed: 'OneDrive: بارگذاری ناموفق بود (وضعیت {status})',
      uploadNetworkError: 'OneDrive: خطای شبکه هنگام بارگذاری فایل',
    },
  },
  s3: {
    connectMenuItem: 'اتصال S3',
    modalTitle: 'اتصال به فضای ذخیره‌سازی سازگار با S3',
    nameLabel: 'نام برگه',
    namePlaceholder: 'مثلاً باکت من',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'منطقه',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'اندپوینت اختصاصی (اختیاری)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'برای AWS S3 خالی بگذارید. برای سرویس‌های سازگار با S3 (MinIO، Wasabi، DigitalOcean Spaces، Cloudflare R2…) پر کنید.',
    forcePathStyleLabel: 'استفاده از آدرس‌های path-style (برای بیشتر اندپوینت‌های self-hosted/سازگار با S3 لازم است)',
    corsHint: 'باکت باید درخواست‌های CORS از این سایت را مجاز کند (GET، PUT، DELETE، HEAD) — این را در تنظیمات CORS باکت انجام دهید.',
    connect: 'اتصال',
    cancel: 'لغو',
    connecting: 'در حال اتصال…',
    error: {
      required: 'همه فیلدهای ضروری را پر کنید.',
      duplicateName: 'برگه‌ای با این نام از قبل وجود دارد.',
      connectFailed: 'اتصال ناموفق بود: {message}',
      listFailed: 'S3: فهرست‌کردن اشیاء ناموفق بود (وضعیت {status})',
      uploadFailed: 'S3: بارگذاری ناموفق بود (وضعیت {status})',
      uploadNetworkError: 'S3: خطای شبکه هنگام بارگذاری فایل',
      deleteFailed: 'S3: حذف ناموفق بود (وضعیت {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'ورود OAuth از طریق PKCE به Web Crypto API (‏crypto.subtle) نیاز دارد که مرورگرها آن را در مبدأ ناامن (http ساده، به‌جز localhost) غیرفعال می‌کنند. سایت را از طریق https:// یا برای آزمایش از طریق http://localhost باز کنید.',
      popupBlocked: 'مرورگر پنجره بازشوی تأیید هویت را مسدود کرد. پنجره‌های بازشو را برای این سایت مجاز کنید.',
      stateMismatch: 'پاسخ تأیید هویت اعتبارسنجی نشد (عدم تطابق state).',
      popupClosed: 'پنجره تأیید هویت پیش از پایان ورود بسته شد.',
    },
  },
};

export default messages;
