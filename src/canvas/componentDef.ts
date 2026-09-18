import type { ResolvedAsset } from '../types';
import { escapeHtml } from '../utils/html';

/**
 * Слегка типизированное определение компонента GrapesJS — сам
 * GrapesJS принимает произвольный объект вида `{ type, tagName,
 * attributes, ... }` (Component Definition), точный тип для него в
 * @types/grapesjs не экспортирован как что-то узкое, поэтому здесь
 * достаточно Record.
 */
export type ComponentDef = Record<string, unknown>;

/**
 * По типу выбранного asset'а решает, каким компонентом GrapesJS его
 * вставить:
 *
 * - image/video — встроенные типы компонентов GrapesJS ('image',
 *   'video' — `ComponentImage`/`ComponentVideo` в исходниках), у них
 *   уже есть свой тулбар, ресайз, трейты и т.п.
 * - audio — в ядре GrapesJS нет отдельного типа компонента audio;
 *   обычный тег `<audio controls>` через tagName работает так же
 *   (редактируемый, с базовым тулбаром компонента).
 * - document/other — ссылка (`<a>`, встроенный тип 'link') на файл:
 *   для документов (PDF, ZIP, DOCX...) это привычнее, чем встраивать
 *   что-то на страницу.
 */
export function componentDefForAsset(asset: ResolvedAsset): ComponentDef {
  switch (asset.type) {
    case 'image':
      return { type: 'image', src: asset.src, alt: asset.name };

    case 'video':
      return { type: 'video', provider: 'so', src: asset.src };

    case 'audio':
      return {
        tagName: 'audio',
        attributes: { controls: 'controls', src: asset.src },
        void: false,
      };

    case 'document':
    case 'other':
    default:
      return {
        type: 'link',
        tagName: 'a',
        attributes: { href: asset.src, target: '_blank', rel: 'noopener noreferrer' },
        content: escapeHtml(asset.name),
      };
  }
}
