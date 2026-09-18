import { afterEach, describe, expect, it } from 'vitest';
import { createFakeProvider } from '../helpers/fakeProvider';
import { mountAssetBrowser } from '../helpers/mountAssetBrowser';

/**
 * jsdom never computes real layout, so `clientWidth`/`offsetWidth`
 * are always 0 — `AssetBrowser.updateTabsOverflow()` treats that as
 * "not measurable yet" and leaves every tab visible (see its own
 * doc-comment). To actually exercise the hide/chevron logic here, the
 * relevant widths are stubbed directly on the elements before
 * triggering a recompute (the `resize` listener — the same path a
 * real window resize takes, see `AssetBrowser.onWindowResize`).
 */
function stubWidth(el: Element, prop: 'clientWidth' | 'offsetWidth', value: number): void {
  Object.defineProperty(el, prop, { configurable: true, value });
}

function recompute(): void {
  window.dispatchEvent(new Event('resize'));
}

describe('AssetBrowser — responsive tab overflow (hide behind a chevron when tabs do not fit)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('keeps every tab visible and the chevron hidden while the row is not measurable (jsdom default: clientWidth 0)', () => {
    const providers = ['A', 'B', 'C'].map((label) => createFakeProvider({ id: label, label, items: [] }));
    const { container } = mountAssetBrowser(providers);

    expect([...container.querySelectorAll<HTMLElement>('.gca-tab-wrap')].every((w) => w.style.display !== 'none')).toBe(true);
    expect(container.querySelector<HTMLElement>('.gca-tab-overflow')!.hidden).toBe(true);
  });

  it('hides the tabs that do not fit behind the chevron, keeping the active tab visible', () => {
    const providers = ['A', 'B', 'C'].map((label) => createFakeProvider({ id: label, label, items: [] }));
    const { container } = mountAssetBrowser(providers); // 'A' is active (first provider)

    const tabsEl = container.querySelector<HTMLElement>('.gca-tabs')!;
    const wraps = [...container.querySelectorAll<HTMLElement>('.gca-tab-wrap')];
    const addWrap = container.querySelector<HTMLElement>('.gca-tab-add')!;

    stubWidth(tabsEl, 'clientWidth', 250);
    wraps.forEach((w) => stubWidth(w, 'offsetWidth', 100));
    stubWidth(addWrap, 'offsetWidth', 30);
    recompute();

    expect(wraps[0].style.display).not.toBe('none'); // active — always visible
    expect(wraps[1].style.display).toBe('none');
    expect(wraps[2].style.display).toBe('none');

    const overflowWrap = container.querySelector<HTMLElement>('.gca-tab-overflow')!;
    expect(overflowWrap.hidden).toBe(false);
    const overflowItems = [...overflowWrap.querySelectorAll('.gca-tab-overflow__item')].map((el) => el.textContent);
    expect(overflowItems).toEqual(['B', 'C']);
  });

  it('keeps the active tab visible even when it is positionally later than tabs that get hidden', async () => {
    const providers = ['A', 'B', 'C'].map((label) => createFakeProvider({ id: label, label, items: [] }));
    const { container } = mountAssetBrowser(providers);

    // Switch to 'C' — its position in the DOM stays last, but it must never end up in the overflow menu once active.
    container.querySelectorAll<HTMLElement>('.gca-tab')[2].click();

    const tabsEl = container.querySelector<HTMLElement>('.gca-tabs')!;
    const wraps = [...container.querySelectorAll<HTMLElement>('.gca-tab-wrap')];
    const addWrap = container.querySelector<HTMLElement>('.gca-tab-add')!;
    stubWidth(tabsEl, 'clientWidth', 250);
    wraps.forEach((w) => stubWidth(w, 'offsetWidth', 100));
    stubWidth(addWrap, 'offsetWidth', 30);
    recompute();

    expect(wraps[2].style.display).not.toBe('none'); // C — active, stays visible
    const overflowItems = [...container.querySelectorAll('.gca-tab-overflow__item')].map((el) => el.textContent);
    expect(overflowItems).not.toContain('C');
  });

  it('clicking a hidden tab in the overflow menu switches to it', async () => {
    const providers = ['A', 'B', 'C'].map((label) => createFakeProvider({ id: label, label, items: [] }));
    const { container } = mountAssetBrowser(providers);

    const tabsEl = container.querySelector<HTMLElement>('.gca-tabs')!;
    const wraps = [...container.querySelectorAll<HTMLElement>('.gca-tab-wrap')];
    const addWrap = container.querySelector<HTMLElement>('.gca-tab-add')!;
    stubWidth(tabsEl, 'clientWidth', 250);
    wraps.forEach((w) => stubWidth(w, 'offsetWidth', 100));
    stubWidth(addWrap, 'offsetWidth', 30);
    recompute();

    const overflowItem = [...container.querySelectorAll<HTMLElement>('.gca-tab-overflow__item')].find((el) => el.textContent === 'C')!;
    overflowItem.click();

    // renderShell() rebuilds everything on switch — the (now active) 'C' tab is back among .gca-tab-wrap in first position order-wise, still visible pre-recompute (fresh render defaults to showing all).
    expect(container.querySelectorAll<HTMLElement>('.gca-tab')[2].classList.contains('gca-tab--active')).toBe(true);
  });
});
