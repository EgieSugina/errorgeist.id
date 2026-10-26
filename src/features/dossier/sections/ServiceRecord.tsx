import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { experience } from '../../../content/experience';
import { ui } from '../../../content/ui';
import { DossierSection } from '../DossierSection';
import { Paper } from '../primitives/Paper';

const WIDE = '@media (min-width: 640px)';

const styles = stylex.create({
  list: { display: 'grid' },
  entry: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [WIDE]: '9.5rem minmax(0, 1fr)' },
    columnGap: 28,
    rowGap: 8,
    paddingBottom: 22,
    borderTopWidth: { default: '1px', ':first-child': 0 },
    borderTopStyle: 'dashed',
    borderTopColor: colors.paperEdge,
    paddingTop: { default: 22, ':first-child': 4 },
  },
  period: {
    margin: 0,
    fontSize: '0.92rem',
    lineHeight: 1.5,
    letterSpacing: '0.06em',
    color: colors.inkDim,
    display: 'flex',
    flexDirection: { default: 'row', [WIDE]: 'column' },
    flexWrap: 'wrap',
    columnGap: 8,
  },
  periodTo: { color: colors.ink },
  title: {
    margin: 0,
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: 'clamp(1.2rem, 3vw, 1.45rem)',
    lineHeight: 1.2,
    letterSpacing: '0.04em',
    color: colors.ink,
  },
  org: { margin: '4px 0 10px', color: colors.ink },
  clients: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    margin: '0 0 12px',
    fontSize: '0.8rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  // Evidence-tag look for client names.
  client: {
    padding: '1px 8px',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    color: colors.ink,
    backgroundColor: colors.folderTab,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderRadius: 2,
  },
  points: { margin: 0, padding: 0, listStyle: 'none', maxWidth: '68ch' },
  point: {
    position: 'relative',
    paddingLeft: 20,
    marginBottom: 4,
    fontFamily: fonts.body,
    lineHeight: 1.6,
    color: colors.ink,
    '::before': {
      content: '""',
      position: 'absolute',
      left: 2,
      top: '0.68em',
      width: 7,
      height: 7,
      backgroundColor: colors.inkDim,
    },
  },
});

/** "2018-09" -> "Sep 2018" in the current language. */
function formatMonth(ym: string, months: string[]): string {
  const [y, m] = ym.split('-').map(Number);
  return `${months[m - 1]} ${y}`;
}

export function ServiceRecord() {
  const { t } = useLang();
  const months = t(ui.record.months).split(' ');
  const newestFirst = [...experience].sort((a, b) => b.period.from.localeCompare(a.period.from));

  return (
    <DossierSection id="record">
      <Paper>
        <div {...stylex.props(styles.list)}>
          {newestFirst.map((job) => (
            <article key={job.org} {...stylex.props(styles.entry)}>
              <p {...stylex.props(styles.period)}>
                <span>{formatMonth(job.period.from, months)}</span>
                <span aria-hidden="true">–</span>
                <span {...stylex.props(styles.periodTo)}>
                  {job.period.to ? formatMonth(job.period.to, months) : t(ui.record.present)}
                </span>
              </p>
              <div>
                <h3 {...stylex.props(styles.title)}>{t(job.title)}</h3>
                <p {...stylex.props(styles.org)}>{job.org}</p>
                {job.clients.length > 0 && (
                  <p {...stylex.props(styles.clients)}>
                    <span>{t(ui.record.clients)}</span>
                    {job.clients.map((c) => (
                      <span key={c} {...stylex.props(styles.client)}>
                        {c}
                      </span>
                    ))}
                  </p>
                )}
                <ul {...stylex.props(styles.points)}>
                  {job.points.map((p) => (
                    <li key={p.en} {...stylex.props(styles.point)}>
                      {t(p)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Paper>
    </DossierSection>
  );
}
