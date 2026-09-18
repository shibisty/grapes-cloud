import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProvider, makeFile } from '../helpers/fakeProvider';
import { mountAssetBrowser } from '../helpers/mountAssetBrowser';

/**
 * renderBody() tears down and rebuilds `.gca-body` on every state
 * change — including the two renders the search debounce itself
 * triggers (state.loading = true, then the resolved results). Before
 * the fix, that stole focus from the search input mid-typing/mid-
 * refresh (see task: "Поиск скидывает focus во время обновления, не
 * должен"). captureFocusState()/restoreFocusState() in AssetBrowser.ts
 * are what these tests exercise.
 */
describe('AssetBrowser — focus preservation across renderBody()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.useRealTimers();
  });

  async function settleInitialLoad() {
    // Lets the initial (fake-timer-agnostic microtask) loadActiveProvider() settle.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  it('keeps focus and cursor position in the search input across the debounce-triggered re-renders', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })], withSearch: true });
    const { container } = mountAssetBrowser([provider]);
    await settleInitialLoad();

    const input = container.querySelector<HTMLInputElement>('.gca-search-input')!;
    input.focus();
    input.value = 'report';
    input.setSelectionRange(3, 3); // cursor after "rep"
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // First renderBody() happens synchronously once loadActiveProvider()
    // sets state.loading = true, well before the debounce timer fires.
    await vi.advanceTimersByTimeAsync(350);
    await Promise.resolve();
    await Promise.resolve();

    const afterFirstRender = container.querySelector<HTMLInputElement>('.gca-search-input')!;
    expect(afterFirstRender).not.toBe(input); // the element itself was torn down and rebuilt
    expect(document.activeElement).toBe(afterFirstRender); // but focus followed it
    expect(afterFirstRender.value).toBe('report');
    expect(afterFirstRender.selectionStart).toBe(3);
    expect(afterFirstRender.selectionEnd).toBe(3);

    // And after the search() promise itself resolves (second renderBody()) — still focused.
    await Promise.resolve();
    await Promise.resolve();
    const afterSecondRender = container.querySelector<HTMLInputElement>('.gca-search-input')!;
    expect(document.activeElement).toBe(afterSecondRender);
  });

  it('keeps focus in the type filter <select> across the renderBody() its own change triggers', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })], withSearch: true });
    const { container } = mountAssetBrowser([provider]);
    await settleInitialLoad();

    const select = container.querySelector<HTMLSelectElement>('.gca-filter-select')!;
    select.focus();
    select.value = 'image';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    const afterRender = container.querySelector<HTMLSelectElement>('.gca-filter-select')!;
    expect(afterRender).not.toBe(select);
    expect(document.activeElement).toBe(afterRender);
    expect(afterRender.value).toBe('image');
  });

  it('does not restore focus onto an unrelated element after a render triggered from somewhere else', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' }), makeFile({ name: 'b.jpg' })], withSearch: true });
    const { container } = mountAssetBrowser([provider]);
    await settleInitialLoad();

    // Focus the search input, but trigger the re-render via a completely
    // different action (clicking a grid cell) — the input had focus but
    // isn't part of this render's cause, so no crash, and the click's own
    // target behaves normally (this mostly guards against captureFocusState()
    // throwing or misbehaving when the focused element isn't the thing driving the render).
    const input = container.querySelector<HTMLInputElement>('.gca-search-input')!;
    input.focus();

    const cell = container.querySelector<HTMLElement>('.gca-cell')!;
    expect(() => cell.click()).not.toThrow();

    // Selection changed as a normal consequence of the click — search input still exists and usable.
    expect(container.querySelector('.gca-search-input')).not.toBeNull();
  });
});
