import type { Editor } from 'grapesjs';
import type { StorageProvider } from '../types';
import { componentDefForAsset } from './componentDef';
import { insertAfterSelectionOrEnd } from './insert';
import { openCloudMediaPicker } from './picker';
import { t } from '../i18n/t';

const COMMAND_ID = 'gca-open-picker';
const BUTTON_ID = 'gca-open-picker-btn';

const ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M7 18a4 4 0 0 1-1-7.87A5.5 5.5 0 0 1 16.9 8.14 4.5 4.5 0 0 1 17.5 17H8"/><path d="M12 12v7"/><path d="m9.5 14.5 2.5-2.5 2.5 2.5"/></svg>';

export interface CloudMediaButtonOptions {
  providers: StorageProvider[];
  buttonLabel?: string;
  modalTitle?: string;
}

/**
 * Кнопка "Вставить из облака" на верхней панели ('options' — тот же
 * стандартный панель, куда добавляют свои кнопки export-в-zip,
 * просмотр кода и т.п. официальные плагины). Не трогает Asset
 * Manager — открывает наш собственный пикер (`picker.ts`) и
 * вставляет результат рядом с выделенным компонентом (см.
 * `insert.ts`).
 */
export function registerCloudMediaButton(editor: Editor, opts: CloudMediaButtonOptions): void {
  const { providers, modalTitle } = opts;

  editor.Commands.add(COMMAND_ID, {
    run(cmdEditor) {
      void openCloudMediaPicker(cmdEditor, providers, { title: modalTitle }).then((assets) => {
        if (!assets?.length) return;
        for (const asset of assets) {
          insertAfterSelectionOrEnd(cmdEditor, componentDefForAsset(asset));
        }
      });
    },
  });

  editor.Panels.addButton('options', {
    id: BUTTON_ID,
    command: COMMAND_ID,
    label: ICON,
    attributes: { title: opts.buttonLabel ?? t(editor, 'button.label') },
  });
}
