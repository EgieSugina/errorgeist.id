/**
 * CRT power-off on a full-screen quad. `uProgress` runs 0 -> 1 over the transition:
 *   0.00-0.25  RGB split, line tearing and noise over a garbled phosphor screen
 *   0.25-0.60  vertical collapse to a bright horizontal line (log-scale, so it accelerates)
 *   0.60-0.85  horizontal collapse of that line to a point
 *   0.85-1.00  everything fades to transparent, revealing what is underneath
 * Output is premultiplied alpha (the material uses NoBlending onto a cleared canvas).
 */

/** Same values as `colors.desk` / `colors.phosphor` (StyleX vars are CSS refs at runtime). */
export const CRT_DESK_RGB: [number, number, number] = [0x0b / 255, 0x0d / 255, 0x0c / 255];
export const CRT_PHOSPHOR_RGB: [number, number, number] = [0x39 / 255, 0xff / 255, 0x6a / 255];

export const crtVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // The quad is already in clip space; no camera transform.
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const crtFragmentShader = /* glsl */ `
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uDesk;
uniform vec3 uPhosphor;

varying vec2 vUv;

// Sine-free hash (stable on mediump mobile GPUs).
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// The terminal face as it dies: dark phosphor, scanlines, and garbled glyph blocks
// whose density follows the glitch envelope g.
vec3 screenFace(vec2 uv, float g, float frame) {
  vec2 cell = floor(uv * vec2(72.0, 28.0));
  float row = hash12(vec2(cell.y, frame));
  float glyph = step(0.62, hash12(cell + frame)) * step(0.35, row) * step(uv.x, 0.15 + 0.8 * row);
  float scan = 0.82 + 0.18 * sin(uv.y * uResolution.y * 3.14159);
  vec3 col = uDesk + uPhosphor * 0.05 * scan;
  col += uPhosphor * glyph * 0.55 * g * scan;
  return col;
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float frame = floor(uTime * 30.0);

  // Beat 1: glitch envelope rises and settles inside 0-0.25.
  float g = sin(3.14159 * clamp(p / 0.25, 0.0, 1.0));
  float band = floor(vUv.y * 24.0);
  float tear = (hash12(vec2(band, frame)) - 0.5) * step(0.7, hash12(vec2(band + 11.0, frame)));
  vec2 uv = vUv + vec2(tear * 0.08 * g, 0.0);
  float split = 0.014 * g;
  vec3 face = vec3(
    screenFace(uv + vec2(split, 0.0), g, frame).r,
    screenFace(uv, g, frame).g,
    screenFace(uv - vec2(split, 0.0), g, frame).b
  );
  face += (hash12(gl_FragCoord.xy + frame) - 0.5) * 0.18 * g;

  // Beats 2 and 3: the lit rectangle's half-extent shrinks geometrically to ~1px.
  float v = smoothstep(0.25, 0.6, p);
  float h = smoothstep(0.6, 0.85, p);
  vec2 halfSize = vec2(
    exp(mix(log(0.5 * uResolution.x), log(1.5), h)),
    exp(mix(log(0.5 * uResolution.y), log(1.0), v))
  );
  vec2 d = abs((vUv - 0.5) * uResolution);
  float inside = (1.0 - smoothstep(halfSize.x - 0.75, halfSize.x + 0.75, d.x))
               * (1.0 - smoothstep(halfSize.y - 0.75, halfSize.y + 0.75, d.y));

  // Energy concentrates as it collapses: the face heats to a green-white, with bloom.
  vec3 hot = mix(vec3(1.0), uPhosphor, 0.2);
  vec3 lit = mix(face, hot * 1.4, v);
  float dist = length(max(d - halfSize, 0.0));
  float glow = exp(-dist / 14.0) * v * 0.8;
  vec3 rgb = lit * inside + hot * glow * (1.0 - inside);

  // Beat 4: fade the whole overlay out.
  float alpha = 1.0 - smoothstep(0.85, 1.0, p);
  gl_FragColor = vec4(min(rgb, vec3(1.0)) * alpha, alpha);
}
`;
