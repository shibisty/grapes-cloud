import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleDriveProvider } from '../../src/providers/google/GoogleDriveProvider';
import { installFakeXhr } from '../helpers/fakeXhr';

function jsonResponse(status: number, body: unknown, blobBody?: BlobPart) {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
    text: async () => JSON.stringify(body),
    blob: async () => new Blob([blobBody ?? JSON.stringify(body)]),
  };
}

/** Installs a fake `window.google.accounts.oauth2` GIS client whose requestAccessToken() responds however the test wants. */
function installFakeGis(respond: (silent: boolean) => { access_token?: string; expires_in?: number; error?: string }) {
  const revoke = vi.fn();
  (window as unknown as { google: unknown }).google = {
    accounts: {
      oauth2: {
        initTokenClient: (config: { callback: (r: unknown) => void }) => ({
          callback: config.callback,
          requestAccessToken(overridable?: { prompt?: string }) {
            const silent = overridable?.prompt === '';
            // Real GIS calls back asynchronously; a microtask is enough here.
            Promise.resolve().then(() => this.callback(respond(silent)));
          },
        }),
        revoke,
      },
    },
  };
  return { revoke };
}

describe('GoogleDriveProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as unknown as { google?: unknown }).google;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is unconfigured until a Client ID is saved', () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_1' });
    expect(provider.getAuthState()).toEqual({ configured: false, authenticated: false });
  });

  it('authenticate() requests a token with the interactive (select_account) prompt and stores it', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_2' });
    provider.setCredential('client-id');
    installFakeGis(() => ({ access_token: 'tok-abc', expires_in: 3600 }));

    await provider.authenticate();
    expect(provider.getAuthState().authenticated).toBe(true);
  });

  it('rejects with tokenFailed when GIS returns an error on the interactive request', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_3' });
    provider.setCredential('client-id');
    installFakeGis(() => ({ error: 'access_denied' }));

    await expect(provider.authenticate()).rejects.toMatchObject({ i18nKey: 'google.error.tokenFailed' });
  });

  it('list() silently refreshes an expired token, then requests the folder listing', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_list' });
    provider.setCredential('client-id');
    installFakeGis((silent) => (silent ? { access_token: 'tok-fresh', expires_in: 3600 } : { access_token: 'tok-x', expires_in: 3600 }));

    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse(200, {
        files: [
          { id: 'folder1', name: 'Work', mimeType: 'application/vnd.google-apps.folder' },
          {
            id: 'file1',
            name: 'diagram.png',
            mimeType: 'image/png',
            size: '2048',
            modifiedTime: '2024-02-01T00:00:00Z',
            webViewLink: 'https://drive.google.com/file/d/file1/view',
          },
          // Google Docs (no real binary content) must be filtered out entirely.
          { id: 'doc1', name: 'Notes', mimeType: 'application/vnd.google-apps.document' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await provider.list('');
    expect(result.items.map((i) => i.name)).toEqual(['Work', 'diagram.png']);

    const file = result.items.find((i) => i.name === 'diagram.png')!;
    expect(file.webUrl).toBe('https://drive.google.com/file/d/file1/view');
    expect(file.size).toBe(2048);

    const [url] = fetchMock.mock.calls[0];
    expect(new URL(String(url)).searchParams.get('q')).toBe("'root' in parents and trashed = false");
  });

  it('search() escapes single quotes/backslashes in the query before building q=', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_search' });
    provider.setCredential('client-id');
    installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
    await provider.authenticate();

    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, { files: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await provider.search("O'Brien's file");

    const [url] = fetchMock.mock.calls[0];
    const q = new URL(String(url)).searchParams.get('q');
    expect(q).toBe("name contains 'O\\'Brien\\'s file' and trashed = false");
  });

  it('delete() sends a PATCH with trashed: true (soft delete, not a hard DELETE)', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_del' });
    provider.setCredential('client-id');
    installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
    await provider.authenticate();

    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);

    await provider.delete({ id: 'f1', name: 'f1', kind: 'file', path: 'f1', parentPath: '' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/files/f1');
    expect((init as RequestInit).method).toBe('PATCH');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ trashed: true });
  });

  describe('resolve()', () => {
    it('downloads the file and returns a data: URL for small files', async () => {
      const provider = new GoogleDriveProvider({ storageKey: 'test_gd_resolve' });
      provider.setCredential('client-id');
      installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
      await provider.authenticate();

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, {}, 'small file contents'));
      vi.stubGlobal('fetch', fetchMock);

      const asset = await provider.resolve({ id: 'f1', name: 'f1.txt', kind: 'file', path: 'f1', parentPath: '' });
      expect(asset.src.startsWith('data:')).toBe(true);
      expect(asset.provider).toBe('google-drive');
    });

    it('rejects with fileTooLarge when the downloaded blob exceeds the inline limit', async () => {
      const provider = new GoogleDriveProvider({ storageKey: 'test_gd_toobig' });
      provider.setCredential('client-id');
      installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
      await provider.authenticate();

      const bigContent = 'x'.repeat(11 * 1024 * 1024); // over the 10MB MAX_INLINE_BYTES limit
      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, {}, bigContent));
      vi.stubGlobal('fetch', fetchMock);

      await expect(
        provider.resolve({ id: 'f1', name: 'big.bin', kind: 'file', path: 'f1', parentPath: '' }),
      ).rejects.toMatchObject({ i18nKey: 'google.error.fileTooLarge' });
    });
  });

  it('disconnect() clears the local token and revokes it with GIS', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_disc' });
    provider.setCredential('client-id');
    const { revoke } = installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
    await provider.authenticate();

    provider.disconnect();
    expect(provider.getAuthState().authenticated).toBe(false);
    expect(revoke).toHaveBeenCalledWith('tok');
  });

  it('upload() POSTs a multipart body via XHR and resolves the created item', async () => {
    const provider = new GoogleDriveProvider({ storageKey: 'test_gd_upload' });
    provider.setCredential('client-id');
    installFakeGis(() => ({ access_token: 'tok', expires_in: 3600 }));
    await provider.authenticate();

    const { handles, restore } = installFakeXhr();
    try {
      const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });
      const uploadPromise = provider.upload(file, '');
      // upload() awaits ensureAccessToken() (GIS, microtask-based) and then
      // file.arrayBuffer() (FileReader, fires via a real macrotask in jsdom)
      // before calling xhr.send() — a couple of real setTimeout(0) ticks are
      // needed here, not just queued microtasks.
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));

      expect(handles).toHaveLength(1);
      handles[0].respond(200, { id: 'new1', name: 'hi.txt', mimeType: 'text/plain' });

      const item = await uploadPromise;
      expect(item.name).toBe('hi.txt');
      expect(handles[0].method).toBe('POST');
      expect(handles[0].url).toContain('uploadType=multipart');
    } finally {
      restore();
    }
  });
});
