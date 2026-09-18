import { describe, expect, it } from 'vitest';
import { STYLES } from '../../src/ui/styles';

/**
 * Лёгкие регрессионные проверки на текст CSS — не про то, как он
 * РЕНДЕРИТСЯ (jsdom не считает реальный layout/клиппинг, см. заметку в
 * `assetBrowser.tabsOverflow.test.ts`), а про то, что в файле НЕ
 * появятся обратно два конкретных правила, из-за которых уже дважды
 * ловили баги, невидимые в юнит-тестах и заметные только в реальном
 * браузере:
 *
 * 1. Любой элемент, скрываемый через `element.hidden`
 *    (`.gca-drop-overlay`, `.gca-upload-queue` и т.п.), сам объявляет
 *    свой `display` — без явного `[hidden] { display: none !important }`
 *    это правило браузера по умолчанию проигрывает авторскому CSS той
 *    же специфичности, и элемент остаётся видимым несмотря на атрибут
 *    (зона drag-and-drop висела постоянно).
 * 2. `.gca-tabs` НЕ должен иметь `overflow: hidden` — кнопка "+" и
 *    шеврон "ещё вкладки" лежат внутри неё, а их выпадающие меню
 *    (`.gca-tab-add__menu`/`.gca-tab-overflow__menu`) позиционированы
 *    АБСОЛЮТНО и выезжают ниже границы `.gca-tabs`; `overflow: hidden`
 *    на родителе обрезает такие меню — они открывались (`hidden`
 *    снимался), но были невидимы и некликабельны. Функционально
 *    JS (`updateTabsOverflow()`) и так прячет (`display: none`)
 *    вкладки, которые не влезли, так что `overflow: hidden` был лишней
 *    подстраховкой, не стоившей своей цены.
 */
describe('STYLES — регрессия на два конкретных бага каскада CSS', () => {
  it('содержит .gca-root [hidden] { display: none !important } — иначе элементы, скрытые через element.hidden, остаются видимыми', () => {
    expect(STYLES).toMatch(/\.gca-root\s*\[hidden\]\s*\{[^}]*display:\s*none\s*!important/);
  });

  it('.gca-tabs НЕ содержит overflow: hidden — иначе меню кнопки "+"/шеврона "ещё вкладки" внутри неё обрезаются и становятся некликабельными', () => {
    const match = STYLES.match(/\.gca-tabs\s*\{([^}]*)\}/);
    expect(match, '.gca-tabs rule not found in STYLES').toBeTruthy();
    expect(match![1]).not.toMatch(/overflow\s*:\s*hidden/);
  });
});
