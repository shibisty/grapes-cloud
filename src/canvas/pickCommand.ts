import type { Editor } from 'grapesjs';
import type { ResolvedAsset, ResolvedAssetType, StorageProvider } from '../types';
import { openCloudMediaPicker } from './picker';

/**
 * Команда для других плагинов: выбрать файл(ы) в пикере и получить их,
 * ничего не вставляя в холст.
 *
 *   const assets = await editor.runCommand('cloud-assets:pick', { type: 'image' });
 *   // ResolvedAsset[] | null (закрыли, ничего не выбрав)
 *
 * Плагин находится по имени команды (`editor.Commands.has(PICK_COMMAND)`),
 * без импорта этого пакета — так им пользуются grapesjs-storage (поля
 * image/file/gallery) и grapesjs-site-pages (картинка Open Graph).
 *
 * Пока открыт другой диалог (`editor.Modal`), пикер по умолчанию
 * открывается в своём оверлее поверх него: модалка GrapesJS одна, и её
 * повторное открытие заменило бы диалог с несохранёнными полями.
 *
 * Внимание: у Dropbox, OneDrive и S3 ссылка временная (`expiresAt`) —
 * для данных, которые хранятся долго, вызывающий код должен это учесть.
 */
export const PICK_COMMAND = 'cloud-assets:pick';

export interface PickCommandOptions {
  /** Фильтр по типу при открытии: `'image'`, `'video'`, `'audio'`, `'document'`. */
  type?: ResolvedAssetType | 'all';
  title?: string;
  /** Вкладка при открытии (`provider.id`). */
  provider?: string;
  /** Свой оверлей вместо `editor.Modal`; по умолчанию — если модалка уже открыта. */
  overlay?: boolean;
}

export function registerPickCommand(editor: Editor, providers: StorageProvider[], modalTitle?: string): void {
  editor.Commands.add(PICK_COMMAND, {
    run(ed: Editor, _sender: unknown, o: PickCommandOptions = {}): Promise<ResolvedAsset[] | null> {
      const modalOpen = (() => {
        try {
          return !!(ed.Modal as any)?.isOpen?.();
        } catch {
          return false;
        }
      })();
      return openCloudMediaPicker(ed, providers, {
        title: o?.title ?? modalTitle,
        initialProviderId: o?.provider,
        typeFilter: o?.type && o.type !== 'all' ? o.type : undefined,
        overlay: o?.overlay ?? modalOpen,
      });
    },
  });
}
