import type { Editor } from 'grapesjs';
import type { CloudAssetsMessages } from './types';

import ar from './locales/ar';
import bs from './locales/bs';
import ca from './locales/ca';
import de from './locales/de';
import el from './locales/el';
import en from './locales/en';
import es from './locales/es';
import fa from './locales/fa';
import fr from './locales/fr';
import he from './locales/he';
import id from './locales/id';
import it from './locales/it';
import ko from './locales/ko';
import nb from './locales/nb';
import nl from './locales/nl';
import pl from './locales/pl';
import pt from './locales/pt';
import ru from './locales/ru';
import se from './locales/se';
import tr from './locales/tr';
import vi from './locales/vi';
import zh from './locales/zh';

/**
 * Ровно тот же набор кодов языка, что и в `grapesjs/locale` (ar, bs,
 * ca, de, el, en, es, fa, fr, he, id, it, ko, nb, nl, pl, pt, ru, se,
 * tr, vi, zh) — так что везде, где сайт может настроить или
 * определить локаль ядра GrapesJS, у плагина уже есть перевод под
 * тем же кодом. `se` — это шведский (исторически неверный код и в
 * самом GrapesJS, см. комментарий в `locales/se.ts`), оставлен как
 * есть ради совместимости с ядром.
 */
const LOCALE_MESSAGES: Record<string, CloudAssetsMessages> = {
  ar,
  bs,
  ca,
  de,
  el,
  en,
  es,
  fa,
  fr,
  he,
  id,
  it,
  ko,
  nb,
  nl,
  pl,
  pt,
  ru,
  se,
  tr,
  vi,
  zh,
};

export const SUPPORTED_LOCALES: readonly string[] = Object.keys(LOCALE_MESSAGES);

/**
 * Регистрирует переводы плагина в `editor.I18n` под ключом
 * `cloudAssets`, сразу на все поддерживаемые языки.
 *
 * После этого ничего специально настраивать не нужно: GrapesJS по
 * умолчанию сам определяет локаль по языку браузера
 * (`i18n.detectLocale`, включено по умолчанию) и использует её в
 * `editor.I18n.t()`, а если такой локали нет ни у нас, ни у сайта —
 * автоматически откатывается на `localeFallback` (по умолчанию
 * 'en'), для которого перевод есть всегда. Другими словами — тексты
 * плагина "подключаются" на нужный язык сами, без того, чтобы
 * владелец сайта что-то указывал.
 *
 * Использует `addMessages()` (слияние), а не `setMessages()`, чтобы
 * не затирать messages/messagesAdd, которые сайт мог задать в своей
 * конфигурации `i18n`, или переводы других плагинов. Если сайт хочет
 * переопределить конкретную строку плагина — это можно сделать,
 * вызвав `editor.I18n.addMessages(...)` ПОСЛЕ инициализации редактора
 * (например, в обработчике события `load`): порядок вызовов
 * `addMessages()` имеет значение, выигрывает тот, что вызван позже
 * (см. README, раздел про локализацию).
 */
export function registerI18n(editor: Editor): void {
  const messages: Record<string, { cloudAssets: CloudAssetsMessages }> = {};
  for (const locale of SUPPORTED_LOCALES) {
    messages[locale] = { cloudAssets: LOCALE_MESSAGES[locale] };
  }
  editor.I18n.addMessages(messages);
}
