import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

// `webgl.forceAvailable` pretends the WebGL probe passed (jsdom has none).
const webgl = vi.hoisted(() => ({ forceAvailable: false }));
vi.mock('../../src/lib/webgl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/webgl')>();
  return { ...actual, hasWebGL: () => webgl.forceAvailable || actual.hasWebGL() };
});

// Counts requests for the WebGL renderer chunks (the only modules that pull in three.js).
// They resolve to inert renderers so no real three.js runs here.
const loads = vi.hoisted(() => ({ crt: 0, grain: 0 }));
vi.mock('../../src/features/fx/loaders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/features/fx/loaders')>();
  const inert = () => ({ stop() {} });
  return {
    ...actual,
    loadCrtRenderer: () => {
      loads.crt++;
      return Promise.resolve({ startCrtRenderer: inert });
    },
    loadGrainRenderer: () => {
      loads.grain++;
      return Promise.resolve({ startGrainRenderer: inert });
    },
  };
});

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

/**
 * React batches state inside one act(), so step the clock in small slices like a real browser.
 * Async act also flushes microtasks, which lets the lazily loaded fx renderers resolve.
 */
async function advance(ms: number) {
  for (let t = 0; t < ms; t += 50) {
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
  }
}

async function skipAndSettle() {
  act(() => {
    fireEvent.keyDown(window, { key: 'x' });
  });
  // The CRT transition runs ~900 ms; stay safely above it.
  await advance(1500);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  window.localStorage.clear();
  window.sessionStorage.clear();
  webgl.forceAvailable = false;
  loads.crt = 0;
  loads.grain = 0;
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
  it('starts at the boot terminal with empty storage, then reaches the dossier after a skip', async () => {
    const { container } = render(<App />);
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    expect(dossierHeading()).not.toBeInTheDocument();

    await skipAndSettle();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(dossierHeading()).toBeInTheDocument();
    expect(window.sessionStorage.getItem('egs.bootSeen')).toBe('1');
  });

  it('reaches the dossier on its own when the boot sequence completes', async () => {
    const { container } = render(<App />);
    await advance(6000);
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

  it('presses during the transition do not restart or double-advance it', async () => {
    const { container } = render(<App />);
    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'y' });
      fireEvent.pointerDown(window);
    });
    await advance(1500);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
  });

  it('starts straight at the dossier when bootSeen is set', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    const { container } = render(<App />);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(screen.queryByText(/SECURE TERMINAL/)).not.toBeInTheDocument();
  });

  it('under reduced motion shows a static boot terminal, then fades to the dossier', async () => {
    setReducedMotion(true);
    const { container } = render(<App />);
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    // Static: the whole script is on screen at once, nothing to type.
    expect(screen.getByText(/MATCH FOUND/)).toBeInTheDocument();
    expect(dossierHeading()).not.toBeInTheDocument();
    await advance(2600);
    expect(container.querySelector('[data-fx="crt-fade"]')).toBeInTheDocument();
    expect(container.querySelector('[data-fx="crt-css"], [data-fx="crt-webgl"]')).not.toBeInTheDocument();
    await advance(400);
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(window.sessionStorage.getItem('egs.bootSeen')).toBe('1');
  });

  it('still boots and reaches the dossier when storage throws', async () => {
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
    await skipAndSettle();
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

  it('replay boot under reduced motion ends in an opacity fade, not the CRT power-off', async () => {
    setReducedMotion(true);
    window.sessionStorage.setItem('egs.bootSeen', '1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /replay boot/i }));
    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });
    await advance(50);
    expect(container.querySelector('[data-fx="crt-fade"]')).toBeInTheDocument();
    expect(container.querySelector('[data-fx="crt-css"], [data-fx="crt-webgl"]')).not.toBeInTheDocument();
    await advance(400);
    expect(container.querySelector('[data-fx^="crt"]')).not.toBeInTheDocument();
    expect(dossierHeading()).toBeInTheDocument();
  });

  it('renders the dossier with StyleX-compiled styles', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    render(<App />);
    const name = screen.getByRole('heading', { level: 1, name: 'Egie Sugina' });
    expect(name.className).not.toBe('');
  });

  it('without WebGL never requests a WebGL renderer chunk, through boot, transition and dossier', async () => {
    const { container } = render(<App />);
    await skipAndSettle();
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(loads).toEqual({ crt: 0, grain: 0 });
  });

  it('under reduced motion never requests a WebGL renderer chunk, even with WebGL and a replay', async () => {
    setReducedMotion(true);
    webgl.forceAvailable = true;
    render(<App />);
    // First visit: static boot, then the fade.
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    await skipAndSettle();
    expect(dossierHeading()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /replay boot/i }));
    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });
    await advance(600);
    expect(dossierHeading()).toBeInTheDocument();
    expect(loads).toEqual({ crt: 0, grain: 0 });
  });

  it('with WebGL fetches both renderer chunks while the boot terminal types', async () => {
    webgl.forceAvailable = true;
    render(<App />);
    await advance(50);
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    expect(loads.crt).toBeGreaterThanOrEqual(1);
    expect(loads.grain).toBeGreaterThanOrEqual(1);
  });

  it('with WebGL still reaches the dossier exactly once', async () => {
    webgl.forceAvailable = true;
    const { container } = render(<App />);
    await skipAndSettle();
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(container.querySelector('[data-fx^="crt"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-fx="grain"]')).toBeInTheDocument();
  });

  it('moves focus to the dossier heading, without scrolling, after the transition', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    render(<App />);
    await skipAndSettle();
    const heading = dossierHeading()!;
    expect(document.activeElement).toBe(heading);
    const call = focus.mock.contexts.findIndex((el) => el === heading);
    expect(call).toBeGreaterThanOrEqual(0);
    expect(focus.mock.calls[call][0]).toEqual({ preventScroll: true });
  });

  it('moves focus to the dossier heading after a replay', async () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /replay boot/i }));
    await skipAndSettle();
    expect(document.activeElement).toBe(dossierHeading());
  });

  it('leaves focus alone on a direct dossier load', () => {
    window.sessionStorage.setItem('egs.bootSeen', '1');
    render(<App />);
    expect(dossierHeading()).toBeInTheDocument();
    expect(document.activeElement).toBe(document.body);
  });
});
