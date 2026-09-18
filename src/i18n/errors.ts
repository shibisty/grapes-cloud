/**
 * Ошибка с "адресом" перевода вместо (или вместе с) готового текста.
 *
 * Провайдеры (`DropboxProvider`, `pkce.ts`, `LocalAssetsProvider`)
 * сознательно НЕ знают про `Editor` и не могут сами вызвать
 * `editor.I18n.t()` в момент throw — а `AssetBrowser`, который эти
 * ошибки ловит и показывает пользователю, знает. Поэтому вместо
 * готовой строки на одном языке провайдер кидает `GcaError` с ключом
 * сообщения в общем каталоге плагина (`src/i18n/types.ts`) — и уже
 * `AssetBrowser` переводит его на язык редактора при показе (см.
 * `describeError` в `ui/AssetBrowser.ts`).
 *
 * `message` (обычный `Error.message`) при этом не теряется — это
 * английский текст по умолчанию, на случай если `GcaError` поймает
 * код, вообще не подключённый к GrapesJS (юнит-тест провайдера сам
 * по себе, без `Editor`) — там сработает обычный `error.message`.
 */
export class GcaError extends Error {
  constructor(
    /** Ключ в `CloudAssetsMessages`, без префикса `cloudAssets.` — например `'dropbox.error.notConnected'`. */
    readonly i18nKey: string,
    message: string,
    /** Параметры для `{param}` в переводе — например `{ status: 404 }`. */
    readonly params?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'GcaError';
  }
}
