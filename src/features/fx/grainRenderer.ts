import { Vector2 } from 'three';
import { createFullscreenQuad } from './fullscreenQuad';
import {
  GRAIN_OPACITY,
  VIGNETTE_STRENGTH,
  grainFragmentShader,
  grainVertexShader,
} from './grainShader';
import type { FxRenderer, FxRendererOptions } from './loaders';

const FPS = 24;
const FRAME_MS = 1000 / FPS;

function matches(query: string): boolean {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

/**
 * Draws film grain and vignette into a new canvas inside `host`. Pixel ratio is capped
 * at 1, coarse-pointer devices render at half resolution, frames are capped at 24 fps,
 * and the loop stops while the tab is hidden. Throws (with the canvas already removed)
 * when no WebGL context can be created.
 */
export function startGrainRenderer(host: HTMLElement, { canvasClassName, onLost }: FxRendererOptions): FxRenderer {
  const canvas = document.createElement('canvas');
  canvas.className = canvasClassName;
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
  } catch (err) {
    canvas.remove();
    throw err;
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
  const handleLost = () => {
    pause();
    onLost();
  };

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', handleLost);
  if (!document.hidden) play();

  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      pause();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', handleLost);
      quad.dispose();
      canvas.remove();
    },
  };
}
