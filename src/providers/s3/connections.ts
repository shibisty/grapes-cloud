import type { S3ConnectionConfig } from '../../types';

/**
 * Persisted S3-соединения (подключаются самим посетителем через попап
 * "Подключить S3", см. `AssetBrowser.openConnectS3Modal`) хранятся в
 * localStorage под этим ключом — общий на все инстансы плагина на
 * странице. Вынесено из `AssetBrowser.ts` в отдельный модуль, потому
 * что теперь список S3-соединений нужен ДВУМ независимым частям
 * плагина: самому `AssetBrowser` (чтобы показать вкладки) и
 * `canvas/block.ts` (чтобы держать по блоку в Block Manager на каждое
 * соединение, см. `registerProviderBlocks`) — у второго нет и не
 * должно быть собственного инстанса `AssetBrowser`.
 */
export const S3_CONNECTIONS_STORAGE_KEY = 'gca_s3_connections';

/**
 * GrapesJS-событие редактора (`editor.trigger`/`editor.on`), которым
 * `AssetBrowser` оповещает об изменении списка S3-соединений —
 * подключили новое через попап или удалили вкладку "×". `canvas/block.ts`
 * подписывается на него, чтобы синхронизировать блоки в Block Manager
 * даже когда сам пикер в этот момент уже закрыт (иначе блок для
 * только что подключённого S3 появился бы только после перезагрузки
 * страницы).
 */
export const S3_CONNECTIONS_CHANGED_EVENT = 'gca:s3-connections-changed';

function isValidS3ConnectionConfig(c: unknown): c is S3ConnectionConfig {
  return (
    !!c &&
    typeof c === 'object' &&
    typeof (c as S3ConnectionConfig).id === 'string' &&
    typeof (c as S3ConnectionConfig).name === 'string' &&
    typeof (c as S3ConnectionConfig).accessKeyId === 'string' &&
    typeof (c as S3ConnectionConfig).secretAccessKey === 'string' &&
    typeof (c as S3ConnectionConfig).bucket === 'string' &&
    typeof (c as S3ConnectionConfig).region === 'string'
  );
}

export function readS3Connections(): S3ConnectionConfig[] {
  try {
    const raw = localStorage.getItem(S3_CONNECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidS3ConnectionConfig);
  } catch {
    // Битый JSON или localStorage недоступен (приватный режим) — просто без persisted-соединений.
    return [];
  }
}

export function writeS3Connections(configs: S3ConnectionConfig[]): void {
  try {
    localStorage.setItem(S3_CONNECTIONS_STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // Не критично — просто не переживёт перезагрузку страницы.
  }
}
