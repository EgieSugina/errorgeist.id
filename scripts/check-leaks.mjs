#!/usr/bin/env node
// Fail-closed leak scan of the production build (dist/).
// Exits non-zero on any blocklisted term, any .map file, or a missing/empty blocklist.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Files whose bytes are not scanned (their paths still are). */
export const BINARY_EXT = /\.(png|jpe?g|woff2)$/i;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split on newlines and commas, trim, drop blanks and `#` comment lines. @param {string} text */
export function parseBlocklistText(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .flatMap((line) => line.split(','))
    .map((t) => t.trim())
    .filter((t) => t !== '');
}

/** @param {string} path */
export function loadBlocklist(path) {
  if (!existsSync(path)) throw new Error(`leak blocklist missing: ${path}`);
  const terms = parseBlocklistText(readFileSync(path, 'utf8'));
  if (terms.length === 0) throw new Error(`leak blocklist empty: ${path}`);
  return terms;
}

/** @param {string} text @param {string[]} terms */
export function findLeaks(text, terms) {
  return terms.filter((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(text));
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

/**
 * Every term hit in `distDir`: in a file's relative path (`inPath: true`) or its contents.
 * Any `.map` file is a hit on its own.
 * @param {string} distDir @param {string[]} terms
 */
export function scanForLeaks(distDir, terms) {
  const hits = [];
  for (const abs of walk(distDir)) {
    const file = relative(distDir, abs).split(sep).join('/');
    for (const term of findLeaks(file, terms)) hits.push({ file, term, inPath: true });
    if (file.endsWith('.map')) {
      hits.push({ file, term: '<sourcemap>' });
      continue;
    }
    if (BINARY_EXT.test(file)) continue;
    for (const term of findLeaks(readFileSync(abs, 'utf8'), terms)) hits.push({ file, term });
  }
  return hits;
}

/** One line per hit, as printed by the CLIs. @param {{ file: string, term: string, inPath?: boolean }} hit */
export function formatHit(hit) {
  return `leak: ${hit.file}${hit.inPath ? ' (path)' : ''}: ${hit.term}`;
}

/**
 * Terms from `LEAK_BLOCKLIST_TERMS` when set and non-blank, else from the file at
 * `LEAK_BLOCKLIST` (default `defaultPath`). Throws when neither yields any term.
 * @param {Record<string, string | undefined>} [env] @param {string} [defaultPath]
 */
export function resolveBlocklist(env = process.env, defaultPath = '.leak-blocklist') {
  const fromEnv = env.LEAK_BLOCKLIST_TERMS;
  if (fromEnv !== undefined && fromEnv.trim() !== '') {
    const terms = parseBlocklistText(fromEnv);
    if (terms.length === 0) throw new Error('leak blocklist empty: LEAK_BLOCKLIST_TERMS');
    return { terms, source: 'env' };
  }
  const path = env.LEAK_BLOCKLIST ?? defaultPath;
  try {
    return { terms: loadBlocklist(path), source: 'file' };
  } catch (err) {
    if (err instanceof Error && /^leak blocklist missing/.test(err.message)) {
      throw new Error(`${err.message} (or set LEAK_BLOCKLIST_TERMS)`);
    }
    throw err;
  }
}

function main() {
  const distDir = 'dist';
  try {
    const { terms, source } = resolveBlocklist();
    if (!existsSync(distDir)) throw new Error(`leak check: ${distDir}/ not found`);
    const hits = scanForLeaks(distDir, terms);
    if (hits.length > 0) {
      for (const h of hits) console.error(formatHit(h));
      console.error(`leak check: FAILED (${hits.length} hits)`);
      process.exit(1);
    }
    console.log(`leak check: clean (${terms.length} terms from ${source}, ${walk(distDir).length} files)`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
