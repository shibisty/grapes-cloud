import type { PluginMeta } from './contract';
import type { CloudAssetsPluginOptions, ProviderSpec, StorageProvider } from './types';
import { DropboxProvider } from './providers/dropbox/DropboxProvider';
import { GoogleDriveProvider } from './providers/google/GoogleDriveProvider';
import { OneDriveProvider } from './providers/onedrive/OneDriveProvider';
import { BoxProvider } from './providers/box/BoxProvider';

export const PLUGIN_ID = 'grapesjs-cloud-assets';
/** Version of this package (a test checks it against package.json). */
export const VERSION = '0.10.0';

type Factory = (options: Record<string, unknown>) => StorageProvider;

/** Providers that can be given by id (`providers: ['dropbox', …]`). */
const FACTORIES: Record<string, Factory> = {
  dropbox: (o) => new DropboxProvider(o),
  'google-drive': (o) => new GoogleDriveProvider(o),
  onedrive: (o) => new OneDriveProvider(o),
  box: (o) => new BoxProvider(o as never),
};

/** Instances as they are; ids and `{ type, ...options }` built with their constructors. */
export function createProviders(list: Array<StorageProvider | ProviderSpec>): StorageProvider[] {
  const out: StorageProvider[] = [];
  list.forEach((p) => {
    if (!p) return;
    const spec = typeof p === 'string' || (Object.getPrototypeOf(p) === Object.prototype && typeof (p as { type?: unknown }).type === 'string');
    if (spec) {
      const { type, ...rest } = typeof p === 'string' ? { type: p } : (p as { type: string });
      const make = FACTORIES[type];
      if (make) out.push(make(rest));
      else console.warn(`[grapesjs-cloud-assets] Unknown provider: ${type}`);
    } else out.push(p as StorageProvider);
  });
  return out;
}

/** Options for forms (plugin contract). Changes apply after a reload. */
export const META: PluginMeta = {
  id: PLUGIN_ID,
  version: VERSION,
  title: 'Cloud Assets',
  description: 'Media from Dropbox, Google Drive, OneDrive, Box and S3-compatible storages.',
  options: [
    {
      key: 'providers',
      type: 'json',
      default: [],
      title: 'Cloud providers',
      description: 'e.g. ["dropbox", "google-drive", "onedrive", { "type": "box", "tokenEndpoint": "/api/box-token" }]',
    },
    { key: 'includeLocalTab', type: 'boolean', default: true, title: '"My files" tab', description: 'Files of the editor, upload, link.' },
    { key: 'blockCategory', type: 'string', default: '', title: 'Block category', description: 'Empty — the plugin default.' },
    { key: 'modalTitle', type: 'string', default: '', title: 'Window title', advanced: true },
    { key: 'buttonLabel', type: 'string', default: '', title: 'Toolbar button title', advanced: true },
  ],
};

/** The options a form can show: providers by id. */
export function publicOptions(o: Partial<CloudAssetsPluginOptions>, running: StorageProvider[]): Record<string, unknown> {
  return {
    providers: running.map((p) => p.id).filter((id) => id !== 'local'),
    includeLocalTab: o.includeLocalTab !== false,
    blockCategory: o.blockCategory || '',
    modalTitle: o.modalTitle || '',
    buttonLabel: o.buttonLabel || '',
  };
}
