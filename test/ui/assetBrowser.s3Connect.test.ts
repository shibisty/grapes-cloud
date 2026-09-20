import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeProvider, makeFile } from '../helpers/fakeProvider';
import { mountAssetBrowser } from '../helpers/mountAssetBrowser';

/**
 * S3Provider signs every request via real `crypto.subtle` (sha256 +
 * HMAC chain, see `sigv4.ts`) — under Node's WebCrypto those resolve
 * on a MACROtask (libuv threadpool), not a microtask, so the plain
 * microtask-draining `flush()` from `mountAssetBrowser.ts` isn't
 * enough whenever a test goes through the "Connect S3" submit flow
 * (which calls `provider.list('')` to validate the credentials before
 * saving — see `AssetBrowser.openConnectS3Modal`). This local flush
 * yields to the event loop instead — same fix as in `s3Provider.test.ts`.
 */
async function flush(times = 20): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

const EMPTY_LIST_XML = `<ListBucketResult><IsTruncated>false</IsTruncated></ListBucketResult>`;

function okFetch() {
  return vi.fn(async () => ({ ok: true, status: 200, statusText: 'OK', text: async () => EMPTY_LIST_XML }));
}

function forbiddenFetch() {
  return vi.fn(async () => ({ ok: false, status: 403, statusText: 'Forbidden', text: async () => '<Error/>' }));
}

function openAddMenu(container: HTMLElement): void {
  container.querySelector<HTMLElement>('.gca-tab-add .gca-tab-icon-btn')!.click();
}

function fillConnectForm(
  container: HTMLElement,
  values: { name?: string; accessKeyId?: string; secretAccessKey?: string; bucket?: string; region?: string },
): void {
  const modal = document.querySelector<HTMLElement>('.gca-connect-modal')!;
  const inputs = [...modal.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="password"]')];
  const [nameInput, accessKeyInput, secretKeyInput, bucketInput, regionInput] = inputs;
  if (values.name !== undefined) nameInput.value = values.name;
  if (values.accessKeyId !== undefined) accessKeyInput.value = values.accessKeyId;
  if (values.secretAccessKey !== undefined) secretKeyInput.value = values.secretAccessKey;
  if (values.bucket !== undefined) bucketInput.value = values.bucket;
  if (values.region !== undefined) regionInput.value = values.region;
}

function submitConnectForm(): void {
  document.querySelector<HTMLElement>('.gca-connect-modal form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

const VALID_VALUES = { name: 'My Bucket', accessKeyId: 'AKIA123', secretAccessKey: 'secret', bucket: 'my-bucket', region: 'us-east-1' };

describe('AssetBrowser — "+" add-connection button / Connect S3 popup', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('shows a "+" button after the tabs, opening a menu with "Connect S3"', async () => {
    const provider = createFakeProvider({ items: [] });
    const { container } = mountAssetBrowser([provider]);

    expect(container.querySelector('.gca-connect-modal')).toBeNull();
    openAddMenu(container);

    const item = container.querySelector<HTMLElement>('.gca-tab-add__item')!;
    expect(item.textContent).toContain('Connect S3');

    item.click();
    expect(document.querySelector('.gca-connect-modal')).not.toBeNull();
    expect(document.querySelector('.gca-connect-modal__title')!.textContent).toBe('Connect S3-compatible storage');
  });

  it('shows a validation error and does not submit when required fields are left empty', async () => {
    const provider = createFakeProvider({ items: [] });
    const { container } = mountAssetBrowser([provider]);
    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();

    submitConnectForm();

    const error = document.querySelector<HTMLElement>('.gca-connect-modal__error')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe('Fill in all required fields.');
    expect(document.querySelector('.gca-connect-modal')).not.toBeNull(); // stays open
  });

  it('rejects a name that collides with an existing tab', async () => {
    const provider = createFakeProvider({ items: [], label: 'Dropbox' });
    const { container } = mountAssetBrowser([provider]);
    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();

    fillConnectForm(container, { ...VALID_VALUES, name: 'Dropbox' });
    submitConnectForm();

    const error = document.querySelector<HTMLElement>('.gca-connect-modal__error')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe('A tab with this name already exists.');
  });

  it('on a failed connectivity check, shows the error inline and keeps the modal open without adding a tab', async () => {
    vi.stubGlobal('fetch', forbiddenFetch());
    const provider = createFakeProvider({ items: [] });
    const { container } = mountAssetBrowser([provider]);
    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();

    fillConnectForm(container, VALID_VALUES);
    submitConnectForm();
    await flush();

    const error = document.querySelector<HTMLElement>('.gca-connect-modal__error')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('Could not connect:');
    expect(container.querySelectorAll('.gca-tab')).toHaveLength(1); // no new tab
  });

  it('on success, closes the popup, adds a new active tab, and persists the connection to localStorage', async () => {
    vi.stubGlobal('fetch', okFetch());
    const provider = createFakeProvider({ items: [], label: 'Dropbox' });
    const { container } = mountAssetBrowser([provider]);
    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();

    fillConnectForm(container, VALID_VALUES);
    submitConnectForm();
    await flush();

    expect(document.querySelector('.gca-connect-modal')).toBeNull();
    const tabs = container.querySelectorAll<HTMLElement>('.gca-tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[1].textContent).toContain('My Bucket');
    expect(tabs[1].classList.contains('gca-tab--active')).toBe(true);

    const saved = JSON.parse(localStorage.getItem('gca_s3_connections')!);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ name: 'My Bucket', bucket: 'my-bucket', region: 'us-east-1' });
  });

  it('Cancel and backdrop-click close the popup without adding a tab', async () => {
    const provider = createFakeProvider({ items: [] });
    const { container } = mountAssetBrowser([provider]);

    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();
    fillConnectForm(container, VALID_VALUES);
    [...document.querySelectorAll<HTMLElement>('.gca-connect-modal__actions button')]
      .find((b) => b.textContent === 'Cancel')!
      .click();
    expect(document.querySelector('.gca-connect-modal')).toBeNull();

    openAddMenu(container);
    container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();
    document.querySelector<HTMLElement>('.gca-connect-modal-backdrop')!.click();
    expect(document.querySelector('.gca-connect-modal')).toBeNull();
    expect(container.querySelectorAll('.gca-tab')).toHaveLength(1);
  });
});

describe('AssetBrowser — removing a dynamically-connected S3 tab', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  async function mountWithOneS3Connection() {
    vi.stubGlobal('fetch', okFetch());
    const provider = createFakeProvider({ items: [], label: 'Dropbox' });
    const mounted = mountAssetBrowser([provider]);
    openAddMenu(mounted.container);
    mounted.container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();
    fillConnectForm(mounted.container, VALID_VALUES);
    submitConnectForm();
    await flush();
    return mounted;
  }

  it('shows a "×" only on the dynamically-added tab, not on the site owner\'s own tabs', async () => {
    const { container } = await mountWithOneS3Connection();
    const wraps = [...container.querySelectorAll<HTMLElement>('.gca-tab-wrap')];
    expect(wraps[0].querySelector('.gca-tab__remove')).toBeNull(); // Dropbox — declared by the site owner
    expect(wraps[1].querySelector('.gca-tab__remove')).not.toBeNull(); // My Bucket — added via the popup
  });

  it('requires two clicks to remove (confirm pattern), then removes the tab, switches away from it, and updates localStorage', async () => {
    const { container } = await mountWithOneS3Connection();
    expect(container.querySelectorAll('.gca-tab')).toHaveLength(2);

    const removeBtn = container.querySelectorAll<HTMLElement>('.gca-tab-wrap')[1].querySelector<HTMLElement>('.gca-tab__remove')!;
    expect(removeBtn.textContent).toBe('×');
    removeBtn.click(); // first click — confirm state only
    expect(container.querySelectorAll('.gca-tab')).toHaveLength(2);
    expect(removeBtn.classList.contains('gca-tab__remove--confirm')).toBe(true);
    // Регрессия: раньше первый клик не менял НИЧЕГО видимого на самой
    // кнопке (только title/aria-label) — визуально клик выглядел так,
    // будто он ничего не сделал. Символ обязан смениться на "?".
    expect(removeBtn.textContent).toBe('?');

    removeBtn.click(); // second click — actually removes
    const tabs = container.querySelectorAll<HTMLElement>('.gca-tab');
    expect(tabs).toHaveLength(1);
    expect(tabs[0].classList.contains('gca-tab--active')).toBe(true); // fell back to the remaining tab

    expect(JSON.parse(localStorage.getItem('gca_s3_connections')!)).toEqual([]);
  });
});

describe('AssetBrowser — S3 connections persist across remounts (reopening the picker)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('restores a previously-connected S3 tab from localStorage on a fresh mount', async () => {
    vi.stubGlobal('fetch', okFetch());
    const provider = createFakeProvider({ items: [], label: 'Dropbox' });
    const first = mountAssetBrowser([provider]);
    openAddMenu(first.container);
    first.container.querySelector<HTMLElement>('.gca-tab-add__item')!.click();
    fillConnectForm(first.container, VALID_VALUES);
    submitConnectForm();
    await flush();
    document.body.innerHTML = ''; // simulate closing the picker — localStorage survives

    const second = mountAssetBrowser([createFakeProvider({ items: [], label: 'Dropbox' })]);
    const tabs = second.container.querySelectorAll<HTMLElement>('.gca-tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[1].textContent).toContain('My Bucket');
  });
});
