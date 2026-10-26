/**
 * True when the browser can create a WebGL context. Never throws: a blocked GPU,
 * a hardened browser or jsdom all just report false. The probe context is released
 * straight away so it does not count against the browser's live-context limit.
 */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
