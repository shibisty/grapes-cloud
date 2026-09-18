import { describe, expect, it, vi } from 'vitest';
import { registerI18n, SUPPORTED_LOCALES } from '../../src/i18n';
import type { CloudAssetsMessages } from '../../src/i18n/types';

// Aliased to L_<code> — two of the locale codes (`it`, `id` is fine, but
// notably `it`) collide with vitest's own `it`/`describe` globals imported
// above, so importing them under their bare names would silently shadow
// the test framework function instead of failing loudly.
import L_ar from '../../src/i18n/locales/ar';
import L_bs from '../../src/i18n/locales/bs';
import L_ca from '../../src/i18n/locales/ca';
import L_de from '../../src/i18n/locales/de';
import L_el from '../../src/i18n/locales/el';
import L_en from '../../src/i18n/locales/en';
import L_es from '../../src/i18n/locales/es';
import L_fa from '../../src/i18n/locales/fa';
import L_fr from '../../src/i18n/locales/fr';
import L_he from '../../src/i18n/locales/he';
import L_id from '../../src/i18n/locales/id';
import L_it from '../../src/i18n/locales/it';
import L_ko from '../../src/i18n/locales/ko';
import L_nb from '../../src/i18n/locales/nb';
import L_nl from '../../src/i18n/locales/nl';
import L_pl from '../../src/i18n/locales/pl';
import L_pt from '../../src/i18n/locales/pt';
import L_ru from '../../src/i18n/locales/ru';
import L_se from '../../src/i18n/locales/se';
import L_tr from '../../src/i18n/locales/tr';
import L_vi from '../../src/i18n/locales/vi';
import L_zh from '../../src/i18n/locales/zh';

const LOCALES: Record<string, CloudAssetsMessages> = {
  ar: L_ar,
  bs: L_bs,
  ca: L_ca,
  de: L_de,
  el: L_el,
  en: L_en,
  es: L_es,
  fa: L_fa,
  fr: L_fr,
  he: L_he,
  id: L_id,
  it: L_it,
  ko: L_ko,
  nb: L_nb,
  nl: L_nl,
  pl: L_pl,
  pt: L_pt,
  ru: L_ru,
  se: L_se,
  tr: L_tr,
  vi: L_vi,
  zh: L_zh,
};
const en = L_en;

/** Все пути листовых ключей (собственно строк перевода), например 'common.selectedCount'. */
function leafKeyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  const paths: string[] = [];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    paths.push(...leafKeyPaths(value, prefix ? `${prefix}.${key}` : key));
  }
  return paths;
}

const EN_KEYS = leafKeyPaths(en).sort();

describe('locale catalogs', () => {
  it('registers exactly the 22 locale codes GrapesJS core ships', () => {
    expect([...SUPPORTED_LOCALES].sort()).toEqual(Object.keys(LOCALES).sort());
    expect(SUPPORTED_LOCALES).toHaveLength(22);
  });

  it.each(Object.entries(LOCALES))('%s has exactly the same key paths as en.ts (no missing/extra keys)', (_code, messages) => {
    expect(leafKeyPaths(messages).sort()).toEqual(EN_KEYS);
  });

  it.each(Object.entries(LOCALES))('%s has a non-empty string for every leaf key', (_code, messages) => {
    for (const path of EN_KEYS) {
      const value = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], messages);
      expect(typeof value, `${path} should be a string`).toBe('string');
      expect((value as string).length, `${path} should not be empty`).toBeGreaterThan(0);
    }
  });

  it('every {param} placeholder used in en.ts also appears in every other locale for the same key', () => {
    const placeholdersOf = (str: string) => [...str.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

    for (const path of EN_KEYS) {
      const enValue = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], en) as string;
      const enParams = placeholdersOf(enValue);
      if (!enParams.length) continue;

      for (const [code, messages] of Object.entries(LOCALES)) {
        const value = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], messages) as string;
        expect(placeholdersOf(value), `${code}: ${path}`).toEqual(enParams);
      }
    }
  });
});

describe('registerI18n', () => {
  it('wraps every locale catalog under the cloudAssets namespace and merges it via addMessages', () => {
    const addMessages = vi.fn();
    const fakeEditor = { I18n: { addMessages } } as unknown as Parameters<typeof registerI18n>[0];

    registerI18n(fakeEditor);

    expect(addMessages).toHaveBeenCalledTimes(1);
    const [payload] = addMessages.mock.calls[0] as [Record<string, { cloudAssets: CloudAssetsMessages }>];

    expect(Object.keys(payload).sort()).toEqual([...SUPPORTED_LOCALES].sort());
    expect(payload.en.cloudAssets.common.settings).toBe('Settings');
    expect(payload.ru.cloudAssets.common.settings).toBe('Настройки');
  });
});
