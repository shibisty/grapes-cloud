import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Editor } from 'grapesjs';
import { openCloudMediaPicker } from '../../src/canvas/picker';
import { createFakeEditor } from '../helpers/fakeEditor';
import { createFakeProvider, makeFile } from '../helpers/fakeProvider';

/**
 * `openCloudMediaPicker` builds a real `AssetBrowser` inside the modal's
 * content container — these tests drive it through actual DOM clicks
 * rather than mocking `AssetBrowser` away, so they also double as an
 * end-to-end check of the onSelect/onDone contract described in
 * `AssetBrowserProps` (see the big comment there about why `onSelect` no
 * longer closes the modal by itself).
 */
function editorWithModal(): {
  editor: Editor;
  closeSpy: ReturnType<typeof vi.fn>;
  onceCloseHandlers: Array<() => void>;
  getContainer: () => HTMLElement;
} {
  const base = createFakeEditor();
  const closeSpy = vi.fn();
  const onceCloseHandlers: Array<() => void> = [];
  let container: HTMLElement | null = null;

  const editor = {
    ...base,
    Modal: {
      open: vi.fn((opts: { title?: string; content: HTMLElement }) => {
        // Real GrapesJS mounts `opts.content` into the DOM when it opens the
        // modal — attach it to `document.body` here so tests can query into
        // it the same way a person clicking through the real UI would.
        container = opts.content;
        document.body.appendChild(container);
        return {
          close: closeSpy,
          onceClose: (handler: () => void) => {
            onceCloseHandlers.push(handler);
          },
        };
      }),
    },
  } as unknown as Editor;

  return {
    editor,
    closeSpy,
    onceCloseHandlers,
    getContainer: () => {
      if (!container) throw new Error('Modal.open() was not called yet');
      return container;
    },
  };
}

describe('openCloudMediaPicker', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves null and does not call Modal.close() twice when the user closes without selecting (X button / overlay)', async () => {
    const { editor, closeSpy, onceCloseHandlers } = editorWithModal();
    const provider = createFakeProvider({ items: [] });

    const promise = openCloudMediaPicker(editor, [provider]);
    // Simulate the modal's own close button being clicked — this is what
    // fires modal.onceClose(), NOT our onDone callback.
    onceCloseHandlers.forEach((h) => h());

    await expect(promise).resolves.toBeNull();
    expect(closeSpy).not.toHaveBeenCalled(); // browser.destroy() runs, but we never call modal.close() ourselves here
  });

  it('resolves with the inserted asset(s) and closes the modal when the user double-clicks a file', async () => {
    const { editor, closeSpy, onceCloseHandlers, getContainer } = editorWithModal();
    const file = makeFile({ id: 'f1', name: 'cat.jpg' });
    const provider = createFakeProvider({ items: [file] });

    const promise = openCloudMediaPicker(editor, [provider]);
    // AssetBrowser's constructor kicks off loadActiveProvider() (async
    // provider.list()) — let it resolve and render before we can click a cell.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const cell = getContainer().querySelector<HTMLElement>('.gca-cell')!;
    cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    // quickInsert() awaits provider.resolve() — flush microtasks.
    await Promise.resolve();
    await Promise.resolve();

    const result = await promise;
    expect(result).toHaveLength(1);
    expect(result![0].name).toBe('cat.jpg');
    expect(closeSpy).toHaveBeenCalledTimes(1);

    // The modal's own onceClose still fires afterwards (real GrapesJS calls
    // it as part of modal.close()) — must not resolve a second time / throw.
    onceCloseHandlers.forEach((h) => h());
  });

  it('accumulates multiple onSelect calls into one resolved array (multi-select "Insert (N)")', async () => {
    const { editor, getContainer } = editorWithModal();
    const fileA = makeFile({ id: 'a', name: 'a.jpg' });
    const fileB = makeFile({ id: 'b', name: 'b.jpg' });
    const provider = createFakeProvider({ items: [fileA, fileB] });

    const promise = openCloudMediaPicker(editor, [provider]);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const cells = getContainer().querySelectorAll<HTMLElement>('.gca-cell');
    cells[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    cells[1].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));

    const insertBtn = getContainer().querySelector<HTMLElement>('.gca-selection-bar__actions .gca-btn--primary')!;
    insertBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const result = await promise;
    expect(result?.map((a) => a.name).sort()).toEqual(['a.jpg', 'b.jpg']);
  });
});
