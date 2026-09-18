import { vi } from 'vitest';
import { AssetBrowser, type AssetBrowserProps } from '../../src/ui/AssetBrowser';
import { createFakeEditor, type FakeEditor } from './fakeEditor';
import type { StorageProvider } from '../../src/types';

export interface MountResult {
  container: HTMLElement;
  editor: FakeEditor;
  browser: AssetBrowser;
  onSelect: ReturnType<typeof vi.fn>;
  onDone: ReturnType<typeof vi.fn>;
  onError: ReturnType<typeof vi.fn>;
}

/**
 * Mounts a real `AssetBrowser` into a container attached to
 * `document.body` (its context-menu/settings-menu code queries
 * `document`-level listeners, so it must be in the live tree, not just
 * detached) with a fake `Editor`. Returns spies for the three
 * `AssetBrowserProps` callbacks so tests can assert on them directly.
 */
export function mountAssetBrowser(providers: StorageProvider[], overrides: Partial<AssetBrowserProps> = {}): MountResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const editor = createFakeEditor();
  const onSelect = vi.fn();
  const onDone = vi.fn();
  const onError = vi.fn();

  const browser = new AssetBrowser(container, {
    editor,
    providers,
    onSelect,
    onDone,
    onError,
    ...overrides,
  });

  return { container, editor, browser, onSelect, onDone, onError };
}

/** Flushes the microtask queue enough times for a provider.list()/search() promise chain (+ render) to settle. */
export async function flush(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) await Promise.resolve();
}
