import type { Editor } from 'grapesjs';

/** Пространство имён, под которым каталог плагина живёт в `editor.I18n`. */
const NAMESPACE = 'cloudAssets';

/**
 * `editor.I18n.t()` с зашитым namespace плагина и без лишнего
 * приведения типов на каждом вызове. `editor.I18n.t()` сам умеет
 * точечные пути ('a.b.c') и fallback на `localeFallback` (по
 * умолчанию 'en'), если ключа нет в текущей локали — а он есть
 * всегда, потому что `registerI18n()` регистрирует полный перевод
 * сразу на все локали, что поддерживает GrapesJS (см. `index.ts`
 * этой папки).
 */
export function t(editor: Editor, key: string, params?: Record<string, unknown>): string {
  const result = editor.I18n.t(`${NAMESPACE}.${key}`, params ? { params } : undefined);
  // На случай полностью отсутствующего ключа (опечатка в коде,
  // кастомный провайдер сослался на несуществующий i18nKey) — лучше
  // показать сам ключ, чем упасть или показать undefined.
  return typeof result === 'string' ? result : key;
}

/**
 * Языки из набора, который поддерживает GrapesJS (`grapesjs/locale`),
 * читающиеся справа налево. Используется только для `dir="rtl"` на
 * корневом контейнере — перевод текста от направления не зависит.
 */
const RTL_LOCALES = new Set(['ar', 'he', 'fa']);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}
