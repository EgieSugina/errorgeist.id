import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { fonts } from '../../tokens/fonts.stylex';
import { useLang } from '../../i18n/LangProvider';
import { LangToggle } from '../../i18n/LangToggle';
import { profile } from '../../content/profile';
import { sections, ui } from '../../content/ui';
import { DossierSection } from './DossierSection';
import { Paper } from './primitives/Paper';
import { SectionTabs } from './primitives/SectionTabs';
import { Stamp } from './primitives/Stamp';
import { SubjectProfile } from './sections/SubjectProfile';
import { ServiceRecord } from './sections/ServiceRecord';
import { Arsenal } from './sections/Arsenal';
import { Education } from './sections/Education';
import { SecureChannel } from './sections/SecureChannel';

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    overflowX: 'clip',
    color: colors.ink,
    fontFamily: fonts.typewriter,
    backgroundColor: colors.desk,
    // Lamp-lit desk: warm pool of light top-left, falling off to the edges.
    backgroundImage:
      'radial-gradient(ellipse 90% 60% at 25% 0%, rgba(58,50,38,0.55), transparent 70%), radial-gradient(ellipse 70% 50% at 90% 100%, rgba(43,36,26,0.4), transparent 70%)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: colors.desk,
  },
  tabs: { flexGrow: 1, minWidth: 0 },
  toggle: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: { default: 8, '@media (min-width: 640px)': 16 },
    backgroundColor: colors.desk,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: colors.paperEdge,
    boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
  },
  main: {
    display: 'grid',
    gap: 'clamp(56px, 9vw, 96px)',
    width: '100%',
    maxWidth: 1000,
    marginInline: 'auto',
    padding: 'clamp(36px, 6vw, 64px) clamp(16px, 4vw, 40px) 24px',
  },
  pending: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 20,
  },
  pendingText: { margin: 0, fontFamily: fonts.body, color: colors.inkDim },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 1000,
    marginInline: 'auto',
    padding: '28px clamp(16px, 4vw, 40px) 40px',
    fontSize: '0.85rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  endRule: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: 0,
  },
  replay: {
    appearance: 'none',
    padding: '4px 6px',
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: fonts.terminal,
    fontSize: '1.25rem',
    letterSpacing: '0.04em',
    textTransform: 'none',
    color: { default: colors.phosphorDim, ':hover': colors.phosphor, ':focus-visible': colors.phosphor },
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
  },
});

/** Stand-in for Task 6's <Operations />. */
function OperationsPlaceholder() {
  const { t } = useLang();
  return (
    <DossierSection id="operations">
      <Paper>
        <div {...stylex.props(styles.pending)}>
          <Stamp kind="classified" />
          <p {...stylex.props(styles.pendingText)}>{t(ui.operations.pending)}</p>
        </div>
      </Paper>
    </DossierSection>
  );
}

export function DossierPage({ onReplayBoot }: { onReplayBoot: () => void }) {
  const { t } = useLang();
  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.tabs)}>
          <SectionTabs sections={sections} />
        </div>
        <div {...stylex.props(styles.toggle)}>
          <LangToggle />
        </div>
      </header>

      <main {...stylex.props(styles.main)}>
        <SubjectProfile />
        <ServiceRecord />
        <OperationsPlaceholder />
        <Arsenal />
        <Education />
        <SecureChannel />
      </main>

      <footer {...stylex.props(styles.footer)}>
        <p {...stylex.props(styles.endRule)}>
          {t(ui.footer.end)} / {profile.fileNo}
        </p>
        <button type="button" onClick={onReplayBoot} {...stylex.props(styles.replay)}>
          <span aria-hidden="true">[ </span>
          {t(ui.footer.replay)}
          <span aria-hidden="true"> ]</span>
        </button>
      </footer>
    </div>
  );
}
