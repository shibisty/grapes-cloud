import type { ResolvedAssetType } from '../types';

/**
 * Общие мелкие хелперы: угадывание MIME-типа и "крупного" типа
 * asset'а (image/video/audio/document/other) по имени файла. Раньше
 * лежало в `providers/shared.ts` — переехало в `utils/`, потому что
 * этим же угадыванием типа теперь пользуется и `ui/AssetBrowser.ts`
 * (иконка/подпись типа в гриде и таблице), а UI-код не должен тянуть
 * файлы из `providers/`. Провайдеры (Dropbox/Local/будущие Google
 * Drive, OneDrive, S3) используют то же самое, чтобы не дублировать
 * одну и ту же таблицу расширений.
 *
 * Разбивка по расширениям — по образцу core/modules/* в
 * embed-inserter (C:\OSPanel6\home\embed-inserter): там то же самое
 * разделение image/video/audio/doc через regex по имени файла.
 * Списки расширений и разделение audio/video для .ogg/.oga —
 * оттуда же. Разница в том, что там на каждый тип ещё и свой
 * render() в превью — нам этого не нужно, GrapesJS сам рисует
 * компонент нужного типа (см. `src/canvas/componentDef.ts`), здесь
 * достаточно одной функции классификации.
 */

export const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i;
export const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|avi|mkv)(\?.*)?$/i;
// .oga — Ogg-контейнер под аудио, .ogg в VIDEO_EXT — под видео (как в embed-inserter).
export const AUDIO_EXT = /\.(mp3|wav|oga|m4a|flac|aac|weba)(\?.*)?$/i;
export const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz)(\?.*)?$/i;

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  oga: 'audio/ogg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  aac: 'audio/aac',
  weba: 'audio/webm',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
};

export function guessMimeType(name: string): string | undefined {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext ? EXT_TO_MIME[ext] : undefined;
}

/**
 * По MIME-типу (если известен) и/или имени файла определяет, каким
 * компонентом GrapesJS вставлять asset — см.
 * `src/canvas/componentDef.ts`, который читает именно это поле
 * (`ResolvedAsset.type`).
 */
export function guessAssetType(mimeType: string | undefined, name: string): ResolvedAssetType {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'document';

  if (IMAGE_EXT.test(name)) return 'image';
  if (VIDEO_EXT.test(name)) return 'video';
  if (AUDIO_EXT.test(name)) return 'audio';
  if (DOC_EXT.test(name)) return 'document';

  return 'other';
}

/** Имя файла из URL — используется, когда пользователь просто вставляет ссылку. */
export function nameFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : url;
  } catch {
    return url;
  }
}
