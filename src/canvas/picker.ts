import type { Editor } from 'grapesjs';
import type { ResolvedAsset, StorageProvider } from '../types';
import { AssetBrowser, type TypeFilter } from '../ui/AssetBrowser';
import { ensureStylesInjected } from '../ui/styles';
import { t } from '../i18n/t';

/**
 * Своё, полностью отдельное от Asset Manager окно выбора файла.
 *
 * Раньше плагин занимал `assetManager.custom` — это единственный
 * слот на весь редактор: если на сайте есть ещё один плагин,
 * которому тоже нужен свой Asset Manager UI, один из них молча
 * перезаписывает другого при инициализации. Здесь этот слот вообще
 * не трогается — стандартный Asset Manager (и любой другой плагин,
 * который его настраивает) остаётся как есть, а наш пикер открывает
 * `editor.Modal` напрямую, по собственной команде/блоку (см.
 * `panelButton.ts`, `block.ts`). `editor.Modal` — это общий стек
 * модалок редактора (сама GrapesJS так показывает код, настройки
 * и т.п.), а не чей-то персональный ресурс, так что открывать его
 * по клику пользователя безопасно и не конфликтует ни с чем.
 *
 * Резолвится массивом выбранных asset'ов (один или несколько — см.
 * множественный выбор shift/ctrl+клик в AssetBrowser), или `null`,
 * если пользователь закрыл окно, ничего не выбрав.
 */
export interface PickerOptions {
  title?: string;
  initialProviderId?: string;
  /** Фильтр по типу при открытии (`'image'` для поля-картинки). */
  typeFilter?: TypeFilter;
  /**
   * Открыть в собственном оверлее поверх страницы, а не в `editor.Modal`.
   * Нужно, когда пикер зовут из уже открытого диалога (свойства страницы
   * grapesjs-site-pages, данные grapesjs-storage): модалка GrapesJS одна,
   * и `Modal.open()` заменил бы тот диалог вместе с несохранёнными полями.
   */
  overlay?: boolean;
}

export function openCloudMediaPicker(
  editor: Editor,
  providers: StorageProvider[],
  opts: PickerOptions = {},
): Promise<ResolvedAsset[] | null> {
  ensureStylesInjected();
  if (opts.overlay) return openInOverlay(editor, providers, opts);

  return new Promise((resolve) => {
    let settled = false;
    const assets: ResolvedAsset[] = [];
    const container = document.createElement('div');

    const browser = new AssetBrowser(container, {
      editor,
      providers,
      initialProviderId: opts.initialProviderId,
      initialTypeFilter: opts.typeFilter,
      // Копится сюда — не закрывает модалку сам по себе, потому что за
      // одно действие (кнопка "Вставить (N)") может вызваться несколько
      // раз подряд. Закрытие — по отдельному сигналу onDone ниже.
      onSelect: (asset) => {
        assets.push(asset);
      },
      onDone: () => {
        settled = true;
        resolve(assets.length ? assets : null);
        modal.close();
      },
      onError: (error, providerId) => {
        console.error(`[grapesjs-cloud-assets] Provider "${providerId}" error:`, error);
      },
    });
    const modal = editor.Modal.open({
      title: opts.title ?? t(editor, 'modal.title'),
      content: container,
    });

    // Баг "на мобильных растянуть попап на всю ширину": сама модалка —
    // родное окно GrapesJS (.gjs-mdl-dialog), у него в стилях самого
    // GrapesJS `width: 90%; max-width: 850px` — на телефоне это уже
    // довольно широко, но с полями по краям и внутренним padding'ом
    // .gjs-mdl-content (10-15px) пикеру не хватает места (таблица
    // файлов горизонтально теснится). Трогать .gjs-mdl-dialog глобально
    // нельзя — это общий стек модалок редактора (там же открывается,
    // например, встроенный редактор кода), поэтому вместо CSS-правила
    // на весь класс помечаем СВОИМ классом именно диалог ЭТОЙ модалки
    // (сразу после открытия он уже в DOM, синхронно) — правило под
    // media query в styles.ts бьёт только по .gca-modal-dialog.
    container.closest('.gjs-mdl-dialog')?.classList.add('gca-modal-dialog');

    // Срабатывает и при закрытии по выбору (см. modal.close() выше),
    // и при закрытии крестиком/оверлеем — в обоих случаях подчищаем
    // AssetBrowser, а resolve(null) уходит только если это НЕ выбор.
    modal.onceClose(() => {
      browser.destroy();
      if (!settled) resolve(null);
    });
  });
}

/**
 * Тот же пикер в своём оверлее (`.gca-overlay` в `document.body`), а не
 * в `editor.Modal` — см. `PickerOptions.overlay`. Закрывается крестиком,
 * кликом по фону и Escape; открытый диалог GrapesJS под ним не трогается.
 */
function openInOverlay(editor: Editor, providers: StorageProvider[], opts: PickerOptions): Promise<ResolvedAsset[] | null> {
  return new Promise((resolve) => {
    const assets: ResolvedAsset[] = [];
    const overlay = document.createElement('div');
    overlay.className = 'gca-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const dialog = document.createElement('div');
    dialog.className = 'gca-overlay__dialog gca-modal-dialog';
    const head = document.createElement('div');
    head.className = 'gca-overlay__head';
    const title = document.createElement('div');
    title.className = 'gca-overlay__title';
    title.textContent = opts.title ?? t(editor, 'modal.title');
    overlay.setAttribute('aria-label', title.textContent);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'gca-overlay__close';
    close.setAttribute('aria-label', '×');
    close.textContent = '×';
    head.append(title, close);
    const container = document.createElement('div');
    container.className = 'gca-overlay__body';
    dialog.append(head, container);
    overlay.appendChild(dialog);

    let done = false;
    const finish = (value: ResolvedAsset[] | null): void => {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey, true);
      browser.destroy();
      overlay.remove();
      resolve(value);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      // Свои мини-модалки пикера (подключить S3, аккаунты) закрываются первыми.
      if (overlay.querySelector('.gca-connect-modal-backdrop:not([hidden]), .gca-settings-modal:not([hidden])')) return;
      e.stopPropagation();
      finish(null);
    };
    const browser = new AssetBrowser(container, {
      editor,
      providers,
      initialProviderId: opts.initialProviderId,
      initialTypeFilter: opts.typeFilter,
      onSelect: (asset) => {
        assets.push(asset);
      },
      onDone: () => finish(assets.length ? assets : null),
      onError: (error, providerId) => {
        console.error(`[grapesjs-cloud-assets] Provider "${providerId}" error:`, error);
      },
    });
    close.addEventListener('click', () => finish(null));
    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);
  });
}
