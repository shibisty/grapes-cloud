/**
 * Стили инжектируются рядом с #gjs через <style>, а не отдельным
 * .css-файлом — так плагин остаётся одним импортом без ручной
 * подписки на CSS в bundler'е владельца сайта.
 */
export const STYLES = `
/*
 * min-height 600px — так пикер не "прыгает" по высоте от папки к
 * папке, но не любой ценой: на низких экранах (ноутбук с открытой
 * панелью задач, телефон в альбомной ориентации) 600px может не
 * влезть в высоту модалки редактора вообще — clamp через min(...) до
 * 85% высоты viewport'а, чтобы контент всегда помещался и скроллился
 * сам (.gca-body ниже уже overflow-y: auto).
 */
.gca-root { display: flex; flex-direction: column; height: 100%; min-height: min(600px, 85vh); font-size: 13px; }
/*
 * Несколько элементов ниже (.gca-drop-overlay, .gca-upload-queue и
 * т.п.) переключаются через DOM-свойство element.hidden, но сами при
 * этом уже объявляют СВОЙ display (flex/grid/block) в этом же
 * авторском стиле — а правило браузера по умолчанию, [hidden] { display:
 * none }, живёт в USER AGENT stylesheet, у которого более низкий
 * приоритет, чем у ЛЮБОГО авторского правила той же (или даже меньшей)
 * специфичности. Поэтому .foo { display: flex } в этом файле всегда
 * побеждает [hidden] браузера, и элемент с атрибутом hidden="true"
 * всё равно рендерится видимым (баг — зона drag-and-drop висела
 * поверх пикера постоянно, даже без перетаскивания). Явно возвращаем
 * [hidden] его смысл здесь, одним правилом на весь плагин, а не
 * патчим каждый .gca-* класс отдельно.
 */
.gca-root [hidden] { display: none !important; }
/*
 * flex-wrap: nowrap (было wrap) — вкладки, которым не хватило
 * ширины, больше не переносятся на вторую строку, а прячутся за
 * шевроном .gca-tab-overflow (см. AssetBrowser.updateTabsOverflow) —
 * запрос: "в табы должно помещаться ровно столько, сколько есть
 * ширины, если больше — прятать за стрелочкой вниз".
 *
 * НЕТ overflow: hidden здесь (было раньше, как "страховка на случай
 * долей пикселя округления при измерении в JS") — баг: и кнопка "+"
 * (.gca-tab-add), и шеврон "ещё вкладки" (.gca-tab-overflow) лежат
 * ВНУТРИ .gca-tabs, а их выпадающие меню (.gca-tab-add__menu,
 * .gca-tab-overflow__menu) выезжают за пределы строки вкладок вниз
 * (position: absolute; top: calc(100% + 4px)) — overflow: hidden на
 * родителе обрезает и позиционированных потомков тоже, так что меню
 * реально открывалось (menu.hidden = false отрабатывал), но было
 * невидимым — клик по "+" выглядел так, будто вообще ничего не
 * происходит. Сам JS (updateTabsOverflow()) и так явно прячет
 * (display: none) вкладки, которые не влезли, — это и есть
 * настоящий механизм, не даёт строке визуально "поехать", так что
 * overflow: hidden был лишним подстраховочным правилом, которое того
 * не стоило.
 */
.gca-tabs { display: flex; align-items: center; gap: 4px; padding: 8px 8px 0; border-bottom: 1px solid var(--gjs-color3, #3c3c3c); flex-wrap: nowrap; }
.gca-tab { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border: none; background: transparent; color: inherit; cursor: pointer; border-radius: 4px 4px 0 0; opacity: .7; }
.gca-tab:hover { opacity: 1; }
.gca-tab--active { opacity: 1; background: var(--gjs-color4, rgba(255,255,255,.08)); font-weight: 600; }
.gca-tab__icon { width: 16px; height: 16px; display: inline-flex; }
.gca-tab__icon svg { width: 100%; height: 100%; }
/*
 * Каждая вкладка — обёртка .gca-tab-wrap (а не сама .gca-tab-button
 * напрямую в .gca-tabs), потому что у динамически подключённых S3-
 * вкладок есть вторая, отдельная кнопка "×" (см. AssetBrowser.
 * renderShell) — а вложенный <button> внутри <button> невалиден,
 * значит нужен общий родитель-обёртка, который и становится flex-
 * item'ом ряда вкладок вместо самой .gca-tab.
 */
.gca-tab-wrap { position: relative; display: inline-flex; }
.gca-tab--removable { padding-right: 22px; }
[dir="rtl"] .gca-tab--removable { padding-right: 10px; padding-left: 22px; }
.gca-tab__remove { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 50%; background: rgba(0,0,0,.35); color: #fff; font-size: 13px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .12s ease, background .12s ease; }
[dir="rtl"] .gca-tab__remove { right: auto; left: 3px; }
.gca-tab-wrap:hover .gca-tab__remove, .gca-tab__remove:focus-visible { opacity: 1; }
.gca-tab__remove:hover { background: #ff6b6b; }
.gca-tab__remove--confirm { opacity: 1; background: #ff6b6b; }
/* Кнопка "+" (подключить ещё одно хранилище) и шеврон "ещё вкладки" — оба конца ряда вкладок, всегда видимые (не участвуют в переносе/скрытии). */
.gca-tab-add, .gca-tab-overflow { position: relative; display: inline-flex; align-items: center; flex-shrink: 0; }
/*
 * Тот же внешний вид, что у .gca-icon-btn (тулбар), но НАМЕРЕННО свой
 * отдельный класс, а не ".gca-icon-btn" вторым классом на кнопке:
 * несколько мест в коде (и тестах) находят "кнопку-шестерёнку/обновить"
 * через container.querySelector('.gca-icon-btn') — первый попавшийся
 * в DOM-порядке; ряд вкладок рендерится раньше тулбара, так что общий
 * класс тут же стал бы тем самым "первым" вместо настоящей кнопки
 * обновления.
 */
.gca-tab-icon-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; opacity: .75; cursor: pointer; }
.gca-tab-icon-btn:hover { opacity: 1; background: rgba(255,255,255,.12); }
.gca-tab-icon-btn svg { width: 16px; height: 16px; }
.gca-tab-add__menu, .gca-tab-overflow__menu { position: absolute; top: calc(100% + 4px); left: 0; z-index: 20; min-width: 190px; max-height: 260px; overflow-y: auto; padding: 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,.2); background: var(--gjs-color2, #333); box-shadow: 0 4px 16px rgba(0,0,0,.35); }
[dir="rtl"] .gca-tab-add__menu, [dir="rtl"] .gca-tab-overflow__menu { left: auto; right: 0; }
.gca-tab-add__item, .gca-tab-overflow__item { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 7px 10px; border: none; border-radius: 4px; background: none; color: inherit; cursor: pointer; font: inherit; white-space: nowrap; }
[dir="rtl"] .gca-tab-add__item, [dir="rtl"] .gca-tab-overflow__item { text-align: right; }
.gca-tab-add__item:hover, .gca-tab-overflow__item:hover { background: rgba(255,255,255,.1); }
.gca-tab-overflow__item .gca-tab__icon { width: 14px; height: 14px; }

/*
 * Попап подключения S3 — единственная настоящая "модалка" внутри
 * самого .gca-root (не через editor.Modal — тот уже занят под весь
 * AssetBrowser, см. canvas/picker.ts, второй editor.Modal.open()
 * поверх первого рисковал бы неожиданно заменить его содержимое).
 * Как и .gca-drop-overlay/.gca-upload-queue выше — сиблинг .gca-body,
 * не ребёнок (тот целиком пересобирается на каждый рендер).
 */
.gca-connect-modal-backdrop { position: absolute; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.55); padding: 16px; }
.gca-connect-modal { width: 100%; max-width: 420px; max-height: 100%; overflow-y: auto; background: var(--gjs-color2, #333); border-radius: 8px; border: 1px solid rgba(255,255,255,.15); box-shadow: 0 12px 40px rgba(0,0,0,.5); padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.gca-connect-modal__title { margin: 0; font-size: 15px; font-weight: 700; }
.gca-connect-modal__field { display: flex; flex-direction: column; gap: 4px; }
.gca-connect-modal__field label { font-size: 12px; opacity: .8; }
.gca-connect-modal__field input[type="text"], .gca-connect-modal__field input[type="password"] { padding: 7px 9px; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; font: inherit; width: 100%; box-sizing: border-box; }
.gca-connect-modal__field input:focus { outline: 1px solid #2f6fed; }
.gca-connect-modal__checkbox { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.gca-connect-modal__hint { font-size: 11px; opacity: .7; line-height: 1.45; margin: 0; }
.gca-connect-modal__error { color: #ff6b6b; font-size: 12px; margin: 0; }
.gca-connect-modal__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.gca-body { flex: 1; overflow-y: auto; padding: 10px; }
.gca-toolbar { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.gca-toolbar__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.gca-toolbar__row--tools { justify-content: flex-start; }
.gca-toolbar__actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.gca-url-form { display: flex; align-items: center; gap: 6px; }
.gca-url-input { padding: 6px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; min-width: 220px; }
.gca-url-input:focus { outline: 1px solid #2f6fed; }
/* flex: 1 1 auto — растягивает саму зону поиска на всю доступную ширину строки тулбара (запрос: "растяни область поиска на всю доступную ширину"), а не только на минимум по контенту, как раньше; addByUrl/upload-кнопка рядом сохраняют свою естественную ширину. */
.gca-search-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1 1 auto; }
.gca-search-input { min-width: 180px; flex: 1 1 180px; }
.gca-filter-select { padding: 6px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; }
.gca-filter-select:focus { outline: 1px solid #2f6fed; }
.gca-breadcrumb { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.gca-breadcrumb__item { background: none; border: none; color: #4d94ff; opacity: 1; cursor: pointer; padding: 2px 5px; border-radius: 3px; font-weight: 500; }
.gca-breadcrumb__item:hover { color: #78b0ff; text-decoration: underline; background: rgba(255,255,255,.08); }
.gca-breadcrumb__item--current { color: inherit; opacity: 1; font-weight: 700; cursor: default; padding: 2px 5px; }
.gca-breadcrumb__sep { opacity: .55; }
.gca-btn { padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; cursor: pointer; }
.gca-btn:hover { background: rgba(255,255,255,.12); }
.gca-btn--primary { background: #2f6fed; border-color: #2f6fed; color: #fff; }
.gca-upload-btn { display: inline-flex; align-items: center; }
.gca-icon-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; opacity: .75; cursor: pointer; }
.gca-icon-btn:hover { opacity: 1; background: rgba(255,255,255,.12); }
.gca-icon-btn:disabled { cursor: default; opacity: .4; }
.gca-icon-btn svg { width: 16px; height: 16px; }
@keyframes gca-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.gca-icon-btn--spinning svg { animation: gca-spin 0.9s linear infinite; }
.gca-settings { position: relative; }
.gca-settings__menu { position: absolute; top: calc(100% + 4px); right: 0; z-index: 20; min-width: 160px; padding: 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,.2); background: var(--gjs-color2, #333); box-shadow: 0 4px 16px rgba(0,0,0,.35); }
[dir="rtl"] .gca-settings__menu { right: auto; left: 0; }
.gca-settings__item { display: block; width: 100%; text-align: left; padding: 7px 10px; border: none; border-radius: 4px; background: none; color: inherit; cursor: pointer; font: inherit; white-space: nowrap; }
[dir="rtl"] .gca-settings__item { text-align: right; }
.gca-settings__item:hover { background: rgba(255,255,255,.1); }
.gca-settings__item--confirm { color: #ff6b6b; }
.gca-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
.gca-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px; border: 1px solid transparent; border-radius: 6px; background: rgba(255,255,255,.03); color: inherit; cursor: pointer; }
.gca-cell:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.12); }
.gca-cell--busy { opacity: .5; pointer-events: none; }
.gca-table__name-btn.gca-cell--busy { opacity: .5; pointer-events: none; }
/* Множественный выбор (shift/ctrl+клик) — подсветка + галочка в углу плитки, чтобы выбор был виден и без наведения. */
.gca-cell--selected { background: rgba(47,111,237,.18); border-color: #2f6fed; }
.gca-cell--selected::after { content: '\\2713'; position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #2f6fed; color: #fff; font-size: 11px; line-height: 16px; text-align: center; }
[dir="rtl"] .gca-cell--selected::after { right: auto; left: 4px; }
.gca-table__row--selected { background: rgba(47,111,237,.14); }
.gca-table__row--selected:hover { background: rgba(47,111,237,.2); }
/*
 * Иконка типа файла рисуется stroke="currentColor" — то есть должна
 * сама совпадать с цветом текста темы редактора. Но у <button> в
 * браузере по умолчанию color: buttontext (системный цвет, обычно
 * чёрный) — а не inherit, так что без явного color: inherit на самой
 * кнопке (.gca-cell/.gca-table__name-btn выше и .gca-view-toggle__btn
 * ниже) иконка красилась в чёрный ДАЖЕ в тёмной теме редактора, отсюда
 * и "тёмные иконки на тёмном фоне". Сам бокс превью — полупрозрачная
 * чёрная плашка (одинаково хорошо читается и на светлой, и на тёмной
 * теме именно потому, что iconColor = currentColor хоста): на светлой
 * теме плашка светлеет и тёмная иконка на ней контрастна, на тёмной
 * темнеет и светлая иконка контрастна на ней же.
 */
.gca-cell__thumb { width: 100%; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 28px; overflow: hidden; border-radius: 4px; background: rgba(0,0,0,.15); border: 1px solid rgba(128,128,128,.25); }
.gca-cell__thumb img { width: 100%; height: 100%; object-fit: cover; }
.gca-cell__name { font-size: 11px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.gca-cell__thumb svg, .gca-table__icon svg { width: 26px; height: 26px; opacity: .95; }
.gca-view-toggle { display: inline-flex; border: 1px solid rgba(255,255,255,.2); border-radius: 4px; overflow: hidden; }
.gca-view-toggle__btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: none; background: rgba(255,255,255,.03); color: inherit; opacity: .6; cursor: pointer; }
.gca-view-toggle__btn svg { width: 16px; height: 16px; }
.gca-view-toggle__btn:hover { opacity: .9; background: rgba(255,255,255,.08); }
.gca-view-toggle__btn--active { opacity: 1; background: rgba(255,255,255,.14); }
.gca-view-toggle__btn:not(:last-child) { border-right: 1px solid rgba(255,255,255,.2); }
/* Горизонтальный скролл для таблицы на узких экранах — вместо того, чтобы колонки сжимались до нечитаемости. */
.gca-table-wrap { overflow-x: auto; }
.gca-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.gca-table thead th { text-align: left; padding: 0; border-bottom: 1px solid var(--gjs-color3, #3c3c3c); white-space: nowrap; }
.gca-table__sort-btn { width: 100%; padding: 6px 8px; border: none; background: none; color: inherit; opacity: .7; font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
[dir="rtl"] .gca-table__sort-btn { text-align: right; }
.gca-table__sort-btn:hover { opacity: 1; }
.gca-table__sort-btn--active { opacity: 1; color: #4d94ff; }
.gca-table__col--type, .gca-table__col--size, .gca-table__col--modified { width: 1%; }
.gca-table__row:hover { background: rgba(255,255,255,.06); }
.gca-table__cell { padding: 4px 8px; border-bottom: 1px solid rgba(255,255,255,.06); vertical-align: middle; }
.gca-table__cell--type, .gca-table__cell--size, .gca-table__cell--modified { white-space: nowrap; opacity: .8; }
.gca-table__name-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 4px; border: none; background: none; color: inherit; cursor: pointer; text-align: left; border-radius: 4px; }
.gca-table__name-btn:hover { background: rgba(255,255,255,.06); }
.gca-table__icon { width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 3px; overflow: hidden; background: rgba(0,0,0,.15); border: 1px solid rgba(128,128,128,.25); color: inherit; }
.gca-table__icon img { width: 100%; height: 100%; object-fit: cover; }
.gca-table__name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gca-empty, .gca-loading, .gca-error { padding: 24px 8px; text-align: center; opacity: .7; }
.gca-error { color: #ff6b6b; opacity: 1; }
/*
 * Крупнее и менее контрастная, чем обычная .gca-btn — по проще
 * попасть, не должна спорить по весу с реальными действиями (вставить,
 * загрузить). Во время подгрузки — вместо текста "Загрузка…" тонкая
 * неопределённая полоса под подписью.
 */
.gca-load-more-wrap { margin-top: 10px; }
.gca-load-more { position: relative; width: 100%; padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.03); color: inherit; opacity: .8; cursor: pointer; overflow: hidden; }
.gca-load-more:hover { opacity: 1; background: rgba(255,255,255,.07); }
.gca-load-more:disabled { cursor: default; }
.gca-load-more__label { display: block; }
.gca-load-more__bar { position: absolute; left: 0; bottom: 0; height: 2px; width: 40%; background: #2f6fed; animation: gca-load-more-bar 1.1s ease-in-out infinite; }
@keyframes gca-load-more-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
.gca-selection-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; margin-bottom: 10px; border-radius: 6px; background: rgba(47,111,237,.14); border: 1px solid rgba(47,111,237,.35); flex-wrap: wrap; }
.gca-selection-bar__label { font-weight: 600; }
.gca-selection-bar__actions { display: flex; align-items: center; gap: 6px; }
/*
 * Пока ничего не выбрано, кнопки Cancel/Insert прячутся через
 * visibility (НЕ display/[hidden]) — они по-прежнему занимают место в
 * строке, поэтому высота .gca-selection-bar не меняется между "0
 * выбрано" и "N выбрано" и остальной контент body не прыгает при
 * первом клике по файлу. См. renderSelectionBar() в AssetBrowser.ts.
 */
.gca-selection-bar__actions--empty { visibility: hidden; }
/*
 * Раньше ошибка вставки конкретного файла (например, у OneDrive —
 * item без @microsoft.graph.downloadUrl) уходила только в
 * onError/console (см. AssetBrowser.quickInsert/insertSelection) —
 * человек без открытых DevTools видел только, что клик "ничего не
 * сделал". Плавающий баннер ВНИЗУ .gca-root, над последним элементом
 * списка — сиблинг .gca-body (как .gca-drop-overlay/.gca-upload-queue
 * выше, см. insertErrorEl в AssetBrowser.ts), а не его часть, и
 * специально через position: absolute (а не в обычном потоке, как
 * .gca-selection-bar) — ни появление, ни закрытие баннера не должны
 * сдвигать тулбар/список. Из-за абсолютного позиционирования и
 * наложения поверх списка фон делаем непрозрачным (как у
 * .gca-context-menu/.gca-upload-queue), иначе контент списка
 * просвечивал бы сквозь текст ошибки. Совмещается с классом .gca-error
 * (даёт красный цвет текста) — но переопределяет его padding/text-align
 * тем же способом, что и .gca-auth-gate__error ниже.
 */
.gca-insert-error { position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 12; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 6px; background: var(--gjs-color2, #333); border: 1px solid rgba(255,107,107,.5); box-shadow: 0 4px 14px rgba(0,0,0,.35); text-align: left; }
[dir="rtl"] .gca-insert-error { text-align: right; }
.gca-insert-error__text { flex: 1; }
.gca-insert-error__close { width: 22px; height: 22px; font-size: 16px; line-height: 1; flex-shrink: 0; }
.gca-context-menu { position: fixed; z-index: 10000; min-width: 180px; padding: 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,.2); background: var(--gjs-color2, #333); box-shadow: 0 6px 20px rgba(0,0,0,.4); }
.gca-context-menu__item { display: block; width: 100%; text-align: left; padding: 8px 10px; border: none; border-radius: 4px; background: none; color: inherit; cursor: pointer; font: inherit; white-space: nowrap; }
[dir="rtl"] .gca-context-menu__item { text-align: right; }
.gca-context-menu__item:hover { background: rgba(255,255,255,.1); }
.gca-context-menu__item--danger { color: #ff6b6b; }
.gca-auth-gate { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 16px; text-align: center; }
.gca-auth-gate__error { padding: 0; max-width: 360px; font-size: 12px; }
.gca-auth-gate__change { margin-top: -4px; }
.gca-link-btn { background: none; border: none; padding: 0; color: #4d94ff; text-decoration: underline; cursor: pointer; font: inherit; word-break: break-all; }
.gca-link-btn:hover { color: #78b0ff; }
.gca-setup-wizard { max-width: 480px; margin: 0 auto; padding: 8px 4px 24px; display: flex; flex-direction: column; gap: 14px; }
.gca-setup-wizard__intro { margin: 0; line-height: 1.5; }
.gca-setup-wizard__steps { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 12px; line-height: 1.5; }
.gca-setup-wizard__steps li { padding-left: 2px; }
.gca-setup-wizard__form { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.gca-copy-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.gca-copy-row__input { flex: 1; padding: 5px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: inherit; font-size: 12px; }
.gca-copy-row__btn { flex-shrink: 0; font-size: 12px; padding: 5px 10px; }
.gca-setup-wizard__upload-hint { margin: -4px 0 0; padding: 8px 10px; border-radius: 6px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); font-size: 12px; opacity: .85; line-height: 1.5; }

/*
 * Зона перетаскивания — оверлей на весь .gca-body (см. AssetBrowser.
 * renderShell(): это сиблинг body, а не его ребёнок, именно чтобы
 * body.innerHTML = '' на каждый рендер его не стирал). position:
 * absolute относительно .gca-root (у него уже нет своего position —
 * добавляем relative только ему, чтобы не задеть остальную вёрстку
 * страницы владельца).
 */
.gca-root { position: relative; }
.gca-drop-overlay { position: absolute; inset: 0; z-index: 15; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: rgba(47,111,237,.16); border: 2px dashed #2f6fed; border-radius: 6px; margin: 4px; pointer-events: none; }
.gca-drop-overlay__icon { width: 40px; height: 40px; color: #4d94ff; }
.gca-drop-overlay__icon svg { width: 100%; height: 100%; }
.gca-drop-overlay__text { font-weight: 600; font-size: 14px; color: #4d94ff; text-align: center; padding: 0 16px; }

/* Панель очереди загрузки — тоже сиблинг body, прибита к низу .gca-root, не пропадает при рендерах поиска/сортировки/грида. */
.gca-upload-queue { flex-shrink: 0; margin: 0 10px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,.15); background: var(--gjs-color2, #333); box-shadow: 0 -2px 10px rgba(0,0,0,.2); max-height: 220px; display: flex; flex-direction: column; overflow: hidden; }
.gca-upload-queue__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.1); flex-shrink: 0; }
.gca-upload-queue__title { font-weight: 600; font-size: 12px; }
.gca-upload-queue__close { width: 22px; height: 22px; font-size: 16px; line-height: 1; }
.gca-upload-queue__list { overflow-y: auto; padding: 6px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
.gca-upload-queue__item { display: grid; grid-template-columns: 1fr auto; column-gap: 8px; row-gap: 4px; font-size: 12px; }
.gca-upload-queue__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gca-upload-queue__status { opacity: .75; white-space: nowrap; }
.gca-upload-queue__item--error .gca-upload-queue__status { color: #ff6b6b; opacity: 1; }
.gca-upload-queue__item--done .gca-upload-queue__status { color: #3ecf6e; }
.gca-upload-queue__bar { grid-column: 1 / -1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.1); overflow: hidden; }
.gca-upload-queue__bar-fill { height: 100%; background: #2f6fed; transition: width .2s ease; }
.gca-upload-queue__item--error .gca-upload-queue__bar-fill { background: #ff6b6b; }
.gca-upload-queue__item--done .gca-upload-queue__bar-fill { background: #3ecf6e; }

/*
 * Древовидный вид — свой отдельный тулбар (Развернуть/Свернуть всё) и
 * плоский список строк с отступом по глубине через CSS-переменную
 * --gca-tree-depth (простая арифметика в calc(), без вложенных
 * <div>-обёрток на каждый уровень — тогда и подсветку строки при
 * hover/selected не приходится тащить через все родительские отступы).
 */
.gca-tree__toolbar { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.gca-tree__toolbar-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
.gca-tree__toolbar-btn svg { width: 14px; height: 14px; }
.gca-tree__list { display: flex; flex-direction: column; }
.gca-tree-node__row { display: flex; align-items: center; gap: 4px; padding: 5px 6px 5px calc(6px + var(--gca-tree-depth, 0) * 20px); border-radius: 4px; cursor: default; }
.gca-tree-node__row:hover { background: rgba(255,255,255,.06); }
.gca-tree-node__row--selected { background: rgba(47,111,237,.18); }
.gca-tree-node__toggle { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; padding: 0; border: none; background: none; color: inherit; opacity: .7; cursor: pointer; border-radius: 3px; transition: transform .15s ease; }
.gca-tree-node__toggle:hover { opacity: 1; background: rgba(255,255,255,.1); }
.gca-tree-node__toggle svg { width: 14px; height: 14px; }
.gca-tree-node__toggle--expanded { transform: rotate(90deg); }
.gca-tree-node__toggle--spacer { visibility: hidden; cursor: default; }
.gca-tree-node__icon { flex-shrink: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; opacity: .9; }
.gca-tree-node__icon svg { width: 16px; height: 16px; }
.gca-tree-node__name { flex: 1; min-width: 0; text-align: left; padding: 2px 4px; border: none; background: none; color: inherit; cursor: pointer; font: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-radius: 3px; }
[dir="rtl"] .gca-tree-node__name { text-align: right; }
.gca-tree-node__name:hover { text-decoration: underline; }
.gca-tree-node__children { display: flex; flex-direction: column; }
.gca-tree-node__loading, .gca-tree-node__empty { padding: 5px 6px 5px calc(6px + var(--gca-tree-depth, 0) * 20px); opacity: .6; font-size: 12px; }
.gca-tree-node__error { display: block; width: 100%; text-align: left; padding: 5px 6px 5px calc(6px + var(--gca-tree-depth, 0) * 20px); border: none; background: none; color: #ff6b6b; cursor: pointer; font: inherit; font-size: 12px; }
[dir="rtl"] .gca-tree-node__error { text-align: right; }
.gca-tree-node__more { display: block; width: calc(100% - 6px - var(--gca-tree-depth, 0) * 20px); margin: 2px 6px 2px calc(6px + var(--gca-tree-depth, 0) * 20px); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.03); color: inherit; opacity: .75; cursor: pointer; font-size: 11px; text-align: left; }
[dir="rtl"] .gca-tree-node__more { text-align: right; }
.gca-tree-node__more:hover { opacity: 1; background: rgba(255,255,255,.07); }
.gca-tree-node__more:disabled { cursor: default; }

/*
 * Моб. адаптация — узкий экран (телефон, боковая панель редактора в
 * split-view). Тулбар и поиск/фильтр растягиваются на всю ширину и
 * переносятся по одному в столбец, грид ужимается под меньшие плитки,
 * таргеты для тапа увеличены (44px — ориентир Apple/Material для
 * "легко попасть пальцем"), меню настроек занимает всю ширину вместо
 * узкого выпадающего списка у правого края.
 */
@media (max-width: 640px) {
  .gca-toolbar__row { justify-content: flex-start; }
  .gca-toolbar__actions { width: 100%; justify-content: flex-end; }
  .gca-search-row { width: 100%; }
  .gca-search-input { flex-basis: 100%; min-width: 0; }
  .gca-filter-select { flex: 1; }
  .gca-url-form { width: 100%; }
  .gca-url-form .gca-url-input { flex: 1; min-width: 0; }
  .gca-upload-btn { width: 100%; justify-content: center; }
  .gca-grid { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
  .gca-icon-btn, .gca-tab-icon-btn, .gca-view-toggle__btn { width: 36px; height: 36px; }
  .gca-icon-btn svg, .gca-tab-icon-btn svg, .gca-view-toggle__btn svg { width: 18px; height: 18px; }
  .gca-settings__menu { left: 0; right: 0; min-width: 0; }
  [dir="rtl"] .gca-settings__menu { left: 0; right: 0; }
  .gca-settings__item { padding: 10px; }
  .gca-table__name-btn { padding: 8px 4px; }
  .gca-selection-bar { flex-direction: column; align-items: stretch; }
  .gca-selection-bar__actions { justify-content: stretch; }
  .gca-selection-bar__actions .gca-btn { flex: 1; }
  .gca-context-menu__item { padding: 12px 14px; }
  .gca-tree__toolbar-btn { flex: 1; justify-content: center; }
  .gca-tree-node__toggle, .gca-tree-node__name { min-height: 32px; }
  .gca-upload-queue { margin: 0 6px 6px; max-height: 160px; }
}
`;

let injected = false;

export function ensureStylesInjected(): void {
  if (injected) return;
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-grapesjs-cloud-assets', '');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);
  injected = true;
}
