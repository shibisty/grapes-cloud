import type { Editor } from 'grapesjs';
import type { ResolvedAsset, StorageProvider } from '../types';
import { componentDefForAsset } from './componentDef';
import { insertAfterSelectionOrEnd } from './insert';
import { openCloudMediaPicker } from './picker';
import { t } from '../i18n/t';
import { S3Provider } from '../providers/s3/S3Provider';
import { readS3Connections, S3_CONNECTIONS_CHANGED_EVENT } from '../providers/s3/connections';

const PLACEHOLDER_TYPE = 'gca-cloud-media-placeholder';
const BLOCK_ID = 'gca-cloud-media';
/** Префикс id блока/типа-компонента отдельной вкладки хранилища — см. `registerProviderBlock` ниже. */
const PROVIDER_BLOCK_ID_PREFIX = 'gca-cloud-media-provider:';
const PROVIDER_PLACEHOLDER_TYPE_PREFIX = 'gca-cloud-media-provider-placeholder:';

const ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M7 18a4 4 0 0 1-1-7.87A5.5 5.5 0 0 1 16.9 8.14 4.5 4.5 0 0 1 17.5 17H8"/><path d="M12 12v7"/><path d="m9.5 14.5 2.5-2.5 2.5 2.5"/></svg>';

export interface CloudMediaBlockOptions {
  providers: StorageProvider[];
  blockLabel?: string;
  blockCategory?: string;
  modalTitle?: string;
}

/**
 * Регистрирует блок "Облачные медиа" в Block Manager вместе со своим
 * типом компонента-плейсхолдера — отдельно от Asset Manager, чтобы
 * не зависеть от `assetManager.custom` (см. `picker.ts`).
 *
 * У блока в GrapesJS два независимых пути взаимодействия, и оба
 * должны открывать один и тот же пикер:
 *
 * - Клик по блоку в панели идёт через `onClick` блока (ниже) и
 *   полностью подменяет собой стандартную вставку `content` — пикер
 *   открывается сразу, а по выбору компонент вставляется вручную.
 * - Перетаскивание блока на холст `onClick` не использует вообще —
 *   drag всегда вставляет `content` как есть, поэтому `content` —
 *   это компонент-плейсхолдер (`PLACEHOLDER_TYPE`). Он сам открывает
 *   тот же пикер сразу после того, как окажется на холсте (`init()`
 *   ниже), и либо заменяет себя результатом, либо удаляет себя, если
 *   выбор отменили — так итоговый компонент оказывается ровно там,
 *   куда его перетащили.
 *
 * Известное ограничение: `init()` плейсхолдера отрабатывает при
 * КАЖДОМ его создании, включая повторное — например, если undo
 * вернёт только что удалённый плейсхолдер обратно. Это редкий
 * сценарий (сам плейсхолдер живёт на холсте доли секунды), и в
 * худшем случае пикер просто откроется ещё раз — не ломает данные.
 *
 * ПОМИМО этого общего блока (открывает пикер на той вкладке, что
 * была активна в прошлый раз, как и раньше), регистрируется ещё по
 * ОТДЕЛЬНОМУ блоку на каждый уже добавленный тип хранилища — и
 * заданный владельцем сайта через `pluginsOpts.providers`, и
 * подключённый самим посетителем через попап "Подключить S3" (см.
 * `registerProviderBlocks` ниже) — клик по такому блоку сразу
 * открывает окно с активной вкладкой именно этого хранилища, а не
 * той, что была открыта в прошлый раз.
 */
export function registerCloudMediaBlock(editor: Editor, opts: CloudMediaBlockOptions): void {
  const { providers, modalTitle } = opts;
  const category = opts.blockCategory ?? t(editor, 'block.category');

  editor.Components.addType(PLACEHOLDER_TYPE, {
    model: {
      defaults: {
        tagName: 'div',
        removable: true,
        draggable: true,
        droppable: false,
        copyable: false,
        highlightable: false,
        attributes: { 'data-gca-placeholder': '' },
      },

      init() {
        void openCloudMediaPicker(editor, providers, { title: modalTitle }).then((assets) => {
          const parent = this.parent();
          const defs = (assets ?? []).map(componentDefForAsset);

          if (defs.length) {
            if (parent) {
              parent.append(defs, { at: this.index() });
            } else {
              // Плейсхолдер уже оказался корнем (маловероятно, но на
              // всякий случай) — просто кладём в обёртку.
              editor.getWrapper()?.append(defs);
            }
          }

          this.remove();
        });
      },
    },

    block: {
      id: BLOCK_ID,
      label: opts.blockLabel ?? t(editor, 'block.label'),
      category,
      media: ICON,
      content: { type: PLACEHOLDER_TYPE },

      onClick: (_block, blockEditor) => {
        void openCloudMediaPicker(blockEditor, providers, { title: modalTitle }).then((assets) => {
          insertAssets(blockEditor, assets);
        });
      },
    },
  });

  registerProviderBlocks(editor, { providers, category });
}

function insertAssets(blockEditor: Editor, assets: ResolvedAsset[] | null): void {
  if (!assets?.length) return;
  for (const asset of assets) {
    insertAfterSelectionOrEnd(blockEditor, componentDefForAsset(asset));
  }
}

/**
 * Блок для ОДНОГО конкретного хранилища (провайдера) — та же пара
 * "тип компонента-плейсхолдер + блок", что у общего блока выше, но
 * `init()`/`onClick()` передают в `openCloudMediaPicker` свой
 * `initialProviderId`, так что окно сразу открывается на нужной
 * вкладке. `providers` здесь — ВСЕГДА статический список (Local +
 * `pluginsOpts.providers`), тот же, что и у общего блока: сам
 * `AssetBrowser` в любом случае дочитывает актуальные S3-соединения
 * из localStorage при каждом открытии (см. его конструктор), так что
 * все вкладки видны и переключаемы независимо от того, каким именно
 * блоком открыт пикер — `initialProviderId` влияет только на то,
 * какая вкладка активна СРАЗУ при открытии.
 */
function registerProviderBlock(editor: Editor, provider: StorageProvider, providers: StorageProvider[], category: string): void {
  const blockId = PROVIDER_BLOCK_ID_PREFIX + provider.id;
  const placeholderType = PROVIDER_PLACEHOLDER_TYPE_PREFIX + provider.id;

  // Тип компонента регистрируется один раз на id провайдера — повторный
  // вызов (например, при каждой синхронизации S3-соединений, см.
  // `registerProviderBlocks`) не должен плодить дубликаты/предупреждения.
  if (!editor.Components.getType(placeholderType)) {
    editor.Components.addType(placeholderType, {
      model: {
        defaults: {
          tagName: 'div',
          removable: true,
          draggable: true,
          droppable: false,
          copyable: false,
          highlightable: false,
          attributes: { 'data-gca-placeholder': '', 'data-gca-provider': provider.id },
        },

        init() {
          void openCloudMediaPicker(editor, providers, { title: provider.label, initialProviderId: provider.id }).then((assets) => {
            const parent = this.parent();
            const defs = (assets ?? []).map(componentDefForAsset);

            if (defs.length) {
              if (parent) {
                parent.append(defs, { at: this.index() });
              } else {
                editor.getWrapper()?.append(defs);
              }
            }

            this.remove();
          });
        },
      },
    });
  }

  editor.BlockManager.add(blockId, {
    label: provider.label,
    category,
    media: provider.icon,
    content: { type: placeholderType },

    onClick: (_block, blockEditor) => {
      void openCloudMediaPicker(blockEditor, providers, { title: provider.label, initialProviderId: provider.id }).then((assets) => {
        insertAssets(blockEditor, assets);
      });
    },
  });
}

/**
 * По блоку на каждый УЖЕ ДОБАВЛЕННЫЙ тип хранилища:
 *
 * - Статические провайдеры (`providers` — Local + `pluginsOpts.providers`)
 *   регистрируются один раз, сразу при инициализации плагина — их
 *   список не меняется в течение жизни страницы.
 * - S3-соединения посетитель подключает/отключает в любой момент уже
 *   ПОСЛЕ инициализации плагина, через попап "Подключить S3" в самом
 *   пикере (см. `AssetBrowser.addS3Connection`/`removeS3Connection`) —
 *   их блоки нужно держать в синхроне динамически: подписываемся на
 *   `S3_CONNECTIONS_CHANGED_EVENT`, которое `AssetBrowser` шлёт через
 *   `editor.trigger()` при каждом подключении/отключении, и на каждое
 *   срабатывание перечитываем localStorage (`readS3Connections`) —
 *   добавляем блоки для новых соединений, убираем для отключённых.
 */
function registerProviderBlocks(editor: Editor, opts: { providers: StorageProvider[]; category: string }): void {
  const { providers, category } = opts;

  for (const provider of providers) {
    registerProviderBlock(editor, provider, providers, category);
  }

  let knownS3ProviderIds = new Set<string>();

  function syncS3Blocks(): void {
    const configs = readS3Connections();
    const currentIds = new Set(configs.map((cfg) => `s3:${cfg.id}`));

    for (const providerId of knownS3ProviderIds) {
      if (!currentIds.has(providerId)) {
        editor.BlockManager.remove(PROVIDER_BLOCK_ID_PREFIX + providerId);
        editor.Components.removeType(PROVIDER_PLACEHOLDER_TYPE_PREFIX + providerId);
      }
    }

    for (const config of configs) {
      registerProviderBlock(editor, new S3Provider(config), providers, category);
    }

    knownS3ProviderIds = currentIds;
  }

  syncS3Blocks();
  editor.on(S3_CONNECTIONS_CHANGED_EVENT, syncS3Blocks);
}
