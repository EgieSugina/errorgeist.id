import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { LangProvider, useLang } from '../../../src/i18n/LangProvider';
import { LangToggle } from '../../../src/i18n/LangToggle';

const wrapper = ({ children }: { children: ReactNode }) => <LangProvider>{children}</LangProvider>;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('lang');
});
afterEach(() => vi.restoreAllMocks());

describe('LangProvider', () => {
  it('defaults to en and sets <html lang>', () => {
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLang persists to localStorage and updates <html lang>', () => {
    const { result } = renderHook(() => useLang(), { wrapper });
    act(() => result.current.setLang('id'));
    expect(result.current.lang).toBe('id');
    expect(window.localStorage.getItem('egs.lang')).toBe('id');
    expect(document.documentElement.lang).toBe('id');
  });

  it('reads a stored id value', () => {
    window.localStorage.setItem('egs.lang', 'id');
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe('id');
    expect(document.documentElement.lang).toBe('id');
  });

  it('falls back to en for garbage stored values', () => {
    window.localStorage.setItem('egs.lang', 'fr');
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe('en');
  });

  it('still works (defaults to en) when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe('en');
    act(() => result.current.setLang('id'));
    expect(result.current.lang).toBe('id');
  });

  it('t() picks the string for the active language', () => {
    const text = { en: 'File', id: 'Berkas' };
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.t(text)).toBe('File');
    act(() => result.current.setLang('id'));
    expect(result.current.t(text)).toBe('Berkas');
  });
});

describe('LangToggle', () => {
  it('is a group with two pressed-state buttons; clicking ID switches language', async () => {
    render(
      <LangProvider>
        <LangToggle />
      </LangProvider>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    const en = screen.getByRole('button', { name: 'EN' });
    const id = screen.getByRole('button', { name: 'ID' });
    expect(en).toHaveAttribute('aria-pressed', 'true');
    expect(id).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(id);

    expect(id).toHaveAttribute('aria-pressed', 'true');
    expect(en).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.lang).toBe('id');
  });
});
