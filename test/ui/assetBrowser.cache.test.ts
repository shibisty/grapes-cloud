import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeProvider, makeFile, makeFolder } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

describe('AssetBrowser — 15-minute list cache', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('reuses cached items on a second visit to the same folder within the 15-minute TTL, without calling list() again', async () => {
    vi.useFakeTimers();
    const provider = createFakeProvider({
      items: [makeFolder({ id: 'sub', name: 'Sub', path: '/sub' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flushMicrotasks(); // call #1 — root, now cached

    provider.list.mockResolvedValueOnce({ items: [makeFile({ name: 'inside.jpg' })], hasMore: false });
    container.querySelector<HTMLElement>('.gca-cell')!.click(); // navigate into /sub — call #2, now cached
    await flushMicrotasks();
    expect(provider.list).toHaveBeenCalledTimes(2);

    // Back to root — already cached from call #1, still within the TTL — no new network call.
    const rootCrumb = container.querySelectorAll<HTMLElement>('.gca-breadcrumb__item')[0];
    rootCrumb.click();
    await flushMicrotasks();
    expect(provider.list).toHaveBeenCalledTimes(2);

    // 10 minutes later (still under the 15-minute TTL), back into /sub — also served from its own cache entry.
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    container.querySelector<HTMLElement>('.gca-cell')!.click();
    await flushMicrotasks();

    expect(provider.list).toHaveBeenCalledTimes(2); // still no new call
    expect(container.querySelector('.gca-cell__name')?.textContent).toBe('inside.jpg'); // cached data, not empty/refetched
  });

  it('goes back to the network once the 15-minute TTL has elapsed, instead of serving the stale cache entry', async () => {
    vi.useFakeTimers();
    const provider = createFakeProvider({
      items: [makeFolder({ id: 'sub', name: 'Sub', path: '/sub' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flushMicrotasks(); // call #1 — root, now cached

    provider.list.mockResolvedValueOnce({ items: [makeFile({ name: 'inside.jpg' })], hasMore: false });
    container.querySelector<HTMLElement>('.gca-cell')!.click(); // navigate into /sub — call #2, now cached
    await flushMicrotasks();
    expect(provider.list).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(16 * 60 * 1000); // past the 15-minute TTL for both cache entries

    provider.list.mockResolvedValueOnce({ items: [], hasMore: false });
    const rootCrumb = container.querySelectorAll<HTMLElement>('.gca-breadcrumb__item')[0];
    rootCrumb.click(); // back to root — cache entry is stale, must re-fetch
    await flushMicrotasks();

    expect(provider.list).toHaveBeenCalledTimes(3);
  });

  it('the refresh button always goes to the network, bypassing the cache, and updates it with fresh data', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'old.jpg' })] });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(provider.list).toHaveBeenCalledTimes(1);

    provider.list.mockResolvedValueOnce({ items: [makeFile({ name: 'fresh.jpg' })], hasMore: false });
    const refreshBtn = container.querySelector<HTMLButtonElement>('.gca-icon-btn')!; // first icon button is refresh
    refreshBtn.click();
    await flush();

    expect(provider.list).toHaveBeenCalledTimes(2);
    expect(container.querySelector('.gca-cell__name')?.textContent).toBe('fresh.jpg');
  });

  it('deleting an item invalidates the cache for its folder so a later visit re-fetches instead of showing the deleted file', async () => {
    const item = makeFile({ id: 'del1', name: 'to-delete.jpg', webUrl: 'https://example.com/x' });
    const provider = createFakeProvider({ items: [item], withDelete: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(provider.list).toHaveBeenCalledTimes(1);

    const cell = container.querySelector<HTMLElement>('.gca-cell')!;
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }));
    const deleteBtn = [...document.querySelectorAll<HTMLElement>('.gca-context-menu__item')].find((b) =>
      b.textContent?.includes('Delete'),
    )!;
    deleteBtn.click(); // first click — enters confirm state
    deleteBtn.click(); // second click — confirms
    await flush();

    expect(provider.delete).toHaveBeenCalledWith(item);

    // Now force a refresh of the same folder — since the cache entry was
    // invalidated, this must go to the network, not just re-show cached data.
    provider.list.mockResolvedValueOnce({ items: [], hasMore: false });
    const refreshBtn = container.querySelector<HTMLButtonElement>('.gca-icon-btn')!;
    refreshBtn.click();
    await flush();
    expect(provider.list).toHaveBeenCalledTimes(2);
  });

  async function flushMicrotasks(times = 5) {
    for (let i = 0; i < times; i++) await Promise.resolve();
  }
});
