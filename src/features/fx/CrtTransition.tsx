import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { colors } from '../../tokens/colors.stylex';
import { hasWebGL } from '../../lib/webgl';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { loadCrtRenderer, type FxRenderer } from './loaders';

/** Length of the CRT power-off (shader and CSS fallback alike). */
export const CRT_DURATION_MS = 900;
/** Length of the reduced-motion opacity fade that replaces it. */
export const CRT_REDUCED_MS = 300;
/** How long the WebGL path waits for its renderer chunk before playing the CSS version. */
export const CRT_LOAD_TIMEOUT_MS = 1200;

type Mode = 'webgl' | 'css' | 'fade';

// Beat boundaries shared by the shader and the CSS fallback.
const BEATS = [0, 0.25, 0.6, 0.85, 1];

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    pointerEvents: 'none',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  black: {
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  screen: {
    gridArea: '1 / 1',
    width: '100%',
    height: '100%',
  },
  dot: {
    gridArea: '1 / 1',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundImage:
      'radial-gradient(circle, #fff 0 12%, rgba(205,255,220,0.75) 30%, rgba(57,255,106,0) 70%)',
  },
  fade: {
    backgroundColor: colors.desk,
  },
});

function pickMode(): Mode {
  if (prefersReducedMotion()) return 'fade';
  return hasWebGL() ? 'webgl' : 'css';
}

/**
 * Full-screen CRT power-off between the boot terminal and the dossier. Calls `onDone`
 * exactly once, never after unmount. The WebGL renderer (and three.js with it) loads on
 * demand; its clock starts once it is drawing. A failed, stalled or lost WebGL path drops
 * to the CSS version without restarting a running clock, so the screen can never stay
 * black. Under reduced motion it is a short opacity fade instead.
 */
export function CrtTransition({ onDone }: { onDone: () => void }) {
  const [initialMode] = useState(pickMode);
  const [mode, setMode] = useState(initialMode);
  // One-way latch: the clock starts once, either at mount or when the WebGL path is ready.
  const [running, setRunning] = useState(initialMode !== 'webgl');
  const hostRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // One clock for every path: switching WebGL -> CSS never restarts or doubles it.
  useEffect(() => {
    if (!running) return;
    const ms = initialMode === 'fade' ? CRT_REDUCED_MS : CRT_DURATION_MS;
    const id = setTimeout(() => onDoneRef.current(), ms);
    return () => clearTimeout(id);
  }, [running, initialMode]);

  useEffect(() => {
    const host = hostRef.current;
    if (mode !== 'webgl' || !host) return;

    let active = true;
    let renderer: FxRenderer | null = null;
    const toCss = () => {
      if (!active) return;
      setMode('css');
      setRunning(true);
    };
    const giveUp = setTimeout(toCss, CRT_LOAD_TIMEOUT_MS);

    loadCrtRenderer().then(
      ({ startCrtRenderer }) => {
        if (!active) return;
        clearTimeout(giveUp);
        try {
          renderer = startCrtRenderer(host, {
            canvasClassName: stylex.props(styles.canvas).className ?? '',
            durationMs: CRT_DURATION_MS,
            onLost: toCss,
          });
        } catch {
          toCss();
          return;
        }
        setRunning(true);
      },
      () => {
        clearTimeout(giveUp);
        toCss();
      },
    );

    return () => {
      active = false;
      clearTimeout(giveUp);
      renderer?.stop();
    };
  }, [mode]);

  if (mode === 'fade') {
    return (
      <motion.div
        aria-hidden="true"
        data-fx="crt-fade"
        {...stylex.props(styles.overlay, styles.fade)}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: CRT_REDUCED_MS / 1000, ease: 'linear' }}
      />
    );
  }

  if (mode === 'css') {
    const transition = { duration: CRT_DURATION_MS / 1000, times: BEATS, ease: 'easeIn' as const };
    return (
      <motion.div
        aria-hidden="true"
        data-fx="crt-css"
        {...stylex.props(styles.overlay, styles.black)}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 1, 1, 0] }}
        transition={transition}
      >
        <motion.div
          {...stylex.props(styles.screen)}
          initial={false}
          animate={{
            x: [0, -10, 0, 0, 0],
            scaleY: [1, 1, 0.004, 0.004, 0.004],
            scaleX: [1, 1, 1, 0.004, 0.004],
            backgroundColor: ['#07140b', '#0c2a14', '#e9ffef', '#ffffff', '#ffffff'],
            boxShadow: [
              'inset 0 0 0 0 rgba(255,40,80,0), inset 0 0 0 0 rgba(40,200,255,0)',
              'inset 8px 0 0 0 rgba(255,40,80,0.45), inset -8px 0 0 0 rgba(40,200,255,0.45)',
              'inset 0 0 0 0 rgba(255,40,80,0), inset 0 0 0 0 rgba(40,200,255,0)',
              'inset 0 0 0 0 rgba(255,40,80,0), inset 0 0 0 0 rgba(40,200,255,0)',
              'inset 0 0 0 0 rgba(255,40,80,0), inset 0 0 0 0 rgba(40,200,255,0)',
            ],
          }}
          transition={transition}
        />
        <motion.div
          {...stylex.props(styles.dot)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0, 0.4, 1, 0], scale: [0.6, 0.6, 1.4, 1, 0.3] }}
          transition={transition}
        />
      </motion.div>
    );
  }

  return <div ref={hostRef} aria-hidden="true" data-fx="crt-webgl" {...stylex.props(styles.overlay)} />;
}
