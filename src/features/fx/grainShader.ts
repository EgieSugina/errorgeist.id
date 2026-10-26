/**
 * Film grain plus vignette for the desk behind the dossier. One noise value per
 * drawing-buffer pixel, reseeded every frame (the loop runs at 24 fps). Grain is a
 * light layer at `uGrain` alpha (about 0.08) over a black vignette that darkens the
 * edges. Output is premultiplied alpha (NoBlending onto a cleared canvas).
 */

export const GRAIN_OPACITY = 0.08;
export const VIGNETTE_STRENGTH = 0.45;

export const grainVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const grainFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
uniform float uGrain;
uniform float uVignette;

varying vec2 vUv;

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float n = hash13(vec3(floor(gl_FragCoord.xy), floor(uTime * 24.0)));

  vec2 c = vUv - 0.5;
  c.x *= uResolution.x / uResolution.y;
  float vig = smoothstep(0.35, 0.95, length(c)) * uVignette;

  // Grain layer "over" the vignette layer, premultiplied.
  float a = uGrain + vig * (1.0 - uGrain);
  gl_FragColor = vec4(vec3(n * uGrain), a);
}
`;
