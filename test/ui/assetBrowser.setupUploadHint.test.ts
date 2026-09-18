import { afterEach, describe, expect, it } from 'vitest';
import { createFakeProvider } from '../helpers/fakeProvider';
import { flush, mountAssetBrowser } from '../helpers/mountAssetBrowser';

const SETUP_INFO = {
  createAppUrl: 'https://example.com/console',
  steps: [{ text: 'Create an app' }],
};

describe('AssetBrowser — setup wizard upload hint', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows a drag-and-drop upload hint in the setup wizard for a provider that supports upload()', async () => {
    const provider = createFakeProvider({ configured: false, authenticated: false, withUpload: true, setupInfo: SETUP_INFO });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    expect(container.querySelector('.gca-setup-wizard')).not.toBeNull();
    const hint = container.querySelector('.gca-setup-wizard__upload-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toContain('drag');
  });

  it('does not show the upload hint for a provider without upload()', async () => {
    const provider = createFakeProvider({ configured: false, authenticated: false, withUpload: false, setupInfo: SETUP_INFO });
    const { container } = mountAssetBrowser([provider]);
    await flush();

    expect(container.querySelector('.gca-setup-wizard')).not.toBeNull();
    expect(container.querySelector('.gca-setup-wizard__upload-hint')).toBeNull();
  });
});
