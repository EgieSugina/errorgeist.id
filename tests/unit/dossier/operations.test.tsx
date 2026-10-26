import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider } from '../../../src/i18n/LangProvider';
import { archive, operations } from '../../../src/content/operations';
import { Operations } from '../../../src/features/dossier/sections/Operations';
import { CaseFile } from '../../../src/features/dossier/sections/CaseFile';
import { ArchiveList } from '../../../src/features/dossier/sections/ArchiveList';

function renderEn(ui: ReactElement) {
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

function setReducedMotion(on: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: on && query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

const originalIO = globalThis.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  globalThis.IntersectionObserver = originalIO;
  window.matchMedia = originalMatchMedia;
  document.body.style.overflow = '';
});

/** The card's open-file button for an operation. */
function cardButton(codename: string) {
  return screen.getByRole('button', { name: new RegExp(codename.replace(/\./g, '\\.')) });
}

describe('Operations cards', () => {
  it('renders 8 cards: 6 CLASSIFIED and 2 DECLASSIFIED', () => {
    renderEn(<Operations />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(8);
    const stamps = cards.map((c) =>
      within(c).queryByText('DECLASSIFIED') ? 'declassified' : within(c).queryByText('CLASSIFIED') ? 'classified' : null,
    );
    expect(stamps.filter((s) => s === 'classified')).toHaveLength(6);
    expect(stamps.filter((s) => s === 'declassified')).toHaveLength(2);
  });

  it('classified cards show OPERATION + redaction, codename, client, kind and the first 4 stack chips', () => {
    renderEn(<Operations />);
    const op = operations.find((o) => o.id === 'hivemind')!;
    const card = cardButton('HIVEMIND').closest('article')!;
    const heading = within(card).getByRole('heading', { level: 3 });
    expect(heading.textContent).toContain('OPERATION');
    expect(heading.textContent).toContain('HIVEMIND');
    expect(within(heading).getByRole('img', { name: 'redacted' })).toBeInTheDocument();
    expect(card.textContent).toMatch(/CLIENT:\s*TELKOMSEL/);
    expect(card.textContent).toContain(op.kind.en);
    for (const tech of op.stack.slice(0, 4)) expect(within(card).getByText(tech)).toBeInTheDocument();
    expect(within(card).queryByText(op.stack[4])).toBeNull();
  });

  it.each(['S.P.E.C.T.R.E', 'TSUKIMI'])('%s card is titled by its real name with no redaction in the heading', (name) => {
    renderEn(<Operations />);
    const card = cardButton(name).closest('article')!;
    const heading = within(card).getByRole('heading', { level: 3 });
    expect(heading.textContent).toContain(name);
    expect(within(heading).queryByRole('img', { name: 'redacted' })).toBeNull();
    expect(within(card).getByText('DECLASSIFIED')).toBeInTheDocument();
    expect(card.textContent).not.toContain('TELKOMSEL');
  });

  it('every card has a button whose accessible name includes the codename', () => {
    renderEn(<Operations />);
    for (const op of operations) expect(cardButton(op.codename)).toBeInTheDocument();
  });
});

describe('CaseFile dialog', () => {
  it('opens from the HIVEMIND card, closes on Escape, and returns focus to the card', async () => {
    const user = userEvent.setup();
    renderEn(<Operations />);
    const card = cardButton('HIVEMIND');
    await user.click(card);

    const dialog = screen.getByRole('dialog', { name: /HIVEMIND/ });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(card);
    expect(document.body.style.overflow).toBe('');
    // While the folder animates back into its card, the leftover overlay takes no input.
    // (jsdom never finishes motion's shared-layout exit, so it may still be in the DOM here.)
    const leftover = document.querySelector('[data-testid="casefile-backdrop"]');
    if (leftover) expect(leftover.parentElement).toHaveAttribute('inert');
  });

  it('closes on a backdrop click and from the close button', async () => {
    const user = userEvent.setup();
    renderEn(<Operations />);

    await user.click(cardButton('ORACLE'));
    await user.click(screen.getByTestId('casefile-backdrop'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(cardButton('ORACLE'));

    await user.click(cardButton('TSUKIMI'));
    const dialog = screen.getByRole('dialog', { name: /TSUKIMI/ });
    await user.click(within(dialog).getByRole('button', { name: /close file/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(cardButton('TSUKIMI'));
  });

  it('a click inside the panel does not close it', async () => {
    const user = userEvent.setup();
    renderEn(<Operations />);
    await user.click(cardButton('COURIER'));
    const dialog = screen.getByRole('dialog', { name: /COURIER/ });
    await user.click(within(dialog).getByRole('heading', { level: 2 }));
    expect(screen.getByRole('dialog', { name: /COURIER/ })).toBeInTheDocument();
  });

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    renderEn(<Operations />);
    await user.click(cardButton('FIBERLINE'));
    const dialog = screen.getByRole('dialog', { name: /FIBERLINE/ });
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('shows summary, role, full stack and highlights; a classified op has no <a>', () => {
    const op = operations.find((o) => o.id === 'crowdwatch')!;
    renderEn(<CaseFile op={op} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /CROWDWATCH/ });
    expect(dialog.textContent).toContain(op.summary.en);
    expect(dialog.textContent).toContain(op.role.en);
    for (const tech of op.stack) expect(within(dialog).getByText(tech)).toBeInTheDocument();
    for (const h of op.highlights) expect(within(dialog).getByText(h.en)).toBeInTheDocument();
    expect(dialog.querySelectorAll('a')).toHaveLength(0);
  });

  it('every classified dialog is link-free even if links were added to the data', () => {
    for (const base of operations.filter((o) => o.clearance === 'classified')) {
      const op = { ...base, links: [{ label: 'demo', href: 'https://example.com' }] };
      renderEn(<CaseFile op={op} onClose={() => {}} />);
      expect(screen.getByRole('dialog').querySelectorAll('a')).toHaveLength(0);
      cleanup();
    }
  });

  it('a declassified op renders its links, opening safely in a new tab', () => {
    const base = operations.find((o) => o.id === 'spectre')!;
    const op = { ...base, links: [{ label: 'repo', href: 'https://example.com/repo' }] };
    renderEn(<CaseFile op={op} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /S\.P\.E\.C\.T\.R\.E/ });
    const link = within(dialog).getByRole('link', { name: /repo/ });
    expect(link).toHaveAttribute('href', 'https://example.com/repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(dialog).queryByRole('img', { name: 'redacted' })).toBeNull();
  });

  // Smoke test only: motion caches the reduced-motion media query per module, so jsdom cannot
  // flip it per test. The reduced-motion path is checked in a real browser.
  it('opens and closes with IntersectionObserver present (reduced-motion smoke)', async () => {
    globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    setReducedMotion(true);
    const user = userEvent.setup();
    renderEn(<Operations />);
    const card = cardButton('ARMORY');
    await user.click(card);
    expect(screen.getByRole('dialog', { name: /ARMORY/ })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(card);
  });
});

describe('ArchiveList', () => {
  it('renders every family with its items, each prefixed OP. and a redaction', () => {
    renderEn(<ArchiveList />);
    let total = 0;
    for (const g of archive) {
      const list = screen.getByRole('list', { name: g.family.en });
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(g.items.length);
      items.forEach((li, i) => {
        expect(li.textContent).toMatch(/^OP\./);
        expect(within(li).getByRole('img', { name: 'redacted' })).toBeInTheDocument();
        expect(li.textContent).toContain(g.items[i].en);
      });
      total += items.length;
    }
    expect(total).toBe(archive.reduce((n, g) => n + g.items.length, 0));
  });
});
