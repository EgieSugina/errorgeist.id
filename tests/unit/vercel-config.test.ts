import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(readFileSync(resolve(__dirname, '../../vercel.json'), 'utf8')) as {
  framework: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  headers: HeaderRule[];
  rewrites?: unknown;
};

const header = (source: string, key: string) =>
  config.headers.find((h) => h.source === source)?.headers.find((h) => h.key === key)?.value;

describe('vercel.json', () => {
  it('builds with the frozen lockfile into dist/', () => {
    expect(config.framework).toBe('vite');
    expect(config.installCommand).toBe('pnpm install --frozen-lockfile');
    expect(config.buildCommand).toBe('pnpm build');
    expect(config.outputDirectory).toBe('dist');
  });

  it('caches hashed assets immutably', () => {
    expect(header('/assets/(.*)', 'Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('sets security headers on every route', () => {
    expect(header('/(.*)', 'X-Content-Type-Options')).toBe('nosniff');
    expect(header('/(.*)', 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('/(.*)', 'X-Frame-Options')).toBe('DENY');
    expect(header('/(.*)', 'Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('has no SPA rewrites (single page)', () => {
    expect(config.rewrites).toBeUndefined();
  });
});
