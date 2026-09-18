import { describe, expect, it } from 'vitest';
import { isRtlLocale, t } from '../../src/i18n/t';
import { createFakeEditor } from '../helpers/fakeEditor';

describe('t()', () => {
  it('prefixes the key with the plugin namespace before asking editor.I18n.t()', () => {
    const editor = createFakeEditor();
    // common.settings === 'Settings' in en.ts — proves the 'cloudAssets.' prefix round-trips correctly.
    expect(t(editor, 'common.settings')).toBe('Settings');
  });

  it('forwards interpolation params', () => {
    const editor = createFakeEditor();
    expect(t(editor, 'common.selectedCount', { count: 3 })).toBe('3 selected');
    expect(t(editor, 'auth.connectPrompt', { provider: 'Dropbox' })).toBe('Connect Dropbox to pick files from here.');
  });

  it('falls back to the raw key when the translation is missing entirely', () => {
    const editor = createFakeEditor();
    expect(t(editor, 'common.thisKeyDoesNotExist')).toBe('common.thisKeyDoesNotExist');
  });
});

describe('isRtlLocale', () => {
  it('flags the three RTL locales GrapesJS ships', () => {
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('he')).toBe(true);
    expect(isRtlLocale('fa')).toBe(true);
  });

  it('treats every other supported locale as LTR', () => {
    expect(isRtlLocale('en')).toBe(false);
    expect(isRtlLocale('ru')).toBe(false);
    expect(isRtlLocale('zh')).toBe(false);
  });
});
