import {
  Camera,
  Mesh,
  NoBlending,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  type IUniform,
} from 'three';

export interface FullscreenQuad {
  renderer: WebGLRenderer;
  /** Sizes the drawing buffer (CSS size is left to the canvas styles) and updates `uResolution`. */
  setSize(width: number, height: number): void;
  render(): void;
  /** Releases geometry, material, renderer and the GL context. Safe to call once. */
  dispose(): void;
}

/**
 * A clip-space quad with one ShaderMaterial on `canvas`. Throws when no WebGL context
 * can be created; callers catch that and take their non-WebGL path.
 * `uniforms` must contain `uResolution: { value: Vector2 }`.
 */
export function createFullscreenQuad(
  canvas: HTMLCanvasElement,
  opts: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, IUniform> & { uResolution: IUniform<Vector2> };
    pixelRatio: number;
    powerPreference: WebGLPowerPreference;
  },
): FullscreenQuad {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: opts.powerPreference,
  });
  renderer.setPixelRatio(opts.pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader: opts.vertexShader,
    fragmentShader: opts.fragmentShader,
    uniforms: opts.uniforms,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  scene.add(mesh);
  const camera = new Camera();

  return {
    renderer,
    setSize(width, height) {
      renderer.setSize(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)), false);
      renderer.getDrawingBufferSize(opts.uniforms.uResolution.value);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
