import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  findLeaks,
  loadBlocklist,
  parseBlocklistText,
  resolveBlocklist,
  scanForLeaks,
} from '../../../scripts/check-leaks.mjs';

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

  it('reports a term in the relative file path, even when the content is clean', () => {
    mkdirSync(join(dir, 'assets'));
    writeFileSync(join(dir, 'assets', 'zorblax-notes.txt'), 'nothing to see');
    expect(scanForLeaks(dir, ['zorblax'])).toEqual([
      { file: 'assets/zorblax-notes.txt', term: 'zorblax', inPath: true },
    ]);
  });

  it('checks the path of binary files too', () => {
    writeFileSync(join(dir, 'zorblax.png'), 'binary');
    expect(scanForLeaks(dir, ['zorblax'])).toEqual([{ file: 'zorblax.png', term: 'zorblax', inPath: true }]);
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

describe('resolveBlocklist', () => {
  it('prefers non-blank LEAK_BLOCKLIST_TERMS over the file', () => {
    const p = join(dir, 'bl');
    writeFileSync(p, 'fromfile\n');
    expect(resolveBlocklist({ LEAK_BLOCKLIST_TERMS: 'zorblax, quux' }, p)).toEqual({
      terms: ['zorblax', 'quux'],
      source: 'env',
    });
  });

  it('falls back to LEAK_BLOCKLIST, then the default path, when the env value is blank', () => {
    const p = join(dir, 'bl');
    writeFileSync(p, 'zorblax\n');
    expect(resolveBlocklist({ LEAK_BLOCKLIST_TERMS: '  ' }, p)).toEqual({ terms: ['zorblax'], source: 'file' });
    expect(resolveBlocklist({ LEAK_BLOCKLIST: p }, join(dir, 'nope'))).toEqual({
      terms: ['zorblax'],
      source: 'file',
    });
  });

  it('throws (fail-closed) when neither source exists, naming the env alternative', () => {
    expect(() => resolveBlocklist({}, join(dir, 'nope'))).toThrow(/leak blocklist missing.*LEAK_BLOCKLIST_TERMS/);
  });

  it('throws when the env value parses to zero terms', () => {
    expect(() => resolveBlocklist({ LEAK_BLOCKLIST_TERMS: ' , \n# c' }, join(dir, 'nope'))).toThrow(/empty/);
  });
});

describe('parseBlocklistText', () => {
  it('splits on newlines and commas, trims, and drops blanks and comments', () => {
    expect(parseBlocklistText('# c\n zorblax ,two words\n\n#x\nquux, \r\nfrob')).toEqual([
      'zorblax',
      'two words',
      'quux',
      'frob',
    ]);
  });

  it('returns [] for blank or comment-only text', () => {
    expect(parseBlocklistText(' , \n# c')).toEqual([]);
  });
});

describe('check-leaks CLI (fail-closed)', () => {
  const runCli = (blocklist: string, terms?: string) => {
    const env: NodeJS.ProcessEnv = { ...process.env, LEAK_BLOCKLIST: blocklist };
    delete env.LEAK_BLOCKLIST_TERMS;
    if (terms !== undefined) env.LEAK_BLOCKLIST_TERMS = terms;
    return spawnSync(process.execPath, [SCRIPT], { cwd: dir, env, encoding: 'utf8' });
  };

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

  it('names LEAK_BLOCKLIST_TERMS as the alternative when the file is missing', () => {
    const r = runCli(join(dir, 'missing-blocklist'));
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/leak blocklist missing/);
    expect(r.stderr).toMatch(/LEAK_BLOCKLIST_TERMS/);
  });

  describe('LEAK_BLOCKLIST_TERMS env source', () => {
    const missing = () => join(dir, 'missing-blocklist');

    it('passes on a clean dist and reports the env source', () => {
      mkdirSync(join(dir, 'dist'));
      writeFileSync(join(dir, 'dist', 'a.js'), 'const t = "hello";');
      const r = runCli(missing(), 'zorblax,quux\n# note\nfrob');
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/leak check: clean \(3 terms from env, 1 files\)/);
    });

    it('fails and names the term when dist contains it', () => {
      mkdirSync(join(dir, 'dist'));
      writeFileSync(join(dir, 'dist', 'a.js'), 'const t = "OP. ZORBLAX";');
      const r = runCli(missing(), 'zorblax,quux');
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/leak: a\.js: zorblax/);
    });

    it('fails and names the file when only its path contains the term', () => {
      mkdirSync(join(dir, 'dist'));
      writeFileSync(join(dir, 'dist', 'zorblax.js'), 'ok');
      const r = runCli(missing(), 'zorblax');
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/leak: zorblax\.js \(path\): zorblax/);
    });

    it('fails closed when the env value parses to zero terms', () => {
      mkdirSync(join(dir, 'dist'));
      const r = runCli(missing(), ' , \n# c');
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/empty/);
    });

    it('falls back to the file when the env value is blank', () => {
      const p = join(dir, 'bl');
      writeFileSync(p, 'zorblax\n');
      mkdirSync(join(dir, 'dist'));
      writeFileSync(join(dir, 'dist', 'a.js'), 'ok');
      const r = runCli(p, '   ');
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/1 terms from file/);
    });
  });
});
