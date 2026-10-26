#!/usr/bin/env node
// Fail-closed leak scan of the production build (dist/).
// Exits non-zero on any blocklisted term, any .map file, or a missing/empty blocklist.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BINARY_EXT = /\.(png|jpe?g|woff2)$/i;

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

/** @param {string} distDir @param {string[]} terms */
export function scanForLeaks(distDir, terms) {
  const hits = [];
  for (const abs of walk(distDir)) {
    const file = relative(distDir, abs).split(sep).join('/');
    if (file.endsWith('.map')) {
      hits.push({ file, term: '<sourcemap>' });
      continue;
    }
    if (BINARY_EXT.test(file)) continue;
    for (const term of findLeaks(readFileSync(abs, 'utf8'), terms)) hits.push({ file, term });
  }
  return hits;
}

/** Terms from env LEAK_BLOCKLIST_TERMS when set and non-blank, else from the blocklist file. */
function resolveBlocklist() {
  const fromEnv = process.env.LEAK_BLOCKLIST_TERMS;
  if (fromEnv !== undefined && fromEnv.trim() !== '') {
    const terms = parseBlocklistText(fromEnv);
    if (terms.length === 0) throw new Error('leak blocklist empty: LEAK_BLOCKLIST_TERMS');
    return { terms, source: 'env' };
  }
  const path = process.env.LEAK_BLOCKLIST ?? '.leak-blocklist';
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
      for (const h of hits) console.error(`leak: ${h.file}: ${h.term}`);
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
