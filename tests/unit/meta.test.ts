import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

/** The desk token is the single source for the page background colour. */
const desk = read('src/tokens/colors.stylex.ts').match(/\bdesk:\s*'(#[0-9a-f]{6})'/i)?.[1];

describe('desk colour outside the app', () => {
  it('finds the desk token', () => {
    expect(desk).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('global.css body background matches it', () => {
    expect(read('src/global.css')).toMatch(new RegExp(`background-color:\\s*${desk}`, 'i'));
  });

  it('index.html theme-color matches it', () => {
    expect(read('index.html')).toMatch(new RegExp(`<meta name="theme-color" content="${desk}"`, 'i'));
  });

  it('the favicon background matches it', () => {
    expect(read('public/favicon.svg')).toMatch(new RegExp(`<rect width="64" height="64" rx="10" fill="${desk}"`, 'i'));
  });
});
