import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { motion, useReducedMotion } from 'motion/react';
import { colors } from '../../tokens/colors.stylex';
import { fonts } from '../../tokens/fonts.stylex';
import { useLang } from '../../i18n/LangProvider';
import { sections } from '../../content/ui';

/** Height of the sticky tab bar plus breathing room, so anchor jumps land below it. */
const TAB_BAR_CLEARANCE = 72;

const styles = stylex.create({
  section: {
    scrollMarginTop: TAB_BAR_CLEARANCE,
    minWidth: 0,
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    margin: '0 0 18px',
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: 'clamp(1.25rem, 3.2vw, 1.6rem)',
    lineHeight: 1.1,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.ink,
    // Index mark on the left, a fold line running out to the right edge.
    '::before': {
      content: '""',
      flexShrink: 0,
      width: 10,
      height: '0.9em',
      backgroundColor: colors.stamp,
    },
    '::after': {
      content: '""',
      flexGrow: 1,
      height: 1,
      backgroundColor: colors.paperEdge,
    },
  },
});

type Props = {
  /** Anchor id; also picks the heading label from `sections` in content/ui. */
  id: string;
  /** Hide the standard h2 (the section supplies its own heading) and label by this id. */
  labelledBy?: string;
  children: ReactNode;
};

/** One dossier section: anchor target, standard heading, and a single scroll-in reveal. */
export function DossierSection({ id, labelledBy, children }: Props) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  // motion's viewport tracking needs IntersectionObserver; without it, render statically.
  const canObserve = typeof IntersectionObserver !== 'undefined';
  const label = sections.find((s) => s.id === id)?.label;
  const headingId = `${id}-title`;

  const motionProps = !canObserve
    ? {}
    : {
        viewport: { once: true, amount: 0.08 },
        ...(reduce
          ? {
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              transition: { duration: 0.45 },
            }
          : {
              initial: { opacity: 0, y: 18 },
              whileInView: { opacity: 1, y: 0 },
              transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const },
            }),
      };

  return (
    <motion.section
      id={id}
      aria-labelledby={labelledBy ?? headingId}
      {...motionProps}
      {...stylex.props(styles.section)}
    >
      {!labelledBy && label && (
        <h2 id={headingId} {...stylex.props(styles.heading)}>
          {t(label)}
        </h2>
      )}
      {children}
    </motion.section>
  );
}
