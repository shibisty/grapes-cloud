import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Kök',
    loading: 'Yükleniyor…',
    empty: 'Burada henüz bir şey yok.',
    loadMore: 'Daha fazla',
    uploadFile: 'Dosya yükle',
    urlPlaceholder: 'Bir dosya bağlantısı yapıştırın…',
    addUrl: 'Ekle',
    searchPlaceholder: 'Dosyalarda ara…',
    filter: {
      all: 'Tüm türler',
    },
    settings: 'Ayarlar',
    refresh: 'Yenile',
    selectedCount: '{count} seçildi',
    cancelSelection: 'İptal',
    insertSelected: 'Ekle ({count})',
    openInTab: 'Yeni sekmede aç',
    delete: 'Sil',
    deleteConfirm: 'Silinsin mi?',
    viewGrid: 'Izgara görünümü',
    viewTable: 'Tablo görünümü',
    viewTree: 'Ağaç görünümü',
    columnName: 'Ad',
    columnType: 'Tür',
    columnSize: 'Boyut',
    columnModified: 'Değiştirilme',
    type: {
      image: 'Görsel',
      video: 'Video',
      audio: 'Ses',
      document: 'Belge',
      folder: 'Klasör',
      other: 'Dosya',
    },
    error: {
      generic: 'Dosya listesi yüklenemedi',
      insertFailed: 'Bu dosya eklenemedi',
    },
    dropzone: {
      active: 'Yüklemek için bırakın',
    },
    upload: {
      queueTitle: '{done}/{total} yükleniyor',
      uploading: 'Yükleniyor…',
      done: 'Tamamlandı',
      error: 'Başarısız',
      close: 'Kapat',
    },
    tree: {
      expandAll: 'Tümünü genişlet',
      collapseAll: 'Tümünü daralt',
      expandFolder: 'Klasörü genişlet',
      collapseFolder: 'Klasörü daralt',
    },
    addConnection: 'Bağlantı ekle',
    moreTabs: 'Diğer sekmeler',
    removeConnection: 'Kaldır',
    removeConnectionConfirm: 'Kaldırılsın mı?',
  },
  auth: {
    connectPrompt: 'Buradan dosya seçmek için {provider} bağlantısını yapın.',
    loginButton: '{provider} hesabına giriş yap',
    loggingIn: 'Yetkilendirme penceresi açılıyor…',
    loginFailed: 'Giriş başarısız oldu.',
    changeAppKey: 'App Key değiştir',
    logout: 'Çıkış yap',
    logoutConfirm: 'Çıkış yapılsın mı?',
  },
  setup: {
    missingInfo: '{provider} kurulum gerektiriyor ancak talimat bulunamadı.',
    intro: '{provider} bağlantısı için önce geliştirici konsolunda bir uygulama oluşturun: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Kaydet',
    saveFailed: 'App Key kaydedilemedi.',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    selected: 'Seçildi, Ctrl+C tuşlarına basın',
    uploadHint: 'Bağlandıktan sonra, dosyaları (veya tüm bir klasörü) listeye sürükleyerek ya da yukarıdaki Yükle düğmesiyle de yükleyebilirsiniz.',
  },
  block: {
    label: 'Bulut medyası',
    category: 'Depolama',
  },
  button: {
    label: 'Buluttan ekle',
  },
  modal: {
    title: 'Buluttan ekle',
  },
  local: {
    tabLabel: 'Dosyalarım',
    error: {
      emptyUrl: 'Bir dosya bağlantısı girin',
      readFile: 'Dosya okunamadı',
    },
  },
  settings: {
    tabButton: 'Bağlı hesaplar',
    title: 'Bağlı hesaplar',
    empty: 'Buradaki hiçbir sağlayıcı henüz App Key/Client ID ile girişi desteklemiyor.',
    authenticatedAt: '{date} tarihinde yetkilendirildi',
    authenticatedAtUnknown: 'Yetkilendirme tarihi bilinmiyor',
    notConnected: 'Bağlı değil',
    tokenExpiresIn: 'Jeton {time} içinde sona erecek',
    tokenExpired: 'Jetonun süresi doldu — bir sonraki işlemde otomatik olarak yenilenecek',
    close: 'Kapat',
  },
  dropbox: {
    setup: {
      step1: 'Dropbox App Console’u açın ve "Create app" düğmesine tıklayın.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Herhangi bir uygulama adı girin ve Create app düğmesine tıklayın.',
      step3: 'Permissions sekmesinde files.metadata.read, files.content.read ve files.content.write seçeneklerini işaretleyip Submit düğmesine tıklayın.',
      step4WithRedirect: 'Settings sekmesinde, Redirect URIs bölümüne bunu yapıştırın ve Add düğmesine tıklayın:',
      step4NoRedirect:
        'Settings sekmesinde, Redirect URIs bölümüne kendi alan adınızdaki public/dropbox-callback.html sayfasının tam adresini ekleyin — otomatik olarak algılanamadı (sağlayıcı seçeneklerindeki redirectUri’ye bakın).',
      step5: 'Aynı Settings sekmesinde App key’i kopyalayıp aşağıdaki alana yapıştırın.',
    },
    error: {
      exchangeCode: 'Dropbox: kod bir belirteçle değiştirilemedi (durum {status})',
      requireAppKey: 'Önce bir App Key kaydedin (kurulum sihirbazına bakın).',
      requireRedirectUri:
        'redirectUri otomatik olarak belirlenemedi. Bunu DropboxProvider seçeneklerinde açıkça belirtin (eklenti <script type="module"> veya bir paketleyici ile yükleniyorsa gereklidir).',
      notConnected: 'Dropbox bağlı değil.',
      sessionExpired: 'Dropbox oturumunun süresi doldu, lütfen tekrar giriş yapın.',
      refreshFailed: 'Dropbox: belirteç yenilenemedi (durum {status})',
      uploadFailed: 'Dropbox: yükleme başarısız oldu (durum {status})',
      uploadNetworkError: 'Dropbox: dosya yüklenirken ağ hatası oluştu',
    },
    sessionNote: 'Dropbox oturumunun süre sınırı yoktur: siz çıkış yapana veya erişimi Dropbox’ın kendi ayarlarından iptal edene kadar geçerli kalır.',
  },
  google: {
    setup: {
      step1: 'Google Cloud Console’u açın, bir proje oluşturun (veya mevcut birini seçin), ardından "APIs & Services"i açın.',
      step2: 'Library altında "Google Drive API"yi bulup etkinleştirin.',
      step3:
        '"OAuth consent screen"de User type’ı External olarak ayarlayın, .../auth/drive.readonly scope’unu ekleyin ve kendi Google hesabınızı test user olarak ekleyin (doğrulanmamış bir uygulama yalnızca test user’larla sınırlıdır ve bir uyarı ekranı gösterir — çok sayıda kullanıcıya yayınlamak için Google’ın doğrulama incelemesi gerekir).',
      step4WithOrigin:
        'Credentials → Create Credentials → OAuth client ID altında Application type olarak "Web application"ı seçin ve Authorized JavaScript origins altına bunu yapıştırıp Add düğmesine tıklayın:',
      step4NoOrigin:
        'Credentials → Create Credentials → OAuth client ID altında Application type olarak "Web application"ı seçin ve Authorized JavaScript origins altına bu sitenin sunulduğu tam origin’i (protokol + alan adı + bağlantı noktası) ekleyin — otomatik olarak algılanamadı.',
      step5: 'Aynı ekranda, Client ID’yi (.apps.googleusercontent.com ile biter) kopyalayıp aşağıdaki alana yapıştırın.',
    },
    error: {
      gisLoadFailed: 'Google Identity Services (accounts.google.com/gsi/client) yüklenemedi — ağ bağlantınızı veya bir reklam/betik engelleyiciyi kontrol edin.',
      tokenFailed: 'Google bir erişim belirteci döndürmedi. Tekrar giriş yapmayı deneyin.',
      requireClientId: 'Önce bir Client ID kaydedin (kurulum sihirbazına bakın).',
      notConnected: 'Google Drive bağlı değil.',
      sessionExpired: 'Google oturumunun süresi doldu, lütfen tekrar giriş yapın.',
      fileTooLarge:
        'Dosya {maxMb} MB’den büyük — sunucu olmadığı için Google Drive dosyaları veri URL’si olarak satır içi eklenir, bu yüzden bu dosya eklenemeyecek kadar büyük.',
      uploadFailed: 'Google Drive: yükleme başarısız oldu (durum {status})',
      uploadNetworkError: 'Google Drive: dosya yüklenirken ağ hatası oluştu',
    },
    sessionNote: 'Bu tarayıcıda Google hesabınızda oturum açık kaldığı sürece Google Drive oturumu otomatik olarak (yaklaşık her saat) yenilenir.',
  },
  microsoft: {
    setup: {
      step1: 'Azure Portal → Microsoft Entra ID → App registrations’ı açın ve "New registration"a tıklayın.',
      step2: 'Supported account types altında "Accounts in any organizational directory and personal Microsoft accounts"ı seçin, ardından Register’a tıklayın.',
      step3:
        'API permissions → Add a permission → Microsoft Graph → Delegated permissions altında Files.ReadWrite ve offline_access ekleyin, ardından Add permissions’a tıklayın.',
      step4WithRedirect:
        'Authentication → Add a platform → Single-page application altında, Redirect URIs bölümüne bunu yapıştırın ve Configure’a tıklayın:',
      step4NoRedirect:
        'Authentication → Add a platform → Single-page application altında, Redirect URIs bölümüne kendi alan adınızdaki public/microsoft-callback.html sayfasının tam adresini ekleyin — otomatik olarak algılanamadı (sağlayıcı seçeneklerindeki redirectUri’ye bakın).',
      step5: 'Overview sayfasında Application (client) ID’yi kopyalayıp aşağıdaki alana yapıştırın.',
    },
    error: {
      exchangeCode: 'Microsoft: kod bir belirteçle değiştirilemedi (durum {status})',
      requireClientId: 'Önce bir Application (client) ID kaydedin (kurulum sihirbazına bakın).',
      requireRedirectUri:
        'redirectUri otomatik olarak belirlenemedi. Bunu OneDriveProvider seçeneklerinde açıkça belirtin (eklenti <script type="module"> veya bir paketleyici ile yükleniyorsa gereklidir).',
      notConnected: 'OneDrive bağlı değil.',
      sessionExpired: 'Microsoft oturumunun süresi doldu, lütfen tekrar giriş yapın.',
      refreshFailed: 'Microsoft: belirteç yenilenemedi (durum {status})',
      noSpoLicense:
        'Bu Microsoft hesabının kuruluşunda OneDrive/SharePoint lisansı yok (Microsoft Graph: "Tenant does not have a SPO license"). Kişisel bir Microsoft hesabıyla (outlook.com/hotmail/live) veya kuruluşunda OneDrive for Business etkinleştirilmiş bir iş hesabıyla giriş yapın.',
      noDownloadableContent:
        '"{name}" öğesinin indirilebilir içeriği yok ve eklenemiyor — bu genellikle bir OneNote defteri veya OneDrive tarafından normal bir dosya olarak sunulamayan başka bir öğe türü olduğunda görülür.',
      downloadUrlUnavailable:
        '"{name}" için henüz bir indirme bağlantısı yok — bu, dosya yüklendikten kısa süre sonra veya kuruluşunuz bu dosyanın indirilmesini engelliyorsa oluşabilir. Lütfen birazdan yeniden deneyin.',
      uploadFailed: 'OneDrive: yükleme başarısız oldu (durum {status})',
      uploadNetworkError: 'OneDrive: dosya yüklenirken ağ hatası oluştu',
    },
    sessionNote: 'Microsoft, tarayıcıda çalışan uygulamaların (SPA) oturumunu en fazla 24 saatle sınırlar — bu sürenin ardından yeniden giriş yapmanız gerekir. Bu, eklentinin değil, Microsoft platformunun kendi sınırlamasıdır.',
  },
  box: {
    setup: {
      step1: 'Box Developer Console’u açın ve OAuth 2.0 (User) kimlik doğrulamasıyla yeni bir uygulama oluşturun — daha sonra değiştirilemeyen Server Authentication (JWT/CCG) değil.',
      step2Server: 'Dropbox, Google Drive ve OneDrive’dan farklı olarak Box, oturum açmak için bir Client Secret gerektirir ve Box’ın kendisi bu sırrın asla tarayıcı kodunda bulunmaması gerektiği konusunda uyarır — bu yüzden bu sağlayıcının onu saklayacak küçük bir sunucuya ihtiyacı vardır (aşağıdaki tokenEndpoint seçeneği; hazır bir örnek README’de "Box" bölümünde bulunur).',
      step3: 'Uygulamanın Configuration sayfasında Client ID ve Client Secret’ı kopyalayın. Client ID’yi aşağıya yapıştırın — Client Secret’ı yalnızca sunucunuzun ortam değişkenlerinde saklayın, buraya asla girmeyin.',
      step4WithRedirect: 'Aynı Configuration sayfasında, Redirect URIs bölümüne bunu yapıştırın ve Save’e tıklayın:',
      step4NoRedirect: 'Aynı Configuration sayfasında, Redirect URIs bölümüne kendi alan adınızdaki public/box-callback.html sayfasının tam adresini ekleyin — otomatik olarak algılanamadı (sağlayıcı seçeneklerindeki redirectUri’ye bakın).',
      step5WithOrigin: 'Yine Configuration sayfasında CORS Domains bölümüne kaydırın ve bu origin’i ekleyin (tarayıcının Box API’sini doğrudan çağırabilmesi için gereklidir):',
      step5NoOrigin: 'Yine Configuration sayfasında CORS Domains bölümüne kaydırın ve bu sitenin sunulduğu tam origin’i (protokol + alan adı + port) ekleyin — otomatik olarak algılanamadı.',
      step6: 'Application Scopes altında "Read and write all files and folders stored in Box" seçeneğini etkinleştirin (yükleme/silme gerekmiyorsa Read-only).',
      step7: 'Client ID’yi aşağıdaki alana yapıştırın.',
    },
    error: {
      exchangeCode: 'Box: kod bir belirteçle değiştirilemedi (durum {status})',
      requireClientId: 'Önce bir Client ID kaydedin (kurulum sihirbazına bakın).',
      requireRedirectUri:
        'redirectUri otomatik olarak belirlenemedi. Bunu BoxProvider seçeneklerinde açıkça belirtin (eklenti <script type="module"> veya bir paketleyici ile yükleniyorsa gereklidir).',
      requireTokenEndpoint: 'BoxProvider, tokenEndpoint seçeneğini gerektirir (Box Client Secret’ını saklayan küçük bir sunucunuz) — README’deki "Box" bölümüne bakın.',
      notConnected: 'Box bağlı değil.',
      sessionExpired: 'Box oturumunun süresi doldu, lütfen tekrar giriş yapın.',
      refreshFailed: 'Box: belirteç yenilenemedi (durum {status})',
      downloadFailed: 'Box: "{name}" indirilemedi (ağ/CORS hatası) — README’deki "Box" bölümüne bakın',
      fileTooLarge:
        'Dosya {maxMb} MB’den büyük — indirme proxy’si olmadığı için Box dosyaları data URL olarak eklenir ve bu dosya bunun için çok büyük.',
      uploadFailed: 'Box: yükleme başarısız oldu (durum {status})',
      uploadNetworkError: 'Box: dosya yüklenirken ağ hatası oluştu',
    },
    sessionNote: 'Box yenileme belirteçleri en fazla 60 gün geçerlidir ve her kullanımda yenisiyle değiştirilir — bu siteyi 60 gün boyunca kullanmazsanız yeniden giriş yapmanız gerekir. Bu sağlayıcı ayrıca Box Client Secret’ını tarayıcının dışında tutmak için kendi küçük sunucunuza bağımlıdır.',
  },
  s3: {
    connectMenuItem: 'S3 bağlan',
    modalTitle: 'S3 uyumlu depolama bağla',
    nameLabel: 'Sekme adı',
    namePlaceholder: 'örn. Bucket\'ım',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Bölge',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Özel endpoint (isteğe bağlı)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'AWS S3 için boş bırakın. S3 uyumlu servisler için doldurun (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Path-style URL kullan (çoğu self-hosted/S3 uyumlu endpoint için gerekli)',
    corsHint: 'Bucket, bu siteden CORS isteklerine izin vermelidir (GET, PUT, DELETE, HEAD) — bunu bucket\'ın CORS ayarlarında yapılandırın.',
    connect: 'Bağlan',
    cancel: 'İptal',
    connecting: 'Bağlanıyor…',
    error: {
      required: 'Tüm gerekli alanları doldurun.',
      duplicateName: 'Bu ada sahip bir sekme zaten var.',
      connectFailed: 'Bağlanılamadı: {message}',
      listFailed: 'S3: nesneler listelenemedi (durum {status})',
      uploadFailed: 'S3: yükleme başarısız oldu (durum {status})',
      uploadNetworkError: 'S3: dosya yüklenirken ağ hatası oluştu',
      deleteFailed: 'S3: silme başarısız oldu (durum {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'PKCE ile OAuth girişi, tarayıcıların güvenli olmayan bir kaynakta (localhost hariç düz http) devre dışı bıraktığı Web Crypto API’sini (crypto.subtle) gerektirir. Siteyi https:// üzerinden veya test için http://localhost üzerinden açın.',
      popupBlocked: 'Tarayıcı yetkilendirme açılır penceresini engelledi. Bu site için açılır pencerelere izin verin.',
      stateMismatch: 'Yetkilendirme yanıtı doğrulamayı geçemedi (state eşleşmiyor).',
      popupClosed: 'Giriş tamamlanmadan yetkilendirme penceresi kapatıldı.',
    },
  },
};

export default messages;
