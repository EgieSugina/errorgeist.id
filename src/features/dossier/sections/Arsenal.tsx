import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { arsenal } from '../../../content/arsenal';
import { ui } from '../../../content/ui';
import { DossierSection } from '../DossierSection';
import { Paper } from '../primitives/Paper';

const styles = stylex.create({
  intro: {
    margin: '0 0 20px',
    maxWidth: '68ch',
    fontFamily: fonts.body,
    lineHeight: 1.6,
    color: colors.inkDim,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      '@media (min-width: 640px)': 'repeat(auto-fill, minmax(230px, 1fr))',
    },
    gap: { default: 10, '@media (min-width: 640px)': 16 },
  },
  // A kit slot on the quartermaster's sheet: dashed outline, group stencilled across the top.
  kit: {
    minWidth: 0,
    padding: { default: '10px 10px 12px', '@media (min-width: 640px)': '12px 14px 14px' },
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: colors.paperEdge,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  group: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    margin: '0 0 10px',
    paddingBottom: 6,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.ink,
  },
  items: { margin: 0, padding: 0, listStyle: 'none' },
  item: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingBlock: 2,
    lineHeight: 1.5,
    color: colors.ink,
    // Ticked requisition box (drawn, so screen readers do not announce a glyph).
    '::before': {
      content: '""',
      flexShrink: 0,
      width: '0.85em',
      height: '0.85em',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.inkDim,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 5.2 4.2 7.4 8.4 2.4' fill='none' stroke='%23e6dcc4' stroke-width='1.6' stroke-linecap='square'/%3E%3C/svg%3E")`,
      backgroundSize: '100% 100%',
      transform: 'translateY(0.08em)',
    },
  },
});

export function Arsenal() {
  const { t } = useLang();
  return (
    <DossierSection id="arsenal">
      <Paper>
        <p {...stylex.props(styles.intro)}>{t(ui.arsenal.intro)}</p>
        <div {...stylex.props(styles.grid)}>
          {arsenal.map((g) => {
            const headingId = `arsenal-${g.group.en.toLowerCase().replace(/[^a-z]+/g, '-')}`;
            return (
              <div key={g.group.en} {...stylex.props(styles.kit)}>
                <h3 id={headingId} {...stylex.props(styles.group)}>
                  {t(g.group)}
                </h3>
                <ul aria-labelledby={headingId} {...stylex.props(styles.items)}>
                  {g.items.map((item) => (
                    <li key={item} {...stylex.props(styles.item)}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Paper>
    </DossierSection>
  );
}
