import { defineConfig } from 'vitest/config';

/**
 * Тестовая конфигурация — отдельно от vite.config.ts (тот заточен
 * под lib-сборку `dist/`, а не под тесты). `environment: 'jsdom'`,
 * потому что почти весь плагин — это либо DOM-код (AssetBrowser
 * рисует вручную через document.createElement, без JSX/фреймворка),
 * либо код, которому нужны браузерные глобалы (localStorage,
 * crypto.subtle, fetch, XMLHttpRequest) — их проще подделать поверх
 * jsdom в самих тестах, чем гонять три десятка тестов в headless-
 * браузере ради этого немногого.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    globals: false,
    restoreMocks: true,
    css: false,
  },
});
