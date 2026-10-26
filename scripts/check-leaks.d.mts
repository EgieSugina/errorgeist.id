export interface LeakHit {
  file: string;
  term: string;
  /** True when the term is in the file's path rather than its contents. */
  inPath?: boolean;
}
export const BINARY_EXT: RegExp;
export function parseBlocklistText(text: string): string[];
export function loadBlocklist(path: string): string[];
export function findLeaks(text: string, terms: string[]): string[];
export function scanForLeaks(distDir: string, terms: string[]): LeakHit[];
export function formatHit(hit: LeakHit): string;
export function resolveBlocklist(
  env?: Record<string, string | undefined>,
  defaultPath?: string,
): { terms: string[]; source: 'env' | 'file' };
