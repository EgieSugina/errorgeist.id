import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider } from '../../../src/i18n/LangProvider';
import type { L10n } from '../../../src/i18n/types';
import { Redacted } from '../../../src/features/dossier/primitives/Redacted';
import { Stamp } from '../../../src/features/dossier/primitives/Stamp';
import { Paper } from '../../../src/features/dossier/primitives/Paper';
import { SectionTabs } from '../../../src/features/dossier/primitives/SectionTabs';

/** Controllable IntersectionObserver double (jsdom has none). */
class MockIO {
  static instances: MockIO[] = [];
  targets: Element[] = [];
  constructor(public cb: IntersectionObserverCallback) {
    MockIO.instances.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {
    this.targets = [];
  }
  takeRecords() {
    return [];
  }
  fire(el: Element, isIntersecting: boolean) {
    this.cb(
      [{ target: el, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const original = globalThis.IntersectionObserver;

beforeEach(() => {
  MockIO.instances = [];
  window.localStorage.clear();
  globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  globalThis.IntersectionObserver = original;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Redacted', () => {
  it('is an empty labelled bar; the tooltip is not in the DOM at rest', () => {
    render(<Redacted chars={8} />);
    const bar = screen.getByRole('img', { name: 'redacted' });
    expect(bar.textContent).toBe('');
    expect(screen.queryByText('[CLASSIFIED]')).toBeNull();
  });

  it('is sized in ch units', () => {
    render(<Redacted chars={8} />);
    // jsdom resolves ch to px in computed style; assert on the authored value instead.
    expect(screen.getByRole('img', { name: 'redacted' }).getAttribute('style')).toContain('8ch');
  });

  it('shows [CLASSIFIED] on hover and hides it on leave', async () => {
    const user = userEvent.setup();
    render(<Redacted chars={8} />);
    const bar = screen.getByRole('img', { name: 'redacted' });
    await user.hover(bar);
    expect(screen.getByText('[CLASSIFIED]')).toBeInTheDocument();
    await user.unhover(bar);
    expect(screen.queryByText('[CLASSIFIED]')).toBeNull();
  });

  it('is keyboard focusable and shows [CLASSIFIED] on focus', async () => {
    const user = userEvent.setup();
    render(<Redacted chars={8} />);
    const bar = screen.getByRole('img', { name: 'redacted' });
    expect(bar).toHaveAttribute('tabindex', '0');
    await user.tab();
    expect(bar).toHaveFocus();
    expect(screen.getByText('[CLASSIFIED]')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByText('[CLASSIFIED]')).toBeNull();
  });

  it('rejects children at the type level', () => {
    // @ts-expect-error Redacted takes no children: redacted text is never in source
    render(<Redacted chars={3}>secret</Redacted>);
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('still renders without IntersectionObserver', () => {
    // @ts-expect-error simulate an environment without IO
    delete globalThis.IntersectionObserver;
    render(<Redacted chars={4} />);
    expect(screen.getByRole('img', { name: 'redacted' })).toBeInTheDocument();
  });
});

describe('Stamp', () => {
  it.each([
    ['topSecret', 'TOP SECRET'],
    ['classified', 'CLASSIFIED'],
    ['declassified', 'DECLASSIFIED'],
  ] as const)('%s renders its fixed English label', (kind, label) => {
    render(<Stamp kind={kind} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('mounts and renders visibly without IntersectionObserver', () => {
    // @ts-expect-error simulate an environment without IO
    delete globalThis.IntersectionObserver;
    expect(() => render(<Stamp kind="classified" />)).not.toThrow();
    const el = screen.getByText('CLASSIFIED');
    expect(el).toBeInTheDocument();
    expect(el.style.opacity).not.toBe('0');
  });

  it('keeps the English label when the language is id', () => {
    window.localStorage.setItem('egs.lang', 'id');
    render(
      <LangProvider>
        <Stamp kind="topSecret" />
      </LangProvider>,
    );
    expect(screen.getByText('TOP SECRET')).toBeInTheDocument();
  });
});

describe('Paper', () => {
  it('renders children, an optional tab label and an optional clip', () => {
    const { container, rerender } = render(<Paper>body</Paper>);
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();

    rerender(
      <Paper tab="FILE NO. 0718-ES" clip>
        body
      </Paper>,
    );
    expect(screen.getByText('FILE NO. 0718-ES')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SectionTabs', () => {
  const sections: { id: string; label: L10n }[] = [
    { id: 'profile', label: { en: 'Subject Profile', id: 'Profil Subjek' } },
    { id: 'record', label: { en: 'Service Record', id: 'Rekam Dinas' } },
  ];

  function renderTabs() {
    sections.forEach((s) => {
      const el = document.createElement('section');
      el.id = s.id;
      document.body.appendChild(el);
    });
    return render(
      <LangProvider>
        <SectionTabs sections={sections} />
      </LangProvider>,
    );
  }

  it('renders one anchor per section with the english label', () => {
    renderTabs();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Subject Profile' })).toHaveAttribute('href', '#profile');
    expect(screen.getByRole('link', { name: 'Service Record' })).toHaveAttribute('href', '#record');
  });

  it('uses the current language for labels', () => {
    window.localStorage.setItem('egs.lang', 'id');
    renderTabs();
    expect(screen.getByRole('link', { name: 'Profil Subjek' })).toBeInTheDocument();
  });

  it('marks the in-view section with aria-current', () => {
    renderTabs();
    const [io] = MockIO.instances;
    expect(io.targets.map((t) => t.id)).toEqual(['profile', 'record']);
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(0);

    act(() => io.fire(document.getElementById('record')!, true));
    expect(screen.getByRole('link', { name: 'Service Record' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Subject Profile' })).not.toHaveAttribute('aria-current');

    act(() => io.fire(document.getElementById('profile')!, true));
    expect(screen.getByRole('link', { name: 'Subject Profile' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Service Record' })).not.toHaveAttribute('aria-current');
  });

  it('tolerates a missing IntersectionObserver', () => {
    // @ts-expect-error simulate an environment without IO
    delete globalThis.IntersectionObserver;
    expect(() => renderTabs()).not.toThrow();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
