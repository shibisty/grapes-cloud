import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProvider, makeFile, makeFolder } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

function rowNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.gca-table__name-text')].map((n) => n.textContent!);
}

describe('AssetBrowser — table sort, type filter, search', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('sorting (table view)', () => {
    it('sorts by name ascending, then descending on a second click of the same column — folders always stay first', async () => {
      const provider = createFakeProvider({
        items: [
          makeFile({ id: 'b', name: 'banana.jpg', size: 20 }),
          makeFile({ id: 'a', name: 'apple.jpg', size: 10 }),
          makeFolder({ id: 'z', name: 'zzz-folder' }),
        ],
      });
      localStorage.setItem('gca_view_mode', 'table'); // AssetBrowser reads this in its constructor
      const { container } = mountAssetBrowser([provider]);
      await flush();

      const nameHeader = () => container.querySelectorAll<HTMLElement>('.gca-table__sort-btn')[0];
      nameHeader().click();
      expect(rowNames(container)).toEqual(['zzz-folder', 'apple.jpg', 'banana.jpg']); // folder first, then asc by name

      nameHeader().click(); // second click on the same column → descending (re-query: the header button was rebuilt on re-render)
      expect(rowNames(container)).toEqual(['zzz-folder', 'banana.jpg', 'apple.jpg']);
      expect(nameHeader().textContent).toContain('↓');
    });

    it('sorts by size', async () => {
      const provider = createFakeProvider({
        items: [makeFile({ id: 'a', name: 'a.jpg', size: 300 }), makeFile({ id: 'b', name: 'b.jpg', size: 100 })],
      });
      localStorage.setItem('gca_view_mode', 'table');
      const { container } = mountAssetBrowser([provider]);
      await flush();

      const sizeHeader = container.querySelectorAll<HTMLElement>('.gca-table__sort-btn')[2];
      sizeHeader.click();
      expect(rowNames(container)).toEqual(['b.jpg', 'a.jpg']); // ascending by size: 100 before 300
    });

    it('switching to a different column resets direction to ascending', async () => {
      const provider = createFakeProvider({
        items: [makeFile({ id: 'a', name: 'a.jpg', size: 300 }), makeFile({ id: 'b', name: 'b.jpg', size: 100 })],
      });
      localStorage.setItem('gca_view_mode', 'table');
      const { container } = mountAssetBrowser([provider]);
      await flush();

      const headers = () => container.querySelectorAll<HTMLElement>('.gca-table__sort-btn');
      headers()[0].click(); // name asc
      headers()[0].click(); // name desc
      headers()[2].click(); // switch to size — should be ascending again, not desc
      expect(rowNames(container)).toEqual(['b.jpg', 'a.jpg']);
    });
  });

  describe('type filter', () => {
    it('hides files that do not match the selected type but always keeps folders visible', async () => {
      const provider = createFakeProvider({
        items: [
          makeFile({ id: 'img', name: 'pic.png', mimeType: 'image/png' }),
          makeFile({ id: 'doc', name: 'file.pdf', mimeType: 'application/pdf' }),
          makeFolder({ id: 'f', name: 'Folder' }),
        ],
        withSearch: true,
      });
      const { container } = mountAssetBrowser([provider]);
      await flush();

      const select = container.querySelector<HTMLSelectElement>('.gca-filter-select')!;
      select.value = 'image';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const names = [...container.querySelectorAll('.gca-cell__name')].map((n) => n.textContent);
      expect(names.sort()).toEqual(['Folder', 'pic.png']);
    });

    it('is not rendered at all for a provider without search() (e.g. "My files")', async () => {
      const provider = createFakeProvider({ items: [], withSearch: false });
      const { container } = mountAssetBrowser([provider]);
      await flush();
      expect(container.querySelector('.gca-filter-select')).toBeNull();
      expect(container.querySelector('.gca-search-input')).toBeNull();
    });
  });

  describe('search debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces 350ms before calling provider.search(), and clears any pending search on tab switch', async () => {
      const providerA = createFakeProvider({ id: 'a', label: 'A', items: [], withSearch: true });
      const providerB = createFakeProvider({ id: 'b', label: 'B', items: [] });
      const { container } = mountAssetBrowser([providerA, providerB]);
      await flushTimers();

      const input = container.querySelector<HTMLInputElement>('.gca-search-input')!;
      input.value = 'report';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Switch tabs before the debounce fires — the pending search must not
      // leak into providerA's state after the user has already left it.
      const tabs = container.querySelectorAll<HTMLElement>('.gca-tab');
      tabs[1].click();
      await vi.advanceTimersByTimeAsync(400);

      expect(providerA.search).not.toHaveBeenCalled();
    });

    it('calls provider.search() with the trimmed query after the debounce window', async () => {
      const provider = createFakeProvider({ items: [], withSearch: true });
      const { container } = mountAssetBrowser([provider]);
      await flushTimers();

      const input = container.querySelector<HTMLInputElement>('.gca-search-input')!;
      input.value = '  report  ';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(349);
      expect(provider.search).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(50);
      expect(provider.search).toHaveBeenCalledWith('report', expect.anything());
      expect(provider.list).toHaveBeenCalledTimes(1); // only the initial root listing, not called again for the search
    });

    it('only fires once for rapid keystrokes (debounce restarts on every input event)', async () => {
      const provider = createFakeProvider({ items: [], withSearch: true });
      const { container } = mountAssetBrowser([provider]);
      await flushTimers();

      const input = container.querySelector<HTMLInputElement>('.gca-search-input')!;
      for (const partial of ['r', 're', 'rep', 'repo', 'repor', 'report']) {
        input.value = partial;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(100); // less than the 350ms window between each keystroke
      }
      await vi.advanceTimersByTimeAsync(350);

      expect(provider.search).toHaveBeenCalledTimes(1);
      expect(provider.search).toHaveBeenCalledWith('report', expect.anything());
    });

    async function flushTimers() {
      // Lets the initial (fake-timer-agnostic microtask) loadActiveProvider() settle.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    }
  });
});
