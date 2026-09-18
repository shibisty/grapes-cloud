import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: '루트',
    loading: '불러오는 중…',
    empty: '아직 여기에 아무것도 없습니다.',
    loadMore: '더',
    uploadFile: '파일 업로드',
    urlPlaceholder: '파일 링크를 붙여넣으세요…',
    addUrl: '추가',
    searchPlaceholder: '파일 검색…',
    filter: {
      all: '모든 유형',
    },
    settings: '설정',
    refresh: '새로고침',
    selectedCount: '{count}개 선택됨',
    cancelSelection: '취소',
    insertSelected: '삽입 ({count})',
    openInTab: '새 탭에서 열기',
    delete: '삭제',
    deleteConfirm: '삭제할까요?',
    viewGrid: '그리드 보기',
    viewTable: '표 보기',
    viewTree: '트리 보기',
    columnName: '이름',
    columnType: '유형',
    columnSize: '크기',
    columnModified: '수정됨',
    type: {
      image: '이미지',
      video: '동영상',
      audio: '오디오',
      document: '문서',
      folder: '폴더',
      other: '파일',
    },
    error: {
      generic: '파일 목록을 불러오지 못했습니다',
      insertFailed: '이 파일을 삽입하지 못했습니다',
    },
    dropzone: {
      active: '놓아서 업로드',
    },
    upload: {
      queueTitle: '{done}/{total}개 업로드 중',
      uploading: '업로드 중…',
      done: '완료',
      error: '실패',
      close: '닫기',
    },
    tree: {
      expandAll: '모두 펼치기',
      collapseAll: '모두 접기',
      expandFolder: '폴더 펼치기',
      collapseFolder: '폴더 접기',
    },
    addConnection: '연결 추가',
    moreTabs: '탭 더보기',
    removeConnection: '제거',
    removeConnectionConfirm: '제거할까요?',
  },
  auth: {
    connectPrompt: '여기서 파일을 선택하려면 {provider}를 연결하세요.',
    loginButton: '{provider}에 로그인',
    loggingIn: '인증 창을 여는 중…',
    loginFailed: '로그인에 실패했습니다.',
    changeAppKey: 'App Key 변경',
    logout: '로그아웃',
    logoutConfirm: '로그아웃할까요?',
  },
  setup: {
    missingInfo: '{provider} 설정이 필요하지만 사용 가능한 안내가 없습니다.',
    intro: '{provider}를 연결하려면 먼저 해당 개발자 콘솔에서 앱을 만드세요: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: '저장',
    saveFailed: 'App Key를 저장하지 못했습니다.',
    copy: '복사',
    copied: '복사됨',
    selected: '선택됨, Ctrl+C를 누르세요',
    uploadHint: '연결되면 파일(또는 폴더 전체)을 목록으로 끌어다 놓거나 위의 업로드 버튼을 사용해 파일을 업로드할 수도 있습니다.',
  },
  block: {
    label: '클라우드 미디어',
    category: '스토리지',
  },
  button: {
    label: '클라우드에서 삽입',
  },
  modal: {
    title: '클라우드에서 삽입',
  },
  local: {
    tabLabel: '내 파일',
    error: {
      emptyUrl: '파일 링크를 입력하세요',
      readFile: '파일을 읽지 못했습니다',
    },
  },
  dropbox: {
    setup: {
      step1: 'Dropbox App Console을 열고 "Create app"을 클릭하세요.',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. 원하는 앱 이름을 입력하고 Create app을 클릭하세요.',
      step3: 'Permissions 탭에서 files.metadata.read, files.content.read, files.content.write를 선택한 다음 Submit을 클릭하세요.',
      step4WithRedirect: 'Settings 탭의 Redirect URIs에서 아래 값을 붙여넣고 Add를 클릭하세요:',
      step4NoRedirect:
        'Settings 탭의 Redirect URIs에서 사용 중인 도메인의 public/dropbox-callback.html 페이지 전체 URL을 추가하세요 — 자동으로 감지할 수 없었습니다(제공자 옵션의 redirectUri 참고).',
      step5: '같은 Settings 탭에서 App key를 복사하여 아래 입력란에 붙여넣으세요.',
    },
    error: {
      exchangeCode: 'Dropbox: code를 토큰으로 교환하지 못했습니다(상태 코드 {status})',
      requireAppKey: '먼저 App Key를 저장하세요(설정 마법사를 참고하세요).',
      requireRedirectUri:
        'redirectUri를 자동으로 확인할 수 없습니다. DropboxProvider 옵션에서 명시적으로 지정하세요(플러그인이 <script type="module"> 또는 번들러를 통해 로드될 때 필요합니다).',
      notConnected: 'Dropbox가 연결되어 있지 않습니다.',
      sessionExpired: 'Dropbox 세션이 만료되었습니다. 다시 로그인해 주세요.',
      refreshFailed: 'Dropbox: 토큰을 갱신하지 못했습니다(상태 코드 {status})',
      uploadFailed: 'Dropbox: 업로드에 실패했습니다(상태 코드 {status})',
      uploadNetworkError: 'Dropbox: 파일 업로드 중 네트워크 오류가 발생했습니다',
    },
  },
  google: {
    setup: {
      step1: 'Google Cloud Console을 열고 프로젝트를 만들거나 기존 프로젝트를 선택한 다음 "APIs & Services"를 여세요.',
      step2: 'Library에서 "Google Drive API"를 찾아 사용 설정하세요.',
      step3:
        '"OAuth consent screen"에서 User type을 External로 설정하고, .../auth/drive.readonly 범위(scope)를 추가한 다음, 본인의 Google 계정을 test user로 추가하세요(검증되지 않은 앱은 test user로만 제한되며 경고 화면이 표시됩니다 — 많은 사용자에게 게시하려면 Google의 확인 심사가 필요합니다).',
      step4WithOrigin:
        'Credentials → Create Credentials → OAuth client ID에서 Application type을 "Web application"으로 선택하고, Authorized JavaScript origins에 아래 값을 붙여넣은 다음 Add를 클릭하세요:',
      step4NoOrigin:
        'Credentials → Create Credentials → OAuth client ID에서 Application type을 "Web application"으로 선택하고, Authorized JavaScript origins에 이 사이트가 제공되는 정확한 origin(프로토콜 + 도메인 + 포트)을 추가하세요 — 자동으로 감지할 수 없었습니다.',
      step5: '같은 화면에서 Client ID(.apps.googleusercontent.com으로 끝남)를 복사하여 아래 입력란에 붙여넣으세요.',
    },
    error: {
      gisLoadFailed: 'Google Identity Services(accounts.google.com/gsi/client)를 불러오지 못했습니다 — 네트워크 연결이나 광고/스크립트 차단기를 확인하세요.',
      tokenFailed: 'Google이 액세스 토큰을 반환하지 않았습니다. 다시 로그인해 보세요.',
      requireClientId: '먼저 Client ID를 저장하세요(설정 마법사를 참고하세요).',
      notConnected: 'Google Drive가 연결되어 있지 않습니다.',
      sessionExpired: 'Google 세션이 만료되었습니다. 다시 로그인해 주세요.',
      fileTooLarge:
        '파일이 {maxMb}MB보다 큽니다 — 서버가 없어 Google Drive 파일은 data URL로 인라인 삽입되므로, 이 파일은 삽입하기에 너무 큽니다.',
      uploadFailed: 'Google Drive: 업로드에 실패했습니다(상태 코드 {status})',
      uploadNetworkError: 'Google Drive: 파일 업로드 중 네트워크 오류가 발생했습니다',
    },
  },
  microsoft: {
    setup: {
      step1: 'Azure Portal → Microsoft Entra ID → App registrations를 열고 "New registration"을 클릭하세요.',
      step2: 'Supported account types에서 "Accounts in any organizational directory and personal Microsoft accounts"를 선택한 다음 Register를 클릭하세요.',
      step3:
        'API permissions → Add a permission → Microsoft Graph → Delegated permissions에서 Files.ReadWrite와 offline_access를 추가한 다음 Add permissions를 클릭하세요.',
      step4WithRedirect:
        'Authentication → Add a platform → Single-page application에서 Redirect URIs에 아래 값을 붙여넣고 Configure를 클릭하세요:',
      step4NoRedirect:
        'Authentication → Add a platform → Single-page application에서 Redirect URIs에 사용 중인 도메인의 public/microsoft-callback.html 페이지 전체 URL을 추가하세요 — 자동으로 감지할 수 없었습니다(제공자 옵션의 redirectUri 참고).',
      step5: 'Overview 페이지에서 Application (client) ID를 복사하여 아래 입력란에 붙여넣으세요.',
    },
    error: {
      exchangeCode: 'Microsoft: code를 토큰으로 교환하지 못했습니다(상태 코드 {status})',
      requireClientId: '먼저 Application (client) ID를 저장하세요(설정 마법사를 참고하세요).',
      requireRedirectUri:
        'redirectUri를 자동으로 확인할 수 없습니다. OneDriveProvider 옵션에서 명시적으로 지정하세요(플러그인이 <script type="module"> 또는 번들러를 통해 로드될 때 필요합니다).',
      notConnected: 'OneDrive가 연결되어 있지 않습니다.',
      sessionExpired: 'Microsoft 세션이 만료되었습니다. 다시 로그인해 주세요.',
      refreshFailed: 'Microsoft: 토큰을 갱신하지 못했습니다(상태 코드 {status})',
      noSpoLicense:
        '이 Microsoft 계정의 조직에는 OneDrive/SharePoint 라이선스가 없습니다(Microsoft Graph: "Tenant does not have a SPO license"). 개인 Microsoft 계정(outlook.com/hotmail/live)으로 로그인하거나, OneDrive for Business가 활성화된 조직의 업무용 계정으로 로그인하세요.',
      noDownloadableContent:
        '"{name}" 항목에는 다운로드할 수 있는 콘텐츠가 없어 삽입할 수 없습니다 — 보통 OneNote 노트북이거나, OneDrive가 일반 파일로 제공할 수 없는 다른 유형의 항목인 경우입니다.',
      uploadFailed: 'OneDrive: 업로드에 실패했습니다(상태 코드 {status})',
      uploadNetworkError: 'OneDrive: 파일 업로드 중 네트워크 오류가 발생했습니다',
    },
  },
  s3: {
    connectMenuItem: 'S3 연결',
    modalTitle: 'S3 호환 스토리지 연결',
    nameLabel: '탭 이름',
    namePlaceholder: '예: 내 버킷',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: '리전',
    regionPlaceholder: 'us-east-1',
    endpointLabel: '사용자 지정 엔드포인트(선택 사항)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'AWS S3인 경우 비워 두세요. S3 호환 서비스(MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2 등)인 경우 입력하세요.',
    forcePathStyleLabel: '경로 스타일 URL 사용(대부분의 자체 호스팅/S3 호환 엔드포인트에 필요)',
    corsHint: '버킷은 이 사이트에서의 CORS 요청(GET, PUT, DELETE, HEAD)을 허용해야 합니다 — 버킷의 CORS 설정에서 구성하세요.',
    connect: '연결',
    cancel: '취소',
    connecting: '연결 중…',
    error: {
      required: '모든 필수 항목을 입력하세요.',
      duplicateName: '같은 이름의 탭이 이미 있습니다.',
      connectFailed: '연결할 수 없습니다: {message}',
      listFailed: 'S3: 객체 목록을 가져오지 못했습니다(상태 코드 {status})',
      uploadFailed: 'S3: 업로드에 실패했습니다(상태 코드 {status})',
      uploadNetworkError: 'S3: 파일 업로드 중 네트워크 오류가 발생했습니다',
      deleteFailed: 'S3: 삭제하지 못했습니다(상태 코드 {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'PKCE를 통한 OAuth 로그인에는 Web Crypto API(crypto.subtle)가 필요하며, 브라우저는 안전하지 않은 origin(localhost가 아닌 일반 http)에서 이를 비활성화합니다. https:// 로 사이트를 열거나 테스트를 위해 http://localhost 로 열어 보세요.',
      popupBlocked: '브라우저가 인증 팝업 창을 차단했습니다. 이 사이트의 팝업을 허용하세요.',
      stateMismatch: '인증 응답이 검증을 통과하지 못했습니다(state 불일치).',
      popupClosed: '로그인이 완료되기 전에 인증 창이 닫혔습니다.',
    },
  },
};

export default messages;
