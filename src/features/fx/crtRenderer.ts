import { Vector2, Vector3 } from 'three';
import { createFullscreenQuad } from './fullscreenQuad';
import { CRT_DESK_RGB, CRT_PHOSPHOR_RGB, crtFragmentShader, crtVertexShader } from './crtShader';
import type { FxRenderer, FxRendererOptions } from './loaders';

/**
 * Draws the CRT power-off shader into a new canvas inside `host`, running `uProgress`
 * 0 -> 1 over `durationMs`. Throws (with the canvas already removed) when no WebGL
 * context can be created; the caller then takes the CSS path.
 */
export function startCrtRenderer(
  host: HTMLElement,
  { canvasClassName, onLost, durationMs }: FxRendererOptions & { durationMs: number },
): FxRenderer {
  // The canvas lives only as long as this renderer, so StrictMode's remount and the
  // context loss in dispose() never leave a dead context on a reused element.
  const canvas = document.createElement('canvas');
  canvas.className = canvasClassName;
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
  } catch (err) {
    canvas.remove();
    throw err;
  }

  let raf = 0;
  const start = performance.now();
  const frame = (now: number) => {
    const elapsed = Math.max(0, now - start);
    uniforms.uProgress.value = Math.min(elapsed / durationMs, 1);
    uniforms.uTime.value = elapsed / 1000;
    quad.render();
    raf = requestAnimationFrame(frame);
  };
  const handleLost = () => {
    cancelAnimationFrame(raf);
    onLost();
  };
  canvas.addEventListener('webglcontextlost', handleLost);
  frame(start);

  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', handleLost);
      quad.dispose();
      canvas.remove();
    },
  };
}
