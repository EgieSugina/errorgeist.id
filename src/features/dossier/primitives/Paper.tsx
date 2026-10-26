import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';

// Folder-board browns from the approved mockup; decorative only, not text-on-paper colors.
const FOLDER = '#1c1813';
const FOLDER_EDGE = '#3a3226';
const TAB_FACE = '#2b241a';
const TAB_TEXT = '#a8977a';

const styles = stylex.create({
  folder: {
    position: 'relative',
    // Room above for the tab and clip that overhang the folder edge.
    marginTop: 14,
    padding: 'clamp(10px, 2.4vw, 18px)',
    backgroundColor: FOLDER,
    border: `1px solid ${FOLDER_EDGE}`,
    borderRadius: 3,
    boxShadow: '0 10px 30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
    minWidth: 0,
  },
  sheet: {
    position: 'relative',
    padding: 'clamp(16px, 3.4vw, 28px)',
    backgroundColor: colors.paper,
    // Faint typewritten-ruled lines and an edge-darkening, like an aged sheet.
    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(90,84,72,0.10) 27px, rgba(90,84,72,0.10) 28px), linear-gradient(to right, ${colors.paperEdge}, transparent 6%, transparent 94%, ${colors.paperEdge})`,
    color: colors.ink,
    fontFamily: fonts.typewriter,
    lineHeight: 1.6,
    borderRadius: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
    overflowWrap: 'anywhere',
    minWidth: 0,
  },
  tab: {
    position: 'absolute',
    top: -1,
    right: 24,
    transform: 'translateY(-100%)',
    padding: '4px 12px 3px',
    backgroundColor: TAB_FACE,
    color: TAB_TEXT,
    border: `1px solid ${FOLDER_EDGE}`,
    borderBottom: 'none',
    borderRadius: '4px 4px 0 0',
    fontFamily: fonts.typewriter,
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  clip: {
    position: 'absolute',
    top: -16,
    left: 'clamp(18px, 4vw, 34px)',
    width: 22,
    height: 56,
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(1px 2px 1px rgba(0,0,0,0.55))',
  },
});

type PaperProps = {
  /** Label printed on the folder tab, e.g. "FILE NO. 0718-ES". */
  tab?: string;
  /** Show a paper clip holding the sheet. */
  clip?: boolean;
  children?: ReactNode;
};

/** A manila sheet inside a dark case-file folder, with optional file tab and paper clip. */
export function Paper({ tab, clip = false, children }: PaperProps) {
  return (
    <div {...stylex.props(styles.folder)}>
      {tab && <span {...stylex.props(styles.tab)}>{tab}</span>}
      {clip && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 22 56"
          {...stylex.props(styles.clip)}
        >
          <path
            d="M16 18 V46 a7 7 0 0 1 -14 0 V12 a9 9 0 0 1 18 0 V42 a4 4 0 0 1 -8 0 V18"
            fill="none"
            stroke="#a9adb0"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div {...stylex.props(styles.sheet)}>{children}</div>
    </div>
  );
}
