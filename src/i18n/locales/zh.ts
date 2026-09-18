import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: '根目录',
    loading: '加载中…',
    empty: '这里还没有任何内容。',
    loadMore: '更多',
    uploadFile: '上传文件',
    urlPlaceholder: '粘贴文件链接…',
    addUrl: '添加',
    searchPlaceholder: '搜索文件…',
    filter: {
      all: '所有类型',
    },
    settings: '设置',
    refresh: '刷新',
    selectedCount: '已选择 {count} 项',
    cancelSelection: '取消',
    insertSelected: '插入（{count}）',
    openInTab: '在新标签页中打开',
    delete: '删除',
    deleteConfirm: '确定删除？',
    viewGrid: '网格视图',
    viewTable: '表格视图',
    viewTree: '树形视图',
    columnName: '名称',
    columnType: '类型',
    columnSize: '大小',
    columnModified: '修改时间',
    type: {
      image: '图片',
      video: '视频',
      audio: '音频',
      document: '文档',
      folder: '文件夹',
      other: '文件',
    },
    error: {
      generic: '文件列表加载失败',
    },
    dropzone: {
      active: '拖放以上传',
    },
    upload: {
      queueTitle: '正在上传 {done}/{total}',
      uploading: '上传中…',
      done: '完成',
      error: '失败',
      close: '关闭',
    },
    tree: {
      expandAll: '全部展开',
      collapseAll: '全部折叠',
      expandFolder: '展开文件夹',
      collapseFolder: '折叠文件夹',
    },
    addConnection: '添加连接',
    moreTabs: '更多标签',
    removeConnection: '移除',
    removeConnectionConfirm: '确定移除？',
  },
  auth: {
    connectPrompt: '连接 {provider} 以从这里选择文件。',
    loginButton: '登录 {provider}',
    loggingIn: '正在打开授权窗口…',
    loginFailed: '登录失败。',
    changeAppKey: '更改 App Key',
    logout: '退出登录',
    logoutConfirm: '确定退出登录？',
  },
  setup: {
    missingInfo: '{provider} 需要进行设置，但没有可用的说明。',
    intro: '要连接 {provider}，请先在其开发者控制台中创建一个应用：',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: '保存',
    saveFailed: '保存 App Key 失败。',
    copy: '复制',
    copied: '已复制',
    selected: '已选中，请按 Ctrl+C',
    uploadHint: '连接后，您也可以通过将文件（或整个文件夹）拖到列表中，或使用上方的"上传"按钮来上传文件。',
  },
  block: {
    label: '云媒体',
    category: '存储',
  },
  button: {
    label: '从云端插入',
  },
  modal: {
    title: '从云端插入',
  },
  local: {
    tabLabel: '我的文件',
    error: {
      emptyUrl: '请输入文件链接',
      readFile: '读取文件失败',
    },
  },
  dropbox: {
    setup: {
      step1: '打开 Dropbox App Console，点击 "Create app"。',
      step2: 'Choose an API → Scoped access。Type of access → Full Dropbox。输入任意应用名称后点击 Create app。',
      step3: '在 Permissions 选项卡中勾选 files.metadata.read、files.content.read 和 files.content.write，然后点击 Submit。',
      step4WithRedirect: '在 Settings 选项卡的 Redirect URIs 中粘贴以下内容并点击 Add：',
      step4NoRedirect:
        '在 Settings 选项卡的 Redirect URIs 中添加您域名下 public/dropbox-callback.html 页面的完整网址 —— 未能自动检测到该地址（请参见提供方选项中的 redirectUri）。',
      step5: '在同一个 Settings 选项卡中复制 App key，并粘贴到下面的输入框中。',
    },
    error: {
      exchangeCode: 'Dropbox：无法用 code 换取令牌（状态码 {status}）',
      requireAppKey: '请先保存 App Key（参见设置向导）。',
      requireRedirectUri:
        '无法自动确定 redirectUri。请在 DropboxProvider 选项中显式指定（当插件通过 <script type="module"> 或打包工具加载时需要）。',
      notConnected: 'Dropbox 尚未连接。',
      sessionExpired: 'Dropbox 会话已过期，请重新登录。',
      refreshFailed: 'Dropbox：刷新令牌失败（状态码 {status}）',
      uploadFailed: 'Dropbox：上传失败（状态码 {status}）',
      uploadNetworkError: 'Dropbox：上传文件时发生网络错误',
    },
  },
  google: {
    setup: {
      step1: '打开 Google Cloud Console，创建一个项目（或选择一个现有项目），然后打开 "APIs & Services"。',
      step2: '在 Library 中找到并启用 "Google Drive API"。',
      step3:
        '在 "OAuth consent screen" 中，将 User type 设置为 External，添加 scope .../auth/drive.readonly，并将您自己的 Google 账号添加为 test user（未经验证的应用仅限 test user 使用，并会显示警告页面 —— 面向大量用户发布需要通过 Google 的验证审核）。',
      step4WithOrigin:
        '在 Credentials → Create Credentials → OAuth client ID 中，选择 Application type 为 "Web application"，然后在 Authorized JavaScript origins 中粘贴以下内容并点击 Add：',
      step4NoOrigin:
        '在 Credentials → Create Credentials → OAuth client ID 中，选择 Application type 为 "Web application"，然后在 Authorized JavaScript origins 中添加此站点所使用的确切 origin（协议 + 域名 + 端口）—— 未能自动检测到。',
      step5: '在同一屏幕上，复制 Client ID（以 .apps.googleusercontent.com 结尾）并粘贴到下面的输入框中。',
    },
    error: {
      gisLoadFailed: '无法加载 Google Identity Services（accounts.google.com/gsi/client）—— 请检查您的网络连接或广告/脚本拦截程序。',
      tokenFailed: 'Google 未返回访问令牌。请重新登录。',
      requireClientId: '请先保存 Client ID（参见设置向导）。',
      notConnected: 'Google Drive 尚未连接。',
      sessionExpired: 'Google 会话已过期，请重新登录。',
      fileTooLarge:
        '文件大于 {maxMb} MB —— 由于没有服务器，Google Drive 文件会以 data URL 的形式内联插入，因此该文件太大，无法插入。',
      uploadFailed: 'Google Drive：上传失败（状态码 {status}）',
      uploadNetworkError: 'Google Drive：上传文件时发生网络错误',
    },
  },
  microsoft: {
    setup: {
      step1: '打开 Azure Portal → Microsoft Entra ID → App registrations，然后点击 "New registration"。',
      step2: '在 Supported account types 中选择 "Accounts in any organizational directory and personal Microsoft accounts"，然后点击 Register。',
      step3:
        '在 API permissions → Add a permission → Microsoft Graph → Delegated permissions 中添加 Files.ReadWrite 和 offline_access，然后点击 Add permissions。',
      step4WithRedirect:
        '在 Authentication → Add a platform → Single-page application 中，将以下内容粘贴到 Redirect URIs，然后点击 Configure：',
      step4NoRedirect:
        '在 Authentication → Add a platform → Single-page application 中，将您域名下 public/microsoft-callback.html 页面的完整网址添加到 Redirect URIs —— 未能自动检测到该地址（请参见提供方选项中的 redirectUri）。',
      step5: '在 Overview 页面上，复制 Application (client) ID 并粘贴到下面的输入框中。',
    },
    error: {
      exchangeCode: 'Microsoft：无法用 code 换取令牌（状态码 {status}）',
      requireClientId: '请先保存 Application (client) ID（参见设置向导）。',
      requireRedirectUri:
        '无法自动确定 redirectUri。请在 OneDriveProvider 选项中显式指定（当插件通过 <script type="module"> 或打包工具加载时需要）。',
      notConnected: 'OneDrive 尚未连接。',
      sessionExpired: 'Microsoft 会话已过期，请重新登录。',
      refreshFailed: 'Microsoft：刷新令牌失败（状态码 {status}）',
      noSpoLicense:
        '此 Microsoft 账号所属组织未获得 OneDrive/SharePoint 许可（Microsoft Graph："Tenant does not have a SPO license"）。请使用个人 Microsoft 账号（outlook.com/hotmail/live）登录，或使用组织已启用 OneDrive for Business 的工作账号登录。',
      noDownloadableContent:
        '"{name}" 没有可下载的内容，无法插入 —— 这通常是因为它是 OneNote 笔记本，或是 OneDrive 无法作为普通文件提供的其他类型的项目。',
      uploadFailed: 'OneDrive：上传失败（状态码 {status}）',
      uploadNetworkError: 'OneDrive：上传文件时发生网络错误',
    },
  },
  s3: {
    connectMenuItem: '连接 S3',
    modalTitle: '连接兼容 S3 的存储',
    nameLabel: '标签名称',
    namePlaceholder: '例如：我的存储桶',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: '区域',
    regionPlaceholder: 'us-east-1',
    endpointLabel: '自定义端点（可选）',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'AWS S3 留空即可。用于 S3 兼容服务（MinIO、Wasabi、DigitalOcean Spaces、Cloudflare R2 等）时填写此项。',
    forcePathStyleLabel: '使用路径样式 URL（大多数自托管/S3 兼容端点需要）',
    corsHint: '存储桶必须允许来自本站点的 CORS 请求（GET、PUT、DELETE、HEAD）——请在存储桶的 CORS 设置中配置。',
    connect: '连接',
    cancel: '取消',
    connecting: '连接中…',
    error: {
      required: '请填写所有必填字段。',
      duplicateName: '已存在同名标签。',
      connectFailed: '连接失败：{message}',
      listFailed: 'S3：获取对象列表失败（状态码 {status}）',
      uploadFailed: 'S3：上传失败（状态码 {status}）',
      uploadNetworkError: 'S3：上传文件时发生网络错误',
      deleteFailed: 'S3：删除失败（状态码 {status}）',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        '通过 PKCE 进行 OAuth 登录需要 Web Crypto API（crypto.subtle），浏览器会在不安全的源（普通 http，localhost 除外）上禁用该 API。请通过 https:// 打开网站，或在测试时通过 http://localhost 打开。',
      popupBlocked: '浏览器阻止了授权弹出窗口。请为此网站允许弹出窗口。',
      stateMismatch: '授权响应未通过验证（state 不匹配）。',
      popupClosed: '在登录完成之前授权窗口已被关闭。',
    },
  },
};

export default messages;
