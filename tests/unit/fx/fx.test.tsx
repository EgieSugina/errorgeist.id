import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasWebGL } from '../../../src/lib/webgl';
import { CRT_LOAD_TIMEOUT_MS, CrtTransition } from '../../../src/features/fx/CrtTransition';
import { GrainBackdrop } from '../../../src/features/fx/GrainBackdrop';
import type { FxRenderer, FxRendererOptions } from '../../../src/features/fx/loaders';

// jsdom has no WebGL. `webgl.forceAvailable` lets a test pretend the probe passed,
// so the real three.js renderer is constructed and fails mid-way (no context).
const webgl = vi.hoisted(() => ({ forceAvailable: false }));
vi.mock('../../../src/lib/webgl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/lib/webgl')>();
  return { ...actual, hasWebGL: () => webgl.forceAvailable || actual.hasWebGL() };
});

// Counts every request for a WebGL renderer chunk (the only modules that pull in three.js).
// A test may swap in its own loader; otherwise the real chunk is imported.
type Load<M> = (() => Promise<M>) | null;
const loads = vi.hoisted(() => ({
  crt: 0,
  grain: 0,
  crtLoad: null as Load<{ startCrtRenderer: unknown }>,
  grainLoad: null as Load<{ startGrainRenderer: unknown }>,
}));
vi.mock('../../../src/features/fx/loaders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/features/fx/loaders')>();
  return {
    ...actual,
    loadCrtRenderer: () => {
      loads.crt++;
      return (loads.crtLoad ?? actual.loadCrtRenderer)();
    },
    loadGrainRenderer: () => {
      loads.grain++;
      return (loads.grainLoad ?? actual.loadGrainRenderer)();
    },
  };
});

/** A stand-in renderer: records its host and options, and lets a test fire a context loss. */
function fakeRenderer() {
  const calls: { host: HTMLElement; opts: FxRendererOptions }[] = [];
  const stop = vi.fn();
  const start = (host: HTMLElement, opts: FxRendererOptions): FxRenderer => {
    calls.push({ host, opts });
    return { stop };
  };
  return { calls, stop, start };
}

/** Let pending dynamic imports (and the state updates after them) settle. */
async function flush() {
  for (let i = 0; i < 10; i++) {
    await act(async () => {
      await new Promise<void>((r) => queueMicrotask(r));
    });
  }
}

// Warm the real renderer chunks so their dynamic import resolves within a flush.
beforeAll(async () => {
  await import('../../../src/features/fx/crtRenderer');
  await import('../../../src/features/fx/grainRenderer');
});

const originalMatchMedia = window.matchMedia;

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

/** Step the clock in small slices like a real browser. */
function advance(ms: number) {
  for (let t = 0; t < ms; t += 50) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  webgl.forceAvailable = false;
  loads.crt = 0;
  loads.grain = 0;
  loads.crtLoad = null;
  loads.grainLoad = null;
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

describe('hasWebGL', () => {
  it('returns false in jsdom without throwing', () => {
    expect(() => hasWebGL()).not.toThrow();
    expect(hasWebGL()).toBe(false);
  });

  it('returns false when getContext throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(hasWebGL()).toBe(false);
  });
});

describe('CrtTransition', () => {
  it('without WebGL renders the CSS fallback and calls onDone exactly once after ~900 ms', () => {
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    const overlay = container.querySelector('[data-fx="crt-css"]');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('canvas')).not.toBeInTheDocument();

    advance(500);
    expect(onDone).not.toHaveBeenCalled();
    advance(500);
    expect(onDone).toHaveBeenCalledTimes(1);
    advance(2000);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(loads.crt, 'renderer chunk requested').toBe(0);
  });

  it('does not call onDone after an early unmount', () => {
    const onDone = vi.fn();
    const { unmount } = render(<CrtTransition onDone={onDone} />);
    advance(300);
    unmount();
    advance(2000);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('falls back to the CSS path when WebGL context creation fails mid-way', async () => {
    webgl.forceAvailable = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    await flush();
    expect(loads.crt).toBe(1);
    expect(container.querySelector('[data-fx="crt-css"]')).toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
    advance(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('with WebGL mounts the lazily loaded renderer and starts the clock once it is running', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    loads.crtLoad = () => Promise.resolve({ startCrtRenderer: r.start });
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    const host = container.querySelector<HTMLElement>('[data-fx="crt-webgl"]');
    expect(host).toBeInTheDocument();
    await flush();
    expect(r.calls).toHaveLength(1);
    expect(r.calls[0].host).toBe(host);
    expect(r.calls[0].opts.canvasClassName).not.toBe('');
    advance(800);
    expect(onDone).not.toHaveBeenCalled();
    advance(200);
    expect(onDone).toHaveBeenCalledTimes(1);
    advance(2000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a context loss mid-flight drops to CSS without restarting or doubling the clock', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    loads.crtLoad = () => Promise.resolve({ startCrtRenderer: r.start });
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    await flush();
    advance(400);
    act(() => r.calls[0].opts.onLost());
    expect(container.querySelector('[data-fx="crt-css"]')).toBeInTheDocument();
    expect(r.stop).toHaveBeenCalled();
    advance(550);
    expect(onDone).toHaveBeenCalledTimes(1);
    advance(2000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a failed renderer chunk drops to CSS and still calls onDone once', async () => {
    webgl.forceAvailable = true;
    loads.crtLoad = () => Promise.reject(new Error('chunk failed'));
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    await flush();
    expect(container.querySelector('[data-fx="crt-css"]')).toBeInTheDocument();
    advance(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a stalled renderer chunk gives up, plays the CSS version and calls onDone once', async () => {
    webgl.forceAvailable = true;
    loads.crtLoad = () => new Promise(() => {});
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    await flush();
    expect(container.querySelector('[data-fx="crt-webgl"]')).toBeInTheDocument();
    advance(CRT_LOAD_TIMEOUT_MS);
    expect(container.querySelector('[data-fx="crt-css"]')).toBeInTheDocument();
    advance(800);
    expect(onDone).not.toHaveBeenCalled();
    advance(200);
    expect(onDone).toHaveBeenCalledTimes(1);
    advance(2000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('unmounting while the renderer runs stops it and never calls onDone', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    loads.crtLoad = () => Promise.resolve({ startCrtRenderer: r.start });
    const onDone = vi.fn();
    const { unmount } = render(<CrtTransition onDone={onDone} />);
    await flush();
    advance(300);
    unmount();
    expect(r.stop).toHaveBeenCalled();
    advance(2000);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('a renderer chunk that arrives after unmount is never started', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    let resolve!: (m: { startCrtRenderer: typeof r.start }) => void;
    loads.crtLoad = () => new Promise((res) => (resolve = res));
    const onDone = vi.fn();
    const { unmount } = render(<CrtTransition onDone={onDone} />);
    unmount();
    resolve({ startCrtRenderer: r.start });
    await flush();
    expect(r.calls).toHaveLength(0);
    advance(3000);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('under reduced motion does a short opacity fade, not the power-off, then calls onDone once', () => {
    setReducedMotion(true);
    webgl.forceAvailable = true;
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    expect(container.querySelector('[data-fx="crt-fade"]')).toBeInTheDocument();
    expect(container.querySelector('[data-fx="crt-css"]')).not.toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
    advance(200);
    expect(onDone).not.toHaveBeenCalled();
    advance(200);
    expect(onDone).toHaveBeenCalledTimes(1);
    advance(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(loads.crt, 'renderer chunk requested').toBe(0);
  });
});

describe('GrainBackdrop', () => {
  it('renders nothing without WebGL and never requests the renderer chunk', async () => {
    const { container } = render(<GrainBackdrop />);
    await flush();
    expect(container).toBeEmptyDOMElement();
    expect(loads.grain).toBe(0);
  });

  it('renders nothing under reduced motion, even with WebGL, and never requests the chunk', async () => {
    setReducedMotion(true);
    webgl.forceAvailable = true;
    const { container } = render(<GrainBackdrop />);
    await flush();
    expect(container).toBeEmptyDOMElement();
    expect(loads.grain).toBe(0);
  });

  it('renders nothing when WebGL context creation fails mid-way', async () => {
    webgl.forceAvailable = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<GrainBackdrop />);
    await flush();
    expect(loads.grain).toBe(1);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the renderer chunk fails to load', async () => {
    webgl.forceAvailable = true;
    loads.grainLoad = () => Promise.reject(new Error('chunk failed'));
    const { container } = render(<GrainBackdrop />);
    await flush();
    expect(container).toBeEmptyDOMElement();
  });

  it('with WebGL mounts the lazily loaded renderer in its host and stops it on unmount', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    loads.grainLoad = () => Promise.resolve({ startGrainRenderer: r.start });
    const { container, unmount } = render(<GrainBackdrop />);
    await flush();
    const host = container.querySelector('[data-fx="grain"]');
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(r.calls).toHaveLength(1);
    expect(r.calls[0].host).toBe(host);
    unmount();
    expect(r.stop).toHaveBeenCalled();
  });

  it('a context loss removes the backdrop', async () => {
    webgl.forceAvailable = true;
    const r = fakeRenderer();
    loads.grainLoad = () => Promise.resolve({ startGrainRenderer: r.start });
    const { container } = render(<GrainBackdrop />);
    await flush();
    act(() => r.calls[0].opts.onLost());
    expect(container).toBeEmptyDOMElement();
  });
});
