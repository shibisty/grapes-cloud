import { afterEach, describe, expect, it } from 'vitest';
import grapesjs, { type Editor } from 'grapesjs';
import plugin, { META, VERSION, createProviders, DropboxProvider } from '../src/index';
import { CONTROLS, definePlugin, type PluginControl } from '../src/contract';
import pkg from '../package.json';

const control = (ed: object): PluginControl => (ed as Record<symbol, Map<string, PluginControl>>)[CONTROLS].get(META.id)!;
let editor: Editor | undefined;
afterEach(() => {
  editor?.destroy();
  editor = undefined;
  document.body.innerHTML = '';
});

describe('plugin contract', () => {
  it('meta: id = npm name, version = package.json, registered by id', () => {
    expect(META.id).toBe(pkg.name);
    expect(VERSION).toBe(pkg.version);
    expect((plugin as unknown as { meta: unknown }).meta).toBe(META);
    (globalThis as { grapesjs?: unknown }).grapesjs = grapesjs;
    definePlugin(plugin, META);
    expect(grapesjs.plugins.get(META.id)).toBe(plugin);
  });

  it('providers by id or { type, ...options }; instances as they are', () => {
    const own = new DropboxProvider();
    const list = createProviders(['dropbox', { type: 'box', tokenEndpoint: '/t' }, own, 'nope']);
    expect(list.map((p) => p.id)).toEqual(['dropbox', 'box', 'dropbox']);
    expect(list[2]).toBe(own);
  });

  it('reports its options with providers by id', () => {
    const container = document.createElement('div');
    document.body.append(container);
    editor = grapesjs.init({
      container,
      storageManager: false,
      plugins: [(ed: Editor) => plugin(ed, { providers: ['onedrive', 'google-drive'] })],
    } as Parameters<typeof grapesjs.init>[0]);
    expect(control(editor).getOptions()).toEqual({
      providers: ['onedrive', 'google-drive'],
      includeLocalTab: true,
      blockCategory: '',
      modalTitle: '',
      buttonLabel: '',
    });
    expect(control(editor).setOptions({ includeLocalTab: false })).toEqual({ applied: [], reload: ['includeLocalTab'] });
  });
});
