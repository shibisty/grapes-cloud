import type { Component, Editor } from 'grapesjs';
import type { ComponentDef } from './componentDef';

/**
 * Вставляет компонент сразу следующим соседом выбранного (если
 * ничего не выбрано — в конец страницы) и сразу выделяет его.
 * Используется и кнопкой на панели (там нет позиции дропа — нужна
 * разумная точка по умолчанию), и в дальнейшем может быть
 * переопределена сайтом, который слушает результат
 * `openCloudMediaPicker` напрямую вместо стандартной кнопки/блока.
 *
 * Баг из практики: если на холсте ничего не выделено (открыли пикер
 * кнопкой на панели/кликом по блоку, а НЕ перетащили блок в конкретное
 * место), компонент вставляется в конец страницы — технически корректно
 * (он есть в разметке), но визуально незаметно, если это место сейчас
 * не видно на экране (например, страница длинная, а конец — это подвал).
 * Выглядит так, будто "вставка ничего не сделала". Поэтому после вставки
 * ВСЕГДА докручиваем канвас до нового компонента — независимо от того,
 * оказался он рядом с выделением или в конце страницы.
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
  try {
    editor.Canvas.scrollTo(inserted, { behavior: 'smooth' });
  } catch {
    // scrollTo — необязательное удобство (например, недоступно в
    // headless-тестовом окружении без реального canvas-фрейма);
    // сама вставка уже случилась и важнее, чем прокрутка к ней.
  }
  return inserted;
}
