import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropboxProvider } from '../../src/providers/dropbox/DropboxProvider';
import { installFakeXhr } from '../helpers/fakeXhr';

function jsonResponse(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

describe('DropboxProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAuthState / setup', () => {
    it('is unconfigured until an App Key is saved', () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_1', redirectUri: 'https://site.example/cb.html' });
      expect(provider.getAuthState()).toEqual({ configured: false, authenticated: false, accountLabel: undefined });
    });

    it('becomes configured once setCredential() is called, and persists across a new instance sharing the storageKey', () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_2', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('  my-app-key  ');
      expect(provider.getAuthState().configured).toBe(true);

      const second = new DropboxProvider({ storageKey: 'test_dbx_2', redirectUri: 'https://site.example/cb.html' });
      expect(second.getAuthState().configured).toBe(true);
    });

    it('clears the App Key when setCredential("") is called (the "Change App Key" flow)', () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_3', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('key');
      provider.setCredential('');
      expect(provider.getAuthState().configured).toBe(false);
    });

    it('exposes a redirect URI copy step in the setup wizard when one was provided', () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_4', redirectUri: 'https://site.example/cb.html' });
      const info = provider.getSetupInfo();
      expect(info.steps.some((s) => s.i18nKey === 'dropbox.setup.step4WithRedirect' && s.copyValue === 'https://site.example/cb.html')).toBe(true);
    });

    it('falls back to the "could not detect redirectUri" step when none was resolved', () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_5', redirectUri: undefined });
      const info = provider.getSetupInfo();
      expect(info.steps.some((s) => s.i18nKey === 'dropbox.setup.step4NoRedirect')).toBe(true);
    });
  });

  describe('list()', () => {
    it('maps Dropbox entries into StorageItem, building the unofficial dropbox.com/home webUrl', async () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_list', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');
      // Seed a valid (non-expired) token directly via localStorage, same shape the provider itself writes.
      localStorage.setItem(
        'test_dbx_list',
        JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }),
      );
      const provider2 = new DropboxProvider({ storageKey: 'test_dbx_list', redirectUri: 'https://site.example/cb.html' });

      const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
        if (String(url).includes('list_folder')) {
          return jsonResponse(200, {
            entries: [
              {
                '.tag': 'folder',
                name: 'Photos',
                id: 'id:folder1',
                path_lower: '/photos',
                path_display: '/Photos',
              },
              {
                '.tag': 'file',
                name: 'cat.png',
                id: 'id:file1',
                path_lower: '/photos/cat.png',
                path_display: '/Photos/cat.png',
                size: 1234,
                server_modified: '2024-01-01T00:00:00Z',
              },
            ],
            cursor: 'next-cursor',
            has_more: true,
          });
        }
        if (String(url).includes('get_thumbnail_batch')) {
          return jsonResponse(200, { entries: [{ '.tag': 'success', thumbnail: 'YmFzZTY0' }] });
        }
        throw new Error(`unexpected fetch: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider2.list('');

      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('next-cursor');
      expect(result.items).toHaveLength(2);

      const folder = result.items.find((i) => i.kind === 'folder')!;
      // Each path segment is percent-encoded individually, then rejoined with a literal '/'.
      expect(folder.webUrl).toBe('https://www.dropbox.com/home/Photos');

      const file = result.items.find((i) => i.kind === 'file')!;
      expect(file.path).toBe('/photos/cat.png');
      expect(file.size).toBe(1234);
      expect(file.webUrl).toBe('https://www.dropbox.com/home/Photos/cat.png');
      // Thumbnail was fetched for the one image file via the batch endpoint.
      expect(file.thumbnailUrl).toBe('data:image/jpeg;base64,YmFzZTY0');
    });

    it('throws when the access token is missing entirely (never authenticated)', async () => {
      const provider = new DropboxProvider({ storageKey: 'test_dbx_noauth', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');
      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'dropbox.error.notConnected' });
    });
  });

  describe('search()', () => {
    it('derives parentPath from path_display for each match (list() results already know their folder, search results do not)', async () => {
      localStorage.setItem('test_dbx_search', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new DropboxProvider({ storageKey: 'test_dbx_search', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
        if (String(url).includes('search_v2')) {
          return jsonResponse(200, {
            matches: [
              {
                metadata: {
                  metadata: {
                    '.tag': 'file',
                    name: 'report.pdf',
                    id: 'id:1',
                    path_lower: '/docs/report.pdf',
                    path_display: '/Docs/report.pdf',
                  },
                },
              },
            ],
            has_more: false,
          });
        }
        throw new Error(`unexpected fetch: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider.search('report');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].parentPath).toBe('/Docs');

      const [, init] = fetchMock.mock.calls[0];
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body.options.filename_only).toBe(true);
    });
  });

  describe('delete()', () => {
    it('calls files/delete_v2 with the item path', async () => {
      localStorage.setItem('test_dbx_del', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new DropboxProvider({ storageKey: 'test_dbx_del', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse(200, {}));
      vi.stubGlobal('fetch', fetchMock);

      await provider.delete({ id: 'x', name: 'x', kind: 'file', path: '/x.png', parentPath: '' });

      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain('files/delete_v2');
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({ path: '/x.png' });
    });
  });

  describe('ensureAccessToken() refresh flow', () => {
    it('refreshes an expired token using the stored refresh token', async () => {
      localStorage.setItem(
        'test_dbx_refresh',
        JSON.stringify({ accessToken: 'old', refreshToken: 'refresh-1', expiresAt: Date.now() - 1000 }),
      );
      const provider = new DropboxProvider({ storageKey: 'test_dbx_refresh', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
        if (String(url).includes('oauth2/token')) {
          return jsonResponse(200, { access_token: 'new-token', expires_in: 3600 });
        }
        if (String(url).includes('list_folder')) {
          return jsonResponse(200, { entries: [], cursor: 'c', has_more: false });
        }
        throw new Error(`unexpected: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      await provider.list('');

      const tokenCall = fetchMock.mock.calls.find(([url]) => String(url).includes('oauth2/token'))!;
      const body = new URLSearchParams((tokenCall[1] as RequestInit).body as string);
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('refresh_token')).toBe('refresh-1');
    });

    it('throws sessionExpired when the token is expired and there is no refresh token', async () => {
      localStorage.setItem(
        'test_dbx_norefresh',
        JSON.stringify({ accessToken: 'old', expiresAt: Date.now() - 1000 }),
      );
      const provider = new DropboxProvider({ storageKey: 'test_dbx_norefresh', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'dropbox.error.sessionExpired' });
      expect(provider.getAuthState().authenticated).toBe(false);
    });
  });

  describe('upload()', () => {
    it('PUTs to files/upload via XHR and resolves the created item, reporting progress', async () => {
      localStorage.setItem('test_dbx_upload', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new DropboxProvider({ storageKey: 'test_dbx_upload', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        const onProgress = vi.fn();
        const uploadPromise = provider.upload(file, '/docs', onProgress);

        // Wait a microtask for ensureAccessToken() to resolve and xhr.send() to run.
        await Promise.resolve();
        await Promise.resolve();
        expect(handles).toHaveLength(1);
        handles[0].progress(5, 10);
        handles[0].respond(200, {
          '.tag': 'file',
          name: 'hello.txt',
          id: 'id:up1',
          path_lower: '/docs/hello.txt',
          path_display: '/docs/hello.txt',
        });

        const item = await uploadPromise;
        expect(item.name).toBe('hello.txt');
        expect(onProgress).toHaveBeenCalledWith({ loaded: 5, total: 10 });
        expect(handles[0].headers['Dropbox-API-Arg']).toContain('"path":"/docs/hello.txt"');
      } finally {
        restore();
      }
    });

    it('rejects with uploadFailed when the XHR reports a non-2xx status', async () => {
      localStorage.setItem('test_dbx_upload_fail', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new DropboxProvider({ storageKey: 'test_dbx_upload_fail', redirectUri: 'https://site.example/cb.html' });
      provider.setCredential('app-key');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['x'], 'x.txt');
        const uploadPromise = provider.upload(file, '');
        await Promise.resolve();
        await Promise.resolve();
        handles[0].respond(409, {});
        await expect(uploadPromise).rejects.toMatchObject({ i18nKey: 'dropbox.error.uploadFailed' });
      } finally {
        restore();
      }
    });
  });
});
