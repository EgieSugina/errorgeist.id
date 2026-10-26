import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

const originalMatchMedia = window.matchMedia;
const originalIO = globalThis.IntersectionObserver;

class MockIO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

const dossierHeading = () => screen.queryByRole('heading', { level: 1, name: 'Egie Sugina' });

/** React batches state inside one act(), so step the clock in small slices like a real browser. */
function advance(ms: number) {
  for (let t = 0; t < ms; t += 50) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

function skipAndSettle() {
  act(() => {
    fireEvent.keyDown(window, { key: 'x' });
  });
  // Task 8 swaps the transition for ~900 ms; stay safely above both.
  advance(1500);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  window.localStorage.clear();
  window.sessionStorage.clear();
  globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  globalThis.IntersectionObserver = originalIO;
});

describe('App phase machine', () => {
  it('starts at the boot terminal with empty storage, then reaches the dossier after a skip', () => {
    const { container } = render(<App />);
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    expect(dossierHeading()).not.toBeInTheDocument();

    skipAndSettle();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(dossierHeading()).toBeInTheDocument();
    expect(window.sessionStorage.getItem('egs.bootSeen')).toBe('1');
  });

  it('reaches the dossier on its own when the boot sequence completes', () => {
    const { container } = render(<App />);
    advance(6000);
    expect(container.querySelector('#profile')).toBeInTheDocument();
  });

  it('does not write bootSeen until the transition is done', () => {
    render(<App />);
    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });
    expect(window.sessionStorage.getItem('egs.bootSeen')).toBeNull();
    expect(dossierHeading()).not.toBeInTheDocument();
  });

  it('presses during the transition do not restart or double-advance it', () => {
    const { container } = render(<App />);
    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'y' });
      fireEvent.pointerDown(window);
    });
    advance(1500);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
  });

  it('starts straight at the dossier when bootSeen is set', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    const { container } = render(<App />);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
  });

  it('starts straight at the dossier under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<App />);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
  });

  it('still boots and reaches the dossier when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { container } = render(<App />);
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    skipAndSettle();
    expect(container.querySelector('#profile')).toBeInTheDocument();
  });

  it('replay boot returns to the terminal and clears bootSeen', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /replay boot/i }));
    expect(window.sessionStorage.getItem('egs.bootSeen')).toBeNull();
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    expect(dossierHeading()).not.toBeInTheDocument();
  });

  it('renders the dossier with StyleX-compiled styles', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    render(<App />);
    const name = screen.getByRole('heading', { level: 1, name: 'Egie Sugina' });
    expect(name.className).not.toBe('');
  });
});
