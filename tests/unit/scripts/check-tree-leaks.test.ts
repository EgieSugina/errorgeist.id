import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');
const SCRIPT = resolve(ROOT, 'scripts/check-tree-leaks.mjs');

/** A hermetic git environment: no user/system config, no inherited repo pointers. */
function gitEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.invalid',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.invalid',
  };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'LEAK_BLOCKLIST', 'LEAK_BLOCKLIST_TERMS']) delete env[k];
  return env;
}

let dir: string;

function git(...args: string[]) {
  const r = spawnSync('git', args, { cwd: dir, env: gitEnv(), encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout;
}

function commitFile(path: string, content: string, message = 'add file') {
  const abs = join(dir, path);
  mkdirSync(join(abs, '..'), { recursive: true });
  writeFileSync(abs, content);
  git('add', '--', path);
  git('commit', '-q', '--no-gpg-sign', '-m', message);
}

/** Run the script in the temp repo with a synthetic blocklist from the env (`null`: none). */
function run(terms: string | null = 'zorblax,quux') {
  const env = gitEnv();
  // Point the file fallback at a path that does not exist, so only the env value counts.
  env.LEAK_BLOCKLIST = join(dir, '.no-such-blocklist');
  if (terms !== null) env.LEAK_BLOCKLIST_TERMS = terms;
  return spawnSync(process.execPath, [SCRIPT], { cwd: dir, env, encoding: 'utf8' });
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'tree-leaks-'));
  git('init', '-q', '-b', 'main');
  commitFile('README.md', '# clean project\n', 'initial commit');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('check-tree-leaks', () => {
  it('passes on a clean repo and reports what it scanned', () => {
    commitFile('src/app.ts', 'export const x = 1;\n');
    const r = run();
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/tree leak check: clean \(2 terms from env, 2 files, 2 commit messages\)/);
  });

  it('fails when a tracked file contains a term, naming file and term', () => {
    commitFile('src/app.ts', 'const op = "OP. Zorblax";\n');
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak: src\/app\.ts: zorblax/);
  });

  it('fails when a commit message contains a term', () => {
    commitFile('src/app.ts', 'ok\n', 'feat: wire up the quux integration');
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak: commit [0-9a-f]{7,}: quux/);
  });

  it('fails when a tracked file PATH contains a term', () => {
    commitFile('notes/zorblax-plan.txt', 'nothing in here\n');
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak: notes\/zorblax-plan\.txt \(path\): zorblax/);
  });

  it('checks the path but not the bytes of binary files', () => {
    commitFile('img/logo.png', 'zorblax inside a png');
    expect(run().status).toBe(0);
    commitFile('img/quux.png', 'png');
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak: img\/quux\.png \(path\): quux/);
  });

  it('scans staged files that are not committed yet', () => {
    writeFileSync(join(dir, 'staged.ts'), 'zorblax\n');
    git('add', 'staged.ts');
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak: staged\.ts: zorblax/);
  });

  it('with an upstream, scans only the commit messages not pushed yet', () => {
    const remote = mkdtempSync(join(tmpdir(), 'tree-leaks-remote-'));
    try {
      spawnSync('git', ['init', '-q', '--bare', remote], { env: gitEnv() });
      // Already published history is out of reach (it cannot be rewritten without a force push).
      commitFile('a.txt', 'a\n', 'old quux message');
      git('remote', 'add', 'origin', remote);
      git('push', '-q', '-u', 'origin', 'main');
      expect(run().status).toBe(0);
      commitFile('b.txt', 'b\n', 'new zorblax message');
      const r = run();
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/leak: commit [0-9a-f]{7,}: zorblax/);
      expect(r.stderr).not.toMatch(/quux/);
    } finally {
      rmSync(remote, { recursive: true, force: true });
    }
  });

  it('fails closed when no blocklist is available', () => {
    const r = run(null);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/leak blocklist missing/);
  });

  it('fails closed outside a git repository', () => {
    const plain = mkdtempSync(join(tmpdir(), 'tree-leaks-plain-'));
    try {
      const env = gitEnv();
      env.LEAK_BLOCKLIST_TERMS = 'zorblax';
      env.GIT_CEILING_DIRECTORIES = tmpdir();
      const r = spawnSync(process.execPath, [SCRIPT], { cwd: plain, env, encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stderr).not.toBe('');
    } finally {
      rmSync(plain, { recursive: true, force: true });
    }
  });
});

describe('pre-push hook', () => {
  it('is an executable sh script that runs the tree leak check with node directly', () => {
    const hook = resolve(ROOT, '.githooks/pre-push');
    expect(statSync(hook).mode & 0o111).not.toBe(0);
    const text = spawnSync('cat', [hook], { encoding: 'utf8' }).stdout;
    expect(text.startsWith('#!/bin/sh\n')).toBe(true);
    expect(text).toMatch(/node scripts\/check-tree-leaks\.mjs/);
    // pnpm 12 has no -s/--silent, so the hook must not run through pnpm.
    expect(text).not.toMatch(/^\s*(exec\s+)?pnpm\b/m);
  });

  it('package.json wires the hook path on install and exposes leak:tree', async () => {
    const pkg = (await import('../../../package.json')).default as { scripts: Record<string, string> };
    expect(pkg.scripts['leak:tree']).toBe('node scripts/check-tree-leaks.mjs');
    expect(pkg.scripts.prepare).toBe('git config core.hooksPath .githooks || true');
  });
});
