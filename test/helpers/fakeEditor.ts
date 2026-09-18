import type { Editor } from 'grapesjs';
import en from '../../src/i18n/locales/en';

/**
 * Минимальный `Editor`, которого достаточно всему нашему коду:
 * AssetBrowser трогает только `editor.on/off` и `editor.I18n.t/getLocale`
 * (см. `src/ui/AssetBrowser.ts`), а `t()`-хелпер (`src/i18n/t.ts`) —
 * только `editor.I18n.t()`. Настоящий GrapesJS Editor тяжело поднимать
 * в jsdom ради этого небольшого подмножества API, поэтому вместо него
 * — маленькая подделка, которая ведёт себя как настоящий `editor.I18n`
 * (строковые ключи через точку + `{param}`-подстановка), но без самого
 * GrapesJS.
 */

type Listener = (...args: unknown[]) => void;

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(str: string, params?: Record<string, unknown>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (whole, key) => (key in params ? String(params[key]) : whole));
}

export interface FakeEditorOptions {
  locale?: string;
  /** Переопределяет каталог сообщений (по умолчанию — английский, как и localeFallback в реальном GrapesJS). */
  messages?: Record<string, unknown>;
}

export interface FakeEditor extends Editor {
  /** Тестовый хелпер — вызывает всех подписчиков на событие (используется, чтобы проверить `editor.on('i18n:locale', ...)`). */
  emit(event: string, ...args: unknown[]): void;
}

export function createFakeEditor(opts: FakeEditorOptions = {}): FakeEditor {
  const listeners = new Map<string, Set<Listener>>();
  let locale = opts.locale ?? 'en';
  const messages = opts.messages ?? en;

  const editor = {
    I18n: {
      getLocale: () => locale,
      setLocale: (next: string) => {
        locale = next;
      },
      t: (key: string, config?: { params?: Record<string, unknown> }) => {
        const path = key.startsWith('cloudAssets.') ? key.slice('cloudAssets.'.length) : key;
        const value = getByPath(messages, path);
        return typeof value === 'string' ? interpolate(value, config?.params) : undefined;
      },
      addMessages: (_next: Record<string, unknown>) => {
        // Не нужен ни AssetBrowser, ни t() — реализован только там, где явно тестируется (registerI18n).
      },
    },
    on(event: string, handler: Listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return editor;
    },
    off(event: string, handler: Listener) {
      listeners.get(event)?.delete(handler);
      return editor;
    },
    /**
     * Настоящий `editor.trigger()` — используется production-кодом
     * напрямую (см. `AssetBrowser.addS3Connection`/`removeS3Connection`,
     * которые шлют `S3_CONNECTIONS_CHANGED_EVENT`), в отличие от
     * `emit()` ниже, который существует только в тестах, чтобы вручную
     * дёрнуть подписчиков (`editor.on('i18n:locale', ...)` и т.п.) —
     * ведёт себя идентично.
     */
    trigger(event: string, ...args: unknown[]) {
      for (const handler of listeners.get(event) ?? []) handler(...args);
      return editor;
    },
    emit(event: string, ...args: unknown[]) {
      for (const handler of listeners.get(event) ?? []) handler(...args);
    },
  } as unknown as FakeEditor;

  return editor;
}
