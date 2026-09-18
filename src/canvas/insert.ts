import type { Component, Editor } from 'grapesjs';
import type { ComponentDef } from './componentDef';

/**
 * Вставляет компонент сразу следующим соседом выбранного (если
 * ничего не выбрано — в конец страницы) и сразу выделяет его.
 * Используется и кнопкой на панели (там нет позиции дропа — нужна
 * разумная точка по умолчанию), и в дальнейшем может быть
 * переопределена сайтом, который слушает результат
 * `openCloudMediaPicker` напрямую вместо стандартной кнопки/блока.
 */
export function insertAfterSelectionOrEnd(editor: Editor, def: ComponentDef): Component {
  const selected = editor.getSelected();
  const parent = selected?.parent();
  const target = parent ?? editor.getWrapper();

  if (!target) {
    // Редактор без обёртки не бывает в рабочем состоянии — это
    // защита от типа, а не ожидаемый сценарий.
    throw new Error('[grapesjs-cloud-assets] editor.getWrapper() is unavailable');
  }

  const [inserted] = parent ? target.append(def, { at: selected!.index() + 1 }) : target.append(def);

  editor.select(inserted);
  return inserted;
}
