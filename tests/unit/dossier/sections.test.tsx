import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider } from '../../../src/i18n/LangProvider';
import type { Lang } from '../../../src/i18n/types';
import { profile } from '../../../src/content/profile';
import { arsenal } from '../../../src/content/arsenal';
import { SubjectProfile } from '../../../src/features/dossier/sections/SubjectProfile';
import { ServiceRecord } from '../../../src/features/dossier/sections/ServiceRecord';
import { Arsenal } from '../../../src/features/dossier/sections/Arsenal';
import { Education } from '../../../src/features/dossier/sections/Education';
import { SecureChannel } from '../../../src/features/dossier/sections/SecureChannel';
import { DossierPage } from '../../../src/features/dossier/DossierPage';

const GITHUB = 'https://github.com/EgieSugina';
const LINKEDIN = 'https://www.linkedin.com/in/egie-sugina-857680179/';

function renderIn(lang: Lang, ui: ReactElement) {
  if (lang === 'id') window.localStorage.setItem('egs.lang', 'id');
  return render(<LangProvider>{ui}</LangProvider>);
}

/** Minimal IntersectionObserver double (jsdom has none). */
class MockIO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const originalIO = globalThis.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 26));
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  globalThis.IntersectionObserver = originalIO;
  window.matchMedia = originalMatchMedia;
});

describe('SubjectProfile', () => {
  it('shows name, computed years, location and a redacted address (EN)', () => {
    const { container } = renderIn('en', <SubjectProfile />);
    expect(screen.getByRole('heading', { level: 1, name: 'Egie Sugina' })).toBeInTheDocument();
    expect(screen.getByText(/10\+ years/)).toBeInTheDocument();
    expect(screen.getByText(/Subang, West Java/)).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'redacted' }).length).toBeGreaterThanOrEqual(1);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\d{9,}/);
    expect(text).not.toMatch(/\b7\+/);
  });

  it('uses Indonesian copy when the language is id', () => {
    renderIn('id', <SubjectProfile />);
    expect(screen.getByText(/10\+ tahun/)).toBeInTheDocument();
    expect(screen.getByText(/Subang, Jawa Barat/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Foto subjek' })).toBeInTheDocument();
  });

  it('has a sized, eagerly loaded subject photo with an English alt', () => {
    renderIn('en', <SubjectProfile />);
    const img = screen.getByRole('img', { name: 'Subject photo' });
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('carries the TOP SECRET stamp and the file-number tab', () => {
    renderIn('en', <SubjectProfile />);
    expect(screen.getByText('TOP SECRET')).toBeInTheDocument();
    expect(screen.getByText(`FILE NO. ${profile.fileNo}`)).toBeInTheDocument();
  });
});

describe('ServiceRecord', () => {
  it('lists NTI with TELKOMSEL first, then Hirata.id with its clients', () => {
    renderIn('en', <ServiceRecord />);
    const entries = screen.getAllByRole('article');
    expect(entries).toHaveLength(2);
    expect(entries[0].textContent).toContain('Neural Technologies Indonesia');
    expect(entries[0].textContent).toContain('TELKOMSEL');
    expect(entries[1].textContent).toContain('Hirata.id');
    expect(entries[1].textContent).toContain('Pertamina Lubricants');
    expect(entries[1].textContent).toContain('JICT');
  });

  it('shows the open-ended role as present', () => {
    renderIn('en', <ServiceRecord />);
    const [current] = screen.getAllByRole('article');
    expect(within(current).getByText(/Present/)).toBeInTheDocument();
  });
});

describe('Arsenal', () => {
  it('renders every group and every item as a loadout list', () => {
    renderIn('en', <Arsenal />);
    for (const g of arsenal) {
      const list = screen.getByRole('list', { name: g.group.en });
      expect(within(list).getAllByRole('listitem')).toHaveLength(g.items.length);
    }
  });
});

describe('Education', () => {
  it('puts the S.Kom degree at Universitas Subang first, SMKN 2 Subang after it', () => {
    renderIn('en', <Education />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('S.Kom');
    expect(items[0].textContent).toContain('Universitas Subang');
    const smk = items.findIndex((li) => li.textContent?.includes('SMKN 2 Subang'));
    expect(smk).toBeGreaterThan(0);
  });
});

describe('SecureChannel', () => {
  it('links to email, GitHub and LinkedIn; external links open safely', () => {
    renderIn('en', <SecureChannel />);
    const links = screen.getAllByRole('link');
    const mail = links.find((a) => a.getAttribute('href') === 'mailto:egiesugina704@gmail.com');
    expect(mail).toBeDefined();
    for (const href of [GITHUB, LINKEDIN]) {
      const a = links.find((l) => l.getAttribute('href') === href);
      expect(a, href).toBeDefined();
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('shows the phone only as a redaction bar', () => {
    const { container } = renderIn('en', <SecureChannel />);
    expect(screen.getAllByRole('img', { name: 'redacted' }).length).toBeGreaterThanOrEqual(1);
    // The LinkedIn handle legitimately holds 9 digits; check everything outside the links.
    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('a').forEach((a) => a.remove());
    expect(clone.textContent ?? '').not.toMatch(/\d{9,}/);
  });
});

describe('DossierPage', () => {
  const IDS = ['profile', 'record', 'operations', 'arsenal', 'education', 'contact'];

  it('renders the six sections in order', () => {
    const { container } = renderIn('en', <DossierPage onReplayBoot={() => {}} />);
    const ids = [...container.querySelectorAll('section[id]')].map((s) => s.id);
    expect(ids).toEqual(IDS);
  });

  it('has one section tab per section', () => {
    renderIn('en', <DossierPage onReplayBoot={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Dossier sections' });
    expect(within(nav).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(
      IDS.map((id) => `#${id}`),
    );
  });

  it('calls onReplayBoot from the footer link', async () => {
    const user = userEvent.setup();
    const onReplayBoot = vi.fn();
    renderIn('en', <DossierPage onReplayBoot={onReplayBoot} />);
    await user.click(screen.getByRole('button', { name: 'replay boot' }));
    expect(onReplayBoot).toHaveBeenCalledTimes(1);
  });

  it('switches language from the visible toggle', async () => {
    const user = userEvent.setup();
    renderIn('en', <DossierPage onReplayBoot={() => {}} />);
    const toggle = screen.getByRole('group', { name: 'Language' });
    await user.click(within(toggle).getByRole('button', { name: 'ID' }));
    expect(screen.getByText(/10\+ tahun/)).toBeInTheDocument();
  });

  it('mounts with IntersectionObserver present and with reduced motion on', () => {
    globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    expect(() => renderIn('en', <DossierPage onReplayBoot={() => {}} />)).not.toThrow();
    expect(screen.getByRole('heading', { level: 1, name: 'Egie Sugina' })).toBeInTheDocument();
  });
});
