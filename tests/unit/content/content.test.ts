import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { findLeaks, loadBlocklist } from '../../../scripts/check-leaks.mjs';
import { profile } from '../../../src/content/profile';
import { experience } from '../../../src/content/experience';
import { education } from '../../../src/content/education';
import { arsenal } from '../../../src/content/arsenal';
import { archive, operations, operationsCount } from '../../../src/content/operations';
import { bootLines } from '../../../src/content/boot';
import { sections, ui } from '../../../src/content/ui';

const BLOCKLIST_PATH = resolve(__dirname, '../../../.leak-blocklist');

// Every bilingual content module, including the page chrome in content/ui.ts.
const everything = { profile, experience, education, arsenal, operations, archive, sections, ui };

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
    // 120 from the data modules + 46 page-chrome strings from content/ui.ts (at time of writing).
    expect(collectL10n(everything).length).toBeGreaterThan(180);
  });

  it('covers the page chrome in content/ui.ts', () => {
    expect(collectL10n({ sections, ui }).length).toBeGreaterThan(40);
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
  const byId = (id: string) => operations.find((o) => o.id === id)!;
  const DECLASSIFIED_IDS = [
    'spectre', 'tsukimi', 'lucy', 'homechef', 'lawang', 'kinanti', 'phantomportal', 'asmodeus', 'thesis',
  ];

  it('has 15 featured operations', () => {
    expect(operations).toHaveLength(15);
  });

  it('has exactly nine declassified ops, in order, with no client', () => {
    const declassified = operations.filter((o) => o.clearance === 'declassified');
    expect(declassified.map((o) => o.id)).toEqual(DECLASSIFIED_IDS);
    expect(operations.slice(6).map((o) => o.id)).toEqual(DECLASSIFIED_IDS);
    for (const o of declassified) expect(o.client).toBeNull();
  });

  it('declassified ops carry exactly the confirmed public repo links', () => {
    expect(byId('spectre').links).toEqual([
      { label: 'GitHub', href: 'https://github.com/EgieSugina/S.P.E.C.T.R.E' },
    ]);
    expect(byId('tsukimi').links).toEqual([
      { label: 'GitHub', href: 'https://github.com/EgieSugina/tsukimi.my' },
    ]);
    expect(byId('homechef').links).toEqual([
      {
        label: 'GitHub — model training',
        href: 'https://github.com/EgieSugina/Training-Model-Chef-AI-Indonesia',
      },
    ]);
    expect(byId('phantomportal').links).toEqual([
      { label: 'GitHub', href: 'https://github.com/EgieSugina/0xPhantomPortal' },
    ]);
    // Private repositories: no links at all.
    for (const id of ['lucy', 'lawang', 'kinanti', 'asmodeus', 'thesis']) expect(byId(id).links).toEqual([]);
    expect(operations.filter((o) => o.links.length > 0).map((o) => o.id)).toEqual([
      'spectre', 'tsukimi', 'homechef', 'phantomportal',
    ]);
  });

  it('the new declassified ops have the specified codenames', () => {
    expect(byId('lucy').codename).toBe('LUCY');
    expect(byId('homechef').codename).toBe('HOME CHEF AI');
    expect(byId('lawang').codename).toBe('LAWANG');
    expect(byId('kinanti').codename).toBe('KINANTI');
    expect(byId('phantomportal').codename).toBe('0xPHANTOMPORTAL');
    expect(byId('asmodeus').codename).toBe('A.S.M.O.D.E.U.S');
    expect(byId('thesis').codename).toBe('THESIS // S.Kom');
  });

  it('puts the high-signal technologies in the first four stack chips', () => {
    expect(byId('lucy').stack.slice(0, 4)).toEqual([
      'Groq (Whisper + LLM)', 'Fish Audio TTS', 'discord.js voice', 'Node.js',
    ]);
    expect(byId('homechef').stack.slice(0, 4)).toEqual(['Next.js 15', 'Qwen2.5 + LoRA', 'FastAPI', 'NextAuth']);
    expect(byId('homechef').stack).toContain('Tailwind CSS 4');
    expect(byId('homechef').stack).not.toContain('Tailwind CSS');
    expect(byId('lawang').stack.slice(0, 4)).toEqual(['TypeScript', 'MCP SDK', 'Drizzle ORM', 'SQLite']);
    expect(byId('kinanti').stack.slice(0, 4)).toEqual(['FastAPI', 'LangGraph', 'React Flow', 'pgvector']);
    expect(byId('phantomportal').stack.slice(0, 4)).toEqual(['Python', 'PySide6', 'OpenSSH', 'keyring']);
    expect(byId('asmodeus').stack.slice(0, 4)).toEqual(['Go', 'chi', 'SQLite', 'React']);
    expect(byId('thesis').stack.slice(0, 4)).toEqual(['n8n', 'Google Gemini', 'PostgreSQL', 'Docker Compose']);
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

describe('archive', () => {
  it('existing families are classified, new declassified family has named items with GitHub links', () => {
    const classified = archive.filter((g) => g.clearance === 'classified');
    const declassified = archive.filter((g) => g.clearance === 'declassified');
    expect(classified.length).toBeGreaterThanOrEqual(8);
    expect(declassified).toHaveLength(1);
    const items = declassified[0].items as { name: string; text: { en: string; id: string }; href?: string }[];
    expect(items.map((i) => i.name)).toEqual([
      'G14-Slash-Lighting-Events',
      'axios-supply-chain-scanner-for-pnpm',
    ]);
    expect(items.map((i) => i.href)).toEqual([
      'https://github.com/EgieSugina/G14-Slash-Lighting-Events',
      'https://github.com/EgieSugina/axios-supply-chain-scanner-for-pnpm',
    ]);
  });

  it('has the new classified families and the dashboards addition', () => {
    const names = archive.map((g) => g.family.en);
    expect(names).toContain('Platform & data APIs');
    expect(names).toContain('Alerting & automation');
    const platform = archive.find((g) => g.family.en === 'Platform & data APIs')!;
    expect(platform.clearance).toBe('classified');
    expect(platform.items).toHaveLength(3);
    const alerting = archive.find((g) => g.family.en === 'Alerting & automation')!;
    expect(alerting.items).toHaveLength(1);
    const dash = archive.find((g) => g.family.en === 'Standalone dashboards')!;
    expect(dash.items.length).toBe(5);
  });

  it('never mentions the excluded downloader projects', () => {
    const text = JSON.stringify({ operations, archive }).toLowerCase();
    expect(text).not.toContain('hls-downloader');
    expect(text).not.toContain('hdl-flux');
    expect(text).not.toContain('hdl flux');
  });
});

describe('education', () => {
  it('carries the thesis title in both languages', () => {
    expect(education.primary.thesis?.id).toBe(
      'Implementasi Natural Language Processing dan Large Language Model pada AI Agent aplikasi Telegram untuk Analisis Data Jaringan Telco',
    );
    expect(education.primary.thesis?.en).toBe(
      'Implementing Natural Language Processing and Large Language Models in a Telegram AI Agent for Telco Network Data Analysis',
    );
  });

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
