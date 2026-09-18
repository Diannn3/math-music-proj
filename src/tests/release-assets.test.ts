import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readPngDimensions(path: string): { width: number; height: number } {
  const bytes = readFileSync(new URL(`../../public/${path}`, import.meta.url));
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.subarray(12, 16).toString('ascii')).toBe('IHDR');
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

describe('release static assets', () => {
  it('ships the 1200x630 social image', () => {
    expect(readPngDimensions('bifurcate-social.png')).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it('ships the 1600x1200 poster fallback', () => {
    expect(readPngDimensions('bifurcate-poster.png')).toEqual({
      width: 1600,
      height: 1200,
    });
  });

  it('ships a dark standalone web manifest', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../../public/site.webmanifest', import.meta.url), 'utf8'),
    );
    expect(manifest.name).toContain('BIFURCATE');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0f1115');
    expect(manifest.icons[0]).toMatchObject({
      src: '/favicon.svg',
      type: 'image/svg+xml',
    });
  });

  it('allows public indexing while keeping metadata explicit in the page', () => {
    const robots = readFileSync(new URL('../../public/robots.txt', import.meta.url), 'utf8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
  });
});
