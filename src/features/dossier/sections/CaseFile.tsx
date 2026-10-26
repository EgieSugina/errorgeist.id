import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import type { Operation } from '../../../content/operations';
import { ui } from '../../../content/ui';
import { Redacted } from '../primitives/Redacted';
import { Stamp } from '../primitives/Stamp';

/** Shared by a case card's folder and the open case file, so the folder "opens" into the dialog. */
export const caseLayoutId = (id: string) => `case-file-${id}`;

const WIDE = '@media (min-width: 640px)';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const titleStyles = stylex.create({
  title: {
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    fontFamily: fonts.stamp,
    fontWeight: 500,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  operation: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: '0.9rem',
    lineHeight: 1.3,
    letterSpacing: '0.18em',
    color: colors.inkDim,
  },
  name: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: 10,
    lineHeight: 1.05,
    letterSpacing: '0.06em',
    overflowWrap: 'anywhere',
  },
  nameCard: { fontSize: 'clamp(1.45rem, 5.4vw, 1.7rem)' },
  nameDialog: { fontSize: 'clamp(1.9rem, 7vw, 2.75rem)' },
  label: {
    fontFamily: fonts.typewriter,
    fontSize: '0.8rem',
    letterSpacing: '0.12em',
    textTransform: 'lowercase',
    color: colors.inkDim,
  },
});

/**
 * Operation heading. Classified: "OPERATION ▇▇▇▇▇▇▇" over "codename HIVEMIND".
 * Declassified: the real name only, with no redaction.
 */
export function OpTitle({
  op,
  as: Tag,
  id,
  size,
}: {
  op: Operation;
  as: 'h2' | 'h3';
  id?: string;
  size: 'card' | 'dialog';
}) {
  const nameSize = size === 'card' ? titleStyles.nameCard : titleStyles.nameDialog;
  if (op.clearance === 'declassified') {
    return (
      <Tag id={id} {...stylex.props(titleStyles.title)}>
        <span {...stylex.props(titleStyles.name, nameSize)}>{op.codename}</span>
      </Tag>
    );
  }
  // "OPERATION" and "codename" are fixed document furniture, like the stamp wording.
  return (
    <Tag id={id} {...stylex.props(titleStyles.title)}>
      <span {...stylex.props(titleStyles.operation)}>
        OPERATION <Redacted chars={7} />
      </span>
      <span {...stylex.props(titleStyles.name, nameSize)}>
        <span {...stylex.props(titleStyles.label)}>codename</span> {op.codename}
      </span>
    </Tag>
  );
}

const chipStyles = stylex.create({
  chip: {
    padding: '1px 7px',
    fontFamily: fonts.typewriter,
    fontSize: '0.78rem',
    lineHeight: 1.6,
    letterSpacing: '0.04em',
    color: colors.ink,
    backgroundColor: colors.folderTab,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderRadius: 2,
    whiteSpace: 'nowrap',
  },
  more: {
    color: colors.inkDim,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
});

/** An evidence-tag chip for one piece of the stack. */
export function StackChip({ label, more = false }: { label: string; more?: boolean }) {
  return <li {...stylex.props(chipStyles.chip, more && chipStyles.more)}>{label}</li>;
}

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: { default: 0, [WIDE]: 24 },
  },
  closing: { pointerEvents: 'none' },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(4,5,4,0.82)',
    backdropFilter: 'blur(2px)',
  },
  panel: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: { default: 'none', [WIDE]: 760 },
    // Phones: the whole screen. Wider: as tall as the content, never taller than the viewport.
    height: { default: '100%', [WIDE]: 'auto' },
    maxHeight: '100%',
    color: colors.ink,
    fontFamily: fonts.typewriter,
    outline: 'none',
  },
  folder: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.paper,
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(230,220,196,0.05) 27px, rgba(230,220,196,0.05) 28px), radial-gradient(circle at 30% 0%, rgba(230,220,196,0.07), transparent 60%)',
    borderWidth: { default: 0, [WIDE]: '1px' },
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderRadius: { default: 0, [WIDE]: 3 },
    boxShadow: '0 24px 70px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  content: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexShrink: 0,
    padding: '10px 12px 10px clamp(16px, 4vw, 32px)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.paperEdge,
  },
  barLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  close: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    appearance: 'none',
    margin: 0,
    padding: '6px 10px',
    cursor: 'pointer',
    fontFamily: fonts.typewriter,
    fontSize: '0.8rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: { default: colors.inkDim, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.folderTab },
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderRadius: 2,
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: 2,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    padding: 'clamp(18px, 4vw, 32px)',
    overflowWrap: 'anywhere',
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphorDim}` },
    outlineOffset: -4,
  },
  head: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 22,
  },
  stamp: { paddingTop: 4, paddingRight: 4 },
  meta: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [WIDE]: '8rem minmax(0, 1fr)' },
    columnGap: 20,
    rowGap: { default: 2, [WIDE]: 6 },
    margin: '0 0 24px',
    paddingBlock: 12,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.paperEdge,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
  },
  dt: {
    marginTop: { default: 8, [WIDE]: 0 },
    fontSize: '0.78rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  dd: { margin: 0, minWidth: 0, color: colors.ink },
  block: { marginBottom: 24 },
  sub: {
    margin: '0 0 10px',
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: '0.9rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  summary: {
    margin: 0,
    maxWidth: '68ch',
    fontFamily: fonts.body,
    fontSize: '1.02rem',
    lineHeight: 1.65,
    color: colors.ink,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  notes: { margin: 0, padding: 0, listStyle: 'none', maxWidth: '68ch' },
  note: {
    position: 'relative',
    paddingLeft: 22,
    marginBottom: 6,
    fontFamily: fonts.body,
    lineHeight: 1.6,
    color: colors.ink,
    '::before': {
      content: '""',
      position: 'absolute',
      left: 2,
      top: '0.68em',
      width: 8,
      height: 2,
      backgroundColor: colors.stamp,
    },
  },
  links: { display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0, padding: 0, listStyle: 'none' },
  link: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: colors.inkDim,
    textUnderlineOffset: 4,
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: 2,
  },
  muted: { margin: 0, fontFamily: fonts.body, color: colors.inkDim },
  end: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '8px 0 0',
    fontSize: '0.72rem',
    letterSpacing: '0.2em',
    color: colors.inkDim,
    '::before': { content: '""', flexGrow: 1, height: 1, backgroundColor: colors.paperEdge },
    '::after': { content: '""', flexGrow: 1, height: 1, backgroundColor: colors.paperEdge },
  },
});

/** Lock page scroll while `active`, keeping the scrollbar's width so the page does not shift. */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [active]);
}

type Props = { op: Operation; onClose: () => void };

/** The open case file: a modal dialog with the full brief. Render inside <AnimatePresence>. */
export function CaseFile({ op, onClose }: Props) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const isPresent = useIsPresent();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const classified = op.clearance === 'classified';

  // Once closing starts, the file is no longer a dialog: scroll unlocks, it leaves the
  // accessibility tree and stops taking input, while the folder animates back into its card.
  useScrollLock(isPresent);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape closes; ignored while the file is already animating shut.
  useEffect(() => {
    if (!isPresent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isPresent, onClose]);

  // Keep Tab focus cycling inside the file.
  const trapTab = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const fade = { duration: reduce ? 0.2 : 0.25 };
  // Full motion: the folder grows out of the card (shared layoutId), then the papers fade in.
  // Reduced motion: no movement, the folder and papers only fade.
  const folderMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { layoutId: caseLayoutId(op.id), transition: { type: 'spring' as const, stiffness: 380, damping: 36 } };

  const links = classified ? [] : op.links;

  return createPortal(
    <div inert={!isPresent} {...stylex.props(styles.overlay, !isPresent && styles.closing)}>
      <motion.div
        data-testid="casefile-backdrop"
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        {...stylex.props(styles.backdrop)}
      />
      <div
        ref={panelRef}
        role={isPresent ? 'dialog' : undefined}
        aria-modal={isPresent ? 'true' : undefined}
        aria-labelledby={isPresent ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        {...stylex.props(styles.panel)}
      >
        <motion.div aria-hidden="true" {...folderMotion} {...stylex.props(styles.folder)} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, delay: reduce ? 0 : 0.16 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          {...stylex.props(styles.content)}
        >
          <div {...stylex.props(styles.bar)}>
            <span {...stylex.props(styles.barLabel)}>
              {t(ui.operations.caseFile)}
              {' // '}
              {op.codename}
            </span>
            <button ref={closeRef} type="button" onClick={onClose} {...stylex.props(styles.close)}>
              {t(ui.operations.close)}
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {/* Focusable so keyboard users can scroll a long file even when it holds no links. */}
          <div tabIndex={0} {...stylex.props(styles.scroll)}>
            <div {...stylex.props(styles.head)}>
              <OpTitle op={op} as="h2" id={titleId} size="dialog" />
              <span {...stylex.props(styles.stamp)}>
                <Stamp kind={classified ? 'classified' : 'declassified'} />
              </span>
            </div>

            <dl {...stylex.props(styles.meta)}>
              {op.client ? (
                <>
                  <dt {...stylex.props(styles.dt)}>{t(ui.operations.client)}</dt>
                  <dd {...stylex.props(styles.dd)}>{op.client}</dd>
                </>
              ) : null}
              <dt {...stylex.props(styles.dt)}>{t(ui.operations.kind)}</dt>
              <dd {...stylex.props(styles.dd)}>{t(op.kind)}</dd>
              <dt {...stylex.props(styles.dt)}>{t(ui.operations.role)}</dt>
              <dd {...stylex.props(styles.dd)}>{t(op.role)}</dd>
            </dl>

            <section {...stylex.props(styles.block)}>
              <h3 {...stylex.props(styles.sub)}>{t(ui.operations.summary)}</h3>
              <p {...stylex.props(styles.summary)}>{t(op.summary)}</p>
            </section>

            <section {...stylex.props(styles.block)}>
              <h3 {...stylex.props(styles.sub)}>{t(ui.operations.stack)}</h3>
              <ul {...stylex.props(styles.chips)}>
                {op.stack.map((s) => (
                  <StackChip key={s} label={s} />
                ))}
              </ul>
            </section>

            <section {...stylex.props(styles.block)}>
              <h3 {...stylex.props(styles.sub)}>{t(ui.operations.highlights)}</h3>
              <ul {...stylex.props(styles.notes)}>
                {op.highlights.map((h) => (
                  <li key={h.en} {...stylex.props(styles.note)}>
                    {t(h)}
                  </li>
                ))}
              </ul>
            </section>

            <section {...stylex.props(styles.block)}>
              <h3 {...stylex.props(styles.sub)}>{t(ui.operations.links)}</h3>
              {classified ? (
                // Client work never carries links, whatever the data says.
                <p {...stylex.props(styles.muted)}>{t(ui.operations.linksWithheld)}</p>
              ) : links.length > 0 ? (
                <ul {...stylex.props(styles.links)}>
                  {links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.link)}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p {...stylex.props(styles.muted)}>{t(ui.operations.linksPending)}</p>
              )}
            </section>

            <p {...stylex.props(styles.end)}>{t(ui.operations.end)}</p>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
