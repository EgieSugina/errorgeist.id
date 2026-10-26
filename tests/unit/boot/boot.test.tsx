import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LangProvider } from '../../../src/i18n/LangProvider';
import { BootTerminal } from '../../../src/features/boot/BootTerminal';
import { bootLines } from '../../../src/content/boot';
import { operationsCount } from '../../../src/content/operations';

const originalMatchMedia = window.matchMedia;

/** React batches state inside one act(), so step the clock in small slices like a real browser. */
function advance(ms: number) {
  for (let t = 0; t < ms; t += 50) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

function renderBoot(onFinish: () => void) {
  return render(
    <LangProvider>
      <BootTerminal onFinish={onFinish} />
    </LangProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

describe('BootTerminal', () => {
  it('shows the terminal banner and the skip hint straight away', () => {
    renderBoot(() => {});
    expect(screen.getByText(/SECURE TERMINAL/)).toBeInTheDocument();
    expect(screen.getByText('[ press any key to skip ]')).toBeInTheDocument();
  });

  it('localizes the skip hint', () => {
    window.localStorage.setItem('egs.lang', 'id');
    renderBoot(() => {});
    expect(screen.getByText('[ tekan tombol apa saja untuk lewati ]')).toBeInTheDocument();
  });

  it('types the script out and finishes exactly once within 4.5s', () => {
    const onFinish = vi.fn();
    renderBoot(onFinish);
    expect(screen.queryByText(/MATCH FOUND/)).not.toBeInTheDocument();

    advance(3000);
    expect(screen.getByText(/MATCH FOUND/)).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();

    advance(1500);
    expect(onFinish).toHaveBeenCalledTimes(1);

    advance(10_000);
    expect(onFinish).toHaveBeenCalledTimes(1);

    const last = bootLines('en', operationsCount())[8]!.text.trim();
    expect(screen.getByText(last)).toBeInTheDocument();
  });

  it('rapid keydowns plus a pointerdown finish exactly once', () => {
    const onFinish = vi.fn();
    renderBoot(onFinish);
    act(() => {
      fireEvent.keyDown(window, { key: 'a' });
      fireEvent.keyDown(window, { key: 'b' });
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.pointerDown(window);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('touchstart skips', () => {
    const onFinish = vi.fn();
    renderBoot(onFinish);
    act(() => {
      fireEvent.touchStart(window);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('ignores modifier-only keys', () => {
    const onFinish = vi.fn();
    renderBoot(onFinish);
    act(() => {
      fireEvent.keyDown(window, { key: 'Shift' });
      fireEvent.keyDown(window, { key: 'Control' });
      fireEvent.keyDown(window, { key: 'Alt' });
      fireEvent.keyDown(window, { key: 'Meta' });
    });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('removes the listeners and the timers after finishing', () => {
    const onFinish = vi.fn();
    renderBoot(onFinish);
    act(() => {
      fireEvent.keyDown(window, { key: 'a' });
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    act(() => {
      fireEvent.keyDown(window, { key: 'b' });
      fireEvent.pointerDown(window);
      fireEvent.touchStart(window);
    });
    advance(6000);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not finish after unmount', () => {
    const onFinish = vi.fn();
    const { unmount } = renderBoot(onFinish);
    unmount();
    act(() => {
      fireEvent.keyDown(window, { key: 'a' });
      vi.advanceTimersByTime(10_000);
    });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('under reduced motion shows the whole script at once and still finishes', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    const onFinish = vi.fn();
    renderBoot(onFinish);
    expect(screen.getByText(/MATCH FOUND/)).toBeInTheDocument();
    advance(4500);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
