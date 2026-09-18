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

    // Срабатывает и при закрытии по выбору (см. modal.close() выше),
    // и при закрытии крестиком/оверлеем — в обоих случаях подчищаем
    // AssetBrowser, а resolve(null) уходит только если это НЕ выбор.
    modal.onceClose(() => {
      browser.destroy();
      if (!settled) resolve(null);
    });
  });
}
