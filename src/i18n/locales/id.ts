import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Akar',
    loading: 'Memuat…',
    empty: 'Belum ada apa pun di sini.',
    loadMore: 'Lainnya',
    uploadFile: 'Unggah file',
    urlPlaceholder: 'Tempel tautan ke sebuah file…',
    addUrl: 'Tambah',
    searchPlaceholder: 'Cari file…',
    filter: {
      all: 'Semua jenis',
    },
    settings: 'Pengaturan',
    refresh: 'Segarkan',
    selectedCount: '{count} dipilih',
    cancelSelection: 'Batal',
    insertSelected: 'Sisipkan ({count})',
    openInTab: 'Buka di tab baru',
    delete: 'Hapus',
    deleteConfirm: 'Konfirmasi hapus?',
    viewGrid: 'Tampilan kisi',
    viewTable: 'Tampilan tabel',
    viewTree: 'Tampilan pohon',
    columnName: 'Nama',
    columnType: 'Jenis',
    columnSize: 'Ukuran',
    columnModified: 'Diubah',
    type: {
      image: 'Gambar',
      video: 'Video',
      audio: 'Audio',
      document: 'Dokumen',
      folder: 'Folder',
      other: 'File',
    },
    error: {
      generic: 'Gagal memuat daftar file',
      insertFailed: 'Gagal menyisipkan file ini',
    },
    dropzone: {
      active: 'Lepaskan untuk mengunggah',
    },
    upload: {
      queueTitle: 'Mengunggah {done}/{total}',
      uploading: 'Mengunggah…',
      done: 'Selesai',
      error: 'Gagal',
      close: 'Tutup',
    },
    tree: {
      expandAll: 'Perluas semua',
      collapseAll: 'Ciutkan semua',
      expandFolder: 'Perluas folder',
      collapseFolder: 'Ciutkan folder',
    },
    addConnection: 'Tambah koneksi',
    moreTabs: 'Tab lainnya',
    removeConnection: 'Hapus',
    removeConnectionConfirm: 'Konfirmasi hapus?',
  },
  auth: {
    connectPrompt: 'Hubungkan {provider} untuk memilih file dari sini.',
    loginButton: 'Masuk ke {provider}',
    loggingIn: 'Membuka jendela otorisasi…',
    loginFailed: 'Gagal masuk.',
    changeAppKey: 'Ubah App Key',
    logout: 'Keluar',
    logoutConfirm: 'Konfirmasi keluar?',
  },
  setup: {
    missingInfo: '{provider} memerlukan penyiapan, tetapi tidak ada instruksi yang tersedia.',
    intro: 'Untuk menghubungkan {provider}, buat dulu aplikasi di konsol pengembangnya: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Simpan',
    saveFailed: 'Gagal menyimpan App Key.',
    copy: 'Salin',
    copied: 'Disalin',
    selected: 'Dipilih, tekan Ctrl+C',
    uploadHint: 'Setelah terhubung, Anda juga dapat mengunggah file dengan menyeretnya (atau seluruh folder) ke dalam daftar, atau dengan tombol Unggah di atas.',
  },
  block: {
    label: 'Media cloud',
    category: 'Penyimpanan',
  },
  button: {
    label: 'Sisipkan dari cloud',
  },
  modal: {
    title: 'Sisipkan dari cloud',
  },
  local: {
    tabLabel: 'File saya',
    error: {
      emptyUrl: 'Masukkan tautan ke sebuah file',
      readFile: 'Gagal membaca file',
    },
  },
  dropbox: {
    setup: {
      step1: 'Buka Dropbox App Console dan klik "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Masukkan nama aplikasi apa saja lalu klik Create app.',
      step3: 'Pada tab Permissions, centang files.metadata.read, files.content.read, dan files.content.write, lalu klik Submit.',
      step4WithRedirect: 'Pada tab Settings, di bagian Redirect URIs, tempel ini lalu klik Add:',
      step4NoRedirect:
        'Pada tab Settings, di bagian Redirect URIs, tambahkan URL lengkap halaman public/dropbox-callback.html pada domain Anda — tidak dapat dideteksi secara otomatis (lihat redirectUri pada opsi provider).',
      step5: 'Pada tab Settings yang sama, salin App key lalu tempel di kolom di bawah.',
    },
    error: {
      exchangeCode: 'Dropbox: gagal menukar code dengan token (status {status})',
      requireAppKey: 'Simpan App Key terlebih dahulu (lihat wizard penyiapan).',
      requireRedirectUri:
        'Tidak dapat menentukan redirectUri secara otomatis. Tentukan secara eksplisit pada opsi DropboxProvider (diperlukan jika plugin dimuat melalui <script type="module"> atau bundler).',
      notConnected: 'Dropbox belum terhubung.',
      sessionExpired: 'Sesi Dropbox telah berakhir, silakan masuk kembali.',
      refreshFailed: 'Dropbox: gagal memperbarui token (status {status})',
      uploadFailed: 'Dropbox: unggah gagal (status {status})',
      uploadNetworkError: 'Dropbox: kesalahan jaringan saat mengunggah file',
    },
  },
  google: {
    setup: {
      step1: 'Buka Google Cloud Console, buat proyek (atau pilih yang sudah ada), lalu buka "APIs & Services".',
      step2: 'Pada Library, cari dan aktifkan "Google Drive API".',
      step3:
        'Pada "OAuth consent screen", atur User type ke External, tambahkan scope .../auth/drive.readonly, dan tambahkan akun Google Anda sendiri sebagai test user (aplikasi yang belum diverifikasi hanya terbatas untuk pengguna uji dan menampilkan layar peringatan — mempublikasikan untuk banyak pengguna memerlukan proses verifikasi Google).',
      step4WithOrigin:
        'Pada Credentials → Create Credentials → OAuth client ID, pilih Application type "Web application", lalu pada Authorized JavaScript origins tempel ini dan klik Add:',
      step4NoOrigin:
        'Pada Credentials → Create Credentials → OAuth client ID, pilih Application type "Web application", lalu pada Authorized JavaScript origins tambahkan origin yang tepat (protokol + domain + port) tempat situs ini disajikan — tidak dapat dideteksi secara otomatis.',
      step5: 'Pada layar yang sama, salin Client ID (diakhiri dengan .apps.googleusercontent.com) lalu tempel di kolom di bawah.',
    },
    error: {
      gisLoadFailed: 'Gagal memuat Google Identity Services (accounts.google.com/gsi/client) — periksa koneksi jaringan Anda atau pemblokir iklan/skrip.',
      tokenFailed: 'Google tidak mengembalikan token akses. Coba masuk lagi.',
      requireClientId: 'Simpan Client ID terlebih dahulu (lihat wizard penyiapan).',
      notConnected: 'Google Drive belum terhubung.',
      sessionExpired: 'Sesi Google telah berakhir, silakan masuk kembali.',
      fileTooLarge:
        'File lebih besar dari {maxMb} MB — file Google Drive disisipkan sebagai data URL karena tidak ada server, jadi file ini terlalu besar untuk disisipkan.',
      uploadFailed: 'Google Drive: unggah gagal (status {status})',
      uploadNetworkError: 'Google Drive: kesalahan jaringan saat mengunggah file',
    },
  },
  microsoft: {
    setup: {
      step1: 'Buka Azure Portal → Microsoft Entra ID → App registrations, lalu klik "New registration".',
      step2: 'Pada Supported account types, pilih "Accounts in any organizational directory and personal Microsoft accounts", lalu klik Register.',
      step3:
        'Pada API permissions → Add a permission → Microsoft Graph → Delegated permissions, tambahkan Files.ReadWrite dan offline_access, lalu klik Add permissions.',
      step4WithRedirect:
        'Pada Authentication → Add a platform → Single-page application, tempel ini pada Redirect URIs lalu klik Configure:',
      step4NoRedirect:
        'Pada Authentication → Add a platform → Single-page application, tambahkan URL lengkap halaman public/microsoft-callback.html pada domain Anda pada Redirect URIs — tidak dapat dideteksi secara otomatis (lihat redirectUri pada opsi provider).',
      step5: 'Pada halaman Overview, salin Application (client) ID lalu tempel di kolom di bawah.',
    },
    error: {
      exchangeCode: 'Microsoft: gagal menukar code dengan token (status {status})',
      requireClientId: 'Simpan Application (client) ID terlebih dahulu (lihat wizard penyiapan).',
      requireRedirectUri:
        'Tidak dapat menentukan redirectUri secara otomatis. Tentukan secara eksplisit pada opsi OneDriveProvider (diperlukan jika plugin dimuat melalui <script type="module"> atau bundler).',
      notConnected: 'OneDrive belum terhubung.',
      sessionExpired: 'Sesi Microsoft telah berakhir, silakan masuk kembali.',
      refreshFailed: 'Microsoft: gagal memperbarui token (status {status})',
      noSpoLicense:
        'Organisasi akun Microsoft ini tidak memiliki lisensi OneDrive/SharePoint (Microsoft Graph: "Tenant does not have a SPO license"). Masuk dengan akun Microsoft pribadi (outlook.com/hotmail/live) atau akun kerja yang organisasinya telah mengaktifkan OneDrive for Business.',
      noDownloadableContent:
        '"{name}" tidak memiliki konten yang dapat diunduh — biasanya ini adalah notebook OneNote atau jenis item lain yang tidak dapat disajikan OneDrive sebagai file biasa.',
      downloadUrlUnavailable:
        '"{name}" belum memiliki tautan unduhan — ini bisa terjadi tepat setelah mengunggah, atau jika organisasi Anda memblokir pengunduhan file ini. Coba lagi sebentar lagi.',
      uploadFailed: 'OneDrive: unggah gagal (status {status})',
      uploadNetworkError: 'OneDrive: kesalahan jaringan saat mengunggah file',
    },
  },
  s3: {
    connectMenuItem: 'Hubungkan S3',
    modalTitle: 'Hubungkan penyimpanan yang kompatibel dengan S3',
    nameLabel: 'Nama tab',
    namePlaceholder: 'misalnya Bucket saya',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Wilayah',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint khusus (opsional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Biarkan kosong untuk AWS S3. Isi untuk layanan yang kompatibel dengan S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Gunakan URL gaya path (diperlukan untuk sebagian besar endpoint self-hosted/kompatibel S3)',
    corsHint: 'Bucket harus mengizinkan permintaan CORS dari situs ini (GET, PUT, DELETE, HEAD) — konfigurasikan ini di pengaturan CORS bucket.',
    connect: 'Hubungkan',
    cancel: 'Batal',
    connecting: 'Menghubungkan…',
    error: {
      required: 'Isi semua kolom yang wajib diisi.',
      duplicateName: 'Tab dengan nama ini sudah ada.',
      connectFailed: 'Gagal terhubung: {message}',
      listFailed: 'S3: gagal mengambil daftar objek (status {status})',
      uploadFailed: 'S3: unggah gagal (status {status})',
      uploadNetworkError: 'S3: kesalahan jaringan saat mengunggah file',
      deleteFailed: 'S3: gagal menghapus (status {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Login OAuth melalui PKCE memerlukan Web Crypto API (crypto.subtle), yang dinonaktifkan browser pada origin yang tidak aman (http biasa, selain localhost). Buka situs melalui https:// atau, untuk pengujian, melalui http://localhost.',
      popupBlocked: 'Browser memblokir jendela pop-up otorisasi. Izinkan pop-up untuk situs ini.',
      stateMismatch: 'Respons otorisasi gagal diverifikasi (state tidak cocok).',
      popupClosed: 'Jendela otorisasi ditutup sebelum login selesai.',
    },
  },
};

export default messages;
