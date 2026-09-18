import type { ResolvedAssetType } from '../types';

/**
 * Иконки для грида/таблицы — по угаданному типу файла
 * (`guessAssetType` из `utils/assetType.ts`), плюс отдельная для
 * папки. Раньше вместо этого везде рисовался один и тот же эмодзи
 * (📄 на любой файл, 📁 на папку) — теперь тип виден на глаз даже
 * без превью-картинки (для не-image это единственный визуальный
 * признак типа, см. `renderTypeIcon`/`renderTable` в AssetBrowser.ts).
 *
 * Тот же контур/толщина линии, что и у иконок блока/кнопки плагина
 * (`canvas/block.ts`, `canvas/panelButton.ts`) и у иконки вкладки
 * "Свои файлы" (`providers/local/LocalAssetsProvider.ts`) — чтобы не
 * выделяться на общем фоне GrapesJS.
 */
const STROKE_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">';

export const FOLDER_ICON =
  STROKE_OPEN + '<path d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z"/></svg>';

const TYPE_ICONS: Record<ResolvedAssetType, string> = {
  image:
    STROKE_OPEN +
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  video:
    STROKE_OPEN + '<rect x="2.5" y="5.5" width="14" height="13" rx="2"/><path d="m16.5 10 5-3v10l-5-3v-4Z"/></svg>',
  audio:
    STROKE_OPEN +
    '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
  document:
    STROKE_OPEN +
    '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><path d="M8 12h8M8 16h8M8 8h3"/></svg>',
  other:
    STROKE_OPEN +
    '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/></svg>',
};

export function typeIcon(type: ResolvedAssetType): string {
  return TYPE_ICONS[type];
}

/** Переключатель "плитка"/"таблица" в тулбаре — см. `AssetBrowser.renderViewToggle`. */
export const GRID_VIEW_ICON =
  STROKE_OPEN +
  '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>' +
  '<rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

export const TABLE_VIEW_ICON =
  STROKE_OPEN + '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M9 10v10"/></svg>';

/** Кнопка настроек (выпадающее меню с "Выйти") в тулбаре — см. `AssetBrowser.renderSettingsMenu`. */
export const SETTINGS_ICON =
  STROKE_OPEN +
  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';

/** Кнопка "Обновить сейчас" (сбросить 15-минутный кеш списка) — см. `AssetBrowser.renderRefreshButton`. */
export const REFRESH_ICON =
  STROKE_OPEN +
  '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>';

/** Переключатель на древовидный вид в тулбаре — см. `AssetBrowser.renderViewToggle`. */
export const TREE_VIEW_ICON =
  STROKE_OPEN +
  '<path d="M5 4v6a2 2 0 0 0 2 2h4"/><path d="M5 4h0"/><circle cx="5" cy="4" r="1.5"/><circle cx="5" cy="14" r="1.5"/>' +
  '<circle cx="13" cy="12" r="1.5"/><path d="M5 14v6"/><path d="M13 12v0"/><path d="M11 12h6a2 2 0 0 0 2-2V4"/>' +
  '<circle cx="19" cy="4" r="1.5"/><path d="M11 20h6a2 2 0 0 0 2-2v-6"/><circle cx="19" cy="20" r="1.5"/></svg>';

/**
 * Шеврон-раскрыватель узла дерева — рисуется указывающим вправо,
 * поворот на 90° при раскрытом узле делается в CSS через
 * `.gca-tree-node__toggle--expanded` (см. styles.ts), а не двумя
 * разными иконками, чтобы анимация поворота была плавной.
 */
export const CHEVRON_RIGHT_ICON = STROKE_OPEN + '<path d="m9 5 7 7-7 7"/></svg>';

/** Кнопка "Развернуть всё" в тулбаре древовидного вида — см. `AssetBrowser.renderTree`. */
export const EXPAND_ALL_ICON =
  STROKE_OPEN + '<path d="M8 3v4a1 1 0 0 1-1 1H3"/><path d="M16 21v-4a1 1 0 0 1 1-1h4"/><path d="M3 3l6 6"/><path d="M21 21l-6-6"/></svg>';

/** Кнопка "Свернуть всё" в тулбаре древовидного вида — см. `AssetBrowser.renderTree`. */
export const COLLAPSE_ALL_ICON =
  STROKE_OPEN + '<path d="M9 3v4a1 1 0 0 1-1 1H4"/><path d="M15 21v-4a1 1 0 0 1 1-1h4"/><path d="M20 4l-6 6"/><path d="M4 20l6-6"/></svg>';

/** Иконка облака-загрузки в оверлее drag-and-drop — см. `AssetBrowser.renderDropOverlay`. */
export const CLOUD_UPLOAD_ICON =
  STROKE_OPEN +
  '<path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.7 8 4 4 0 0 1 17 16"/><path d="M12 12v8"/><path d="m9 15 3-3 3 3"/></svg>';

/** Кнопка "+" в конце ряда вкладок (выпадающее меню "Подключить S3") — см. `AssetBrowser.renderShell`. */
export const PLUS_ICON = STROKE_OPEN + '<path d="M12 5v14M5 12h14"/></svg>';

/**
 * Шеврон вниз — кнопка "ещё вкладки" (не поместившиеся по ширине) в
 * конце ряда вкладок, см. `AssetBrowser.updateTabsOverflow`. Отдельная
 * иконка, а не повёрнутый `CHEVRON_RIGHT_ICON` (тот уже используется
 * с вращением под раскрытие узла дерева — не хотим завязывать два
 * независимых UI на одну и ту же переходную анимацию).
 */
export const CHEVRON_DOWN_ICON = STROKE_OPEN + '<path d="m5 9 7 7 7-7"/></svg>';
