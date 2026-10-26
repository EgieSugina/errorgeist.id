import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { LangProvider } from '../../../src/i18n/LangProvider';
import { DossierSection } from '../../../src/features/dossier/DossierSection';

/** IntersectionObserver double that records the options each observer was created with. */
class RecordingIO {
  static instances: RecordingIO[] = [];
  targets: Element[] = [];
  constructor(
    public cb: IntersectionObserverCallback,
    public options: IntersectionObserverInit = {},
  ) {
    RecordingIO.instances.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const originalIO = globalThis.IntersectionObserver;

beforeEach(() => {
  RecordingIO.instances = [];
  globalThis.IntersectionObserver = RecordingIO as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  cleanup();
  globalThis.IntersectionObserver = originalIO;
});

function observerFor(el: Element) {
  return RecordingIO.instances.find((io) => io.targets.includes(el));
}

describe('DossierSection reveal', () => {
  it('reveals on any intersection, so a section taller than the screen can never stay hidden', () => {
    const { container } = render(
      <LangProvider>
        <DossierSection id="operations">
          <p>body</p>
        </DossierSection>
      </LangProvider>,
    );
    const section = container.querySelector('#operations')!;
    const io = observerFor(section);
    expect(io, 'section is observed').toBeDefined();
    // 0 means "any pixel visible". A fraction (e.g. 0.08 of ~7500px) can exceed a phone screen.
    const threshold = io!.options.threshold ?? 0;
    expect(Array.isArray(threshold) ? Math.max(...threshold) : threshold).toBe(0);
  });
});
