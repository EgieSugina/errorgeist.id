#!/usr/bin/env node
// Fail-closed leak scan of the production build (dist/).
// Exits non-zero on any blocklisted term, any .map file, or a missing/empty blocklist.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BINARY_EXT = /\.(png|jpe?g|woff2)$/i;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @param {string} path */
export function loadBlocklist(path) {
  if (!existsSync(path)) throw new Error(`leak blocklist missing: ${path}`);
  const terms = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#'));
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

function main() {
  const blocklistPath = process.env.LEAK_BLOCKLIST ?? '.leak-blocklist';
  const distDir = 'dist';
  try {
    const terms = loadBlocklist(blocklistPath);
    if (!existsSync(distDir)) throw new Error(`leak check: ${distDir}/ not found`);
    const hits = scanForLeaks(distDir, terms);
    if (hits.length > 0) {
      for (const h of hits) console.error(`leak: ${h.file}: ${h.term}`);
      console.error(`leak check: FAILED (${hits.length} hits)`);
      process.exit(1);
    }
    console.log(`leak check: clean (${terms.length} terms, ${walk(distDir).length} files)`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
