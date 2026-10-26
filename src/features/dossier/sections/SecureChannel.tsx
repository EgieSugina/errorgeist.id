import { Fragment } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { profile } from '../../../content/profile';
import { ui } from '../../../content/ui';
import { DossierSection } from '../DossierSection';
import { Redacted } from '../primitives/Redacted';

const WIDE = '@media (min-width: 560px)';

const blink = stylex.keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0 },
  '100%': { opacity: 0 },
});

const styles = stylex.create({
  panel: {
    position: 'relative',
    overflow: 'hidden',
    padding: 'clamp(16px, 3.4vw, 28px)',
    fontFamily: fonts.terminal,
    fontSize: 'clamp(1.2rem, 3.6vw, 1.45rem)',
    lineHeight: 1.3,
    color: colors.phosphor,
    textShadow: '0 0 6px rgba(57,255,106,0.55)',
    backgroundColor: colors.desk,
    // Faint phosphor wash so the black redaction bar still reads against the screen.
    backgroundImage:
      'radial-gradient(ellipse at 50% 0%, rgba(57,255,106,0.09), transparent 70%), linear-gradient(rgba(57,255,106,0.035), rgba(57,255,106,0.035))',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.phosphorDim,
    borderRadius: 4,
    boxShadow: '0 0 0 4px rgba(0,0,0,0.6), 0 0 24px rgba(57,255,106,0.12), inset 0 0 40px rgba(0,0,0,0.6)',
    // Scanlines.
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.28) 2px 3px)',
    },
  },
  dim: { color: colors.phosphorDim, textShadow: 'none' },
  prompt: { margin: '0 0 12px' },
  rows: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [WIDE]: '10ch minmax(0, 1fr)' },
    columnGap: 12,
    rowGap: { default: 2, [WIDE]: 6 },
    margin: '0 0 16px',
  },
  dt: {
    color: colors.phosphorDim,
    textShadow: 'none',
    marginTop: { default: 8, [WIDE]: 0 },
  },
  dd: { margin: 0, minWidth: 0, overflowWrap: 'anywhere' },
  link: {
    color: colors.phosphor,
    textDecorationLine: 'underline',
    textDecorationColor: colors.phosphorDim,
    textUnderlineOffset: 4,
    backgroundColor: { default: 'transparent', ':hover': 'rgba(57,255,106,0.12)' },
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: 2,
  },
  status: { margin: 0, color: colors.phosphorDim, textShadow: 'none' },
  cursor: {
    display: 'inline-block',
    width: '0.55em',
    height: '1em',
    marginLeft: 6,
    verticalAlign: 'text-bottom',
    backgroundColor: colors.phosphor,
    animationName: { default: blink, '@media (prefers-reduced-motion: reduce)': 'none' },
    animationDuration: '1s',
    animationTimingFunction: 'steps(1, end)',
    animationIterationCount: 'infinite',
  },
});

/** "https://www.linkedin.com/in/x/" -> "linkedin.com/in/x" */
function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function SecureChannel() {
  const { t } = useLang();
  return (
    <DossierSection id="contact">
      <div {...stylex.props(styles.panel)}>
        <p {...stylex.props(styles.prompt)}>
          <span {...stylex.props(styles.dim)}>&gt; </span>
          {t(ui.contact.open)}
        </p>
        <dl {...stylex.props(styles.rows)}>
          <dt {...stylex.props(styles.dt)}>{t(ui.contact.email)}</dt>
          <dd {...stylex.props(styles.dd)}>
            <a href={`mailto:${profile.email}`} {...stylex.props(styles.link)}>
              {profile.email}
            </a>
          </dd>
          {profile.links.map((l) => (
            <Fragment key={l.href}>
              <dt {...stylex.props(styles.dt)}>{l.label.toUpperCase()}</dt>
              <dd {...stylex.props(styles.dd)}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.link)}>
                  {displayUrl(l.href)}
                </a>
              </dd>
            </Fragment>
          ))}
          <dt {...stylex.props(styles.dt)}>{t(ui.contact.phone)}</dt>
          <dd {...stylex.props(styles.dd)}>
            <Redacted chars={12} />
          </dd>
        </dl>
        <p {...stylex.props(styles.status)}>
          {t(ui.contact.status)}
          <span aria-hidden="true" {...stylex.props(styles.cursor)} />
        </p>
      </div>
    </DossierSection>
  );
}
