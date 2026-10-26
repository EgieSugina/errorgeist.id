import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import { LangProvider } from './i18n/LangProvider';
import { DossierPage } from './features/dossier/DossierPage';
import { BootTerminal } from './features/boot/BootTerminal';
import { readStore, writeStore } from './lib/storage';
import { prefersReducedMotion } from './lib/reducedMotion';
import { colors } from './tokens/colors.stylex';

/**
 * React.lazy that can be fetched ahead of time. Once `preload` has resolved, new instances
 * render the real component directly: React 19 holds a Suspense fallback for ~300 ms even
 * when the chunk is already cached, which would show as a blank gap before the transition.
 * Each instance picks its component once, so it never remounts mid-animation.
 */
function preloadable<P extends object>(load: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | null = null;
  const preload = () =>
    load().then((c) => {
      loaded = c;
      return c;
    });
  const Lazy = lazy(() => preload().then((c) => ({ default: c })));
  function Preloadable(props: P) {
    const [C] = useState<ComponentType<P>>(() => loaded ?? Lazy);
    return <C {...props} />;
  }
  return { Component: Preloadable, preload };
}

// Both effects pull in three.js, so they load as separate chunks.
const crt = preloadable(() => import('./features/fx/CrtTransition').then((m) => m.CrtTransition));
const grain = preloadable(() => import('./features/fx/GrainBackdrop').then((m) => m.GrainBackdrop));
const CrtTransition = crt.Component;
const GrainBackdrop = grain.Component;

type Phase = 'boot' | 'transition' | 'dossier';

const BOOT_SEEN_KEY = 'egs.bootSeen';
/** Last-resort exit if the transition never reports done (chunk stalled on a bad network). */
const TRANSITION_WATCHDOG_MS = 4000;

const styles = stylex.create({
  // Shown while the fx chunk resolves; matches the dark terminal it replaces.
  transitionPending: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    backgroundColor: colors.desk,
  },
});

/** A failed lazy chunk renders `fallback` (and reports once) instead of crashing the app. */
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

function initialPhase(): Phase {
  if (prefersReducedMotion()) return 'dossier';
  return readStore('session', BOOT_SEEN_KEY) === '1' ? 'dossier' : 'boot';
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(initialPhase);

  // Functional updates make each hop fire at most once, however many times
  // a child reports it (rapid keys, a skip racing the natural end).
  const finishBoot = useCallback(() => {
    setPhase((p) => (p === 'boot' ? 'transition' : p));
  }, []);

  const finishTransition = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, '1');
    setPhase((p) => (p === 'transition' ? 'dossier' : p));
  }, []);

  const replayBoot = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, null);
    setPhase('boot');
  }, []);

  // Fetch three.js while the intro types, so the transition starts without a wait.
  // A failed fetch is retried (and caught) by React.lazy and FxBoundary on render.
  useEffect(() => {
    if (phase === 'boot') {
      crt.preload().catch(() => {});
      grain.preload().catch(() => {});
    }
    if (phase !== 'transition') return;
    const id = setTimeout(finishTransition, TRANSITION_WATCHDOG_MS);
    return () => clearTimeout(id);
  }, [phase, finishTransition]);

  const pending = <div aria-hidden="true" {...stylex.props(styles.transitionPending)} />;

  return (
    <LangProvider>
      {phase === 'boot' && <BootTerminal onFinish={finishBoot} />}
      {phase === 'transition' && (
        <FxBoundary fallback={null} onError={finishTransition}>
          <Suspense fallback={pending}>
            <CrtTransition onDone={finishTransition} />
          </Suspense>
        </FxBoundary>
      )}
      {phase === 'dossier' && (
        <>
          <FxBoundary fallback={null}>
            <Suspense fallback={null}>
              <GrainBackdrop />
            </Suspense>
          </FxBoundary>
          <DossierPage onReplayBoot={replayBoot} />
        </>
      )}
    </LangProvider>
  );
}
