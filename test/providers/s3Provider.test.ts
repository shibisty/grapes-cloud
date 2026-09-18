import { afterEach, describe, expect, it, vi } from 'vitest';
import { S3Provider } from '../../src/providers/s3/S3Provider';
import { buildRequestUrl } from '../../src/providers/s3/sigv4';
import { installFakeXhr } from '../helpers/fakeXhr';

const CONFIG = {
  id: 'conn1',
  name: 'My bucket',
  accessKeyId: 'AKIAEXAMPLE',
  secretAccessKey: 'secret',
  bucket: 'my-bucket',
  region: 'us-east-1',
};

/**
 * presignUrl()/signedHeaders() chain several real `crypto.subtle`
 * calls (sha256 + 4x HMAC) — under Node's WebCrypto these resolve via
 * the libuv threadpool, i.e. on a MACROtask, not a microtask, so a
 * plain `await Promise.resolve()` loop (which only drains microtasks)
 * never gives them a chance to complete. A `setTimeout` tick actually
 * yields to the event loop between each flush.
 */
async function flush(times = 20): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

function xmlResponse(status: number, xml: string) {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => xml,
  };
}

const LIST_XML_ROOT = `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <IsTruncated>false</IsTruncated>
  <CommonPrefixes><Prefix>Docs/</Prefix></CommonPrefixes>
  <Contents><Key>Docs/</Key><Size>0</Size><LastModified>2024-01-01T00:00:00.000Z</LastModified></Contents>
  <Contents><Key>photo.jpg</Key><Size>1234</Size><LastModified>2024-02-02T00:00:00.000Z</LastModified></Contents>
</ListBucketResult>`;

describe('S3Provider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAuthState / authenticate', () => {
    it('is always authenticated and configured — no OAuth, credentials come from the connect modal upfront', async () => {
      const provider = new S3Provider(CONFIG);
      expect(provider.getAuthState()).toEqual({ authenticated: true, configured: true, accountLabel: 'my-bucket' });
      expect(await provider.authenticate()).toEqual(provider.getAuthState());
    });
  });

  describe('list()', () => {
    it('parses CommonPrefixes as folders and Contents as files, skipping the folder-marker object equal to the prefix itself', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => xmlResponse(200, LIST_XML_ROOT)));
      const provider = new S3Provider(CONFIG);

      const result = await provider.list('');

      expect(result.items).toEqual([
        expect.objectContaining({ kind: 'folder', name: 'Docs', path: '/Docs' }),
        expect.objectContaining({ kind: 'file', name: 'photo.jpg', path: '/photo.jpg', size: 1234 }),
      ]);
      expect(result.hasMore).toBe(false);
    });

    it('signs the ListObjectsV2 request with list-type=2, delimiter=/ and the folder path as a trailing-slash prefix', async () => {
      const fetchMock = vi.fn(async () => xmlResponse(200, LIST_XML_ROOT));
      vi.stubGlobal('fetch', fetchMock);
      const provider = new S3Provider(CONFIG);

      await provider.list('/Docs');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('list-type')).toBe('2');
      expect(parsed.searchParams.get('delimiter')).toBe('/');
      expect(parsed.searchParams.get('prefix')).toBe('Docs/');
      expect(parsed.hostname).toBe('my-bucket.s3.us-east-1.amazonaws.com');
      expect((init.headers as Record<string, string>).Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE\//);
    });

    it('passes opts.cursor as continuation-token and returns hasMore/cursor from IsTruncated/NextContinuationToken', async () => {
      const fetchMock = vi.fn(async () =>
        xmlResponse(
          200,
          `<ListBucketResult><IsTruncated>true</IsTruncated><NextContinuationToken>tok123</NextContinuationToken></ListBucketResult>`,
        ),
      );
      vi.stubGlobal('fetch', fetchMock);
      const provider = new S3Provider(CONFIG);

      const result = await provider.list('', { cursor: 'prev-token' });

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(new URL(url).searchParams.get('continuation-token')).toBe('prev-token');
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('tok123');
    });

    it('throws a GcaError with the HTTP status when the request fails', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => xmlResponse(403, '<Error/>')));
      const provider = new S3Provider(CONFIG);

      await expect(provider.list('')).rejects.toMatchObject({
        name: 'GcaError',
        i18nKey: 's3.error.listFailed',
        params: { status: 403 },
      });
    });
  });

  describe('resolve()', () => {
    it('returns a presigned GET URL for the object, encoding the key and signing with the configured credentials', async () => {
      const provider = new S3Provider(CONFIG);
      const asset = await provider.resolve({
        id: 'file:photo.jpg',
        name: 'photo.jpg',
        kind: 'file',
        path: '/photo.jpg',
        parentPath: '',
        mimeType: 'image/jpeg',
      });

      const url = new URL(asset.src);
      expect(url.hostname).toBe('my-bucket.s3.us-east-1.amazonaws.com');
      expect(url.pathname).toBe('/photo.jpg');
      expect(url.searchParams.get('X-Amz-Algorithm')).toBe('AWS4-HMAC-SHA256');
      expect(url.searchParams.get('X-Amz-Credential')).toMatch(/^AKIAEXAMPLE\//);
      expect(url.searchParams.get('X-Amz-Signature')).toBeTruthy();
      expect(asset.type).toBe('image');
      expect(asset.provider).toBe('s3:conn1');
    });
  });

  describe('upload()', () => {
    it('PUTs the file to a presigned URL via XMLHttpRequest (for progress events) and resolves to the new StorageItem', async () => {
      const { handles, restore } = installFakeXhr();
      const provider = new S3Provider(CONFIG);
      const file = new File(['hello'], 'new.txt', { type: 'text/plain' });

      const progressEvents: Array<{ loaded: number; total: number }> = [];
      const uploadPromise = provider.upload(file, '/Docs', (p) => progressEvents.push(p));

      await flush();
      const handle = handles[0];
      expect(handle.method).toBe('PUT');
      expect(new URL(handle.url).pathname).toBe('/Docs/new.txt');
      expect(handle.headers['Content-Type']).toBe('text/plain');

      handle.progress(50, 100);
      handle.respond(200, '');
      const item = await uploadPromise;

      expect(progressEvents).toEqual([{ loaded: 50, total: 100 }]);
      expect(item).toEqual(
        expect.objectContaining({ name: 'new.txt', kind: 'file', path: '/Docs/new.txt', parentPath: '/Docs' }),
      );
      restore();
    });

    it('rejects with a GcaError carrying the HTTP status on a failed upload', async () => {
      const { handles, restore } = installFakeXhr();
      const provider = new S3Provider(CONFIG);
      const file = new File(['x'], 'x.txt');

      const uploadPromise = provider.upload(file, '');
      await flush();
      handles[0].respond(403, 'Forbidden');

      await expect(uploadPromise).rejects.toMatchObject({ name: 'GcaError', i18nKey: 's3.error.uploadFailed', params: { status: 403 } });
      restore();
    });
  });

  describe('delete()', () => {
    it('sends a signed DELETE request for the object key', async () => {
      const fetchMock = vi.fn(async () => xmlResponse(204, ''));
      vi.stubGlobal('fetch', fetchMock);
      const provider = new S3Provider(CONFIG);

      await provider.delete({ id: 'file:a.txt', name: 'a.txt', kind: 'file', path: '/a.txt', parentPath: '' });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('DELETE');
      expect(new URL(url).pathname).toBe('/a.txt');
    });

    it('throws a GcaError with the HTTP status when the delete fails', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => xmlResponse(403, '')));
      const provider = new S3Provider(CONFIG);

      await expect(
        provider.delete({ id: 'file:a.txt', name: 'a.txt', kind: 'file', path: '/a.txt', parentPath: '' }),
      ).rejects.toMatchObject({ name: 'GcaError', i18nKey: 's3.error.deleteFailed', params: { status: 403 } });
    });
  });
});

describe('sigv4 buildRequestUrl()', () => {
  it('builds a virtual-hosted URL for real AWS S3 (no custom endpoint)', () => {
    const result = buildRequestUrl({ bucket: 'my-bucket', region: 'eu-west-1' }, 'a/b.png');
    expect(result.host).toBe('my-bucket.s3.eu-west-1.amazonaws.com');
    expect(result.baseUrl).toBe('https://my-bucket.s3.eu-west-1.amazonaws.com/a/b.png');
  });

  it('builds a virtual-hosted URL against a custom endpoint when forcePathStyle is not set', () => {
    const result = buildRequestUrl({ bucket: 'my-bucket', region: 'us-east-1', endpoint: 'r2.example.com' }, 'x.png');
    expect(result.host).toBe('my-bucket.r2.example.com');
    expect(result.baseUrl).toBe('https://my-bucket.r2.example.com/x.png');
  });

  it('builds a path-style URL against a custom endpoint when forcePathStyle is set (MinIO/self-hosted)', () => {
    const result = buildRequestUrl(
      { bucket: 'my-bucket', region: 'us-east-1', endpoint: 'http://localhost:9000', forcePathStyle: true },
      'x.png',
    );
    expect(result.host).toBe('localhost:9000');
    expect(result.baseUrl).toBe('http://localhost:9000/my-bucket/x.png');
  });
});
