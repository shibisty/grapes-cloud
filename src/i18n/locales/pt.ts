import type { CloudAssetsMessages } from '../types';

const messages: CloudAssetsMessages = {
  common: {
    rootCrumb: 'Raiz',
    loading: 'A carregar…',
    empty: 'Ainda não há nada aqui.',
    loadMore: 'Mais',
    uploadFile: 'Carregar ficheiro',
    urlPlaceholder: 'Cole um link para um ficheiro…',
    addUrl: 'Adicionar',
    searchPlaceholder: 'Pesquisar ficheiros…',
    filter: {
      all: 'Todos os tipos',
    },
    settings: 'Definições',
    refresh: 'Atualizar',
    selectedCount: '{count} selecionados',
    cancelSelection: 'Cancelar',
    insertSelected: 'Inserir ({count})',
    openInTab: 'Abrir num novo separador',
    delete: 'Eliminar',
    deleteConfirm: 'Confirmar eliminação?',
    viewGrid: 'Vista em grelha',
    viewTable: 'Vista em tabela',
    viewTree: 'Vista em árvore',
    columnName: 'Nome',
    columnType: 'Tipo',
    columnSize: 'Tamanho',
    columnModified: 'Modificado',
    type: {
      image: 'Imagem',
      video: 'Vídeo',
      audio: 'Áudio',
      document: 'Documento',
      folder: 'Pasta',
      other: 'Ficheiro',
    },
    error: {
      generic: 'Não foi possível carregar a lista de ficheiros',
      insertFailed: 'Não foi possível inserir este ficheiro',
    },
    dropzone: {
      active: 'Largue aqui para carregar',
    },
    upload: {
      queueTitle: 'A carregar {done}/{total}',
      uploading: 'A carregar…',
      done: 'Concluído',
      error: 'Falhou',
      close: 'Fechar',
    },
    tree: {
      expandAll: 'Expandir tudo',
      collapseAll: 'Recolher tudo',
      expandFolder: 'Expandir pasta',
      collapseFolder: 'Recolher pasta',
    },
    addConnection: 'Adicionar ligação',
    moreTabs: 'Mais separadores',
    removeConnection: 'Remover',
    removeConnectionConfirm: 'Confirmar remoção?',
  },
  auth: {
    connectPrompt: 'Ligue {provider} para escolher ficheiros a partir daqui.',
    loginButton: 'Iniciar sessão em {provider}',
    loggingIn: 'A abrir a janela de autorização…',
    loginFailed: 'Falha ao iniciar sessão.',
    changeAppKey: 'Alterar App Key',
    logout: 'Terminar sessão',
    logoutConfirm: 'Terminar sessão?',
  },
  setup: {
    missingInfo: '{provider} precisa de configuração, mas não há instruções disponíveis.',
    intro: 'Para ligar {provider}, crie primeiro uma aplicação na respetiva consola de programador: ',
    appKeyPlaceholder: 'App Key',
    clientIdPlaceholder: 'Client ID',
    applicationIdPlaceholder: 'Application (client) ID',
    save: 'Guardar',
    saveFailed: 'Não foi possível guardar o App Key.',
    copy: 'Copiar',
    copied: 'Copiado',
    selected: 'Selecionado, prima Ctrl+C',
    uploadHint: 'Depois de ligado, também pode carregar ficheiros arrastando-os (ou uma pasta inteira) para a lista, ou através do botão Carregar acima.',
  },
  block: {
    label: 'Média na nuvem',
    category: 'Armazenamento',
  },
  button: {
    label: 'Inserir da nuvem',
  },
  modal: {
    title: 'Inserir da nuvem',
  },
  local: {
    tabLabel: 'Os meus ficheiros',
    error: {
      emptyUrl: 'Introduza um link para um ficheiro',
      readFile: 'Não foi possível ler o ficheiro',
    },
  },
  dropbox: {
    setup: {
      step1: 'Abra a Dropbox App Console e clique em «Create app».',
      step2: 'Choose an API → Scoped access. Type of access → Full Dropbox. Introduza qualquer nome de aplicação e clique em Create app.',
      step3: 'No separador Permissions, marque files.metadata.read, files.content.read e files.content.write e clique em Submit.',
      step4WithRedirect: 'No separador Settings, em Redirect URIs, cole isto e clique em Add:',
      step4NoRedirect:
        'No separador Settings, em Redirect URIs, adicione o URL completo da página public/dropbox-callback.html no seu domínio — não foi possível detetá-lo automaticamente (veja redirectUri nas opções do fornecedor).',
      step5: 'Nesse mesmo separador Settings, copie o App key e cole-o no campo abaixo.',
    },
    error: {
      exchangeCode: 'Dropbox: não foi possível trocar o code por um token (estado {status})',
      requireAppKey: 'Guarde primeiro um App Key (veja o assistente de configuração).',
      requireRedirectUri:
        'Não foi possível determinar automaticamente o redirectUri. Indique-o explicitamente nas opções do DropboxProvider (necessário se o plugin for carregado via <script type="module"> ou um bundler).',
      notConnected: 'O Dropbox não está ligado.',
      sessionExpired: 'A sessão do Dropbox expirou, inicie sessão novamente.',
      refreshFailed: 'Dropbox: não foi possível renovar o token (estado {status})',
      uploadFailed: 'Dropbox: o carregamento falhou (estado {status})',
      uploadNetworkError: 'Dropbox: erro de rede ao carregar o ficheiro',
    },
  },
  google: {
    setup: {
      step1: 'Abra a Google Cloud Console, crie um projeto (ou selecione um existente) e depois abra «APIs & Services».',
      step2: 'Em Library, encontre e ative a «Google Drive API».',
      step3:
        'Em «OAuth consent screen», defina User type como External, adicione o scope .../auth/drive.readonly e adicione a sua própria conta Google como test user (uma aplicação não verificada está limitada a test users e mostra um ecrã de aviso — publicar para muitos utilizadores requer a revisão de verificação da Google).',
      step4WithOrigin:
        'Em Credentials → Create Credentials → OAuth client ID, escolha Application type «Web application» e em Authorized JavaScript origins cole isto e clique em Add:',
      step4NoOrigin:
        'Em Credentials → Create Credentials → OAuth client ID, escolha Application type «Web application» e em Authorized JavaScript origins adicione o origin exato (protocolo + domínio + porta) a partir do qual este site é servido — não foi possível detetá-lo automaticamente.',
      step5: 'No mesmo ecrã, copie o Client ID (termina em .apps.googleusercontent.com) e cole-o no campo abaixo.',
    },
    error: {
      gisLoadFailed: 'Não foi possível carregar o Google Identity Services (accounts.google.com/gsi/client) — verifique a sua ligação de rede ou um bloqueador de anúncios/scripts.',
      tokenFailed: 'O Google não devolveu um token de acesso. Tente iniciar sessão novamente.',
      requireClientId: 'Guarde primeiro um Client ID (veja o assistente de configuração).',
      notConnected: 'O Google Drive não está ligado.',
      sessionExpired: 'A sessão do Google expirou, inicie sessão novamente.',
      fileTooLarge:
        'O ficheiro é maior do que {maxMb} MB — os ficheiros do Google Drive são inseridos como um data URL porque não existe servidor, pelo que este ficheiro é demasiado grande para ser inserido.',
      uploadFailed: 'Google Drive: o carregamento falhou (estado {status})',
      uploadNetworkError: 'Google Drive: erro de rede ao carregar o ficheiro',
    },
  },
  microsoft: {
    setup: {
      step1: 'Abra o Azure Portal → Microsoft Entra ID → App registrations e clique em «New registration».',
      step2: 'Em Supported account types, escolha «Accounts in any organizational directory and personal Microsoft accounts» e depois clique em Register.',
      step3:
        'Em API permissions → Add a permission → Microsoft Graph → Delegated permissions, adicione Files.ReadWrite e offline_access, e depois clique em Add permissions.',
      step4WithRedirect:
        'Em Authentication → Add a platform → Single-page application, cole isto em Redirect URIs e clique em Configure:',
      step4NoRedirect:
        'Em Authentication → Add a platform → Single-page application, adicione o URL completo da página public/microsoft-callback.html no seu domínio em Redirect URIs — não foi possível detetá-lo automaticamente (veja redirectUri nas opções do fornecedor).',
      step5: 'Na página Overview, copie o Application (client) ID e cole-o no campo abaixo.',
    },
    error: {
      exchangeCode: 'Microsoft: não foi possível trocar o code por um token (estado {status})',
      requireClientId: 'Guarde primeiro um Application (client) ID (veja o assistente de configuração).',
      requireRedirectUri:
        'Não foi possível determinar automaticamente o redirectUri. Indique-o explicitamente nas opções do OneDriveProvider (necessário se o plugin for carregado via <script type="module"> ou um bundler).',
      notConnected: 'O OneDrive não está ligado.',
      sessionExpired: 'A sessão do Microsoft expirou, inicie sessão novamente.',
      refreshFailed: 'Microsoft: não foi possível renovar o token (estado {status})',
      noSpoLicense:
        'A organização desta conta Microsoft não tem o OneDrive/SharePoint licenciado (Microsoft Graph: «Tenant does not have a SPO license»). Inicie sessão com uma conta Microsoft pessoal (outlook.com/hotmail/live) ou uma conta de trabalho cuja organização tenha o OneDrive for Business ativado.',
      noDownloadableContent:
        '«{name}» não tem conteúdo transferível e não pode ser inserido — isto acontece normalmente com blocos de notas do OneNote ou com outros tipos de item que o OneDrive não consegue disponibilizar como um ficheiro normal.',
      uploadFailed: 'OneDrive: o carregamento falhou (estado {status})',
      uploadNetworkError: 'OneDrive: erro de rede ao carregar o ficheiro',
    },
  },
  s3: {
    connectMenuItem: 'Ligar S3',
    modalTitle: 'Ligar armazenamento compatível com S3',
    nameLabel: 'Nome do separador',
    namePlaceholder: 'p. ex. O meu bucket',
    accessKeyIdLabel: 'Access Key ID',
    secretAccessKeyLabel: 'Secret Access Key',
    bucketLabel: 'Bucket',
    regionLabel: 'Região',
    regionPlaceholder: 'us-east-1',
    endpointLabel: 'Endpoint personalizado (opcional)',
    endpointPlaceholder: 'https://s3.example.com',
    endpointHint: 'Deixe vazio para AWS S3. Preencha para serviços compatíveis com S3 (MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2…).',
    forcePathStyleLabel: 'Usar URLs no estilo "path" (necessário para a maioria dos endpoints self-hosted/compatíveis com S3)',
    corsHint: 'O bucket deve permitir pedidos CORS a partir deste site (GET, PUT, DELETE, HEAD) — configure isto nas definições de CORS do bucket.',
    connect: 'Ligar',
    cancel: 'Cancelar',
    connecting: 'A ligar…',
    error: {
      required: 'Preencha todos os campos obrigatórios.',
      duplicateName: 'Já existe um separador com este nome.',
      connectFailed: 'Não foi possível ligar: {message}',
      listFailed: 'S3: falha ao listar objetos (estado {status})',
      uploadFailed: 'S3: o carregamento falhou (estado {status})',
      uploadNetworkError: 'S3: erro de rede ao carregar o ficheiro',
      deleteFailed: 'S3: falha ao eliminar (estado {status})',
    },
  },
  shared: {
    error: {
      insecureOrigin:
        'O início de sessão OAuth por PKCE requer a Web Crypto API (crypto.subtle), que os navegadores desativam numa origem não segura (http simples, exceto localhost). Abra o site em https:// ou, para testar, em http://localhost.',
      popupBlocked: 'O navegador bloqueou a janela de autorização. Permita janelas pop-up para este site.',
      stateMismatch: 'A resposta de autorização falhou na verificação (state não corresponde).',
      popupClosed: 'A janela de autorização foi fechada antes de a sessão terminar.',
    },
  },
};

export default messages;
