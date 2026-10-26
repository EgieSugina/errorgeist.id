export interface LeakHit {
  file: string;
  term: string;
}
export function parseBlocklistText(text: string): string[];
export function loadBlocklist(path: string): string[];
export function findLeaks(text: string, terms: string[]): string[];
export function scanForLeaks(distDir: string, terms: string[]): LeakHit[];
