import { Component, useCallback, useEffect, useState, type ReactNode } from 'react';
import { LangProvider } from './i18n/LangProvider';
import { DossierPage } from './features/dossier/DossierPage';
import { BootTerminal } from './features/boot/BootTerminal';
import { CrtTransition } from './features/fx/CrtTransition';
import { GrainBackdrop } from './features/fx/GrainBackdrop';
import { loadCrtRenderer, loadGrainRenderer, webglFxEnabled } from './features/fx/loaders';
import { readStore, writeStore } from './lib/storage';

type Phase = 'boot' | 'transition' | 'dossier';

const BOOT_SEEN_KEY = 'egs.bootSeen';
/** Last-resort exit if the transition never reports done (chunk stalled on a bad network). */
const TRANSITION_WATCHDOG_MS = 4000;

/** A render error in an fx component renders `fallback` (and reports once) instead of crashing the app. */
class FxBoundary extends Component<
  { fallback: ReactNode; onError?: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Reduced motion still gets the boot: BootTerminal renders it static and CrtTransition fades.
function initialPhase(): Phase {
  return readStore('session', BOOT_SEEN_KEY) === '1' ? 'dossier' : 'boot';
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  // Set once the dossier is reached through the transition (first visit or replay), so focus
  // follows the visitor into it. A direct dossier load leaves focus where the browser put it.
  const [focusDossier, setFocusDossier] = useState(false);

  // Functional updates make each hop fire at most once, however many times
  // a child reports it (rapid keys, a skip racing the natural end).
  const finishBoot = useCallback(() => {
    setPhase((p) => (p === 'boot' ? 'transition' : p));
  }, []);

  const finishTransition = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, '1');
    setPhase((p) => (p === 'transition' ? 'dossier' : p));
    setFocusDossier(true);
  }, []);

  const replayBoot = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, null);
    setPhase('boot');
  }, []);

  // Fetch the WebGL renderers (and three.js) while the intro types, so the transition starts
  // without a wait. Only when they will run: reduced motion or no WebGL never downloads them.
  // A failed fetch is retried by the effect that needs it, which falls back on failure.
  useEffect(() => {
    if (phase === 'boot' && webglFxEnabled()) {
      loadCrtRenderer().catch(() => {});
      loadGrainRenderer().catch(() => {});
    }
    if (phase !== 'transition') return;
    const id = setTimeout(finishTransition, TRANSITION_WATCHDOG_MS);
    return () => clearTimeout(id);
  }, [phase, finishTransition]);

  return (
    <LangProvider>
      {phase === 'boot' && <BootTerminal onFinish={finishBoot} />}
      {phase === 'transition' && (
        <FxBoundary fallback={null} onError={finishTransition}>
          <CrtTransition onDone={finishTransition} />
        </FxBoundary>
      )}
      {phase === 'dossier' && (
        <>
          <FxBoundary fallback={null}>
            <GrainBackdrop />
          </FxBoundary>
          <DossierPage onReplayBoot={replayBoot} focusOnMount={focusDossier} />
        </>
      )}
    </LangProvider>
  );
}
