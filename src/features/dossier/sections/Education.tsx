import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { education } from '../../../content/education';
import { ui } from '../../../content/ui';
import { DossierSection } from '../DossierSection';
import { Paper } from '../primitives/Paper';

const WIDE = '@media (min-width: 640px)';

const styles = stylex.create({
  // Top padding clears the paper clip biting the sheet's top-left edge.
  list: { margin: 0, padding: '22px 0 0', listStyle: 'none' },
  primary: {
    paddingBottom: 18,
    marginBottom: 14,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
  },
  degree: {
    margin: 0,
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: 'clamp(1.25rem, 3.4vw, 1.6rem)',
    lineHeight: 1.2,
    letterSpacing: '0.03em',
    color: colors.ink,
  },
  school: { margin: '6px 0 2px', color: colors.ink },
  status: {
    margin: 0,
    fontSize: '0.92rem',
    letterSpacing: '0.04em',
    color: colors.inkDim,
  },
  other: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [WIDE]: 'minmax(0, 1fr) minmax(0, 1fr)' },
    columnGap: 24,
    paddingBlock: 8,
    borderTopWidth: { default: '1px', ':nth-child(2)': 0 },
    borderTopStyle: 'dashed',
    borderTopColor: colors.paperEdge,
  },
  thesis: {
    margin: '10px 0 0',
    maxWidth: '68ch',
    fontSize: '0.92rem',
    lineHeight: 1.5,
    color: colors.inkDim,
  },
  thesisLabel: {
    marginRight: 8,
    fontFamily: fonts.stamp,
    fontSize: '0.78rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.ink,
  },
  otherLabel: { color: colors.ink },
  otherDetail: { fontFamily: fonts.body, color: colors.inkDim },
});

export function Education() {
  const { t } = useLang();
  const { primary, others } = education;
  return (
    <DossierSection id="education">
      <Paper clip>
        <ul {...stylex.props(styles.list)}>
          <li {...stylex.props(styles.primary)}>
            <h3 {...stylex.props(styles.degree)}>{t(primary.degree)}</h3>
            <p {...stylex.props(styles.school)}>{primary.school}</p>
            <p {...stylex.props(styles.status)}>{t(primary.status)}</p>
            {primary.thesis && (
              <p {...stylex.props(styles.thesis)}>
                <span {...stylex.props(styles.thesisLabel)}>{t(ui.education.thesis)}</span>
                {t(primary.thesis)}
              </p>
            )}
          </li>
          {others.map((o) => (
            <li key={o.label.en} {...stylex.props(styles.other)}>
              <span {...stylex.props(styles.otherLabel)}>{t(o.label)}</span>
              {o.detail && <span {...stylex.props(styles.otherDetail)}>{t(o.detail)}</span>}
            </li>
          ))}
        </ul>
      </Paper>
    </DossierSection>
  );
}
