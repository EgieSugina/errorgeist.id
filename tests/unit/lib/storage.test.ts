import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStore, writeStore } from '../../../src/lib/storage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('storage', () => {
  it('round-trips values in local and session areas', () => {
    writeStore('local', 'k', 'v1');
    writeStore('session', 'k', 'v2');
    expect(readStore('local', 'k')).toBe('v1');
    expect(readStore('session', 'k')).toBe('v2');
  });

  it('removes the key when value is null', () => {
    writeStore('local', 'k', 'v');
    writeStore('local', 'k', null);
    expect(readStore('local', 'k')).toBeNull();
  });

  it('readStore returns null when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStore('local', 'k')).toBeNull();
    expect(readStore('session', 'k')).toBeNull();
  });

  it('writeStore does not throw when setItem/removeItem throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => writeStore('local', 'k', 'v')).not.toThrow();
    expect(() => writeStore('session', 'k', null)).not.toThrow();
  });

  it('does not throw when the storage accessor itself throws', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readStore('local', 'k')).toBeNull();
    expect(() => writeStore('local', 'k', 'v')).not.toThrow();
  });
});
