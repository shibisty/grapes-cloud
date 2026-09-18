import type { Asset, Editor } from 'grapesjs';
import type {
  AuthState,
  ListOptions,
  ListResult,
  ResolvedAsset,
  StorageItem,
  StorageProvider,
  UploadProgress,
} from '../../types';
import { guessAssetType, guessMimeType, nameFromUrl } from '../../utils/assetType';
import { GcaError } from '../../i18n/errors';
import { t } from '../../i18n/t';

export interface LocalAssetsProviderOptions {
  /** Заголовок вкладки. По умолчанию — перевод `cloudAssets.local.tabLabel` ("Свои файлы" на русском). */
  label?: string;
}

/**
 * "Дефолтный" локальный менеджер как ОБЫЧНАЯ вкладка того же
 * единого AssetBrowser — тот самый выбор между "своими" файлами и
 * облаком, который иначе пропадает: как только `assetManager.custom`
 * подключён, стандартная сетка/загрузка/поле URL GrapesJS больше не
 * рисуется вообще, и без этой вкладки способа добавить файл с диска
 * или вставить прямую ссылку не остаётся.
 *
 * Источник данных этой вкладки — та же коллекция, что
 * `editor.AssetManager.getAll()`/`.add()` использовали всегда, так
 * что она видит и то, что в холст добавляют другие части редактора.
 *
 * Загрузка с диска сделана через data: URL (как `embedAsBase64` в
 * самом grapesjs, только без завязки на конфиг) — своего сервера для
 * файлов у демонстрационной страницы нет. Если на сайте уже есть
 * backend для загрузок, замените здесь тело `upload()` на POST на
 * свой endpoint — вкладка и её UI никак не привязаны к конкретному
 * способу хранения.
 */
export class LocalAssetsProvider implements StorageProvider {
  readonly id = 'local';
  readonly label: string;
  readonly icon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v11m0 0 3.5-3.5M12 14l-3.5-3.5"/><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/></svg>';

  constructor(
    private readonly editor: Editor,
    options: LocalAssetsProviderOptions = {},
  ) {
    this.label = options.label ?? t(editor, 'local.tabLabel');
  }

  // Локальная коллекция редактора — входить никуда не нужно.
  getAuthState(): AuthState {
    return { authenticated: true };
  }

  authenticate(): Promise<AuthState> {
    return Promise.resolve(this.getAuthState());
  }

  disconnect(): void {
    // Нечего отключать — это не внешний аккаунт.
  }

  async list(_folderPath: string, _opts: ListOptions = {}): Promise<ListResult> {
    const models = this.editor.AssetManager.getAll().models;

    const items: StorageItem[] = models.map((asset: Asset) => {
      const src: string = asset.getSrc();
      const name = (asset.get('name') as string | undefined) || asset.getFilename() || nameFromUrl(src);
      const mimeType = (asset.get('type') as string | undefined)?.includes('/')
        ? (asset.get('type') as string)
        : guessMimeType(name);
      const isImage = asset.getType() === 'image' || mimeType?.startsWith('image/');

      return {
        id: src,
        name,
        kind: 'file',
        mimeType,
        thumbnailUrl: isImage ? src : undefined,
        path: src,
        parentPath: '',
        raw: asset,
      };
    });

    // Недавно добавленные — сверху, как в стандартном Asset Manager.
    items.reverse();

    return { items, hasMore: false };
  }

  async resolve(item: StorageItem): Promise<ResolvedAsset> {
    return {
      src: item.path,
      name: item.name,
      type: guessAssetType(item.mimeType, item.name),
      mimeType: item.mimeType,
      provider: this.id,
    };
  }

  async upload(file: File, _folderPath: string, onProgress?: (progress: UploadProgress) => void): Promise<StorageItem> {
    const dataUrl = await readFileAsDataUrl(file, onProgress);
    const type = guessAssetType(file.type || undefined, file.name);

    this.editor.AssetManager.add({ src: dataUrl, name: file.name, type }, { at: 0 });

    return {
      id: dataUrl,
      name: file.name,
      kind: 'file',
      mimeType: file.type || guessMimeType(file.name),
      size: file.size,
      thumbnailUrl: type === 'image' ? dataUrl : undefined,
      path: dataUrl,
      parentPath: '',
    };
  }

  async addByUrl(url: string): Promise<StorageItem> {
    const trimmed = url.trim();
    if (!trimmed) throw new GcaError('local.error.emptyUrl', 'Enter a file link');

    const name = nameFromUrl(trimmed);
    const mimeType = guessMimeType(name);
    const type = guessAssetType(mimeType, name);

    this.editor.AssetManager.add({ src: trimmed, name, type }, { at: 0 });

    return {
      id: trimmed,
      name,
      kind: 'file',
      mimeType,
      thumbnailUrl: type === 'image' ? trimmed : undefined,
      path: trimmed,
      parentPath: '',
    };
  }
}

function readFileAsDataUrl(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.({ loaded: event.loaded, total: event.total });
    };
    reader.onerror = () => reject(reader.error ?? new GcaError('local.error.readFile', 'Failed to read the file'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
