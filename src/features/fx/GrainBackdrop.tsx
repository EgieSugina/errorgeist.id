import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { loadGrainRenderer, webglFxEnabled, type FxRenderer } from './loaders';

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

/**
 * Animated film grain and vignette behind the dossier. Renders nothing (and never fetches
 * the renderer or three.js) under reduced motion or without WebGL; renders nothing once
 * the renderer chunk fails, the context can't be created, or it is lost.
 */
export function GrainBackdrop() {
  const [enabled, setEnabled] = useState(webglFxEnabled);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!enabled || !host) return;

    let active = true;
    let renderer: FxRenderer | null = null;
    const disable = () => {
      if (active) setEnabled(false);
    };

    loadGrainRenderer().then(({ startGrainRenderer }) => {
      if (!active) return;
      try {
        renderer = startGrainRenderer(host, {
          canvasClassName: stylex.props(styles.canvas).className ?? '',
          onLost: disable,
        });
      } catch {
        disable();
      }
    }, disable);

    return () => {
      active = false;
      renderer?.stop();
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={hostRef} aria-hidden="true" data-fx="grain" {...stylex.props(styles.host)} />;
}
