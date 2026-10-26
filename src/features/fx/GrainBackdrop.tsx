import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Vector2 } from 'three';
import { hasWebGL } from '../../lib/webgl';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { createFullscreenQuad } from './fullscreenQuad';
import {
  GRAIN_OPACITY,
  VIGNETTE_STRENGTH,
  grainFragmentShader,
  grainVertexShader,
} from './grainShader';

const FPS = 24;
const FRAME_MS = 1000 / FPS;

const styles = stylex.create({
  host: {
    position: 'fixed',
    inset: 0,
    // Above the body background, below every in-flow element of the dossier.
    zIndex: -1,
    pointerEvents: 'none',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
});

function matches(query: string): boolean {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

/**
 * Animated film grain and vignette behind the dossier. Renders nothing under reduced
 * motion, without WebGL, or once the context is lost. Pixel ratio is capped at 1,
 * coarse-pointer devices render at half resolution, frames are capped at 24 fps, and
 * the loop stops while the tab is hidden.
 */
export function GrainBackdrop() {
  const [enabled, setEnabled] = useState(() => !prefersReducedMotion() && hasWebGL());
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!enabled || !host) return;

    const canvas = document.createElement('canvas');
    canvas.className = stylex.props(styles.canvas).className ?? '';
    host.appendChild(canvas);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uGrain: { value: GRAIN_OPACITY },
      uVignette: { value: VIGNETTE_STRENGTH },
    };

    let quad: ReturnType<typeof createFullscreenQuad>;
    try {
      quad = createFullscreenQuad(canvas, {
        vertexShader: grainVertexShader,
        fragmentShader: grainFragmentShader,
        uniforms,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1),
        powerPreference: 'low-power',
      });
    } catch {
      canvas.remove();
      setEnabled(false);
      return;
    }

    const scale = matches('(pointer: coarse)') ? 0.5 : 1;
    const resize = () => quad.setSize(window.innerWidth * scale, window.innerHeight * scale);
    resize();

    let raf = 0;
    let last = -Infinity;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - last;
      if (elapsed < FRAME_MS) return;
      // Carry the remainder so a 60 Hz display averages 24 fps instead of 20.
      last = elapsed > FRAME_MS * 4 ? now : now - (elapsed % FRAME_MS);
      uniforms.uTime.value = now / 1000;
      quad.render();
    };
    const play = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? pause() : play());
    const onLost = () => {
      pause();
      setEnabled(false);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    if (!document.hidden) play();

    return () => {
      pause();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      quad.dispose();
      canvas.remove();
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={hostRef} aria-hidden="true" data-fx="grain" {...stylex.props(styles.host)} />;
}
