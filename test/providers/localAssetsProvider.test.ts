import { describe, expect, it, vi } from 'vitest';
import type { Asset, Editor } from 'grapesjs';
import { LocalAssetsProvider } from '../../src/providers/local/LocalAssetsProvider';
import { createFakeEditor } from '../helpers/fakeEditor';

/** Just enough of a GrapesJS `Asset` model for LocalAssetsProvider.list() to read. */
function fakeAsset(fields: { src: string; name?: string; type?: string }): Asset {
  return {
    getSrc: () => fields.src,
    get: (key: string) => (key === 'name' ? fields.name : key === 'type' ? fields.type : undefined),
    getFilename: () => fields.src.split('/').pop() ?? '',
    getType: () => fields.type ?? 'other',
  } as unknown as Asset;
}

function editorWithAssets(models: Asset[]): Editor {
  const base = createFakeEditor();
  return {
    ...base,
    AssetManager: {
      getAll: () => ({ models }),
      add: vi.fn(),
    },
  } as unknown as Editor;
}

describe('LocalAssetsProvider', () => {
  it('is always authenticated — it is a view over the editor\'s own asset collection, not an external account', () => {
    const provider = new LocalAssetsProvider(editorWithAssets([]));
    expect(provider.getAuthState()).toEqual({ authenticated: true });
  });

  it('list() reverses the collection so the most recently added asset comes first', async () => {
    const editor = editorWithAssets([
      fakeAsset({ src: 'https://example.com/a.png', type: 'image' }),
      fakeAsset({ src: 'https://example.com/b.png', type: 'image' }),
    ]);
    const provider = new LocalAssetsProvider(editor);

    const result = await provider.list('');
    expect(result.items.map((i) => i.name)).toEqual(['b.png', 'a.png']);
    expect(result.hasMore).toBe(false);
  });

  it('list() sets thumbnailUrl only for images, and falls back name/mimeType sensibly', async () => {
    const editor = editorWithAssets([
      fakeAsset({ src: 'https://example.com/doc.pdf', name: 'My Doc', type: 'other' }),
      fakeAsset({ src: 'https://example.com/photo.jpg', type: 'image' }),
    ]);
    const provider = new LocalAssetsProvider(editor);
    const result = await provider.list('');

    const doc = result.items.find((i) => i.name === 'My Doc')!;
    expect(doc.thumbnailUrl).toBeUndefined();

    const photo = result.items.find((i) => i.name === 'photo.jpg')!;
    expect(photo.thumbnailUrl).toBe('https://example.com/photo.jpg');
    expect(photo.mimeType).toBe('image/jpeg'); // guessed from the extension, type field wasn't a real MIME string
  });

  it('resolve() passes the item straight through as a ResolvedAsset', async () => {
    const provider = new LocalAssetsProvider(editorWithAssets([]));
    const asset = await provider.resolve({
      id: 'x',
      name: 'x.png',
      kind: 'file',
      mimeType: 'image/png',
      path: 'https://example.com/x.png',
      parentPath: '',
    });
    expect(asset).toEqual({
      src: 'https://example.com/x.png',
      name: 'x.png',
      type: 'image',
      mimeType: 'image/png',
      provider: 'local',
    });
  });

  it('addByUrl() rejects an empty URL with a GcaError', async () => {
    const provider = new LocalAssetsProvider(editorWithAssets([]));
    await expect(provider.addByUrl('   ')).rejects.toMatchObject({ i18nKey: 'local.error.emptyUrl' });
  });

  it('addByUrl() registers the asset with the editor and returns a matching StorageItem', async () => {
    const editor = editorWithAssets([]);
    const provider = new LocalAssetsProvider(editor);

    const item = await provider.addByUrl('https://example.com/pic.png');
    expect(item.name).toBe('pic.png');
    expect(item.thumbnailUrl).toBe('https://example.com/pic.png');
    expect(editor.AssetManager.add).toHaveBeenCalledWith(
      { src: 'https://example.com/pic.png', name: 'pic.png', type: 'image' },
      { at: 0 },
    );
  });

  it('upload() reads the file as a data URL, registers it, and reports progress', async () => {
    const editor = editorWithAssets([]);
    const provider = new LocalAssetsProvider(editor);
    const onProgress = vi.fn();

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const item = await provider.upload(file, '', onProgress);

    expect(item.name).toBe('hello.txt');
    expect(item.path.startsWith('data:')).toBe(true);
    expect(editor.AssetManager.add).toHaveBeenCalledTimes(1);
  });

  it('uses the local.tabLabel translation as the default label', () => {
    const provider = new LocalAssetsProvider(editorWithAssets([]));
    expect(provider.label).toBe('My files');
  });

  it('accepts an explicit label override', () => {
    const provider = new LocalAssetsProvider(editorWithAssets([]), { label: 'Custom label' });
    expect(provider.label).toBe('Custom label');
  });
});
