/**
 * jsdom implements neither `DataTransfer` nor the (nonstandard, but
 * universally supported) `webkitGetAsEntry()`/`FileSystemEntry` file-
 * drop API that `AssetBrowser.collectDroppedFiles()`/`walkFileSystemEntry()`
 * rely on for recursive folder uploads. These helpers build minimal
 * fake objects that only implement the handful of members our code
 * actually reads — see `AssetBrowser.ts` — so tests can simulate real
 * drag-and-drop without a real browser.
 */

export interface FakeFileEntry {
  isFile: true;
  isDirectory: false;
  file(successCb: (file: File) => void, errorCb?: (err: unknown) => void): void;
}

export interface FakeDirectoryEntry {
  isFile: false;
  isDirectory: true;
  createReader(): { readEntries(successCb: (entries: FakeEntry[]) => void, errorCb?: (err: unknown) => void): void };
}

export type FakeEntry = FakeFileEntry | FakeDirectoryEntry;

export function fileEntry(file: File): FakeFileEntry {
  return {
    isFile: true,
    isDirectory: false,
    file: (successCb) => successCb(file),
  };
}

/** A dropped folder — `children` can itself contain `dirEntry(...)` for nested subfolders. */
export function dirEntry(children: FakeEntry[]): FakeDirectoryEntry {
  // Real FileSystemDirectoryReader.readEntries() must be called
  // repeatedly until it returns an empty array — walkFileSystemEntry()
  // in AssetBrowser.ts relies on exactly that, so the fake mirrors it
  // instead of just handing back everything on the first call.
  let exhausted = false;
  return {
    isFile: false,
    isDirectory: true,
    createReader: () => ({
      readEntries: (successCb) => {
        if (exhausted) {
          successCb([]);
          return;
        }
        exhausted = true;
        successCb(children);
      },
    }),
  };
}

/** A DataTransferItem-like object exposing only `webkitGetAsEntry()`. */
function dtItem(entry: FakeEntry) {
  return { webkitGetAsEntry: () => entry };
}

/**
 * A fake `DataTransfer` with real File System Access entries (folders
 * supported) — what Chrome/Firefox/Safari actually hand a drop handler.
 */
export function fakeDataTransferWithEntries(entries: FakeEntry[]): DataTransfer {
  return {
    types: ['Files'],
    dropEffect: 'none',
    items: entries.map(dtItem),
    files: [] as unknown as FileList,
  } as unknown as DataTransfer;
}

/** A fake `DataTransfer` with only a flat file list — the pre-webkitGetAsEntry() fallback path. */
export function fakeDataTransferFiles(files: File[]): DataTransfer {
  return {
    types: ['Files'],
    dropEffect: 'none',
    items: [],
    files: files as unknown as FileList,
  } as unknown as DataTransfer;
}

/**
 * A drag/drop `Event` carrying the given fake `dataTransfer` — jsdom's
 * own `DragEvent` constructor does not support a settable
 * `dataTransfer`, so a plain bubbling `Event` is used and the property
 * is attached directly; `AssetBrowser`'s handlers only ever read
 * `event.dataTransfer` and call `event.preventDefault()`, both of
 * which this satisfies.
 */
export function dragEvent(type: string, dataTransfer: DataTransfer): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, configurable: true });
  return event;
}
