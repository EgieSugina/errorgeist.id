import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { fonts } from '../../tokens/fonts.stylex';
import { useLang } from '../../i18n/LangProvider';
import { bootLines } from '../../content/boot';
import { operationsCount } from '../../content/operations';
import { useTypewriter } from './useTypewriter';

/** Pause after the last character so the finished screen can be read. */
const HOLD_MS = 500;
/** With no typing to watch (reduced motion) the static screen needs longer to read. */
const HOLD_REDUCED_MS = 2500;

const blink = stylex.keyframes({
  '0%, 49%': { opacity: 1 },
  '50%, 100%': { opacity: 0 },
});

const styles = stylex.create({
  screen: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    overflow: 'hidden',
    backgroundColor: '#020a04',
    color: colors.phosphor,
    fontFamily: fonts.terminal,
    textShadow: '0 0 6px rgba(57,255,106,0.6)',
    // Cheap CRT vignette so the glow reads as light, not just coloured text.
    backgroundImage: 'radial-gradient(ellipse at center, rgba(57,255,106,0.07), transparent 75%)',
  },
  scanlines: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 3px)',
  },
  body: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    padding: 'clamp(16px, 5vw, 48px)',
    fontSize: 'clamp(22px, 5.6vw, 32px)',
    lineHeight: 1.2,
    overflowY: 'auto',
  },
  lines: { display: 'flex', flexDirection: 'column', margin: 0, padding: 0, listStyle: 'none' },
  line: {
    margin: 0,
    minHeight: '1.2em',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  dim: { color: colors.phosphorDim, textShadow: 'none' },
  warn: { color: colors.amber, textShadow: '0 0 6px rgba(224,165,38,0.6)' },
  cursor: {
    display: 'inline-block',
    width: '0.5em',
    height: '0.85em',
    marginLeft: 2,
    verticalAlign: 'baseline',
    backgroundColor: colors.phosphor,
    boxShadow: '0 0 6px rgba(57,255,106,0.8)',
    animationName: {
      default: blink,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '1s',
    animationTimingFunction: 'steps(1)',
    animationIterationCount: 'infinite',
  },
  hint: { marginTop: 'auto', paddingTop: 24 },
});

const toneStyle = { normal: null, dim: styles.dim, warn: styles.warn } as const;

export function BootTerminal({ onFinish }: { onFinish: () => void }) {
  const { lang } = useLang();
  const all = useMemo(() => bootLines(lang, operationsCount()), [lang]);
  // The last script line is the skip hint: shown from the start, never typed.
  const typed = all.slice(0, -1);
  const hint = all[all.length - 1]!;
  const { shown, active, done, reduced } = useTypewriter(
    typed.map((l) => l.text),
    1,
  );

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinishRef.current();
  }, []);

  // Skip on any input. Listeners stay until unmount; `finished` makes extras no-ops,
  // and the effect cleanup removes them as soon as App leaves the boot phase.
  useEffect(() => {
    const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Fn']);
    const onKey = (e: KeyboardEvent) => {
      if (MODIFIERS.has(e.key)) return;
      detach();
      finish();
    };
    const onPointer = () => {
      detach();
      finish();
    };
    function detach() {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('touchstart', onPointer);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('touchstart', onPointer);
    return detach;
  }, [finish]);

  // Natural end of the sequence.
  useEffect(() => {
    if (!done) return undefined;
    const id = setTimeout(finish, reduced ? HOLD_REDUCED_MS : HOLD_MS);
    return () => clearTimeout(id);
  }, [done, reduced, finish]);

  return (
    <div {...stylex.props(styles.screen)} role="region" aria-label="Secure terminal">
      <div {...stylex.props(styles.body)}>
        <ul {...stylex.props(styles.lines)}>
          {typed.map((line, i) => {
            const text = shown[i] ?? '';
            if (i > active) return null;
            return (
              <li key={i} {...stylex.props(styles.line, toneStyle[line.tone])}>
                {text}
                {i === active || (done && i === typed.length - 1) ? (
                  <span aria-hidden="true" {...stylex.props(styles.cursor)} />
                ) : null}
              </li>
            );
          })}
        </ul>
        <p {...stylex.props(styles.line, styles.hint, toneStyle[hint.tone])}>{hint.text}</p>
      </div>
      <div aria-hidden="true" {...stylex.props(styles.scanlines)} />
    </div>
  );
}
