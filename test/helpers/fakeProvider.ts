import { vi } from 'vitest';
import type { AuthState, ListOptions, ListResult, ProviderSetupInfo, ResolvedAsset, StorageItem, StorageProvider } from '../../src/types';

/** Файл-заготовка для тестов AssetBrowser — минимум обязательных полей StorageItem, остальное через overrides. */
export function makeFile(overrides: Partial<StorageItem> = {}): StorageItem {
  const name = overrides.name ?? 'file.jpg';
  return {
    id: name,
    name,
    kind: 'file',
    path: `/${name}`,
    parentPath: '',
    ...overrides,
  };
}

export function makeFolder(overrides: Partial<StorageItem> = {}): StorageItem {
  const name = overrides.name ?? 'folder';
  return {
    id: name,
    name,
    kind: 'folder',
    path: `/${name}`,
    parentPath: '',
    ...overrides,
  };
}

export interface FakeProviderOptions {
  id?: string;
  label?: string;
  authenticated?: boolean;
  configured?: boolean;
  items?: StorageItem[];
  /** Если задано — провайдер получает search()/delete() (см. StorageProvider — оба необязательны). */
  withSearch?: boolean;
  withDelete?: boolean;
  withUpload?: boolean;
  /** Если задано — provider.getSetupInfo() отдаёт именно это (см. тесты мастера настройки). */
  setupInfo?: ProviderSetupInfo;
}

/**
 * Настраиваемый `StorageProvider` для тестов `AssetBrowser` — реальные
 * провайдеры (Dropbox/Google/OneDrive) тестируются отдельно, здесь
 * нужен только предсказуемый источник данных с шпионами (`vi.fn()`)
 * на каждом методе, чтобы проверять, СКОЛЬКО раз и с какими
 * аргументами AssetBrowser их вызвал (debounce, кеш, множественный
 * выбор и т.п.).
 */
export function createFakeProvider(opts: FakeProviderOptions = {}): StorageProvider & {
  list: ReturnType<typeof vi.fn>;
  search: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  resolve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  upload: ReturnType<typeof vi.fn>;
} {
  const items = opts.items ?? [];

  const list = vi.fn(async (_folderPath: string, _listOpts?: ListOptions): Promise<ListResult> => ({
    items,
    hasMore: false,
  }));

  const search = vi.fn(async (_query: string, _listOpts?: ListOptions): Promise<ListResult> => ({
    items,
    hasMore: false,
  }));

  const del = vi.fn(async (_item: StorageItem): Promise<void> => {});

  const resolve = vi.fn(
    async (item: StorageItem): Promise<ResolvedAsset> => ({
      src: `resolved:${item.path}`,
      name: item.name,
      type: 'image',
      provider: opts.id ?? 'fake',
    }),
  );

  const disconnect = vi.fn(async (): Promise<void> => {});

  const upload = vi.fn(async (file: File, _folderPath: string): Promise<StorageItem> => makeFile({ name: file.name }));

  const getAuthState = (): AuthState => ({
    authenticated: opts.authenticated ?? true,
    configured: opts.configured ?? true,
  });

  const provider = {
    id: opts.id ?? 'fake',
    label: opts.label ?? 'Fake',
    icon: '<svg></svg>',
    getAuthState,
    authenticate: vi.fn(async (): Promise<AuthState> => getAuthState()),
    disconnect,
    list,
    resolve,
    setCredential: vi.fn(),
    // search/delete/upload попадают в объект, ТОЛЬКО если соответствующий
    // withSearch/withDelete/withUpload включён — как и у настоящих
    // StorageProvider (см. types.ts), это опциональные поля интерфейса,
    // и AssetBrowser проверяет именно их наличие (`if (!provider.search) return null` и
    // т.п.), чтобы решить, показывать ли поиск/удаление/загрузку. Ключи
    // `search`/`delete`/`upload` в возвращаемом типе объявлены не-опциональными
    // только для удобства — обращение к ним, когда withX не включён, даёт `undefined`.
    ...(opts.withSearch ? { search } : {}),
    ...(opts.withDelete ? { delete: del } : {}),
    ...(opts.withUpload ? { upload } : {}),
    ...(opts.setupInfo ? { getSetupInfo: () => opts.setupInfo! } : {}),
  };

  return provider as unknown as StorageProvider & {
    list: typeof list;
    search: typeof search;
    delete: typeof del;
    resolve: typeof resolve;
    disconnect: typeof disconnect;
    upload: typeof upload;
  };
}
