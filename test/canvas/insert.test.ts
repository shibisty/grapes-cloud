import { describe, expect, it, vi } from 'vitest';
import type { Component, Editor } from 'grapesjs';
import { insertAfterSelectionOrEnd } from '../../src/canvas/insert';
import type { ComponentDef } from '../../src/canvas/componentDef';

/** Minimal fake Component — just append()/parent()/index(), the only members insert.ts touches. */
function fakeComponent(index: number, parent: Component | null): Component {
  const appended: unknown[] = [];
  const comp = {
    index: () => index,
    parent: () => parent,
    append: vi.fn((_def: ComponentDef, _opts?: { at?: number }) => {
      const inserted = { id: `inserted-${appended.length}` } as unknown as Component;
      appended.push(inserted);
      return [inserted];
    }),
  } as unknown as Component;
  return comp;
}

function fakeEditor(opts: { selected: Component | null; wrapper: Component | null; scrollTo?: ReturnType<typeof vi.fn> }): Editor {
  const select = vi.fn();
  return {
    getSelected: () => opts.selected,
    getWrapper: () => opts.wrapper,
    select,
    ...(opts.scrollTo ? { Canvas: { scrollTo: opts.scrollTo } } : {}),
  } as unknown as Editor;
}

describe('insertAfterSelectionOrEnd', () => {
  it('appends into the selected component\'s parent, right after it, when something is selected', () => {
    const parent = fakeComponent(0, null);
    const selected = fakeComponent(2, parent);
    const editor = fakeEditor({ selected, wrapper: null });

    const def: ComponentDef = { type: 'image', src: 'x' };
    const inserted = insertAfterSelectionOrEnd(editor, def);

    expect(parent.append).toHaveBeenCalledWith(def, { at: 3 }); // selected.index() + 1
    expect(editor.select).toHaveBeenCalledWith(inserted);
  });

  it('appends to the end of the wrapper when nothing is selected', () => {
    const wrapper = fakeComponent(0, null);
    const editor = fakeEditor({ selected: null, wrapper });

    const def: ComponentDef = { type: 'image', src: 'x' };
    insertAfterSelectionOrEnd(editor, def);

    // No `at` — appended at the end, not at an index.
    expect(wrapper.append).toHaveBeenCalledWith(def);
  });

  it('throws when the editor has no wrapper at all (defensive — should never happen in a working editor)', () => {
    const editor = fakeEditor({ selected: null, wrapper: null });
    expect(() => insertAfterSelectionOrEnd(editor, { type: 'image' })).toThrow(/getWrapper\(\) is unavailable/);
  });

  it('scrolls the canvas to the inserted component (regression: inserting via button/click with no selection landed at the end of the page and was invisible unless the user scrolled there manually)', () => {
    const wrapper = fakeComponent(0, null);
    const scrollTo = vi.fn();
    const editor = fakeEditor({ selected: null, wrapper, scrollTo });

    const inserted = insertAfterSelectionOrEnd(editor, { type: 'image', src: 'x' });

    expect(scrollTo).toHaveBeenCalledWith(inserted, { behavior: 'smooth' });
  });

  it('does not throw when editor.Canvas.scrollTo is unavailable (e.g. no real canvas frame)', () => {
    const wrapper = fakeComponent(0, null);
    const editor = fakeEditor({ selected: null, wrapper }); // no Canvas at all

    expect(() => insertAfterSelectionOrEnd(editor, { type: 'image', src: 'x' })).not.toThrow();
  });
});
