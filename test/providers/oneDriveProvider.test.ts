import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OneDriveProvider } from '../../src/providers/onedrive/OneDriveProvider';
import { installFakeXhr } from '../helpers/fakeXhr';

function jsonResponse(status: number, body: unknown, statusText = status >= 200 && status < 300 ? 'OK' : 'Error') {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

const REDIRECT = 'https://site.example/microsoft-callback.html';

describe('OneDriveProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is unconfigured until an Application (client) ID is saved', () => {
    const provider = new OneDriveProvider({ storageKey: 'test_od_1', redirectUri: REDIRECT });
    expect(provider.getAuthState()).toEqual({ configured: false, authenticated: false });
  });

  describe('list()', () => {
    it('maps children into StorageItem, preferring the medium thumbnail over small', async () => {
      localStorage.setItem('test_od_list', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_list', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
        jsonResponse(200, {
          value: [
            {
              id: 'folder1',
              name: 'Docs',
              folder: { childCount: 2 },
              webUrl: 'https://onedrive.live.com/folder1',
            },
            {
              id: 'file1',
              name: 'photo.jpg',
              size: 500,
              lastModifiedDateTime: '2024-03-01T00:00:00Z',
              file: { mimeType: 'image/jpeg' },
              thumbnails: [{ small: { url: 'small.jpg' }, medium: { url: 'medium.jpg' } }],
              webUrl: 'https://onedrive.live.com/file1',
            },
          ],
          '@odata.nextLink': 'https://graph.microsoft.com/v1.0/next-page',
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider.list('');
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('https://graph.microsoft.com/v1.0/next-page');

      const file = result.items.find((i) => i.kind === 'file')!;
      expect(file.thumbnailUrl).toBe('medium.jpg');
      expect(file.webUrl).toBe('https://onedrive.live.com/file1');
    });

    it('translates a Graph "Tenant does not have a SPO license" error into GcaError noSpoLicense', async () => {
      localStorage.setItem('test_od_spo', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_spo', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
        jsonResponse(400, { error: { message: 'Tenant does not have a SPO license.' } }, 'Bad Request'),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'microsoft.error.noSpoLicense' });
    });

    it('lets an unrelated Graph error through as a plain Error with status/text', async () => {
      localStorage.setItem('test_od_other', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_other', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(404, { error: { message: 'itemNotFound' } }, 'Not Found'));
      vi.stubGlobal('fetch', fetchMock);

      await expect(provider.list('')).rejects.toThrow(/Microsoft Graph 404/);
    });
  });

  describe('resolve()', () => {
    it('uses the item straight from /me/drive/items/{id} for a normal file', async () => {
      localStorage.setItem('test_od_resolve', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_resolve', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
        jsonResponse(200, { id: 'file1', name: 'photo.jpg', '@microsoft.graph.downloadUrl': 'https://download/photo.jpg' }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const asset = await provider.resolve({ id: 'file1', name: 'photo.jpg', kind: 'file', path: 'file1', parentPath: '' });
      expect(asset.src).toBe('https://download/photo.jpg');

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toContain('/me/drive/items/file1');
    });

    it('redirects to /drives/{driveId}/items/{id} for a remoteItem (cross-drive shortcut)', async () => {
      localStorage.setItem('test_od_remote', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_remote', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
        jsonResponse(200, {
          id: 'remote-id',
          name: 'shared.jpg',
          '@microsoft.graph.downloadUrl': 'https://download/shared.jpg',
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const item = {
        id: 'local-shortcut-id',
        name: 'shared.jpg',
        kind: 'file' as const,
        path: 'local-shortcut-id',
        parentPath: '',
        raw: { remoteItem: { id: 'remote-id', parentReference: { driveId: 'other-drive-id' } } },
      };
      await provider.resolve(item);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toContain('/drives/other-drive-id/items/remote-id');
    });

    it('throws noDownloadableContent when Graph has no @microsoft.graph.downloadUrl for the item', async () => {
      localStorage.setItem('test_od_nodownload', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_nodownload', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, { id: 'note1', name: 'Notebook' }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(
        provider.resolve({ id: 'note1', name: 'Notebook', kind: 'file', path: 'note1', parentPath: '' }),
      ).rejects.toMatchObject({ i18nKey: 'microsoft.error.noDownloadableContent', params: { name: 'Notebook' } });
    });
  });

  describe('search()', () => {
    it('doubles single quotes in the query for the OData q=\'...\' literal', async () => {
      localStorage.setItem('test_od_search', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_search', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, { value: [] }));
      vi.stubGlobal('fetch', fetchMock);

      await provider.search("O'Brien");

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(encodeURIComponent("O''Brien"));
    });
  });

  describe('delete()', () => {
    it('treats HTTP 204 as success even though res.ok may be true too', async () => {
      localStorage.setItem('test_od_del', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_del', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => ({ ok: false, status: 204, statusText: '', text: async () => '' }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(
        provider.delete({ id: 'f1', name: 'f1', kind: 'file', path: 'f1', parentPath: '' }),
      ).resolves.toBeUndefined();

      const [url, init] = fetchMock.mock.calls[0];
      expect((init as RequestInit).method).toBe('DELETE');
      expect(String(url)).toContain('/me/drive/items/f1');
    });
  });

  describe('ensureAccessToken() refresh flow', () => {
    it('sends the refresh token and keeps the old one if Graph does not return a new one', async () => {
      localStorage.setItem(
        'test_od_refresh',
        JSON.stringify({ accessToken: 'old', refreshToken: 'refresh-1', expiresAt: Date.now() - 1000 }),
      );
      const provider = new OneDriveProvider({ storageKey: 'test_od_refresh', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
        if (String(url).includes('oauth2/v2.0/token')) return jsonResponse(200, { access_token: 'new', expires_in: 3600 });
        return jsonResponse(200, { value: [] });
      });
      vi.stubGlobal('fetch', fetchMock);

      await provider.list('');
      const stored = JSON.parse(localStorage.getItem('test_od_refresh')!);
      expect(stored.accessToken).toBe('new');
      expect(stored.refreshToken).toBe('refresh-1'); // preserved — Graph didn't send a new one
    });
  });

  describe('upload()', () => {
    it('PUTs the file content and resolves the created item', async () => {
      localStorage.setItem('test_od_upload', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_upload', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['content'], 'doc.txt', { type: 'text/plain' });
        const uploadPromise = provider.upload(file, '');
        await Promise.resolve();
        await Promise.resolve();

        expect(handles).toHaveLength(1);
        expect(handles[0].method).toBe('PUT');
        expect(handles[0].url).toContain(':/doc.txt:/content');
        handles[0].respond(200, { id: 'created1', name: 'doc.txt' });

        const item = await uploadPromise;
        expect(item.name).toBe('doc.txt');
      } finally {
        restore();
      }
    });

    it('rejects with uploadNetworkError on an XHR network failure', async () => {
      localStorage.setItem('test_od_upload_neterr', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new OneDriveProvider({ storageKey: 'test_od_upload_neterr', redirectUri: REDIRECT });
      provider.setCredential('client-id');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['x'], 'x.txt');
        const uploadPromise = provider.upload(file, '');
        await Promise.resolve();
        await Promise.resolve();
        handles[0].fail();
        await expect(uploadPromise).rejects.toMatchObject({ i18nKey: 'microsoft.error.uploadNetworkError' });
      } finally {
        restore();
      }
    });
  });
});
