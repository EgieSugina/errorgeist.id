import { hasWebGL } from '../../lib/webgl';
import { prefersReducedMotion } from '../../lib/reducedMotion';

/**
 * The WebGL renderers are the only fx code that needs three.js, so they are the only part
 * loaded on demand. Mode selection, the CSS fallback and the reduced-motion fade stay in
 * the main bundle, and a visitor who can't (or shouldn't) see WebGL never fetches three.js.
 */

export interface FxRendererOptions {
  /** Class for the canvas the renderer appends to its host. */
  canvasClassName: string;
  /** Called once if the GL context is lost while drawing. */
  onLost: () => void;
}

export interface FxRenderer {
  /** Stops drawing and releases the canvas and GL context. Safe to call more than once. */
  stop(): void;
}

/** True when the WebGL effects should run: motion is allowed and a WebGL context is available. */
export function webglFxEnabled(): boolean {
  return !prefersReducedMotion() && hasWebGL();
}

export const loadCrtRenderer = () => import('./crtRenderer');
export const loadGrainRenderer = () => import('./grainRenderer');
