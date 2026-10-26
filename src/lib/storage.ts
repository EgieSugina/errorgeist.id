export type StoreArea = 'local' | 'session';

// Accessing window.localStorage itself can throw (Safari private mode, blocked
// cookies), so the accessor lives inside the try/catch too.
function area(kind: StoreArea): Storage {
  return kind === 'local' ? window.localStorage : window.sessionStorage;
}

export function readStore(kind: StoreArea, key: string): string | null {
  try {
    return area(kind).getItem(key);
  } catch {
    return null;
  }
}

/** `null` removes the key. Never throws. */
export function writeStore(kind: StoreArea, key: string, value: string | null): void {
  try {
    if (value === null) area(kind).removeItem(key);
    else area(kind).setItem(key, value);
  } catch {
    // storage unavailable: silently degrade to in-memory state
  }
}
