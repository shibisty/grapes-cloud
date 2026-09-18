import { describe, expect, it } from 'vitest';
import { guessAssetType, guessMimeType, nameFromUrl } from '../../src/utils/assetType';

describe('guessMimeType', () => {
  it('maps known extensions to their MIME type', () => {
    expect(guessMimeType('photo.png')).toBe('image/png');
    expect(guessMimeType('clip.mp4')).toBe('video/mp4');
    expect(guessMimeType('track.mp3')).toBe('audio/mpeg');
    expect(guessMimeType('report.pdf')).toBe('application/pdf');
  });

  it('is case-insensitive on the extension', () => {
    expect(guessMimeType('PHOTO.PNG')).toBe('image/png');
  });

  it('returns undefined for unknown or missing extensions', () => {
    expect(guessMimeType('README')).toBeUndefined();
    expect(guessMimeType('archive.xyz')).toBeUndefined();
  });
});

describe('guessAssetType', () => {
  it('prefers an explicit MIME type over the file name', () => {
    expect(guessAssetType('image/png', 'not-a-name.mp4')).toBe('image');
    expect(guessAssetType('video/mp4', 'thing.png')).toBe('video');
    expect(guessAssetType('audio/mpeg', 'thing.png')).toBe('audio');
    expect(guessAssetType('application/pdf', 'thing.png')).toBe('document');
  });

  it('falls back to the file extension when MIME type is absent', () => {
    expect(guessAssetType(undefined, 'photo.jpeg')).toBe('image');
    expect(guessAssetType(undefined, 'movie.mkv')).toBe('video');
    expect(guessAssetType(undefined, 'song.flac')).toBe('audio');
    expect(guessAssetType(undefined, 'archive.zip')).toBe('document');
    expect(guessAssetType(undefined, 'unknown.xyz')).toBe('other');
  });

  it('splits .ogg (video) from .oga (audio) — the one asymmetry the extension tables encode', () => {
    expect(guessAssetType(undefined, 'clip.ogg')).toBe('video');
    expect(guessAssetType(undefined, 'clip.oga')).toBe('audio');
  });

  it('ignores an unrelated MIME type instead of trusting it blindly', () => {
    // A MIME type that is present but doesn't start with image/video/audio/
    // and isn't application/pdf falls through to the extension check.
    expect(guessAssetType('application/octet-stream', 'photo.png')).toBe('image');
  });

  it('matches extensions followed by a query string', () => {
    expect(guessAssetType(undefined, 'photo.png?v=2')).toBe('image');
  });
});

describe('nameFromUrl', () => {
  it('extracts and decodes the last path segment', () => {
    expect(nameFromUrl('https://example.com/path/My%20File.png')).toBe('My File.png');
  });

  it('ignores a trailing slash and query string in the path', () => {
    expect(nameFromUrl('https://example.com/dir/file.pdf?download=1')).toBe('file.pdf');
  });

  it('falls back to the raw input for a directory-only URL', () => {
    expect(nameFromUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('falls back to the raw input for an unparsable URL', () => {
    expect(nameFromUrl('not a url')).toBe('not a url');
  });
});
