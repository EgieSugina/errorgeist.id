import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');

/**
 * Static value imports of one module: `import ... from 'x'`, `import 'x'` and `export ... from 'x'`.
 * `import type` is erased at build time and dynamic `import()` makes a separate chunk, so
 * neither counts.
 */
function staticImports(file: string): string[] {
  const src = readFileSync(file, 'utf8');
  const out: string[] = [];
  for (const m of src.matchAll(/(?:^|\n)\s*(?:import|export)\s+(type\s+)?([^;'"]*?)\s*from\s*['"]([^'"]+)['"]/g)) {
    if (!m[1]) out.push(m[3]);
  }
  for (const m of src.matchAll(/(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)) out.push(m[1]);
  return out;
}

function resolveLocal(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec);
  for (const p of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(p) && /\.(ts|tsx)$/.test(p)) return p;
  }
  return null;
}

/** Every bare package reachable from `entry` through static imports only. */
function staticPackages(entry: string): Set<string> {
  const seen = new Set<string>();
  const packages = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const spec of staticImports(file)) {
      if (spec.startsWith('.')) {
        const next = resolveLocal(file, spec);
        if (next) visit(next);
      } else {
        packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
      }
    }
  };
  visit(resolve(ROOT, entry));
  return packages;
}

describe('three.js stays out of the static import graph', () => {
  it('the parser sees real imports (not vacuous)', () => {
    expect(staticPackages('src/main.tsx')).toContain('react');
    expect(staticPackages('src/features/fx/crtRenderer.ts')).toContain('three');
  });

  it.each([
    'src/main.tsx',
    'src/App.tsx',
    'src/features/fx/CrtTransition.tsx',
    'src/features/fx/GrainBackdrop.tsx',
    'src/features/fx/loaders.ts',
  ])('%s does not statically reach three', (entry) => {
    expect(staticPackages(entry)).not.toContain('three');
  });
});
