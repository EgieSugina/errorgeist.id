import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasWebGL } from '../../../src/lib/webgl';
import { CrtTransition } from '../../../src/features/fx/CrtTransition';
import { GrainBackdrop } from '../../../src/features/fx/GrainBackdrop';

// jsdom has no WebGL. `webgl.forceAvailable` lets a test pretend the probe passed,
// so the real three.js renderer is constructed and fails mid-way (no context).
const webgl = vi.hoisted(() => ({ forceAvailable: false }));
vi.mock('../../../src/lib/webgl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/lib/webgl')>();
  return { ...actual, hasWebGL: () => webgl.forceAvailable || actual.hasWebGL() };
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
  });

  it('does not call onDone after an early unmount', () => {
    const onDone = vi.fn();
    const { unmount } = render(<CrtTransition onDone={onDone} />);
    advance(300);
    unmount();
    advance(2000);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('falls back to the CSS path when WebGL context creation fails mid-way', () => {
    webgl.forceAvailable = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onDone = vi.fn();
    const { container } = render(<CrtTransition onDone={onDone} />);
    expect(container.querySelector('[data-fx="crt-css"]')).toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
    advance(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
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
  });
});

describe('GrainBackdrop', () => {
  it('renders nothing without WebGL', () => {
    const { container } = render(<GrainBackdrop />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing under reduced motion, even with WebGL', () => {
    setReducedMotion(true);
    webgl.forceAvailable = true;
    const { container } = render(<GrainBackdrop />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when WebGL context creation fails mid-way', () => {
    webgl.forceAvailable = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<GrainBackdrop />);
    expect(container).toBeEmptyDOMElement();
  });
});
