import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Thư mục gốc',
    loading: 'Đang tải…',
    empty: 'Chưa có gì ở đây.',
    loadMore: 'Thêm',
    uploadFile: 'Tải tệp lên',
    urlPlaceholder: 'Dán liên kết đến một tệp…',
    addUrl: 'Thêm',
    searchPlaceholder: 'Tìm kiếm tệp…',
    filter: {
      all: 'Tất cả loại',
    },
    settings: 'Cài đặt',
    refresh: 'Làm mới',
    selectedCount: 'Đã chọn {count}',
    cancelSelection: 'Hủy',
    insertSelected: 'Chèn ({count})',
    openInTab: 'Mở trong tab mới',
    delete: 'Xóa',
    deleteConfirm: 'Xác nhận xóa?',
    viewGrid: 'Chế độ xem lưới',
    viewTable: 'Chế độ xem bảng',
    viewTree: 'Chế độ xem cây',
    columnName: 'Tên',
    columnType: 'Loại',
    columnSize: 'Kích thước',
    columnModified: 'Đã sửa đổi',
    type: {
      image: 'Hình ảnh',
      video: 'Video',
      audio: 'Âm thanh',
      document: 'Tài liệu',
      folder: 'Thư mục',
      other: 'Tệp',
    },
    error: {
      generic: 'Không thể tải danh sách tệp',
      insertFailed: 'Không thể chèn tệp này',
    },
    dropzone: {
      active: 'Thả để tải lên',
    },
    upload: {
      queueTitle: 'Đang tải lên {done}/{total}',
      uploading: 'Đang tải lên…',
      done: 'Xong',
      error: 'Thất bại',
      close: 'Đóng',
    },
    tree: {
      expandAll: 'Mở rộng tất cả',
      collapseAll: 'Thu gọn tất cả',
      expandFolder: 'Mở rộng thư mục',
      collapseFolder: 'Thu gọn thư mục',
    },
    addConnection: 'Thêm kết nối',
    moreTabs: 'Thêm thẻ',
    removeConnection: 'Xóa',
    removeConnectionConfirm: 'Xác nhận xóa?',
  },
  auth: {
    connectPrompt: 'Kết nối {provider} để chọn tệp từ đây.',
    loginButton: 'Đăng nhập vào {provider}',
    loggingIn: 'Đang mở cửa sổ ủy quyền…',
    loginFailed: 'Đăng nhập không thành công.',
    changeAppKey: 'Đổi App Key',
    logout: 'Đăng xuất',
    logoutConfirm: 'Xác nhận đăng xuất?',
  },
  setup: {
    missingInfo: '{provider} cần được thiết lập, nhưng không có hướng dẫn nào.',
    intro: 'Để kết nối {provider}, trước tiên hãy tạo một ứng dụng trong bảng điều khiển dành cho nhà phát triển: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Lưu',
    saveFailed: 'Không thể lưu App Key.',
    copy: 'Sao chép',
    copied: 'Đã sao chép',
    selected: 'Đã chọn, nhấn Ctrl+C',
    uploadHint: 'Sau khi kết nối, bạn cũng có thể tải tệp lên bằng cách kéo chúng (hoặc cả một thư mục) vào danh sách, hoặc dùng nút Tải lên ở trên.',
  },
  block: {
    label: 'Media đám mây',
    category: 'Lưu trữ',
  },
  button: {
    label: 'Chèn từ đám mây',
  },
  modal: {
    title: 'Chèn từ đám mây',
  },
  local: {
    tabLabel: 'Tệp của tôi',
    error: {
      emptyUrl: 'Nhập liên kết đến một tệp',
      readFile: 'Không thể đọc tệp',
    },
  },
  dropbox: {
    setup: {
      step1: 'Mở Dropbox App Console và nhấp vào "Create app".',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Nhập bất kỳ tên ứng dụng nào rồi nhấp Create app.',
      step3: 'Trong tab Permissions, chọn files.metadata.read, files.content.read và files.content.write, sau đó nhấp Submit.',
      step4WithRedirect: 'Trong tab Settings, ở mục Redirect URIs, dán nội dung này rồi nhấp Add:',
      step4NoRedirect:
        'Trong tab Settings, ở mục Redirect URIs, thêm URL đầy đủ của trang public/dropbox-callback.html trên tên miền của bạn — không thể tự động phát hiện (xem redirectUri trong tùy chọn của provider).',
      step5: 'Cũng trong tab Settings đó, sao chép App key và dán vào ô bên dưới.',
    },
    error: {
      exchangeCode: 'Dropbox: không thể đổi code lấy token (trạng thái {status})',
      requireAppKey: 'Hãy lưu App Key trước (xem trình hướng dẫn thiết lập).',
      requireRedirectUri:
        'Không thể tự động xác định redirectUri. Hãy chỉ định rõ trong tùy chọn của DropboxProvider (cần thiết nếu plugin được tải qua <script type="module"> hoặc một bundler).',
      notConnected: 'Dropbox chưa được kết nối.',
      sessionExpired: 'Phiên Dropbox đã hết hạn, vui lòng đăng nhập lại.',
      refreshFailed: 'Dropbox: không thể làm mới token (trạng thái {status})',
      uploadFailed: 'Dropbox: tải lên không thành công (trạng thái {status})',
      uploadNetworkError: 'Dropbox: lỗi mạng khi tải tệp lên',
    },
  },
  google: {
    setup: {
      step1: 'Mở Google Cloud Console, tạo một dự án (hoặc chọn một dự án có sẵn), sau đó mở "APIs & Services".',
      step2: 'Trong Library, tìm và bật "Google Drive API".',
      step3:
        'Trong "OAuth consent screen", đặt User type thành External, thêm scope .../auth/drive.readonly và thêm tài khoản Google của riêng bạn làm test user (một ứng dụng chưa được xác minh chỉ giới hạn cho test user và hiển thị màn hình cảnh báo — để xuất bản cho nhiều người dùng cần trải qua quá trình xác minh của Google).',
      step4WithOrigin:
        'Trong Credentials → Create Credentials → OAuth client ID, chọn Application type là "Web application", rồi trong Authorized JavaScript origins dán nội dung này vào và nhấp Add:',
      step4NoOrigin:
        'Trong Credentials → Create Credentials → OAuth client ID, chọn Application type là "Web application", rồi trong Authorized JavaScript origins thêm chính xác origin (giao thức + tên miền + cổng) mà trang web này đang chạy từ đó — không thể tự động phát hiện.',
      step5: 'Trên cùng màn hình đó, sao chép Client ID (kết thúc bằng .apps.googleusercontent.com) và dán vào ô bên dưới.',
    },
    error: {
      gisLoadFailed: 'Không thể tải Google Identity Services (accounts.google.com/gsi/client) — hãy kiểm tra kết nối mạng hoặc trình chặn quảng cáo/script.',
      tokenFailed: 'Google không trả về access token. Hãy thử đăng nhập lại.',
      requireClientId: 'Hãy lưu Client ID trước (xem trình hướng dẫn thiết lập).',
      notConnected: 'Google Drive chưa được kết nối.',
      sessionExpired: 'Phiên Google đã hết hạn, vui lòng đăng nhập lại.',
      fileTooLarge:
        'Tệp lớn hơn {maxMb} MB — do không có máy chủ nên các tệp Google Drive được chèn dạng data URL, vì vậy tệp này quá lớn để chèn.',
      uploadFailed: 'Google Drive: tải lên không thành công (trạng thái {status})',
      uploadNetworkError: 'Google Drive: lỗi mạng khi tải tệp lên',
    },
  },
  microsoft: {
    setup: {
      step1: 'Mở Azure Portal → Microsoft Entra ID → App registrations, rồi nhấp "New registration".',
      step2: 'Trong Supported account types, chọn "Accounts in any organizational directory and personal Microsoft accounts", sau đó nhấp Register.',
      step3:
        'Trong API permissions → Add a permission → Microsoft Graph → Delegated permissions, thêm Files.ReadWrite và offline_access, sau đó nhấp Add permissions.',
      step4WithRedirect:
        'Trong Authentication → Add a platform → Single-page application, dán nội dung này vào Redirect URIs rồi nhấp Configure:',
      step4NoRedirect:
        'Trong Authentication → Add a platform → Single-page application, thêm URL đầy đủ của trang public/microsoft-callback.html trên tên miền của bạn vào Redirect URIs — không thể tự động phát hiện (xem redirectUri trong tùy chọn của provider).',
      step5: 'Trên trang Overview, sao chép Application (client) ID và dán vào ô bên dưới.',
    },
    error: {
      exchangeCode: 'Microsoft: không thể đổi code lấy token (trạng thái {status})',
      requireClientId: 'Hãy lưu Application (client) ID trước (xem trình hướng dẫn thiết lập).',
      requireRedirectUri:
        'Không thể tự động xác định redirectUri. Hãy chỉ định rõ trong tùy chọn của OneDriveProvider (cần thiết nếu plugin được tải qua <script type="module"> hoặc một bundler).',
      notConnected: 'OneDrive chưa được kết nối.',
      sessionExpired: 'Phiên Microsoft đã hết hạn, vui lòng đăng nhập lại.',
      refreshFailed: 'Microsoft: không thể làm mới token (trạng thái {status})',
      noSpoLicense:
        'Tổ chức của tài khoản Microsoft này chưa được cấp phép OneDrive/SharePoint (Microsoft Graph: "Tenant does not have a SPO license"). Hãy đăng nhập bằng tài khoản Microsoft cá nhân (outlook.com/hotmail/live) hoặc tài khoản công việc mà tổ chức đã bật OneDrive for Business.',
      noDownloadableContent:
        '"{name}" không có nội dung để tải xuống nên không thể chèn — trường hợp này thường gặp ở sổ tay OneNote hoặc các loại mục khác mà OneDrive không thể cung cấp dưới dạng tệp thông thường.',
      downloadUrlUnavailable:
        '"{name}" chưa có liên kết tải xuống — điều này có thể xảy ra ngay sau khi tải lên, hoặc nếu tổ chức của bạn chặn việc tải xuống tệp này. Vui lòng thử lại sau một chút.',
      uploadFailed: 'OneDrive: tải lên không thành công (trạng thái {status})',
      uploadNetworkError: 'OneDrive: lỗi mạng khi tải tệp lên',
    },
  },
  s3: {
    connectMenuItem: 'Kết nối S3',
    modalTitle: 'Kết nối bộ nhớ tương thích S3',
    nameLabel: 'Tên thẻ',
    namePlaceholder: 'ví dụ: Bucket của tôi',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Khu vực',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint tùy chỉnh (không bắt buộc)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Để trống với AWS S3. Điền cho các dịch vụ tương thích S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Sử dụng URL kiểu path (cần cho hầu hết endpoint tự lưu trữ/tương thích S3)',
    corsHint: 'Bucket phải cho phép các yêu cầu CORS từ trang này (GET, PUT, DELETE, HEAD) — hãy cấu hình điều này trong cài đặt CORS của bucket.',
    connect: 'Kết nối',
    cancel: 'Hủy',
    connecting: 'Đang kết nối…',
    error: {
      required: 'Vui lòng điền đầy đủ các trường bắt buộc.',
      duplicateName: 'Đã có thẻ với tên này.',
      connectFailed: 'Không thể kết nối: {message}',
      listFailed: 'S3: không thể lấy danh sách đối tượng (trạng thái {status})',
      uploadFailed: 'S3: tải lên không thành công (trạng thái {status})',
      uploadNetworkError: 'S3: lỗi mạng khi tải tệp lên',
      deleteFailed: 'S3: xóa không thành công (trạng thái {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'Đăng nhập OAuth bằng PKCE yêu cầu Web Crypto API (crypto.subtle), thứ mà trình duyệt vô hiệu hóa trên nguồn gốc không an toàn (http thông thường, ngoại trừ localhost). Hãy mở trang web qua https:// hoặc, để kiểm thử, qua http://localhost.',
      popupBlocked: 'Trình duyệt đã chặn cửa sổ bật lên ủy quyền. Hãy cho phép cửa sổ bật lên đối với trang web này.',
      stateMismatch: 'Phản hồi ủy quyền không vượt qua xác minh (state không khớp).',
      popupClosed: 'Cửa sổ ủy quyền đã bị đóng trước khi đăng nhập hoàn tất.',
    },
  },
};

export default messages;
