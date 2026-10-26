import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { findLeaks, loadBlocklist } from '../../../scripts/check-leaks.mjs';
import { profile } from '../../../src/content/profile';
import { experience } from '../../../src/content/experience';
import { education } from '../../../src/content/education';
import { arsenal } from '../../../src/content/arsenal';
import { archive, operations, operationsCount } from '../../../src/content/operations';
import { bootLines } from '../../../src/content/boot';

const BLOCKLIST_PATH = resolve(__dirname, '../../../.leak-blocklist');

const everything = { profile, experience, education, arsenal, operations, archive };

/** Collect every { en, id } object reachable from a value. */
function collectL10n(value: unknown, out: { en: unknown; id: unknown }[] = []) {
  if (Array.isArray(value)) {
    value.forEach((v) => collectL10n(v, out));
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('en' in obj && 'id' in obj) out.push({ en: obj.en, id: obj.id });
    else Object.values(obj).forEach((v) => collectL10n(v, out));
  }
  return out;
}

describe('bilingual completeness', () => {
  it('finds a meaningful number of L10n values', () => {
    expect(collectL10n(everything).length).toBeGreaterThan(60);
  });

  it('every L10n has non-empty en and id', () => {
    for (const l of collectL10n(everything)) {
      expect(typeof l.en).toBe('string');
      expect(typeof l.id).toBe('string');
      expect((l.en as string).trim()).not.toBe('');
      expect((l.id as string).trim()).not.toBe('');
    }
  });
});

describe('operations', () => {
  it('has 8 featured operations', () => {
    expect(operations).toHaveLength(8);
  });

  it('has exactly two declassified ops: spectre and tsukimi, with no client', () => {
    const declassified = operations.filter((o) => o.clearance === 'declassified');
    expect(declassified.map((o) => o.id).sort()).toEqual(['spectre', 'tsukimi']);
    for (const o of declassified) expect(o.client).toBeNull();
  });

  it('classified ops are TELKOMSEL and carry no links', () => {
    const classified = operations.filter((o) => o.clearance === 'classified');
    expect(classified).toHaveLength(6);
    for (const o of classified) {
      expect(o.client).toBe('TELKOMSEL');
      expect(o.links).toHaveLength(0);
    }
  });

  it('classified codenames are in the specified order', () => {
    expect(
      operations.filter((o) => o.clearance === 'classified').map((o) => o.codename),
    ).toEqual(['HIVEMIND', 'CROWDWATCH', 'COURIER', 'ORACLE', 'FIBERLINE', 'ARMORY']);
  });

  it('ids are unique', () => {
    expect(new Set(operations.map((o) => o.id)).size).toBe(operations.length);
  });

  it('operationsCount = featured + archive items', () => {
    const archived = archive.reduce((n, g) => n + g.items.length, 0);
    expect(archived).toBeGreaterThan(0);
    expect(operationsCount()).toBe(operations.length + archived);
  });
});

describe('profile', () => {
  it('has the exact identity and links', () => {
    expect(profile.name).toBe('Egie Sugina');
    expect(profile.email).toBe('egiesugina704@gmail.com');
    const hrefs = profile.links.map((l) => l.href);
    expect(hrefs).toContain('https://github.com/EgieSugina');
    expect(hrefs).toContain('https://www.linkedin.com/in/egie-sugina-857680179/');
    expect(profile.fileNo).toMatch(/\S/);
  });

  it('shows only Subang, West Java as location', () => {
    expect(profile.location.en).toBe('Subang, West Java');
    expect(profile.location.id).toBe('Subang, Jawa Barat');
  });
});

describe('education', () => {
  it('primary is S1 Sistem Informasi at Universitas Subang', () => {
    expect(education.primary.degree.en).toContain('Information Systems');
    expect(education.primary.degree.en).toContain('S.Kom');
    expect(education.primary.school).toContain('Universitas Subang');
  });
});

describe('experience', () => {
  it('covers NTI (open-ended) and Hirata.id', () => {
    expect(experience.map((e) => e.org)).toEqual([
      expect.stringContaining('Neural Technologies'),
      expect.stringContaining('Hirata.id'),
    ]);
    expect(experience[0].period.to).toBeNull();
    expect(experience[0].clients).toEqual(['TELKOMSEL']);
  });
});

describe('boot', () => {
  it.each(['en', 'id'] as const)('bootLines(%s) is 9-11 lines with a skip hint and the count', (lang) => {
    const lines = bootLines(lang, 42);
    expect(lines.length).toBeGreaterThanOrEqual(9);
    expect(lines.length).toBeLessThanOrEqual(11);
    expect(lines.some((l) => l.text.includes('42'))).toBe(true);
    expect(lines.some((l) => l.tone === 'warn')).toBe(true);
    expect(lines.at(-1)?.text).toBe(
      lang === 'en' ? '[ press any key to skip ]' : '[ tekan tombol apa saja untuk lewati ]',
    );
  });
});

describe('confidentiality', () => {
  it('loads the blocklist (fails, never skips, when absent)', () => {
    expect(() => loadBlocklist(BLOCKLIST_PATH)).not.toThrow();
  });

  it('no blocklist term appears in the serialized content', () => {
    const terms = loadBlocklist(BLOCKLIST_PATH);
    const serialized = JSON.stringify({
      ...everything,
      boot: [bootLines('en', 42), bootLines('id', 42)],
    });
    expect(findLeaks(serialized, terms)).toEqual([]);
  });

  it('no digits-as-system-counts and no years in classified highlights', () => {
    for (const o of operations.filter((x) => x.clearance === 'classified')) {
      for (const h of [...o.highlights, o.summary]) {
        // "5G" is a technology name, not a count.
        const en = h.en.replace(/\b5G\b/g, '');
        const id = h.id.replace(/\b5G\b/g, '');
        expect(en).not.toMatch(/\b(19|20)\d{2}\b/);
        expect(en).not.toMatch(/\d/);
        expect(id).not.toMatch(/\d/);
      }
    }
  });
});
