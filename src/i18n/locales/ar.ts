import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'الجذر',
    loading: 'جارٍ التحميل…',
    empty: 'لا يوجد شيء هنا بعد.',
    loadMore: 'المزيد',
    uploadFile: 'رفع ملف',
    urlPlaceholder: 'الصق رابط ملف…',
    addUrl: 'إضافة',
    searchPlaceholder: 'ابحث في الملفات…',
    filter: {
      all: 'جميع الأنواع',
    },
    settings: 'الإعدادات',
    refresh: 'تحديث',
    selectedCount: 'تم تحديد {count}',
    cancelSelection: 'إلغاء',
    insertSelected: 'إدراج ({count})',
    openInTab: 'فتح في علامة تبويب جديدة',
    delete: 'حذف',
    deleteConfirm: 'تأكيد الحذف؟',
    viewGrid: 'عرض الشبكة',
    viewTable: 'عرض الجدول',
    viewTree: 'عرض الشجرة',
    columnName: 'الاسم',
    columnType: 'النوع',
    columnSize: 'الحجم',
    columnModified: 'آخر تعديل',
    type: {
      image: 'صورة',
      video: 'فيديو',
      audio: 'صوت',
      document: 'مستند',
      folder: 'مجلد',
      other: 'ملف',
    },
    error: {
      generic: 'تعذّر تحميل قائمة الملفات',
      insertFailed: 'تعذّر إدراج هذا الملف',
    },
    dropzone: {
      active: 'أفلت هنا للرفع',
    },
    upload: {
      queueTitle: 'جارٍ الرفع {done}/{total}',
      uploading: 'جارٍ الرفع…',
      done: 'تم',
      error: 'فشل',
      close: 'إغلاق',
    },
    tree: {
      expandAll: 'توسيع الكل',
      collapseAll: 'طي الكل',
      expandFolder: 'توسيع المجلد',
      collapseFolder: 'طي المجلد',
    },
    addConnection: 'إضافة اتصال',
    moreTabs: 'المزيد من علامات التبويب',
    removeConnection: 'إزالة',
    removeConnectionConfirm: 'تأكيد الإزالة؟',
  },
  auth: {
    connectPrompt: 'قم بربط {provider} لاختيار الملفات من هنا.',
    loginButton: 'تسجيل الدخول إلى {provider}',
    loggingIn: 'جارٍ فتح نافذة التفويض…',
    loginFailed: 'فشل تسجيل الدخول.',
    changeAppKey: 'تغيير App Key',
    logout: 'تسجيل الخروج',
    logoutConfirm: 'تأكيد تسجيل الخروج؟',
  },
  setup: {
    missingInfo: 'يحتاج {provider} إلى إعداد، ولكن لا تتوفر تعليمات.',
    intro: 'لربط {provider}، أنشئ أولاً تطبيقًا في وحدة تحكم المطورين الخاصة به: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'حفظ',
    saveFailed: 'تعذّر حفظ App Key.',
    copy: 'نسخ',
    copied: 'تم النسخ',
    selected: 'تم التحديد، اضغط Ctrl+C',
    uploadHint: 'بمجرد الاتصال، يمكنك أيضًا رفع الملفات عن طريق سحبها (أو سحب مجلد كامل) إلى القائمة، أو باستخدام زر الرفع أعلاه.',
  },
  block: {
    label: 'وسائط سحابية',
    category: 'التخزين',
  },
  button: {
    label: 'إدراج من السحابة',
  },
  modal: {
    title: 'إدراج من السحابة',
  },
  local: {
    tabLabel: 'ملفاتي',
    error: {
      emptyUrl: 'أدخل رابط ملف',
      readFile: 'تعذّرت قراءة الملف',
    },
  },
  settings: {
    tabButton: 'الحسابات المتصلة',
    title: 'الحسابات المتصلة',
    empty: 'لا يوجد مزود هنا يدعم تسجيل الدخول عبر App Key/Client ID بعد.',
    authenticatedAt: 'تم التفويض في {date}',
    authenticatedAtUnknown: 'تاريخ التفويض غير معروف',
    notConnected: 'غير متصل',
    tokenExpiresIn: 'تنتهي صلاحية الرمز خلال {time}',
    tokenExpired: 'انتهت صلاحية الرمز — سيتم تحديثه تلقائيًا عند الإجراء التالي',
    close: 'إغلاق',
  },
  dropbox: {
    setup: {
      step1: 'افتح Dropbox App Console وانقر على «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. أدخل أي اسم للتطبيق وانقر على Create app.',
      step3: 'في علامة التبويب Permissions، حدد files.metadata.read وfiles.content.read وfiles.content.write، ثم انقر على Submit.',
      step4WithRedirect: 'في علامة التبويب Settings، ضمن Redirect URIs، الصق هذا وانقر على Add:',
      step4NoRedirect:
        'في علامة التبويب Settings، ضمن Redirect URIs، أضف عنوان URL الكامل لصفحة public/dropbox-callback.html على نطاقك — تعذّر اكتشافه تلقائيًا (راجع redirectUri في خيارات المزوّد).',
      step5: 'في علامة التبويب Settings نفسها، انسخ App key والصقه في الحقل أدناه.',
    },
    error: {
      exchangeCode: 'Dropbox: تعذّر استبدال code برمز وصول (الحالة {status})',
      requireAppKey: 'احفظ App Key أولاً (راجع معالج الإعداد).',
      requireRedirectUri:
        'تعذّر تحديد redirectUri تلقائيًا. حدّده صراحةً ضمن خيارات DropboxProvider (مطلوب إذا تم تحميل الإضافة عبر <script type="module"> أو أداة تجميع).',
      notConnected: 'Dropbox غير متصل.',
      sessionExpired: 'انتهت صلاحية جلسة Dropbox، الرجاء تسجيل الدخول مرة أخرى.',
      refreshFailed: 'Dropbox: تعذّر تجديد رمز الوصول (الحالة {status})',
      uploadFailed: 'Dropbox: فشل الرفع (الحالة {status})',
      uploadNetworkError: 'Dropbox: خطأ في الشبكة أثناء رفع الملف',
    },
    sessionNote: 'جلسة Dropbox غير محدودة بوقت: تبقى صالحة حتى تسجل الخروج أو تُلغى صلاحية الوصول من إعدادات Dropbox نفسه.',
  },
  google: {
    setup: {
      step1: 'افتح Google Cloud Console، أنشئ مشروعًا (أو اختر مشروعًا موجودًا)، ثم افتح «APIs & Services».',
      step2: 'ضمن Library، ابحث عن «Google Drive API» وفعّله.',
      step3:
        'ضمن «OAuth consent screen»، اضبط User type على External، أضف النطاق .../auth/drive.readonly، وأضف حساب Google الخاص بك كـ test user (التطبيق غير المُتحقق منه يقتصر على المستخدمين التجريبيين ويعرض شاشة تحذير — النشر لعدد كبير من المستخدمين يتطلب مراجعة تحقق من Google).',
      step4WithOrigin:
        'ضمن Credentials → Create Credentials → OAuth client ID، اختر Application type «Web application»، وضمن Authorized JavaScript origins الصق هذا وانقر على Add:',
      step4NoOrigin:
        'ضمن Credentials → Create Credentials → OAuth client ID، اختر Application type «Web application»، وضمن Authorized JavaScript origins أضف الـ origin الدقيق (البروتوكول + النطاق + المنفذ) الذي يُقدَّم منه هذا الموقع — تعذّر اكتشافه تلقائيًا.',
      step5: 'في نفس الشاشة، انسخ Client ID (ينتهي بـ .apps.googleusercontent.com) والصقه في الحقل أدناه.',
    },
    error: {
      gisLoadFailed: 'تعذّر تحميل Google Identity Services (accounts.google.com/gsi/client) — تحقق من اتصال الشبكة أو أداة حظر الإعلانات/النصوص البرمجية.',
      tokenFailed: 'لم يُرجع Google رمز وصول. حاول تسجيل الدخول مرة أخرى.',
      requireClientId: 'احفظ Client ID أولاً (راجع معالج الإعداد).',
      notConnected: 'Google Drive غير متصل.',
      sessionExpired: 'انتهت صلاحية جلسة Google، الرجاء تسجيل الدخول مرة أخرى.',
      fileTooLarge:
        'الملف أكبر من {maxMb} ميجابايت — تُدرج ملفات Google Drive كـ data URL نظرًا لعدم وجود خادم، لذا هذا الملف كبير جدًا على الإدراج.',
      uploadFailed: 'Google Drive: فشل الرفع (الحالة {status})',
      uploadNetworkError: 'Google Drive: خطأ في الشبكة أثناء رفع الملف',
    },
    sessionNote: 'يتم تحديث جلسة Google Drive تلقائيًا (كل ساعة تقريبًا) طالما أنك لا تزال مسجلاً الدخول إلى حساب Google في هذا المتصفح.',
  },
  microsoft: {
    setup: {
      step1: 'افتح Azure Portal → Microsoft Entra ID → App registrations، وانقر على «New registration».',
      step2: 'ضمن Supported account types، اختر «Accounts in any organizational directory and personal Microsoft accounts»، ثم انقر على Register.',
      step3:
        'ضمن API permissions → Add a permission → Microsoft Graph → Delegated permissions، أضف Files.ReadWrite وoffline_access، ثم انقر على Add permissions.',
      step4WithRedirect:
        'ضمن Authentication → Add a platform → Single-page application، الصق هذا ضمن Redirect URIs وانقر على Configure:',
      step4NoRedirect:
        'ضمن Authentication → Add a platform → Single-page application، أضف عنوان URL الكامل لصفحة public/microsoft-callback.html على نطاقك ضمن Redirect URIs — تعذّر اكتشافه تلقائيًا (راجع redirectUri في خيارات المزوّد).',
      step5: 'في صفحة Overview، انسخ Application (client) ID والصقه في الحقل أدناه.',
    },
    error: {
      exchangeCode: 'Microsoft: تعذّر استبدال code برمز وصول (الحالة {status})',
      requireClientId: 'احفظ Application (client) ID أولاً (راجع معالج الإعداد).',
      requireRedirectUri:
        'تعذّر تحديد redirectUri تلقائيًا. حدّده صراحةً ضمن خيارات OneDriveProvider (مطلوب إذا تم تحميل الإضافة عبر <script type="module"> أو أداة تجميع).',
      notConnected: 'OneDrive غير متصل.',
      sessionExpired: 'انتهت صلاحية جلسة Microsoft، الرجاء تسجيل الدخول مرة أخرى.',
      refreshFailed: 'Microsoft: تعذّر تجديد رمز الوصول (الحالة {status})',
      noSpoLicense:
        'مؤسسة حساب Microsoft هذا لا تملك ترخيصًا لـ OneDrive/SharePoint (Microsoft Graph: «Tenant does not have a SPO license»). سجّل الدخول بحساب Microsoft شخصي (outlook.com/hotmail/live) أو بحساب عمل فعّلت مؤسسته OneDrive for Business.',
      noDownloadableContent:
        '«{name}» لا يحتوي على محتوى قابل للتنزيل — وعادةً ما يكون هذا دفتر OneNote أو نوع عنصر آخر لا يستطيع OneDrive تقديمه كملف عادي.',
      downloadUrlUnavailable:
        '«{name}» ليس له رابط تنزيل حتى الآن — يمكن أن يحدث ذلك مباشرة بعد الرفع، أو إذا كانت مؤسستك تحظر تنزيل هذا الملف. حاول مرة أخرى بعد قليل.',
      uploadFailed: 'OneDrive: فشل الرفع (الحالة {status})',
      uploadNetworkError: 'OneDrive: خطأ في الشبكة أثناء رفع الملف',
    },
    sessionNote: 'تحد Microsoft جلسة التطبيقات التي تعمل في المتصفح (SPA) بـ 24 ساعة كحد أقصى — بعدها يجب تسجيل الدخول من جديد، وهذا قيد من Microsoft وليس من الإضافة.',
  },
  box: {
    setup: {
      step1: 'افتح Box Developer Console وأنشئ تطبيقًا جديدًا باستخدام مصادقة OAuth 2.0 (User) — وليس Server Authentication (JWT/CCG)، الذي لا يمكن تغييره لاحقًا.',
      step2Server: 'خلافًا لـ Dropbox وGoogle Drive وOneDrive، يتطلب Box بالضرورة Client Secret لتسجيل الدخول، ويحذّر Box نفسه من أن هذا السر يجب ألا يوجد أبدًا في كود المتصفح — لذا يحتاج هذا المزوّد إلى خادم صغير خاص بك للاحتفاظ به (خيار tokenEndpoint أدناه؛ يوجد مثال جاهز في README، قسم "Box").',
      step3: 'في صفحة Configuration الخاصة بالتطبيق، انسخ Client ID وClient Secret. الصق Client ID أدناه — واحتفظ بـ Client Secret فقط في متغيرات بيئة خادمك، ولا تضعه هنا أبدًا.',
      step4WithRedirect: 'في نفس صفحة Configuration، ضمن Redirect URIs، الصق هذا وانقر على Save:',
      step4NoRedirect: 'في نفس صفحة Configuration، ضمن Redirect URIs، أضف عنوان URL الكامل لصفحة public/box-callback.html على نطاقك — تعذّر اكتشافه تلقائيًا (راجع redirectUri في خيارات المزوّد).',
      step5WithOrigin: 'ما زلت في صفحة Configuration، مرّر إلى CORS Domains وأضف هذا الـ origin (ضروري كي يتمكن المتصفح من استدعاء واجهة Box API مباشرة):',
      step5NoOrigin: 'ما زلت في صفحة Configuration، مرّر إلى CORS Domains وأضف الـ origin الدقيق (البروتوكول + النطاق + المنفذ) الذي يُقدَّم منه هذا الموقع — تعذّر اكتشافه تلقائيًا.',
      step6: 'ضمن Application Scopes، فعّل "Read and write all files and folders stored in Box" (أو Read-only إذا لم تكن بحاجة إلى الرفع/الحذف).',
      step7: 'الصق Client ID في الحقل أدناه.',
    },
    error: {
      exchangeCode: 'Box: تعذّر استبدال code برمز الوصول (الحالة {status})',
      requireClientId: 'احفظ أولاً Client ID (راجع معالج الإعداد).',
      requireRedirectUri:
        'تعذّر تحديد redirectUri تلقائيًا. حدده صراحةً في خيارات BoxProvider (مطلوب عند تحميل الإضافة عبر <script type="module"> أو أداة تجميع).',
      requireTokenEndpoint: 'يتطلب BoxProvider خيار tokenEndpoint (خادم صغير خاص بك يحتفظ بـ Client Secret الخاص بـ Box) — راجع README، قسم "Box".',
      notConnected: 'Box غير متصل.',
      sessionExpired: 'انتهت جلسة Box، يرجى تسجيل الدخول مرة أخرى.',
      refreshFailed: 'Box: تعذّر تحديث رمز الوصول (الحالة {status})',
      downloadFailed: 'Box: تعذّر تنزيل "{name}" (خطأ شبكة/CORS) — راجع README، قسم "Box"',
      fileTooLarge:
        'حجم الملف أكبر من {maxMb} ميغابايت — يتم إدراج ملفات Box كـ data URL لعدم وجود وسيط تنزيل (proxy)، وهذا الملف كبير جدًا لذلك.',
      uploadFailed: 'Box: فشل الرفع (الحالة {status})',
      uploadNetworkError: 'Box: خطأ في الشبكة أثناء رفع الملف',
    },
    sessionNote: 'تكون رموز تحديث Box صالحة لمدة أقصاها 60 يومًا ويتم استبدالها برمز جديد في كل استخدام — إذا لم تستخدم هذا الموقع لمدة 60 يومًا متتاليًا، ستحتاج إلى تسجيل الدخول مرة أخرى. يعتمد هذا المزوّد أيضًا على خادم صغير خاص بك لإبقاء Client Secret الخاص بـ Box بعيدًا عن المتصفح.',
  },
  s3: {
    connectMenuItem: 'ربط S3',
    modalTitle: 'ربط تخزين متوافق مع S3',
    nameLabel: 'اسم علامة التبويب',
    namePlaceholder: 'مثال: المخزن الخاص بي',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'المنطقة',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'نقطة نهاية مخصصة (اختياري)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'اتركه خاليًا لـ AWS S3. عبّئه للخدمات المتوافقة مع S3 (MinIO وWasabi وDigitalOcean Spaces وCloudflare R2…).',
    forcePathStyleLabel: 'استخدام روابط بنمط المسار (مطلوب لمعظم نقاط النهاية المستضافة ذاتيًا/المتوافقة مع S3)',
    corsHint: 'يجب أن يسمح المخزن بطلبات CORS من هذا الموقع (GET، PUT، DELETE، HEAD) — قم بضبط ذلك في إعدادات CORS للمخزن.',
    connect: 'ربط',
    cancel: 'إلغاء',
    connecting: 'جارٍ الربط…',
    error: {
      required: 'يرجى تعبئة جميع الحقول المطلوبة.',
      duplicateName: 'توجد علامة تبويب بهذا الاسم بالفعل.',
      connectFailed: 'تعذّر الربط: {message}',
      listFailed: 'S3: تعذّر سرد العناصر (الحالة {status})',
      uploadFailed: 'S3: فشل الرفع (الحالة {status})',
      uploadNetworkError: 'S3: خطأ في الشبكة أثناء رفع الملف',
      deleteFailed: 'S3: تعذّر الحذف (الحالة {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'يتطلب تسجيل الدخول عبر OAuth باستخدام PKCE واجهة Web Crypto API (‏crypto.subtle)، التي تعطّلها المتصفحات على مصدر غير آمن (http عادي، باستثناء localhost). افتح الموقع عبر https:// أو، للاختبار، عبر http://localhost.',
      popupBlocked: 'حظر المتصفح النافذة المنبثقة للتفويض. اسمح بالنوافذ المنبثقة لهذا الموقع.',
      stateMismatch: 'فشلت استجابة التفويض في التحقق (عدم تطابق state).',
      popupClosed: 'تم إغلاق نافذة التفويض قبل اكتمال تسجيل الدخول.',
    },
  },
};

export default messages;
