import { describe, expect, it } from 'vitest';
import { componentDefForAsset } from '../../src/canvas/componentDef';
import type { ResolvedAsset } from '../../src/types';

function asset(overrides: Partial<ResolvedAsset>): ResolvedAsset {
  return { src: 'https://example.com/f', name: 'f', type: 'other', provider: 'fake', ...overrides };
}

describe('componentDefForAsset', () => {
  it('maps image assets to the built-in "image" component type', () => {
    expect(componentDefForAsset(asset({ type: 'image', src: 'https://x/img.png', name: 'img.png' }))).toEqual({
      type: 'image',
      src: 'https://x/img.png',
      alt: 'img.png',
    });
  });

  it('maps video assets to the built-in "video" component type with provider "so"', () => {
    expect(componentDefForAsset(asset({ type: 'video', src: 'https://x/v.mp4' }))).toEqual({
      type: 'video',
      provider: 'so',
      src: 'https://x/v.mp4',
    });
  });

  it('maps audio assets to a plain <audio controls> tag (no built-in GrapesJS audio component)', () => {
    expect(componentDefForAsset(asset({ type: 'audio', src: 'https://x/a.mp3' }))).toEqual({
      tagName: 'audio',
      attributes: { controls: 'controls', src: 'https://x/a.mp3' },
      void: false,
    });
  });

  it('maps document assets to a link, HTML-escaping the file name in the link text', () => {
    const def = componentDefForAsset(asset({ type: 'document', src: 'https://x/r.pdf', name: '<Report> "final"' }));
    expect(def).toEqual({
      type: 'link',
      tagName: 'a',
      attributes: { href: 'https://x/r.pdf', target: '_blank', rel: 'noopener noreferrer' },
      content: '&lt;Report&gt; &quot;final&quot;',
    });
  });

  it('maps "other" assets the same way as documents (fallback branch)', () => {
    const def = componentDefForAsset(asset({ type: 'other', src: 'https://x/thing.bin', name: 'thing.bin' }));
    expect(def).toMatchObject({ type: 'link', tagName: 'a' });
  });
});
