import type { Editor } from 'grapesjs';
import type { ResolvedAsset, StorageProvider } from '../types';
import { componentDefForAsset } from './componentDef';
import { insertAfterSelectionOrEnd } from './insert';
import { openCloudMediaPicker } from './picker';
import { t } from '../i18n/t';
import { S3Provider } from '../providers/s3/S3Provider';
import { readS3Connections, S3_CONNECTIONS_CHANGED_EVENT } from '../providers/s3/connections';

/** Префикс id блока/типа-компонента отдельной вкладки хранилища — см. `registerProviderBlock` ниже. */
const PROVIDER_BLOCK_ID_PREFIX = 'gca-cloud-media-provider:';
const PROVIDER_PLACEHOLDER_TYPE_PREFIX = 'gca-cloud-media-provider-placeholder:';

export interface CloudMediaBlockOptions {
  providers: StorageProvider[];
  /**
   * @deprecated Больше не используется. Раньше подписывал общий блок
   * "Cloud media" (открывал пикер на той вкладке, что была активна в
   * прошлый раз) — этот блок убрали как визуальный дубликат блока
   * первого провайдера (обычно "Свои файлы"/Local, см. `LocalAssetsProvider`):
   * по факту оба открывали одно и то же окно, просто с разной начальной
   * вкладкой, и на панели блоков это выглядело как две одинаковые кнопки
   * "Storage". Поле оставлено в типе только ради обратной совместимости
   * `pluginsOpts`, значение игнорируется.
   */
  blockLabel?: string;
  blockCategory?: string;
  /**
   * @deprecated Больше не используется здесь — заголовком окна у
   * каждого блока провайдера всегда служит `provider.label` (см.
   * `registerProviderBlock`). Поле оставлено в типе ради обратной
   * совместимости `pluginsOpts`; на модалку кнопки тулбара
   * (`registerCloudMediaButton`) не влияет.
   */
  modalTitle?: string;
}

/**
 * Регистрирует в Block Manager по одному блоку на каждое уже
 * добавленное хранилище (провайдера) — отдельно от Asset Manager,
 * чтобы не зависеть от `assetManager.custom` (см. `picker.ts`).
 * Общего блока "Cloud media", который открывал бы пикер на
 * последней активной вкладке, больше нет: он визуально дублировал
 * блок первого провайдера (обычно "Свои файлы"/Local) — оба вели в
 * одно и то же окно, только с разной начальной вкладкой, и на
 * панели "Storage" это выглядело как две одинаковые кнопки. См.
 * `registerProviderBlocks` — она и делает всю работу.
 */
export function registerCloudMediaBlock(editor: Editor, opts: CloudMediaBlockOptions): void {
  const { providers } = opts;
  const category = opts.blockCategory ?? t(editor, 'block.category');

  registerProviderBlocks(editor, { providers, category });
}

function insertAssets(blockEditor: Editor, assets: ResolvedAsset[] | null): void {
  if (!assets?.length) return;
  for (const asset of assets) {
    insertAfterSelectionOrEnd(blockEditor, componentDefForAsset(asset));
  }
}

/**
 * Блок для ОДНОГО конкретного хранилища (провайдера): пара "тип
 * компонента-плейсхолдер + блок", у которой `init()`/`onClick()`
 * передают в `openCloudMediaPicker` свой `initialProviderId`, так
 * что окно сразу открывается на нужной вкладке (а не на той, что
 * была активна в прошлый раз). У блока в GrapesJS два независимых
 * пути взаимодействия, и оба должны открывать один и тот же пикер:
 *
 * - Клик по блоку в панели идёт через `onClick` (ниже) и полностью
 *   подменяет собой стандартную вставку `content` — пикер
 *   открывается сразу, а по выбору компонент вставляется вручную.
 * - Перетаскивание блока на холст `onClick` не использует вообще —
 *   drag всегда вставляет `content` как есть, поэтому `content` —
 *   это компонент-плейсхолдер. Он сам открывает тот же пикер сразу
 *   после того, как окажется на холсте (`init()` ниже), и либо
 *   заменяет себя результатом, либо удаляет себя, если выбор
 *   отменили — так итоговый компонент оказывается ровно там, куда
 *   его перетащили.
 *
 * Известное ограничение: `init()` плейсхолдера отрабатывает при
 * КАЖДОМ его создании, включая повторное — например, если undo
 * вернёт только что удалённый плейсхолдер обратно. Это редкий
 * сценарий (сам плейсхолдер живёт на холсте доли секунды), и в
 * худшем случае пикер просто откроется ещё раз — не ломает данные.
 *
 * `providers` здесь — ВСЕГДА статический список (Local +
 * `pluginsOpts.providers`): сам `AssetBrowser` в любом случае
 * дочитывает актуальные S3-соединения из localStorage при каждом
 * открытии (см. его конструктор), так что все вкладки видны и
 * переключаемы независимо от того, каким именно блоком открыт
 * пикер — `initialProviderId` влияет только на то, какая вкладка
 * активна СРАЗУ при открытии.
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
