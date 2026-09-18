import { afterEach, describe, expect, it } from 'vitest';
import { createFakeProvider, makeFile, makeFolder } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

/**
 * Covers the explicit design decision the user made when this feature
 * was scoped: a plain click on a file ALWAYS only selects it — it never
 * inserts. Inserting requires an explicit action: double-click for one
 * file, or the "Вставить (N)"/"Insert (N)" button for the current
 * multi-selection. Getting this wrong is exactly the kind of regression
 * that would silently break muscle memory for anyone testing the plugin.
 *
 * Every click here goes through `cellByName()`, which re-queries the DOM
 * fresh each time: `handleItemClick` ends with `this.renderBody()`, which
 * tears down and rebuilds the whole grid, so any `.gca-cell` reference
 * captured before a click is a detached node afterwards. Grid order is
 * also not insertion order — `sortItems()` always groups folders before
 * files — so tests never rely on a raw `.gca-cell` index either.
 */

function cellByName(container: HTMLElement, name: string): HTMLElement {
  const cell = [...container.querySelectorAll<HTMLElement>('.gca-cell')].find(
    (el) => el.querySelector('.gca-cell__name')?.textContent === name,
  );
  if (!cell) throw new Error(`No .gca-cell named "${name}" found`);
  return cell;
}

function selectedNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.gca-cell--selected .gca-cell__name')].map((n) => n.textContent!).sort();
}

describe('AssetBrowser — selection & explicit insert', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('a plain click on a file only selects it — onSelect/onDone are never called', async () => {
    const provider = createFakeProvider({ items: [makeFile({ id: 'f1', name: 'a.jpg' })] });
    const { container, onSelect, onDone } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click();
    await flush();

    expect(onSelect).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(provider.resolve).not.toHaveBeenCalled();
    expect(cellByName(container, 'a.jpg').classList.contains('gca-cell--selected')).toBe(true);
    expect(container.querySelector('.gca-selection-bar__label')?.textContent).toBe('1 selected');
  });

  it('a plain click on a different file REPLACES the selection, not adds to it', async () => {
    const provider = createFakeProvider({
      items: [makeFile({ id: 'a', name: 'a.jpg' }), makeFile({ id: 'b', name: 'b.jpg' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click();
    await flush();
    cellByName(container, 'b.jpg').click();
    await flush();

    expect(selectedNames(container)).toEqual(['b.jpg']);
  });

  it('ctrl/cmd+click toggles a file in and out of the selection', async () => {
    const provider = createFakeProvider({
      items: [makeFile({ id: 'a', name: 'a.jpg' }), makeFile({ id: 'b', name: 'b.jpg' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await flush();
    cellByName(container, 'b.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await flush();

    expect(selectedNames(container)).toEqual(['a.jpg', 'b.jpg']);

    // Ctrl+click the first one again — toggles it back off.
    cellByName(container, 'a.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await flush();
    expect(selectedNames(container)).toEqual(['b.jpg']);
  });

  it('shift+click selects the range between the last plain click and the shift-clicked file', async () => {
    const provider = createFakeProvider({
      items: [
        makeFile({ id: 'a', name: 'a.jpg' }),
        makeFile({ id: 'b', name: 'b.jpg' }),
        makeFile({ id: 'c', name: 'c.jpg' }),
        makeFile({ id: 'd', name: 'd.jpg' }),
      ],
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click(); // anchor
    await flush();
    cellByName(container, 'c.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true })); // range a..c
    await flush();

    expect(selectedNames(container)).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('shift+click range-selects only among files — a folder in between the grid never becomes "selected"', async () => {
    const provider = createFakeProvider({
      items: [makeFile({ id: 'a', name: 'a.jpg' }), makeFolder({ id: 'mid', name: 'Mid' }), makeFile({ id: 'c', name: 'c.jpg' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click(); // anchor — a plain click on a FILE sets lastClickedId
    await flush();
    cellByName(container, 'c.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await flush();

    expect(selectedNames(container)).toEqual(['a.jpg', 'c.jpg']);
    expect(cellByName(container, 'Mid').classList.contains('gca-cell--selected')).toBe(false);
  });

  it('clicking a folder navigates and clears any existing file selection', async () => {
    const provider = createFakeProvider({
      items: [makeFile({ id: 'a', name: 'a.jpg' }), makeFolder({ id: 'f', name: 'Folder', path: '/folder' })],
    });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click(); // select the file first
    await flush();
    expect(selectedNames(container)).toEqual(['a.jpg']);

    provider.list.mockResolvedValueOnce({ items: [], hasMore: false });
    cellByName(container, 'Folder').click(); // navigate into the folder
    await flush();

    expect(container.querySelector('.gca-selection-bar')).toBeNull();
    expect(provider.list).toHaveBeenLastCalledWith('/folder', { cursor: undefined, signal: expect.anything() });
  });

  it('double-click inserts the single file immediately and signals onDone', async () => {
    const provider = createFakeProvider({ items: [makeFile({ id: 'f1', name: 'a.jpg', path: '/a.jpg' })] });
    const { container, onSelect, onDone } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await flush();

    expect(provider.resolve).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].name).toBe('a.jpg');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('double-clicking a folder does nothing (folders only navigate on plain click)', async () => {
    const provider = createFakeProvider({ items: [makeFolder({ id: 'f', name: 'Folder' })] });
    const { container, onSelect, onDone } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'Folder').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await flush();

    expect(provider.resolve).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('the "Insert (N)" button inserts every selected file and closes once, even with a mix of successes and failures', async () => {
    const provider = createFakeProvider({
      items: [
        makeFile({ id: 'a', name: 'a.jpg', path: '/a.jpg' }),
        makeFile({ id: 'b', name: 'b.jpg', path: '/b.jpg' }),
      ],
    });
    provider.resolve.mockImplementation(async (item) => {
      if (item.id === 'b') throw new Error('resolve failed for b');
      return { src: `resolved:${item.path}`, name: item.name, type: 'image', provider: 'fake' };
    });

    const { container, onSelect, onDone, onError } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await flush();
    cellByName(container, 'b.jpg').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await flush();

    const insertBtn = container.querySelector<HTMLButtonElement>('.gca-selection-bar__actions .gca-btn--primary')!;
    expect(insertBtn.textContent).toBe('Insert (2)');
    insertBtn.click();
    await flush();

    expect(onSelect).toHaveBeenCalledTimes(1); // only "a" succeeded
    expect(onSelect.mock.calls[0][0].name).toBe('a.jpg');
    expect(onError).toHaveBeenCalledTimes(1); // "b" failed, reported, not thrown
    expect(onDone).toHaveBeenCalledTimes(1); // still closes: at least one insert succeeded
    expect(container.querySelector('.gca-selection-bar')).toBeNull(); // selection cleared after insert
  });

  it('does NOT call onDone when every selected insert fails', async () => {
    const provider = createFakeProvider({ items: [makeFile({ id: 'a', name: 'a.jpg' })] });
    provider.resolve.mockRejectedValue(new Error('always fails'));

    const { container, onDone, onError } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click();
    await flush();
    container.querySelector<HTMLButtonElement>('.gca-selection-bar__actions .gca-btn--primary')!.click();
    await flush();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('"Cancel" in the selection bar clears the selection without inserting anything', async () => {
    const provider = createFakeProvider({ items: [makeFile({ id: 'a', name: 'a.jpg' })] });
    const { container, onSelect } = mountAssetBrowser([provider]);
    await flush();

    cellByName(container, 'a.jpg').click();
    await flush();
    container.querySelector<HTMLButtonElement>('.gca-selection-bar__actions .gca-btn:not(.gca-btn--primary)')!.click();
    await flush();

    expect(container.querySelector('.gca-selection-bar')).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
