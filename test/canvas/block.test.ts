import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Editor } from 'grapesjs';
import { registerCloudMediaBlock } from '../../src/canvas/block';
import { createFakeEditor } from '../helpers/fakeEditor';
import { createFakeProvider } from '../helpers/fakeProvider';
import { S3_CONNECTIONS_CHANGED_EVENT, S3_CONNECTIONS_STORAGE_KEY } from '../../src/providers/s3/connections';

interface BlockProps {
  label?: string;
  category?: string;
  media?: string;
  content?: unknown;
  onClick?: (block: unknown, blockEditor: Editor) => void;
}

/**
 * Минимальная подделка `editor.Components`/`editor.BlockManager` —
 * `registerCloudMediaBlock` трогает только `addType`/`getType`/`removeType`
 * и `BlockManager.add`/`remove` (см. `src/canvas/block.ts`), реальный
 * GrapesJS для этого поднимать не нужно, как и у `AssetBrowser`
 * (см. `test/helpers/fakeEditor.ts`).
 */
function editorWithBlockManager(): { editor: Editor; types: Map<string, unknown>; blocks: Map<string, BlockProps> } {
  const base = createFakeEditor();
  const types = new Map<string, unknown>();
  const blocks = new Map<string, BlockProps>();

  const editor = {
    ...base,
    Components: {
      // Настоящий `Components.addType(type, { model, block })` заодно
      // регистрирует блок из вложенного ключа `block` в BlockManager —
      // воспроизводим это здесь же, а не только явные вызовы
      // `BlockManager.add()` ниже (их использует `registerProviderBlock`
      // для блоков отдельных провайдеров, а общий блок "Cloud media"
      // как раз идёт через этот вложенный путь, см. `block.ts`).
      addType: vi.fn((type: string, def: { block?: BlockProps & { id: string } }) => {
        types.set(type, def);
        if (def.block) blocks.set(def.block.id, def.block);
      }),
      getType: vi.fn((type: string) => types.get(type)),
      removeType: vi.fn((type: string) => {
        const existing = types.get(type);
        types.delete(type);
        return existing;
      }),
    },
    BlockManager: {
      add: vi.fn((id: string, props: BlockProps) => {
        blocks.set(id, props);
        return props;
      }),
      remove: vi.fn((id: string) => {
        const existing = blocks.get(id);
        blocks.delete(id);
        return existing;
      }),
      get: vi.fn((id: string) => blocks.get(id)),
    },
  } as unknown as Editor;

  return { editor, types, blocks };
}

function fakeModal(): { editor: Editor; getContainer: () => HTMLElement } {
  let container: HTMLElement | null = null;
  const editor = {
    Modal: {
      open: vi.fn((opts: { content: HTMLElement }) => {
        container = opts.content;
        document.body.appendChild(container);
        return { close: vi.fn(), onceClose: vi.fn() };
      }),
    },
  } as unknown as Editor;

  return {
    editor,
    getContainer: () => {
      if (!container) throw new Error('Modal.open() was not called yet');
      return container;
    },
  };
}

describe('registerCloudMediaBlock — по блоку в "Storage" на каждое уже добавленное хранилище', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('регистрирует общий блок "Cloud media" плюс по блоку на каждый статический провайдер (label/category/icon — от самого провайдера)', () => {
    const { editor, blocks } = editorWithBlockManager();
    const dropbox = createFakeProvider({ id: 'dropbox', label: 'Dropbox' });
    const google = createFakeProvider({ id: 'google-drive', label: 'Google Drive' });

    registerCloudMediaBlock(editor, { providers: [dropbox, google] });

    expect(blocks.has('gca-cloud-media')).toBe(true); // общий блок не убран, только дополнен
    expect(blocks.get('gca-cloud-media-provider:dropbox')).toMatchObject({ label: 'Dropbox', category: 'Storage', media: dropbox.icon });
    expect(blocks.get('gca-cloud-media-provider:google-drive')).toMatchObject({ label: 'Google Drive', category: 'Storage', media: google.icon });
  });

  it('клик по блоку конкретного провайдера открывает пикер сразу с активной вкладкой этого провайдера', async () => {
    const { editor: bmEditor, blocks } = editorWithBlockManager();
    const dropbox = createFakeProvider({ id: 'dropbox', label: 'Dropbox', items: [] });
    const google = createFakeProvider({ id: 'google-drive', label: 'Google Drive', items: [] });
    registerCloudMediaBlock(bmEditor, { providers: [dropbox, google] });

    const { editor: modalEditor, getContainer } = fakeModal();
    const editor = { ...bmEditor, ...modalEditor } as unknown as Editor;

    const block = blocks.get('gca-cloud-media-provider:google-drive')!;
    block.onClick!(null, editor);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const activeTab = getContainer().querySelector('.gca-tab--active');
    expect(activeTab?.textContent).toContain('Google Drive');
  });

  it('заголовок окна у блока провайдера — его собственная метка, а не общий заголовок модалки', async () => {
    const { editor: bmEditor, blocks } = editorWithBlockManager();
    const dropbox = createFakeProvider({ id: 'dropbox', label: 'Dropbox', items: [] });
    registerCloudMediaBlock(bmEditor, { providers: [dropbox] });

    const { editor: modalEditor } = fakeModal();
    const editor = { ...bmEditor, ...modalEditor } as unknown as Editor;

    blocks.get('gca-cloud-media-provider:dropbox')!.onClick!(null, editor);
    await Promise.resolve();

    expect((editor.Modal.open as ReturnType<typeof vi.fn>).mock.calls[0][0]).toMatchObject({ title: 'Dropbox' });
  });

  it('уже подключённое (persisted) S3-соединение получает блок сразу при регистрации, ещё до открытия пикера', () => {
    localStorage.setItem(
      S3_CONNECTIONS_STORAGE_KEY,
      JSON.stringify([{ id: 'abc', name: 'My Bucket', accessKeyId: 'a', secretAccessKey: 'b', bucket: 'bkt', region: 'us-east-1' }]),
    );
    const { editor, blocks } = editorWithBlockManager();

    registerCloudMediaBlock(editor, { providers: [] });

    expect(blocks.get('gca-cloud-media-provider:s3:abc')).toMatchObject({ label: 'My Bucket', category: 'Storage' });
  });

  it('добавляет/убирает блок S3-соединения динамически по S3_CONNECTIONS_CHANGED_EVENT (подключили/отключили уже после инициализации)', () => {
    const { editor, blocks } = editorWithBlockManager();
    registerCloudMediaBlock(editor, { providers: [] });
    expect([...blocks.keys()].some((id) => id.startsWith('gca-cloud-media-provider:s3:'))).toBe(false);

    // Подключили новое соединение (как это делает AssetBrowser.addS3Connection)
    localStorage.setItem(
      S3_CONNECTIONS_STORAGE_KEY,
      JSON.stringify([{ id: 'xyz', name: 'New Bucket', accessKeyId: 'a', secretAccessKey: 'b', bucket: 'bkt', region: 'us-east-1' }]),
    );
    editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);
    expect(blocks.get('gca-cloud-media-provider:s3:xyz')).toMatchObject({ label: 'New Bucket' });

    // Отключили (removeS3Connection) — блок должен пропасть, а не просто остаться сиротой.
    localStorage.setItem(S3_CONNECTIONS_STORAGE_KEY, JSON.stringify([]));
    editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);
    expect(blocks.has('gca-cloud-media-provider:s3:xyz')).toBe(false);
  });

  it('не падает и не дублирует блоки при повторном срабатывании события с тем же набором S3-соединений', () => {
    localStorage.setItem(
      S3_CONNECTIONS_STORAGE_KEY,
      JSON.stringify([{ id: 'abc', name: 'My Bucket', accessKeyId: 'a', secretAccessKey: 'b', bucket: 'bkt', region: 'us-east-1' }]),
    );
    const { editor, blocks } = editorWithBlockManager();
    registerCloudMediaBlock(editor, { providers: [] });

    editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);
    editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);

    expect(blocks.get('gca-cloud-media-provider:s3:abc')).toMatchObject({ label: 'My Bucket' });
  });
});
