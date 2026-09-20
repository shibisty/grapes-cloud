import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BoxProvider } from '../../src/providers/box/BoxProvider';
import { installFakeXhr } from '../helpers/fakeXhr';

function jsonResponse(status: number, body: unknown, blobBody?: BlobPart) {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
    text: async (): Promise<string> => JSON.stringify(body),
    blob: async () => new Blob([blobBody ?? JSON.stringify(body)]),
  };
}

const REDIRECT_URI = 'https://site.example/box-cb.html';
const TOKEN_ENDPOINT = 'https://site.example/api/box-token';

describe('BoxProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('constructor', () => {
    it('does not throw when called with no options at all (regression: real-world crash on `new BoxProvider()`)', () => {
      // Тип требует `BoxProviderOptions` (с обязательным `tokenEndpoint`),
      // но плагин используют и из чистого JS/HTML без проверки типов — там
      // ничто не мешает вызвать конструктор вообще без аргумента, как это
      // однажды и уронило редактор целиком: `Cannot read properties of
      // undefined (reading 'tokenEndpoint')` прямо на инициализации.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new (BoxProvider as any)()).not.toThrow();
    });

    it('treats a missing tokenEndpoint the same as an empty one — deferred error on actual use, not a constructor crash', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new (BoxProvider as any)({ storageKey: 'test_box_ctor_partial', redirectUri: REDIRECT_URI });
      expect(provider.getAuthState().configured).toBe(false);
      provider.setCredential('client-abc');
      await expect(provider.authenticate()).rejects.toMatchObject({ i18nKey: 'box.error.requireTokenEndpoint' });
    });
  });

  describe('getAuthState / setup', () => {
    it('is unconfigured until a Client ID is saved', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_1', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      expect(provider.getAuthState()).toEqual({ configured: false, authenticated: false });
    });

    it('becomes configured once setCredential() is called, and persists across a new instance sharing the storageKey', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_2', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('  my-client-id  ');
      expect(provider.getAuthState().configured).toBe(true);

      const second = new BoxProvider({ storageKey: 'test_box_2', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      expect(second.getAuthState().configured).toBe(true);
    });

    it('clears the Client ID when setCredential("") is called', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_3', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('id');
      provider.setCredential('');
      expect(provider.getAuthState().configured).toBe(false);
    });

    it('exposes a redirect URI copy step and a CORS-origin copy step in the setup wizard', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_4', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      const info = provider.getSetupInfo();
      expect(info.credentialLabelKey).toBe('setup.clientIdPlaceholder');
      expect(info.steps.some((s) => s.i18nKey === 'box.setup.step4WithRedirect' && s.copyValue === REDIRECT_URI)).toBe(true);
      expect(info.steps.some((s) => s.i18nKey === 'box.setup.step5WithOrigin' && typeof s.copyValue === 'string')).toBe(true);
      // Explains the tokenEndpoint/server requirement — unique to Box among the four cloud providers.
      expect(info.steps.some((s) => s.i18nKey === 'box.setup.step2Server')).toBe(true);
    });

    it('falls back to the "could not detect redirectUri" step when none was resolved', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_5', tokenEndpoint: TOKEN_ENDPOINT });
      const info = provider.getSetupInfo();
      expect(info.steps.some((s) => s.i18nKey === 'box.setup.step4NoRedirect')).toBe(true);
    });
  });

  describe('authenticate() guards', () => {
    it('rejects with requireTokenEndpoint before ever opening the OAuth popup when tokenEndpoint is empty', async () => {
      const provider = new BoxProvider({ storageKey: 'test_box_noserver', redirectUri: REDIRECT_URI, tokenEndpoint: '' });
      provider.setCredential('client-id');
      const openSpy = vi.spyOn(window, 'open');

      await expect(provider.authenticate()).rejects.toMatchObject({ i18nKey: 'box.error.requireTokenEndpoint' });
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('rejects with requireClientId when no Client ID was saved', async () => {
      const provider = new BoxProvider({ storageKey: 'test_box_noclient', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      await expect(provider.authenticate()).rejects.toMatchObject({ i18nKey: 'box.error.requireClientId' });
    });
  });

  describe('list()', () => {
    it('maps Box entries into StorageItem using ids (not paths), with offset-based pagination', async () => {
      localStorage.setItem('test_box_list', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_list', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string) => {
        if (String(url).includes('/folders/0/items')) {
          return jsonResponse(200, {
            entries: [
              { id: '111', type: 'folder', name: 'Photos' },
              { id: '222', type: 'file', name: 'cat.png', size: 1234, modified_at: '2024-01-01T00:00:00Z' },
            ],
            total_count: 5,
            offset: 0,
            limit: 2,
          });
        }
        if (String(url).includes('/thumbnail.png')) {
          return { ok: false, status: 302, statusText: 'Found', text: async (): Promise<string> => '' };
        }
        throw new Error(`unexpected fetch: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider.list('');
      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('2'); // offset + entries.length

      const folder = result.items.find((i) => i.kind === 'folder')!;
      expect(folder.path).toBe('111'); // Box is id-based, like Google Drive — not a literal path
      expect(folder.webUrl).toBe('https://app.box.com/folder/111');

      const file = result.items.find((i) => i.kind === 'file')!;
      expect(file.path).toBe('222');
      expect(file.size).toBe(1234);
      expect(file.webUrl).toBe('https://app.box.com/file/222');
    });

    it('requests a subfolder by its id and reports hasMore: false on the last page', async () => {
      localStorage.setItem('test_box_list2', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_list2', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string) => {
        expect(String(url)).toContain('/folders/999/items');
        return jsonResponse(200, { entries: [], total_count: 0, offset: 0, limit: 50 });
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider.list('999');
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeUndefined();
    });

    it('throws when there is no access token at all (never authenticated)', async () => {
      const provider = new BoxProvider({ storageKey: 'test_box_noauth', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');
      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'box.error.notConnected' });
    });
  });

  describe('search()', () => {
    it('searches across all of Box (not just the current folder) and filters out web_link entries', async () => {
      localStorage.setItem('test_box_search', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_search', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string) => {
        expect(String(url)).toContain('/search?');
        expect(String(url)).toContain('query=report');
        return jsonResponse(200, {
          entries: [
            { id: '1', type: 'file', name: 'report.pdf', parent: { id: '42' } },
            { id: '2', type: 'web_link', name: 'a link' },
          ],
          total_count: 1,
          offset: 0,
          limit: 50,
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await provider.search('report');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].parentPath).toBe('42');
    });
  });

  describe('delete()', () => {
    it('sends a DELETE to /files/{id}', async () => {
      localStorage.setItem('test_box_del', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_del', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        expect(String(url)).toContain('/files/777');
        expect(init?.method).toBe('DELETE');
        return { ok: true, status: 204, statusText: 'No Content', text: async (): Promise<string> => '' };
      });
      vi.stubGlobal('fetch', fetchMock);

      await provider.delete({ id: '777', name: 'x', kind: 'file', path: '777', parentPath: '' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolve()', () => {
    it('downloads the file and returns a data: URL for small files (same approach as Google Drive)', async () => {
      localStorage.setItem('test_box_resolve', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_resolve', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(200, {}, 'small file contents')));

      const asset = await provider.resolve({ id: '1', name: 'f1.txt', kind: 'file', path: '1', parentPath: '' });
      expect(asset.src.startsWith('data:')).toBe(true);
      expect(asset.provider).toBe('box');
    });

    it('rejects with fileTooLarge when the downloaded blob exceeds the inline limit', async () => {
      localStorage.setItem('test_box_toobig', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_toobig', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const bigContent = 'x'.repeat(11 * 1024 * 1024); // over the 10MB MAX_INLINE_BYTES limit
      vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(200, {}, bigContent)));

      await expect(
        provider.resolve({ id: '1', name: 'big.bin', kind: 'file', path: '1', parentPath: '' }),
      ).rejects.toMatchObject({ i18nKey: 'box.error.fileTooLarge' });
    });

    it('rejects with downloadFailed (not a raw TypeError) when the request throws — e.g. a CORS failure on the dl.boxcloud.com redirect', async () => {
      localStorage.setItem('test_box_cors', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_cors', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new TypeError('Failed to fetch');
        }),
      );

      await expect(
        provider.resolve({ id: '1', name: 'photo.png', kind: 'file', path: '1', parentPath: '' }),
      ).rejects.toMatchObject({ i18nKey: 'box.error.downloadFailed', params: { name: 'photo.png' } });
    });
  });

  describe('ensureAccessToken() refresh flow', () => {
    it('POSTs grant_type=refresh_token to tokenEndpoint and stores the ROTATED refresh token Box returns', async () => {
      localStorage.setItem(
        'test_box_refresh',
        JSON.stringify({ accessToken: 'old', refreshToken: 'refresh-1', expiresAt: Date.now() - 1000 }),
      );
      const provider = new BoxProvider({ storageKey: 'test_box_refresh', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        if (String(url) === TOKEN_ENDPOINT) {
          const body = JSON.parse((init as RequestInit).body as string);
          expect(body).toEqual({ grant_type: 'refresh_token', refresh_token: 'refresh-1' });
          return jsonResponse(200, { access_token: 'new-token', refresh_token: 'refresh-2', expires_in: 3600 });
        }
        if (String(url).includes('/folders/0/items')) {
          return jsonResponse(200, { entries: [], total_count: 0, offset: 0, limit: 50 });
        }
        throw new Error(`unexpected: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      await provider.list('');

      const stored = JSON.parse(localStorage.getItem('test_box_refresh')!);
      // Box refresh tokens are single-use and rotate on every exchange — the OLD one must not be reused.
      expect(stored.refreshToken).toBe('refresh-2');
      expect(stored.accessToken).toBe('new-token');
    });

    it('throws sessionExpired when the token is expired and there is no refresh token', async () => {
      localStorage.setItem('test_box_norefresh', JSON.stringify({ accessToken: 'old', expiresAt: Date.now() - 1000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_norefresh', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'box.error.sessionExpired' });
      expect(provider.getAuthState().authenticated).toBe(false);
    });

    it('throws refreshFailed when the tokenEndpoint itself errors (e.g. the Box refresh token expired after 60 days)', async () => {
      localStorage.setItem(
        'test_box_refresh_fail',
        JSON.stringify({ accessToken: 'old', refreshToken: 'stale', expiresAt: Date.now() - 1000 }),
      );
      const provider = new BoxProvider({ storageKey: 'test_box_refresh_fail', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 400, statusText: 'Bad Request', text: async (): Promise<string> => '' })));

      await expect(provider.list('')).rejects.toMatchObject({ i18nKey: 'box.error.refreshFailed' });
    });
  });

  // Данные для вкладки "Подключённые аккаунты" — чисто информационные геттеры, ничего не меняют.
  describe('getSessionInfo()', () => {
    it('returns all-undefined fields (except sessionNoteKey) before any login', () => {
      const provider = new BoxProvider({ storageKey: 'test_box_session_1', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      expect(provider.getSessionInfo()).toEqual({
        authenticatedAt: undefined,
        expiresAt: undefined,
        credential: undefined,
        sessionNoteKey: 'box.sessionNote',
      });
    });

    it('exposes authenticatedAt/expiresAt from stored tokens and the saved Client ID as credential', () => {
      const authenticatedAt = Date.now() - 60_000;
      const expiresAt = Date.now() + 3_600_000;
      localStorage.setItem('test_box_session_2', JSON.stringify({ accessToken: 'tok', expiresAt, authenticatedAt }));
      const provider = new BoxProvider({ storageKey: 'test_box_session_2', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('my-client-id');

      expect(provider.getSessionInfo()).toEqual({
        authenticatedAt,
        expiresAt,
        credential: 'my-client-id',
        sessionNoteKey: 'box.sessionNote',
      });
    });
  });

  describe('upload()', () => {
    it('POSTs multipart form data (attributes before file) via XHR and resolves the created item, reporting progress', async () => {
      localStorage.setItem('test_box_upload', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_upload', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        const onProgress = vi.fn();
        const uploadPromise = provider.upload(file, '55', onProgress);

        await Promise.resolve();
        await Promise.resolve();
        expect(handles).toHaveLength(1);
        handles[0].progress(5, 10);

        const form = handles[0].body as FormData;
        const keys = [...form.keys()];
        expect(keys).toEqual(['attributes', 'file']); // attributes MUST precede file, or Box replies 400 metadata_after_file_contents
        expect(JSON.parse(form.get('attributes') as string)).toEqual({ name: 'hello.txt', parent: { id: '55' } });

        handles[0].respond(201, { entries: [{ id: 'new1', type: 'file', name: 'hello.txt', size: 5 }] });

        const item = await uploadPromise;
        expect(item.name).toBe('hello.txt');
        expect(item.path).toBe('new1');
        expect(onProgress).toHaveBeenCalledWith({ loaded: 5, total: 10 });
      } finally {
        restore();
      }
    });

    it('rejects with uploadFailed when the XHR reports a non-2xx status', async () => {
      localStorage.setItem('test_box_upload_fail', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_upload_fail', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');

      const { handles, restore } = installFakeXhr();
      try {
        const file = new File(['x'], 'x.txt');
        const uploadPromise = provider.upload(file, '');
        await Promise.resolve();
        await Promise.resolve();
        handles[0].respond(409, {});
        await expect(uploadPromise).rejects.toMatchObject({ i18nKey: 'box.error.uploadFailed' });
      } finally {
        restore();
      }
    });
  });

  describe('disconnect()', () => {
    it('clears stored tokens but keeps the saved Client ID', () => {
      localStorage.setItem('test_box_disc', JSON.stringify({ accessToken: 'tok', expiresAt: Date.now() + 3_600_000 }));
      const provider = new BoxProvider({ storageKey: 'test_box_disc', redirectUri: REDIRECT_URI, tokenEndpoint: TOKEN_ENDPOINT });
      provider.setCredential('client-id');
      expect(provider.getAuthState().authenticated).toBe(true);

      provider.disconnect();
      expect(provider.getAuthState()).toEqual({ configured: true, authenticated: false });
    });
  });
});
