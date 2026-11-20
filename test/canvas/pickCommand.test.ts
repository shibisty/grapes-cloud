import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Editor } from 'grapesjs';
import { openCloudMediaPicker } from '../../src/canvas/picker';
import { PICK_COMMAND, registerPickCommand } from '../../src/canvas/pickCommand';
import { createFakeEditor } from '../helpers/fakeEditor';
import { createFakeProvider, makeFile } from '../helpers/fakeProvider';

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};

/** A fake editor whose Modal is already open (another plugin's dialog) and whose Commands work. */
function editorWithOpenModal(): { editor: Editor; modalOpen: ReturnType<typeof vi.fn>; run: (id: string, o?: unknown) => unknown } {
  const base = createFakeEditor();
  const cmds = new Map<string, { run: (...a: unknown[]) => unknown }>();
  const modalOpen = vi.fn();
  const editor = {
    ...base,
    Modal: { isOpen: () => true, open: modalOpen },
    Commands: { add: (id: string, c: { run: (...a: unknown[]) => unknown }) => cmds.set(id, c), has: (id: string) => cmds.has(id) },
  } as unknown as Editor;
  return { editor, modalOpen, run: (id, o) => cmds.get(id)!.run(editor, null, o) };
}

describe('overlay mode and the pick command', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens over an open dialog without touching editor.Modal, filtered by type; resolves the chosen file', async () => {
    const { editor, modalOpen, run } = editorWithOpenModal();
    const img = makeFile({ id: 'i', name: 'cat.jpg', mimeType: 'image/jpeg' });
    const doc = makeFile({ id: 'd', name: 'a.pdf', mimeType: 'application/pdf' });
    registerPickCommand(editor, [createFakeProvider({ items: [img, doc] })]);
    expect((editor.Commands as any).has(PICK_COMMAND)).toBe(true);

    const promise = run(PICK_COMMAND, { type: 'image' }) as Promise<unknown>;
    await flush();
    expect(modalOpen).not.toHaveBeenCalled();
    const overlay = document.querySelector('.gca-overlay')!;
    expect(overlay).not.toBeNull();
    const cells = overlay.querySelectorAll<HTMLElement>('.gca-cell');
    expect(cells).toHaveLength(1); // the PDF is filtered out
    cells[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await flush();
    const res = (await promise) as Array<{ name: string }>;
    expect(res.map((a) => a.name)).toEqual(['cat.jpg']);
    expect(document.querySelector('.gca-overlay')).toBeNull();
  });

  it('Escape, the × and a click on the backdrop close it with null', async () => {
    const editor = createFakeEditor();
    const provider = createFakeProvider({ items: [] });
    for (const how of ['esc', 'x', 'backdrop'] as const) {
      const p = openCloudMediaPicker(editor, [provider], { overlay: true });
      await flush();
      const overlay = document.querySelector<HTMLElement>('.gca-overlay')!;
      if (how === 'esc') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      if (how === 'x') overlay.querySelector<HTMLElement>('.gca-overlay__close')!.click();
      if (how === 'backdrop') overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await expect(p).resolves.toBeNull();
      expect(document.querySelector('.gca-overlay')).toBeNull();
    }
  });
});
