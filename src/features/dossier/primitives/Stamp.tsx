import * as stylex from '@stylexjs/stylex';
import { motion, useReducedMotion } from 'motion/react';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';

export type StampKind = 'topSecret' | 'classified' | 'declassified';

// Stamp wording is fixed English by design: it is document furniture, not content.
const LABELS: Record<StampKind, string> = {
  topSecret: 'TOP SECRET',
  classified: 'CLASSIFIED',
  declassified: 'DECLASSIFIED',
};

// Each stamp lands at its own crooked angle, like a hand-pressed rubber stamp.
const ANGLES: Record<StampKind, number> = {
  topSecret: -12,
  classified: -5,
  declassified: 7,
};

const styles = stylex.create({
  stamp: {
    display: 'inline-block',
    padding: '2px 12px 1px',
    fontFamily: fonts.stamp,
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.25,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    color: colors.stamp,
    border: `3px solid ${colors.stamp}`,
    borderRadius: 3,
    // Inner hairline gives the classic double-ruled stamp border. Normal blend: red ink on dark paper.
    boxShadow: `inset 0 0 0 2px transparent, inset 0 0 0 3px ${colors.stamp}`,
    // Worn-ink speckle: an alpha mask of tiled turbulence punches tiny gaps in the print.
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 9 0 0 0 -3.1'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
    WebkitMaskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 9 0 0 0 -3.1'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
    maskSize: '140px 140px',
    WebkitMaskSize: '140px 140px',
  },
});

export function Stamp({ kind }: { kind: StampKind }) {
  const reduce = useReducedMotion();
  // motion's viewport mount calls `new IntersectionObserver` unconditionally; without it, render statically.
  const canObserve = typeof IntersectionObserver !== 'undefined';
  const angle = ANGLES[kind];

  // "Stamp hit": slams down big, overshoots slightly small, settles. Reduced motion: fade only.
  const motionProps = !canObserve
    ? { initial: false as const, animate: { rotate: angle, opacity: 1, scale: 1 } }
    : reduce
    ? {
        initial: { opacity: 0, rotate: angle },
        whileInView: { opacity: 1, rotate: angle },
        transition: { duration: 0.4 },
      }
    : {
        initial: { opacity: 0, scale: 1.6, rotate: angle - 4 },
        whileInView: { opacity: 1, scale: 1, rotate: angle },
        transition: {
          opacity: { duration: 0.12 },
          scale: { type: 'spring' as const, stiffness: 520, damping: 14, mass: 0.8 },
          rotate: { type: 'spring' as const, stiffness: 300, damping: 18 },
        },
      };

  return (
    <motion.span
      {...(canObserve ? { viewport: { once: true, amount: 0.6 } } : {})}
      {...motionProps}
      {...stylex.props(styles.stamp)}
    >
      {LABELS[kind]}
    </motion.span>
  );
}
