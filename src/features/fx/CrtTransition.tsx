import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { Vector2, Vector3 } from 'three';
import { colors } from '../../tokens/colors.stylex';
import { hasWebGL } from '../../lib/webgl';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { createFullscreenQuad } from './fullscreenQuad';
import { CRT_DESK_RGB, CRT_PHOSPHOR_RGB, crtFragmentShader, crtVertexShader } from './crtShader';

/** Length of the CRT power-off (shader and CSS fallback alike). */
export const CRT_DURATION_MS = 900;
/** Length of the reduced-motion opacity fade that replaces it. */
export const CRT_REDUCED_MS = 300;

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
 * exactly once, never after unmount. WebGL failures (no context, context lost) drop
 * to the CSS version mid-flight without restarting the clock, so the screen can never
 * stay black. Under reduced motion it is a short opacity fade instead.
 */
export function CrtTransition({ onDone }: { onDone: () => void }) {
  const [initialMode] = useState(pickMode);
  const [mode, setMode] = useState(initialMode);
  const hostRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // One clock for every path: switching WebGL -> CSS never restarts or doubles it.
  useEffect(() => {
    const ms = initialMode === 'fade' ? CRT_REDUCED_MS : CRT_DURATION_MS;
    const id = setTimeout(() => onDoneRef.current(), ms);
    return () => clearTimeout(id);
  }, [initialMode]);

  useEffect(() => {
    const host = hostRef.current;
    if (mode !== 'webgl' || !host) return;

    // The canvas lives only as long as this effect, so StrictMode's remount and the
    // context loss in dispose() never leave a dead context on a reused element.
    const canvas = document.createElement('canvas');
    canvas.className = stylex.props(styles.canvas).className ?? '';
    host.appendChild(canvas);

    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uDesk: { value: new Vector3(...CRT_DESK_RGB) },
      uPhosphor: { value: new Vector3(...CRT_PHOSPHOR_RGB) },
    };

    let quad: ReturnType<typeof createFullscreenQuad>;
    try {
      quad = createFullscreenQuad(canvas, {
        vertexShader: crtVertexShader,
        fragmentShader: crtFragmentShader,
        uniforms,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: 'default',
      });
      quad.setSize(window.innerWidth, window.innerHeight);
    } catch {
      canvas.remove();
      setMode('css');
      return;
    }

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = Math.max(0, now - start);
      uniforms.uProgress.value = Math.min(elapsed / CRT_DURATION_MS, 1);
      uniforms.uTime.value = elapsed / 1000;
      quad.render();
      raf = requestAnimationFrame(frame);
    };
    const onLost = () => {
      cancelAnimationFrame(raf);
      setMode('css');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    frame(start);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      quad.dispose();
      canvas.remove();
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
