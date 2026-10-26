import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { findLeaks, loadBlocklist, scanForLeaks } from '../../../scripts/check-leaks.mjs';

const SCRIPT = resolve(__dirname, '../../../scripts/check-leaks.mjs');

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'leak-check-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('findLeaks', () => {
  it('matches case-insensitively at word boundaries', () => {
    expect(findLeaks('OP. ZORBLAX and some food', ['zorblax', 'foo'])).toEqual(['zorblax']);
  });

  it('escapes regex special characters in terms', () => {
    expect(findLeaks('mail acme.co.id now', ['acme.co.id'])).toEqual(['acme.co.id']);
    expect(findLeaks('acmeXcoXid', ['acme.co.id'])).toEqual([]);
  });

  it('returns [] when nothing matches', () => {
    expect(findLeaks('food court', ['foo'])).toEqual([]);
  });
});

describe('scanForLeaks', () => {
  it('reports a term hit with the relative file name', () => {
    writeFileSync(join(dir, 'a.js'), 'const t = "OP. ZORBLAX";');
    expect(scanForLeaks(dir, ['zorblax'])).toEqual([{ file: 'a.js', term: 'zorblax' }]);
  });

  it('respects word boundaries', () => {
    writeFileSync(join(dir, 'a.js'), 'food court');
    expect(scanForLeaks(dir, ['foo'])).toEqual([]);
  });

  it('reports any .map file as a sourcemap leak', () => {
    writeFileSync(join(dir, 'x.js.map'), '{}');
    expect(scanForLeaks(dir, ['zorblax'])).toEqual([{ file: 'x.js.map', term: '<sourcemap>' }]);
  });
});

describe('loadBlocklist', () => {
  it('throws when the blocklist is missing', () => {
    expect(() => loadBlocklist(join(dir, 'nope'))).toThrow(/leak blocklist missing/);
  });

  it('throws when the blocklist has only blanks and comments', () => {
    const p = join(dir, 'bl');
    writeFileSync(p, '\n# comment\n   \n#another\n');
    expect(() => loadBlocklist(p)).toThrow(/leak blocklist empty/);
  });

  it('returns trimmed terms, skipping blanks and comments', () => {
    const p = join(dir, 'bl');
    writeFileSync(p, '# c\n zorblax \n\ntwo words\n');
    expect(loadBlocklist(p)).toEqual(['zorblax', 'two words']);
  });
});

describe('check-leaks CLI (fail-closed)', () => {
  const runCli = (blocklist: string) =>
    spawnSync(process.execPath, [SCRIPT], {
      cwd: dir,
      env: { ...process.env, LEAK_BLOCKLIST: blocklist },
      encoding: 'utf8',
    });

  it('exits non-zero when the blocklist is missing', () => {
    const r = runCli(join(dir, 'missing-blocklist'));
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/leak blocklist missing/);
  });

  it('exits non-zero when the blocklist is empty', () => {
    const p = join(dir, 'empty-blocklist');
    writeFileSync(p, '# only comments\n\n   \n');
    const r = runCli(p);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/leak blocklist empty/);
  });
});
