import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { motion, useReducedMotion } from 'motion/react';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';

const styles = stylex.create({
  // Outer box carries the layout, focus and tooltip; the inner bar is what animates,
  // so the tooltip never gets squashed by the scaleX sweep.
  root: {
    position: 'relative',
    display: 'inline-block',
    height: '1.05em',
    verticalAlign: 'text-bottom',
    cursor: 'help',
    outline: { default: 'none', ':focus-visible': `2px dashed ${colors.stamp}` },
    outlineOffset: 2,
  },
  bar: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.redaction,
    borderRadius: 1,
    // Marker-pen edge: a faint lighter rim so the bar reads as ink, not a flat box.
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.35)',
    transformOrigin: 'left center',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: 0,
    zIndex: 20,
    padding: '1px 8px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    fontFamily: fonts.terminal,
    fontSize: '1.1rem',
    lineHeight: 1.2,
    letterSpacing: '0.08em',
    color: colors.phosphor,
    backgroundColor: colors.desk,
    border: `1px solid ${colors.phosphorDim}`,
    textShadow: `0 0 6px ${colors.phosphor}`,
  },
});

/** An inline black censor bar. Takes no children: redacted text never exists in source. */
export function Redacted({ chars }: { chars: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(false);
  const canObserve = typeof IntersectionObserver !== 'undefined';

  const motionProps = !canObserve
    ? {}
    : reduce
      ? {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          transition: { duration: 0.4 },
        }
      : {
          initial: { scaleX: 0 },
          whileInView: { scaleX: 1 },
          transition: { duration: 0.55, ease: [0.7, 0, 0.2, 1] as const },
        };

  return (
    <span
      role="img"
      aria-label="redacted"
      tabIndex={0}
      style={{ width: `${chars}ch` }}
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
      onFocus={() => setShown(true)}
      onBlur={() => setShown(false)}
      {...stylex.props(styles.root)}
    >
      <motion.span
        aria-hidden="true"
        viewport={{ once: true, amount: 0.6 }}
        {...motionProps}
        {...stylex.props(styles.bar)}
      />
      {shown && <span {...stylex.props(styles.tooltip)}>[CLASSIFIED]</span>}
    </span>
  );
}
