import { useCallback, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { operations } from '../../../content/operations';
import type { Operation } from '../../../content/operations';
import { ui } from '../../../content/ui';
import { DossierSection } from '../DossierSection';
import { Stamp } from '../primitives/Stamp';
import { ArchiveList } from './ArchiveList';
import { CaseFile, OpTitle, StackChip, caseLayoutId } from './CaseFile';

/** Stack items shown on a card; the case file lists them all. */
const CARD_STACK = 4;

const styles = stylex.create({
  intro: {
    margin: '0 0 8px',
    maxWidth: '68ch',
    fontFamily: fonts.body,
    lineHeight: 1.6,
    color: colors.inkDim,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
    // Rows leave room for each folder's overhanging tab.
    rowGap: 30,
    columnGap: 20,
    margin: '0 0 clamp(40px, 7vw, 64px)',
    padding: 0,
    listStyle: 'none',
  },
  cell: { display: 'flex', minWidth: 0 },
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flexGrow: 1,
    minWidth: 0,
    marginTop: 18,
    padding: '16px 16px 12px 20px',
    cursor: 'pointer',
    borderRadius: 3,
    boxShadow: {
      default: 'none',
      ':hover': `0 0 0 1px ${colors.inkDim}, 0 14px 30px rgba(0,0,0,0.55)`,
    },
    transform: {
      default: 'none',
      ':hover': { default: 'translateY(-3px)', '@media (prefers-reduced-motion: reduce)': 'none' },
    },
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '180ms',
    transitionTimingFunction: 'ease-out',
  },
  // The folder board itself. It carries the shared layoutId, so it is what grows into the open file.
  folder: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.paper,
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(230,220,196,0.05) 27px, rgba(230,220,196,0.05) 28px), radial-gradient(circle at 30% 0%, rgba(230,220,196,0.07), transparent 60%)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderLeftWidth: '4px',
    borderRadius: 3,
    boxShadow: '0 10px 26px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  spineClassified: { borderLeftColor: colors.stamp },
  spineDeclassified: { borderLeftColor: colors.phosphorDim },
  tab: {
    position: 'absolute',
    top: 0,
    left: 18,
    transform: 'translateY(-100%)',
    padding: '3px 10px 2px',
    backgroundColor: colors.folderTab,
    color: colors.inkDim,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderBottomWidth: 0,
    borderBottomStyle: 'none',
    borderRadius: '4px 4px 0 0',
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    whiteSpace: 'nowrap',
  },
  // Everything printed on the folder sits above the board layer.
  layer: { position: 'relative' },
  meta: {
    margin: 0,
    fontSize: '0.74rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  client: { fontWeight: 400, color: colors.ink },
  kind: {
    margin: 0,
    fontFamily: fonts.body,
    fontSize: '0.95rem',
    lineHeight: 1.5,
    color: colors.inkDim,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  foot: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
    rowGap: 8,
  },
  open: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 2px',
    appearance: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    fontFamily: fonts.typewriter,
    fontSize: '0.82rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    color: { default: colors.inkDim, ':hover': colors.ink, ':focus-visible': colors.ink },
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: 3,
  },
  rule: {
    flexShrink: 0,
    height: 1,
    marginTop: 'auto',
    backgroundImage: `linear-gradient(to right, ${colors.paperEdge} 50%, transparent 50%)`,
    backgroundSize: '8px 1px',
  },
  arrow: { color: colors.stamp, fontSize: '1rem' },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

type CardProps = {
  op: Operation;
  index: number;
  onOpen: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

function CaseCard({ op, index, onOpen, buttonRef }: CardProps) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const classified = op.clearance === 'classified';
  const shown = op.stack.slice(0, CARD_STACK);
  const hidden = op.stack.length - shown.length;

  return (
    // The whole folder is clickable for pointer users; the button inside is the keyboard and
    // screen-reader control, and its click bubbles up to this same handler.
    <article onClick={onOpen} {...stylex.props(styles.card)}>
      <motion.div
        aria-hidden="true"
        layoutId={reduce ? undefined : caseLayoutId(op.id)}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        {...stylex.props(styles.folder, classified ? styles.spineClassified : styles.spineDeclassified)}
      />
      <span aria-hidden="true" {...stylex.props(styles.tab)}>
        OP-{String(index + 1).padStart(2, '0')}
      </span>

      <p {...stylex.props(styles.layer, styles.meta)}>
        {op.client ? (
          <>
            {t(ui.operations.client)}: <strong {...stylex.props(styles.client)}>{op.client}</strong>
          </>
        ) : (
          t(ui.operations.personal)
        )}
      </p>

      <div {...stylex.props(styles.layer)}>
        <OpTitle op={op} as="h3" size="card" />
      </div>
      <p {...stylex.props(styles.layer, styles.kind)}>{t(op.kind)}</p>
      <ul {...stylex.props(styles.layer, styles.chips)}>
        {shown.map((s) => (
          <StackChip key={s} label={s} />
        ))}
        {hidden > 0 && <StackChip more label={t(ui.operations.more).replace('{n}', String(hidden))} />}
      </ul>

      <div aria-hidden="true" {...stylex.props(styles.layer, styles.rule)} />
      <div {...stylex.props(styles.layer, styles.foot)}>
        <button ref={buttonRef} type="button" aria-haspopup="dialog" {...stylex.props(styles.open)}>
          {t(ui.operations.open)}
          <span {...stylex.props(styles.srOnly)}> {op.codename}</span>
          <span aria-hidden="true" {...stylex.props(styles.arrow)}>
            →
          </span>
        </button>
        <Stamp kind={classified ? 'classified' : 'declassified'} size="sm" />
      </div>
    </article>
  );
}

export function Operations() {
  const { t } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const current = operations.find((o) => o.id === openId) ?? null;

  const close = useCallback(() => {
    setOpenId(null);
    // Hand focus back to the card that opened the file.
    if (openId) triggers.current.get(openId)?.focus({ preventScroll: true });
  }, [openId]);

  return (
    <DossierSection id="operations">
      <p {...stylex.props(styles.intro)}>{t(ui.operations.intro)}</p>
      <ul {...stylex.props(styles.grid)}>
        {operations.map((op, i) => (
          <li key={op.id} {...stylex.props(styles.cell)}>
            <CaseCard
              op={op}
              index={i}
              onOpen={() => setOpenId(op.id)}
              buttonRef={(el) => {
                if (el) triggers.current.set(op.id, el);
                else triggers.current.delete(op.id);
              }}
            />
          </li>
        ))}
      </ul>
      <ArchiveList />
      <AnimatePresence>{current && <CaseFile key={current.id} op={current} onClose={close} />}</AnimatePresence>
    </DossierSection>
  );
}
