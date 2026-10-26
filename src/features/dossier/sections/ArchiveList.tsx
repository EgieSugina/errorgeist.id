import { useId } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { archive } from '../../../content/operations';
import { ui } from '../../../content/ui';
import { Paper } from '../primitives/Paper';
import { Redacted } from '../primitives/Redacted';

const WIDE = '@media (min-width: 720px)';

const styles = stylex.create({
  title: {
    margin: '0 0 6px',
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: 'clamp(1.15rem, 3vw, 1.35rem)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.ink,
  },
  intro: {
    margin: '0 0 22px',
    maxWidth: '68ch',
    fontFamily: fonts.body,
    lineHeight: 1.6,
    color: colors.inkDim,
  },
  families: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [WIDE]: 'repeat(2, minmax(0, 1fr))' },
    columnGap: 36,
    rowGap: 22,
  },
  family: { minWidth: 0 },
  familyName: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    margin: '0 0 8px',
    paddingBottom: 4,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: '0.95rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.ink,
  },
  count: {
    fontFamily: fonts.typewriter,
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    color: colors.inkDim,
  },
  items: { margin: 0, padding: 0, listStyle: 'none' },
  // A typed ledger line: "OP. ▇▇▇▇▇▇ — description". Phones let it wrap as running text;
  // wider screens hang wrapped lines under the description.
  item: {
    display: { default: 'block', [WIDE]: 'grid' },
    gridTemplateColumns: 'max-content minmax(0, 1fr)',
    alignItems: 'baseline',
    columnGap: 10,
    paddingBlock: 3,
    lineHeight: 1.55,
    color: colors.ink,
  },
  prefix: {
    marginRight: { default: 8, [WIDE]: 0 },
    whiteSpace: 'nowrap',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    color: colors.inkDim,
  },
  desc: { minWidth: 0, fontFamily: fonts.body },
  // Declassified entries carry a real, often long, repo name: it gets its own line above the text.
  itemNamed: { display: 'block', paddingBlock: 4, lineHeight: 1.55, color: colors.ink },
  name: {
    display: 'block',
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    color: colors.ink,
    overflowWrap: 'anywhere',
  },
  descNamed: { display: 'block', minWidth: 0, fontFamily: fonts.body },
  link: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: colors.inkDim,
    textUnderlineOffset: 4,
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: 2,
  },
});

/** Smaller operations grouped by family: client work redacted, personal work named. */
export function ArchiveList() {
  const { t } = useLang();
  const baseId = useId();
  const total = archive.reduce((n, g) => n + g.items.length, 0);

  return (
    <Paper tab={`${t(ui.archive.tab)} // ${total}`}>
      <h3 {...stylex.props(styles.title)}>{t(ui.archive.title)}</h3>
      <p {...stylex.props(styles.intro)}>{t(ui.archive.intro)}</p>
      <div {...stylex.props(styles.families)}>
        {archive.map((g, gi) => {
          const headingId = `${baseId}-family-${gi}`;
          return (
            <div key={g.family.en} {...stylex.props(styles.family)}>
              <h4 id={headingId} {...stylex.props(styles.familyName)}>
                <span>{t(g.family)}</span>
                <span aria-hidden="true" {...stylex.props(styles.count)}>
                  [{String(g.items.length).padStart(2, '0')}]
                </span>
              </h4>
              <ul aria-labelledby={headingId} {...stylex.props(styles.items)}>
                {g.clearance === 'declassified'
                  ? g.items.map((item) => (
                      <li key={item.name} {...stylex.props(styles.itemNamed)}>
                        <span {...stylex.props(styles.name)}>
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...stylex.props(styles.link)}
                            >
                              {item.name}
                            </a>
                          ) : (
                            item.name
                          )}
                        </span>
                        <span {...stylex.props(styles.descNamed)}>{t(item.text)}</span>
                      </li>
                    ))
                  : g.items.map((item) => (
                      <li key={item.en} {...stylex.props(styles.item)}>
                        <span {...stylex.props(styles.prefix)}>
                          OP. <Redacted chars={6} focusable={false} />
                        </span>
                        <span {...stylex.props(styles.desc)}>
                          <span aria-hidden="true">— </span>
                          {t(item)}
                        </span>
                      </li>
                    ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Paper>
  );
}
