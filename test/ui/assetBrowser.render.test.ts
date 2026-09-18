import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeProvider, makeFile, makeFolder } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

describe('AssetBrowser — render states', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('shows the setup wizard when the provider is not configured yet', async () => {
    const provider = createFakeProvider({ configured: false, authenticated: false });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(container.querySelector('.gca-setup-wizard')).not.toBeNull();
    expect(container.querySelector('.gca-auth-gate')).toBeNull();
  });

  it('shows the auth gate (login button) when configured but not authenticated', async () => {
    const provider = createFakeProvider({ configured: true, authenticated: false });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(container.querySelector('.gca-auth-gate')).not.toBeNull();
    expect(container.querySelector('.gca-btn--primary')?.textContent).toContain('Log in');
  });

  it('surfaces a login failure message inline instead of silently resetting the button', async () => {
    const provider = createFakeProvider({ configured: true, authenticated: false });
    (provider.authenticate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'));
    const { container, onError } = mountAssetBrowser([provider]);
    await flush();

    const loginBtn = container.querySelector<HTMLButtonElement>('.gca-auth-gate .gca-btn--primary')!;
    loginBtn.click();
    await flush();

    expect(onError).toHaveBeenCalled();
    const errorEl = container.querySelector<HTMLElement>('.gca-auth-gate__error')!;
    expect(errorEl.hidden).toBe(false);
    expect(errorEl.textContent).toBe('boom');
    expect(loginBtn.disabled).toBe(false); // button re-enabled, ready to retry
  });

  it('shows a loading indicator while the initial list() is in flight', async () => {
    const provider = createFakeProvider();
    let resolveList!: (v: { items: unknown[]; hasMore: boolean }) => void;
    provider.list.mockReturnValue(new Promise((r) => (resolveList = r)));

    const { container } = mountAssetBrowser([provider]);
    await Promise.resolve(); // enough for loadActiveProvider() to set state.loading = true and render
    expect(container.querySelector('.gca-loading')).not.toBeNull();

    resolveList({ items: [], hasMore: false });
    await flush();
    expect(container.querySelector('.gca-loading')).toBeNull();
  });

  it('shows the empty state when the folder has no items', async () => {
    const provider = createFakeProvider({ items: [] });
    const { container } = mountAssetBrowser([provider]);
    await flush();
    expect(container.querySelector('.gca-empty')).not.toBeNull();
  });

  it('shows a load-more button only when hasMore is true, and it fetches the next page on click', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })] });
    provider.list.mockResolvedValueOnce({ items: [makeFile({ name: 'a.jpg' })], hasMore: true, cursor: 'c1' });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const moreBtn = container.querySelector<HTMLButtonElement>('.gca-load-more');
    expect(moreBtn).not.toBeNull();

    provider.list.mockResolvedValueOnce({ items: [makeFile({ name: 'b.jpg' })], hasMore: false });
    moreBtn!.click();
    await flush();

    expect(provider.list).toHaveBeenLastCalledWith('', { cursor: 'c1', signal: expect.anything() });
    expect(container.querySelectorAll('.gca-cell')).toHaveLength(2); // appended, not replaced
    expect(container.querySelector('.gca-load-more')).toBeNull(); // hasMore is now false
  });

  it('renders folders and files, and clicking a folder navigates into it via list(path)', async () => {
    const provider = createFakeProvider({ items: [makeFolder({ id: 'f1', name: 'Docs', path: '/docs' })] });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    provider.list.mockResolvedValueOnce({ items: [], hasMore: false });
    const folderCell = container.querySelector<HTMLElement>('.gca-cell')!;
    folderCell.click();
    await flush();

    expect(provider.list).toHaveBeenLastCalledWith('/docs', { cursor: undefined, signal: expect.anything() });
    const crumbs = container.querySelectorAll('.gca-breadcrumb__item');
    expect(crumbs[crumbs.length - 1].textContent).toBe('Docs');
  });

  it('switching tabs preserves each provider\'s own state independently', async () => {
    const providerA = createFakeProvider({ id: 'a', label: 'Provider A', items: [makeFile({ name: 'a.jpg' })] });
    const providerB = createFakeProvider({ id: 'b', label: 'Provider B', items: [makeFile({ name: 'b.jpg' })] });
    const { container } = mountAssetBrowser([providerA, providerB]);
    await flush();

    expect(container.querySelector('.gca-cell__name')?.textContent).toBe('a.jpg');

    const tabs = container.querySelectorAll<HTMLElement>('.gca-tab');
    tabs[1].click();
    await flush();
    expect(container.querySelector('.gca-cell__name')?.textContent).toBe('b.jpg');
    expect(providerB.list).toHaveBeenCalledTimes(1);

    tabs[0].click();
    await flush();
    // Switching back to A does not re-fetch — its items are still in local state.
    expect(container.querySelector('.gca-cell__name')?.textContent).toBe('a.jpg');
    expect(providerA.list).toHaveBeenCalledTimes(1);
  });

  it('remembers the grid/table view toggle across renders via localStorage', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })] });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    expect(container.querySelector('.gca-grid')).not.toBeNull();
    const tableBtn = container.querySelectorAll<HTMLElement>('.gca-view-toggle__btn')[1];
    tableBtn.click();
    expect(container.querySelector('.gca-table-wrap')).not.toBeNull();
    expect(localStorage.getItem('gca_view_mode')).toBe('table');
  });
});
