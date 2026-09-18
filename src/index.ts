import type { Editor } from 'grapesjs';
import type { CloudAssetsPluginOptions, StorageProvider } from './types';
import { LocalAssetsProvider } from './providers/local/LocalAssetsProvider';
import { registerCloudMediaBlock } from './canvas/block';
import { registerCloudMediaButton } from './canvas/panelButton';
import { registerI18n } from './i18n';

export { SUPPORTED_LOCALES } from './i18n';

export type { CloudAssetsPluginOptions, StorageProvider, StorageItem, ResolvedAsset, S3ConnectionConfig } from './types';
export { DropboxProvider } from './providers/dropbox/DropboxProvider';
export type { DropboxProviderOptions } from './providers/dropbox/DropboxProvider';
export { GoogleDriveProvider } from './providers/google/GoogleDriveProvider';
export type { GoogleDriveProviderOptions } from './providers/google/GoogleDriveProvider';
export { OneDriveProvider } from './providers/onedrive/OneDriveProvider';
export type { OneDriveProviderOptions } from './providers/onedrive/OneDriveProvider';
export { LocalAssetsProvider } from './providers/local/LocalAssetsProvider';
export type { LocalAssetsProviderOptions } from './providers/local/LocalAssetsProvider';
/**
 * В отличие от Dropbox/Google/OneDrive выше, `S3Provider` почти
 * никогда не нужно импортировать и передавать в `pluginsOpts.providers`
 * самому владельцу сайта — посетитель подключает S3-совместимое
 * хранилище САМ, через попап "Подключить S3" (кнопка "+" в ряду
 * вкладок), а `AssetBrowser` создаёт инстанс и сохраняет соединение в
 * localStorage браузера уже сам (см. `S3ConnectionConfig` в
 * `types.ts` и doc-комментарий класса `AssetBrowser`). Экспорт тут —
 * на случай, если владелец сайта всё же хочет предзадать соединение
 * в коде (например, единый корпоративный bucket для всех посетителей).
 */
export { S3Provider } from './providers/s3/S3Provider';
export { openCloudMediaPicker } from './canvas/picker';
export { componentDefForAsset } from './canvas/componentDef';
export type { ComponentDef } from './canvas/componentDef';

/**
 * grapesjs-cloud-assets — вставка медиа (картинка, видео, аудио,
 * документ) из облачных хранилищ через один общий UI с вкладками:
 * Dropbox, Google Drive, OneDrive (настраивает владелец сайта через
 * `pluginsOpts.providers`) и S3-совместимые хранилища (MinIO, Wasabi,
 * DigitalOcean Spaces, Cloudflare R2, сам AWS S3...), которые
 * подключает уже сам посетитель — кнопкой "+" в ряду вкладок, без
 * участия владельца сайта, см. `S3Provider`/`S3ConnectionConfig`.
 *
 * Использование:
 *
 *   import cloudAssets, { DropboxProvider, GoogleDriveProvider, OneDriveProvider } from 'grapesjs-cloud-assets';
 *
 *   grapesjs.init({
 *     // ...
 *     plugins: [cloudAssets],
 *     pluginsOpts: {
 *       [cloudAssets]: {
 *         providers: [
 *           new DropboxProvider(),
 *           new GoogleDriveProvider(),
 *           new OneDriveProvider(),
 *         ],
 *       },
 *     },
 *   });
 *
 * Ни один из трёх провайдеров не принимает App Key/Client ID в
 * конструкторе — ни у Dropbox, ни у Google, ни у Microsoft нет
 * общего ключа, который работал бы на произвольном чужом домене без
 * его предрегистрации, так что "вписать чужой App Key в код" всё
 * равно не сработало бы для стороннего сайта. Вместо этого при
 * первом открытии вкладки провайдера пользователь плагина видит
 * пошаговый мастер настройки (ссылка на консоль провайдера, нужные
 * scopes/permissions, origin/redirect URI — подставляется
 * автоматически, где применимо) и поле для своего ключа; ключ
 * сохраняется в localStorage браузера, и при повторном заходе
 * мастер не показывается снова. `redirectUri` в
 * `DropboxProviderOptions`/`OneDriveProviderOptions` остаётся
 * необязательной ручной настройкой на случай, если автоопределение
 * не сработало (актуально для ESM/бандлерной сборки — см. комментарий
 * в `ownScript.ts`); у `GoogleDriveProviderOptions` такого поля нет —
 * Google Identity Services сам управляет своим попапом без
 * отдельного redirect URI (см. doc-комментарий в `GoogleDriveProvider.ts`).
 *
 * Важное отличие Google Drive от Dropbox/OneDrive — см. подробности
 * в doc-комментарии `GoogleDriveProvider` и в README: без своего
 * backend'а Google не отдаёт готовую embeddable-ссылку на приватный
 * файл, поэтому вставленное изображение/файл превращается в data:
 * URL (с ограничением на размер), а не в обычную http(s)-ссылку.
 *
 * Локализация: весь текст интерфейса плагина уже переведён на все
 * 22 языка, которые поддерживает сама GrapesJS (`grapesjs/locale`) —
 * ничего отдельно настраивать не нужно, язык подхватывается тем же
 * механизмом `editor.I18n`, что и у ядра (по умолчанию — язык
 * браузера, `i18n.detectLocale`). Детали и как переопределить
 * отдельную строку — в README, раздел "Локализация".
 *
 * Архитектура (важно для дальнейшей поддержки): плагин НЕ трогает
 * `assetManager.custom`. Это единственный слот на весь редактор —
 * если на сайте есть ещё один плагин, которому тоже нужен свой Asset
 * Manager UI, они молча перезаписывают друг друга при инициализации
 * (кто последний вызвался — тот и выиграл), и такой конфликт трудно
 * даже диагностировать. Поэтому у плагина СВОЙ, полностью отдельный
 * вход: блок "Облачные медиа" (категория Storage) в Block Manager и
 * кнопка на верхней панели — оба открывают одно и то же окно
 * (`canvas/picker.ts`) через `editor.Modal`, который является общим
 * стеком модалок редактора, а не персональным ресурсом одного
 * плагина, так что делить его с другими плагинами безопасно.
 * Стандартный Asset Manager (двойной клик по картинке и т.п.)
 * продолжает работать как в чистом GrapesJS, каким бы он ни был
 * настроен другими плагинами.
 */
export default function cloudAssetsPlugin(editor: Editor, opts: CloudAssetsPluginOptions): void {
  /**
   * Регистрируем переводы плагина ПЕРВЫМ делом — до создания
   * LocalAssetsProvider и любых блоков/кнопок ниже, у которых уже
   * есть переводимый текст по умолчанию (метка вкладки "Свои файлы",
   * подпись блока и т.п.) и которые резолвят его сразу при создании.
   * Список языков — ровно тот же, что поддерживает сама GrapesJS
   * (`grapesjs/locale`), см. `src/i18n/index.ts`.
   */
  registerI18n(editor);

  /**
   * Первым элементом — локальный источник (см. LocalAssetsProvider):
   * файлы, уже добавленные в редактор, загрузка с диска, вставка по
   * прямой ссылке. `includeLocalTab: false` отключает его явно, если
   * он не нужен (например, ассеты сайта обязаны идти только из
   * облака).
   */
  const providers: StorageProvider[] = [
    ...(opts?.includeLocalTab === false ? [] : [new LocalAssetsProvider(editor)]),
    ...(opts?.providers ?? []),
  ];

  if (!providers.length) {
    console.warn(
      '[grapesjs-cloud-assets] Plugin loaded without a single provider (neither cloud nor the local tab) — there is nothing to insert.',
    );
    return;
  }

  registerCloudMediaBlock(editor, {
    providers,
    blockLabel: opts.blockLabel,
    blockCategory: opts.blockCategory,
    modalTitle: opts.modalTitle,
  });

  registerCloudMediaButton(editor, {
    providers,
    buttonLabel: opts.buttonLabel,
    modalTitle: opts.modalTitle,
  });
}
