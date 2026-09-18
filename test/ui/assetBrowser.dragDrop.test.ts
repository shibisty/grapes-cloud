import { afterEach, describe, expect, it } from 'vitest';
import type { StorageItem } from '../../src/types';
import { dragEvent, fakeDataTransferFiles, fakeDataTransferWithEntries, fileEntry, dirEntry } from '../helpers/fakeDataTransfer';
import { createFakeProvider, makeFile } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

function body(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[data-gca-body]')!;
}

function overlay(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('.gca-drop-overlay')!;
}

describe('AssetBrowser — drag-and-drop upload', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('shows the drop overlay on dragenter and hides it again on dragleave, only for a provider with upload()', async () => {
    const provider = createFakeProvider({ items: [], withUpload: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const dt = fakeDataTransferFiles([new File(['x'], 'x.txt')]);
    expect(overlay(container).hidden).toBe(true);

    body(container).dispatchEvent(dragEvent('dragenter', dt));
    expect(overlay(container).hidden).toBe(false);

    body(container).dispatchEvent(dragEvent('dragleave', dt));
    expect(overlay(container).hidden).toBe(true);
  });

  it('never activates the drop overlay for a provider without upload()', async () => {
    const provider = createFakeProvider({ items: [], withUpload: false });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const dt = fakeDataTransferFiles([new File(['x'], 'x.txt')]);
    body(container).dispatchEvent(dragEvent('dragenter', dt));
    expect(overlay(container).hidden).toBe(true);

    body(container).dispatchEvent(dragEvent('drop', dt));
    await flush();
    expect(overlay(container).hidden).toBe(true);
  });

  it('does not hide the overlay when the pointer passes over a nested child before actually leaving the drop area', async () => {
    const provider = createFakeProvider({ items: [makeFile({ name: 'a.jpg' })], withUpload: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const dt = fakeDataTransferFiles([]);
    const cell = container.querySelector<HTMLElement>('.gca-cell')!;

    body(container).dispatchEvent(dragEvent('dragenter', dt)); // depth 1
    cell.dispatchEvent(dragEvent('dragenter', dt)); // bubbles to body → depth 2
    cell.dispatchEvent(dragEvent('dragleave', dt)); // bubbles to body → depth 1
    expect(overlay(container).hidden).toBe(false); // still inside the drop area overall

    body(container).dispatchEvent(dragEvent('dragleave', dt)); // depth 0
    expect(overlay(container).hidden).toBe(true);
  });

  it('drop of plain files uploads each one to the current folder, tracks progress, and refreshes the listing', async () => {
    const provider = createFakeProvider({ items: [], withUpload: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    let progressCb: ((p: { loaded: number; total: number }) => void) | undefined;
    let resolveUpload!: () => void;
    provider.upload.mockImplementation(
      (file: File, _folderPath: string, onProgress?: (p: { loaded: number; total: number }) => void) => {
        progressCb = onProgress;
        return new Promise<StorageItem>((resolve) => {
          resolveUpload = () => resolve(makeFile({ name: file.name }));
        });
      },
    );

    const file = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' });
    const dt = fakeDataTransferFiles([file]);
    body(container).dispatchEvent(dragEvent('dragenter', dt));
    body(container).dispatchEvent(dragEvent('drop', dt));
    await flush();

    expect(overlay(container).hidden).toBe(true); // drop closes the overlay immediately
    expect(provider.upload).toHaveBeenCalledWith(file, '', expect.any(Function));

    const queue = container.querySelector<HTMLElement>('.gca-upload-queue')!;
    expect(queue.hidden).toBe(false);
    expect(queue.querySelector('.gca-upload-queue__name')!.textContent).toBe('photo.jpg');

    progressCb!({ loaded: 50, total: 100 });
    await flush();
    expect(queue.querySelector('.gca-upload-queue__status')!.textContent).toBe('50%');

    provider.list.mockClear();
    resolveUpload();
    await flush();

    expect(queue.querySelector('.gca-upload-queue__status')!.textContent).toBe('Done');
    // Still viewing the same folder it uploaded into → the listing gets force-refreshed.
    expect(provider.list).toHaveBeenCalledWith('', expect.objectContaining({}));
  });

  it('recursively flattens a dropped folder (including a nested subfolder) into individual upload() calls in the current folder, ignoring the folders themselves', async () => {
    const provider = createFakeProvider({ items: [], withUpload: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const topFile = new File(['t'], 'top.txt');
    const fileA = new File(['a'], 'a.txt');
    const fileB = new File(['b'], 'b.txt');

    const dt = fakeDataTransferWithEntries([
      fileEntry(topFile),
      dirEntry([fileEntry(fileA), dirEntry([fileEntry(fileB)])]), // folder containing a file and a nested subfolder
    ]);

    body(container).dispatchEvent(dragEvent('drop', dt));
    await flush(50);

    const uploadedNames = provider.upload.mock.calls.map((call) => (call[0] as File).name).sort();
    expect(uploadedNames).toEqual(['a.txt', 'b.txt', 'top.txt']);
    // Every file — including the ones from inside the (nested) folder — lands in the currently open folder, not a re-created subpath.
    expect(provider.upload.mock.calls.every((call) => call[1] === '')).toBe(true);
  });

  it('a failed upload is reported inline in the queue and does not stop the remaining files from uploading', async () => {
    const provider = createFakeProvider({ items: [], withUpload: true });
    const { container, onError } = mountAssetBrowser([provider]);
    await flush();

    provider.upload.mockImplementationOnce(async () => {
      throw new Error('quota exceeded');
    });
    provider.upload.mockImplementationOnce(async (file: File) => makeFile({ name: file.name }));

    const dt = fakeDataTransferFiles([new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]);
    body(container).dispatchEvent(dragEvent('drop', dt));
    await flush(8);

    expect(onError).toHaveBeenCalled();
    const statuses = [...container.querySelectorAll('.gca-upload-queue__status')].map((el) => el.textContent);
    expect(statuses).toEqual(['quota exceeded', 'Done']);
  });

  it('closing the finished queue panel clears it', async () => {
    const provider = createFakeProvider({ items: [], withUpload: true });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    const dt = fakeDataTransferFiles([new File(['x'], 'x.txt')]);
    body(container).dispatchEvent(dragEvent('drop', dt));
    await flush(8);

    const closeBtn = container.querySelector<HTMLButtonElement>('.gca-upload-queue__close')!;
    closeBtn.click();
    expect(container.querySelector<HTMLElement>('.gca-upload-queue')!.hidden).toBe(true);
  });
});
