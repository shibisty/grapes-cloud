import type { Editor } from 'grapesjs';
import type { ResolvedAsset, StorageProvider } from '../types';
import { AssetBrowser } from '../ui/AssetBrowser';
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
export function openCloudMediaPicker(
  editor: Editor,
  providers: StorageProvider[],
  opts: { title?: string; initialProviderId?: string } = {},
): Promise<ResolvedAsset[] | null> {
  ensureStylesInjected();

  return new Promise((resolve) => {
    let settled = false;
    const assets: ResolvedAsset[] = [];
    const container = document.createElement('div');

    const browser = new AssetBrowser(container, {
      editor,
      providers,
      initialProviderId: opts.initialProviderId,
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
