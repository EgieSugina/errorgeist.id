#!/usr/bin/env node
// Fail-closed leak scan of the source tree, for the pre-push hook and `pnpm leak:tree`.
// Checks every tracked file (path and contents) and the commit messages about to be pushed
// against the same private blocklist as check-leaks.mjs. Exits non-zero on any hit, on a
// missing/empty blocklist, or when git fails.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BINARY_EXT, findLeaks, formatHit, resolveBlocklist } from './check-leaks.mjs';

/** @param {string} cwd @param {string[]} args */
function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Tracked paths (index), NUL-separated so odd names survive. @param {string} cwd */
function trackedFiles(cwd) {
  return git(cwd, ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean);
}

/** Contents from the working tree, or from the index when the file is deleted locally. */
function readTracked(cwd, file) {
  const abs = join(cwd, file);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : git(cwd, ['show', `:${file}`]).toString('utf8');
}

/** True when the current branch has an upstream. @param {string} cwd */
function hasUpstream(cwd) {
  try {
    git(cwd, ['rev-parse', '--verify', '--quiet', '@{u}']);
    return true;
  } catch {
    return false;
  }
}

/** True when HEAD points at a commit (false in a fresh repo). @param {string} cwd */
function hasHead(cwd) {
  try {
    git(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Commit messages about to be pushed: `@{u}..HEAD` when an upstream exists, else every
 * commit reachable from HEAD. @param {string} cwd
 */
function commitMessages(cwd) {
  if (!hasHead(cwd)) return [];
  const range = hasUpstream(cwd) ? '@{u}..HEAD' : 'HEAD';
  const out = git(cwd, ['log', '--format=%H%x00%B%x1e', range]).toString('utf8');
  return out
    .split('\x1e')
    .map((rec) => rec.replace(/^\n/, ''))
    .filter((rec) => rec.includes('\0'))
    .map((rec) => {
      const [sha, message] = rec.split('\0');
      return { sha, message };
    });
}

/**
 * Every hit in the tree at `cwd`. @param {string} cwd @param {string[]} terms
 * @returns {{ hits: { file: string, term: string, inPath?: boolean }[], files: number, commits: number }}
 */
export function scanTree(cwd, terms) {
  const hits = [];
  const files = trackedFiles(cwd);
  for (const file of files) {
    for (const term of findLeaks(file, terms)) hits.push({ file, term, inPath: true });
    if (BINARY_EXT.test(file)) continue;
    for (const term of findLeaks(readTracked(cwd, file), terms)) hits.push({ file, term });
  }
  const commits = commitMessages(cwd);
  for (const { sha, message } of commits) {
    for (const term of findLeaks(message, terms)) hits.push({ file: `commit ${sha.slice(0, 12)}`, term });
  }
  return { hits, files: files.length, commits: commits.length };
}

function main() {
  try {
    const { terms, source } = resolveBlocklist();
    const { hits, files, commits } = scanTree(process.cwd(), terms);
    if (hits.length > 0) {
      for (const h of hits) console.error(formatHit(h));
      console.error(`tree leak check: FAILED (${hits.length} hits)`);
      process.exit(1);
    }
    console.log(
      `tree leak check: clean (${terms.length} terms from ${source}, ${files} files, ${commits} commit messages)`,
    );
  } catch (err) {
    const stderr = err && typeof err === 'object' && 'stderr' in err ? String(err.stderr).trim() : '';
    console.error(err instanceof Error ? err.message : err);
    if (stderr) console.error(stderr);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
