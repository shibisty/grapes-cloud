import { afterEach, describe, expect, it } from 'vitest';
import type { ListResult } from '../../src/types';
import { createFakeProvider, makeFile, makeFolder } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

function treeNodeNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.gca-tree-node__name')].map((n) => n.textContent!);
}

function switchToTree(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('.gca-view-toggle__btn')[2].click();
}

function toolbarButton(container: HTMLElement, label: string): HTMLElement {
  return [...container.querySelectorAll<HTMLElement>('.gca-tree__toolbar-btn')].find((b) => b.textContent?.includes(label))!;
}

describe('AssetBrowser — tree view', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('switching to the tree view renders the root listing, folders before files, alphabetically', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') {
        return { items: [makeFile({ id: 'z', name: 'zeta.jpg' }), makeFolder({ id: 'a', name: 'Alpha', path: '/Alpha' })], hasMore: false };
      }
      return { items: [], hasMore: false };
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    switchToTree(container);
    await flush();

    // Root path ('') shares its cache key with the grid/table's own
    // listing of the same folder (see cacheKey()/listCache) — the tree's
    // root reuses that 15-minute cache rather than re-fetching, which is
    // exactly why the content is correct even without a second list() call.
    expect(treeNodeNames(container)).toEqual(['Alpha', 'zeta.jpg']);
  });

  it('switching to the tree view fetches the root fresh when nothing has been listed yet (no grid load happened first)', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFile({ id: 'z', name: 'zeta.jpg' })], hasMore: false };
      return { items: [], hasMore: false };
    });
    localStorage.setItem('gca_view_mode', 'tree'); // so the browser opens directly into tree mode
    const { container } = mountAssetBrowser([provider]);
    await flush();

    expect(provider.list).toHaveBeenCalledWith('');
    expect(treeNodeNames(container)).toEqual(['zeta.jpg']);
  });

  it('expanding a folder lazily fetches its children on first click, and re-expanding after a collapse does not refetch', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFolder({ id: 'docs', name: 'Docs', path: '/Docs' })], hasMore: false };
      if (path === '/Docs') return { items: [makeFile({ id: 'f1', name: 'report.pdf' })], hasMore: false };
      return { items: [], hasMore: false };
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    switchToTree(container);
    await flush();

    expect(treeNodeNames(container)).toEqual(['Docs']);

    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();
    expect(provider.list).toHaveBeenCalledWith('/Docs');
    expect(treeNodeNames(container)).toEqual(['Docs', 'report.pdf']);

    // Collapse — children stay cached, just hidden.
    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    expect(treeNodeNames(container)).toEqual(['Docs']);

    provider.list.mockClear();
    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();
    expect(provider.list).not.toHaveBeenCalled(); // served from the in-memory node cache
    expect(treeNodeNames(container)).toEqual(['Docs', 'report.pdf']);
  });

  it('shows a retryable error placeholder when a node fails to load, and retries on click', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFolder({ id: 'docs', name: 'Docs', path: '/Docs' })], hasMore: false };
      throw new Error('network down');
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    switchToTree(container);
    await flush();

    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();

    const errorBtn = container.querySelector<HTMLElement>('.gca-tree-node__error')!;
    expect(errorBtn).not.toBeNull();
    expect(errorBtn.textContent).toBe('network down');

    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '/Docs') return { items: [makeFile({ id: 'f1', name: 'ok.pdf' })], hasMore: false };
      return { items: [], hasMore: false };
    });
    errorBtn.click();
    await flush();

    expect(container.querySelector('.gca-tree-node__error')).toBeNull();
    expect(treeNodeNames(container)).toEqual(['Docs', 'ok.pdf']);
  });

  it('"Expand all" recursively expands and fetches every nested folder from the root down', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFolder({ id: 'a', name: 'A', path: '/A' })], hasMore: false };
      if (path === '/A') return { items: [makeFolder({ id: 'b', name: 'B', path: '/A/B' })], hasMore: false };
      if (path === '/A/B') return { items: [makeFile({ id: 'f', name: 'deep.txt' })], hasMore: false };
      return { items: [], hasMore: false };
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    switchToTree(container);
    await flush();

    toolbarButton(container, 'Expand all').click();
    await flush(12);

    expect(treeNodeNames(container)).toEqual(['A', 'B', 'deep.txt']);
  });

  it('"Collapse all" hides every expanded node without discarding their cached children', async () => {
    const provider = createFakeProvider();
    provider.list.mockImplementation(async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFolder({ id: 'a', name: 'A', path: '/A' })], hasMore: false };
      if (path === '/A') return { items: [makeFile({ id: 'f', name: 'inside.txt' })], hasMore: false };
      return { items: [], hasMore: false };
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    switchToTree(container);
    await flush();

    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();
    expect(treeNodeNames(container)).toEqual(['A', 'inside.txt']);

    toolbarButton(container, 'Collapse all').click();
    expect(treeNodeNames(container)).toEqual(['A']);

    provider.list.mockClear();
    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();
    expect(provider.list).not.toHaveBeenCalled();
    expect(treeNodeNames(container)).toEqual(['A', 'inside.txt']);
  });

  it('persists expanded folders per provider to localStorage and restores them (cascading into nested folders) when the picker is reopened', async () => {
    const listImpl = async (path: string): Promise<ListResult> => {
      if (path === '') return { items: [makeFolder({ id: 'docs', name: 'Docs', path: '/Docs' })], hasMore: false };
      if (path === '/Docs') return { items: [makeFolder({ id: 'sub', name: 'Sub', path: '/Docs/Sub' })], hasMore: false };
      if (path === '/Docs/Sub') return { items: [makeFile({ id: 'f', name: 'deep.pdf' })], hasMore: false };
      return { items: [], hasMore: false };
    };

    const provider = createFakeProvider({ id: 'dbx' });
    provider.list.mockImplementation(listImpl);
    const { container } = mountAssetBrowser([provider]);
    await flush();
    switchToTree(container);
    await flush();

    // Expand Docs, then Sub — two levels deep.
    container.querySelector<HTMLElement>('.gca-tree-node__toggle')!.click();
    await flush();
    container.querySelectorAll<HTMLElement>('.gca-tree-node__toggle')[1].click();
    await flush();
    expect(treeNodeNames(container)).toEqual(['Docs', 'Sub', 'deep.pdf']);

    expect(JSON.parse(localStorage.getItem('gca_tree_expanded_dbx')!).sort()).toEqual(['/Docs', '/Docs/Sub']);

    document.body.innerHTML = ''; // simulate closing the picker (gca_view_mode + gca_tree_expanded_dbx survive in localStorage)

    const provider2 = createFakeProvider({ id: 'dbx' });
    provider2.list.mockImplementation(listImpl);
    const { container: container2 } = mountAssetBrowser([provider2]);
    await flush(10);

    // Tree view mode itself is remembered too (gca_view_mode), so it should already be showing the tree, pre-expanded.
    expect(treeNodeNames(container2)).toEqual(['Docs', 'Sub', 'deep.pdf']);
  });

  it('hides the search/filter row while in tree view, and shows it again back in grid view', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })], withSearch: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(container.querySelector('.gca-search-row')).not.toBeNull();

    switchToTree(container);
    await flush();
    expect(container.querySelector('.gca-search-row')).toBeNull();

    container.querySelectorAll<HTMLElement>('.gca-view-toggle__btn')[0].click();
    expect(container.querySelector('.gca-search-row')).not.toBeNull();
  });
});
