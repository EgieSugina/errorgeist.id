import * as stylex from '@stylexjs/stylex';
import { useReducedMotion } from 'motion/react';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import { profile } from '../../../content/profile';
import { ui } from '../../../content/ui';
import { CAREER_START, yearsSince } from '../../../lib/yearsSince';
import subjectPhoto from '../../../assets/subject-id.webp';
import { DossierSection } from '../DossierSection';
import { Paper } from '../primitives/Paper';
import { Redacted } from '../primitives/Redacted';
import { Stamp } from '../primitives/Stamp';

const PHOTO_W = 176;
const PHOTO_H = 220;
const DESKTOP = '@media (min-width: 720px)';
const PHOTO_FILTER = 'saturate(.7) contrast(1.05)';

// Hover glitch: a few frames of jitter with red/cyan fringes, then back to rest.
const glitch = stylex.keyframes({
  '0%': { transform: 'translate(0, 0)', filter: PHOTO_FILTER },
  '18%': {
    transform: 'translate(-2px, 1px)',
    filter: `${PHOTO_FILTER} drop-shadow(3px 0 0 rgba(255,0,64,.6)) drop-shadow(-3px 0 0 rgba(0,240,255,.5))`,
  },
  '36%': {
    transform: 'translate(2px, -1px)',
    filter: `${PHOTO_FILTER} drop-shadow(-2px 0 0 rgba(255,0,64,.6)) drop-shadow(2px 0 0 rgba(0,240,255,.5))`,
  },
  '54%': { transform: 'translate(-1px, 0)', filter: PHOTO_FILTER },
  '72%': {
    transform: 'translate(1px, 1px)',
    filter: `${PHOTO_FILTER} drop-shadow(2px 0 0 rgba(255,0,64,.5)) drop-shadow(-2px 0 0 rgba(0,240,255,.4))`,
  },
  '100%': { transform: 'translate(0, 0)', filter: PHOTO_FILTER },
});

const styles = stylex.create({
  sheet: {
    display: 'grid',
    gridTemplateColumns: { default: 'auto minmax(0, 1fr)', [DESKTOP]: 'auto minmax(0, 1fr) auto' },
    gridTemplateAreas: {
      default: '"photo stamp" "ident ident"',
      [DESKTOP]: '"photo ident stamp"',
    },
    columnGap: { default: 16, [DESKTOP]: 32 },
    rowGap: 20,
    alignItems: 'start',
  },
  photoFrame: {
    gridArea: 'photo',
    margin: 0,
    // Pinned instant photo: cream border, slight tilt, cast shadow. The folder clip bites its top edge.
    padding: 5,
    backgroundColor: colors.ink,
    transform: 'rotate(-1.5deg)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
    width: { default: 'clamp(116px, 34vw, 150px)', [DESKTOP]: PHOTO_W + 10 },
    marginTop: 8,
  },
  photo: {
    display: 'block',
    width: '100%',
    height: 'auto',
    aspectRatio: `${PHOTO_W} / ${PHOTO_H}`,
    objectFit: 'cover',
    filter: PHOTO_FILTER,
  },
  photoGlitch: {
    animationName: { default: null, ':hover': glitch },
    animationDuration: '420ms',
    animationTimingFunction: 'steps(1, end)',
    animationIterationCount: 'infinite',
  },
  stamp: {
    gridArea: 'stamp',
    justifySelf: 'end',
    alignSelf: { default: 'center', [DESKTOP]: 'start' },
    marginTop: { default: 0, [DESKTOP]: 6 },
    marginRight: { default: 0, [DESKTOP]: 8 },
    // Smaller press on phones so the rotated stamp never crowds the photo.
    transform: { default: 'scale(0.78)', [DESKTOP]: 'none' },
    transformOrigin: 'right center',
  },
  ident: { gridArea: 'ident', minWidth: 0 },
  subjectLabel: {
    margin: 0,
    fontSize: '0.85rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  name: {
    margin: '2px 0 6px',
    fontFamily: fonts.stamp,
    fontWeight: 700,
    fontSize: 'clamp(2.4rem, 8vw, 4.2rem)',
    lineHeight: 0.95,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    color: colors.ink,
  },
  role: {
    margin: '0 0 18px',
    fontSize: { default: '1rem', [DESKTOP]: '1.1rem' },
    lineHeight: 1.4,
    color: colors.ink,
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: 'max-content minmax(0, 1fr)',
    columnGap: 14,
    rowGap: 4,
    margin: 0,
    paddingTop: 12,
    borderTopWidth: '1px',
    borderTopStyle: 'dashed',
    borderTopColor: colors.paperEdge,
  },
  dt: {
    fontSize: '0.8rem',
    lineHeight: 1.9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  dd: { margin: 0, lineHeight: 1.6, minWidth: 0 },
  dim: { color: colors.inkDim },
  link: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: colors.inkDim,
    textUnderlineOffset: 3,
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.ink}` },
    outlineOffset: 2,
  },
  assessment: {
    marginTop: 28,
    paddingTop: 18,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.paperEdge,
  },
  assessmentTitle: {
    margin: '0 0 10px',
    fontFamily: fonts.stamp,
    fontWeight: 500,
    fontSize: '0.95rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: colors.inkDim,
  },
  summary: {
    margin: '0 0 12px',
    maxWidth: '68ch',
    fontFamily: fonts.body,
    fontSize: '1rem',
    lineHeight: 1.7,
    color: colors.ink,
  },
  note: {
    display: 'block',
    width: 'fit-content',
    maxWidth: '100%',
    margin: '18px 0 0 auto',
    padding: '0 4px 2px',
    fontSize: '1.05rem',
    color: colors.amber,
    transform: 'rotate(-2.5deg)',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.amber,
    borderBottomLeftRadius: '60% 4px',
    borderBottomRightRadius: '40% 6px',
  },
});

export function SubjectProfile() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const years = yearsSince(CAREER_START, new Date());

  return (
    <DossierSection id="profile" labelledBy="profile-name">
      <Paper tab={`FILE NO. ${profile.fileNo}`} clip>
        <div {...stylex.props(styles.sheet)}>
          <figure {...stylex.props(styles.photoFrame)}>
            <img
              src={subjectPhoto}
              alt={t(ui.profile.photoAlt)}
              width={PHOTO_W}
              height={PHOTO_H}
              loading="eager"
              decoding="async"
              {...stylex.props(styles.photo, !reduce && styles.photoGlitch)}
            />
          </figure>

          <div {...stylex.props(styles.stamp)}>
            <Stamp kind="topSecret" />
          </div>

          <div {...stylex.props(styles.ident)}>
            <p {...stylex.props(styles.subjectLabel)}>{t(ui.profile.subject)}</p>
            <h1 id="profile-name" {...stylex.props(styles.name)}>
              {profile.name}
            </h1>
            <p {...stylex.props(styles.role)}>{t(profile.role)}</p>

            <dl {...stylex.props(styles.fields)}>
              <dt {...stylex.props(styles.dt)}>{t(ui.profile.active)}</dt>
              <dd {...stylex.props(styles.dd)}>
                {t(ui.profile.years).replace('{n}', String(years))}{' '}
                <span {...stylex.props(styles.dim)}>({t(ui.profile.since)})</span>
              </dd>

              <dt {...stylex.props(styles.dt)}>{t(ui.profile.location)}</dt>
              <dd {...stylex.props(styles.dd)}>{t(profile.location)}</dd>

              <dt {...stylex.props(styles.dt)}>{t(ui.profile.address)}</dt>
              <dd {...stylex.props(styles.dd)}>
                <Redacted chars={18} />
              </dd>

              <dt {...stylex.props(styles.dt)}>{t(ui.profile.phone)}</dt>
              <dd {...stylex.props(styles.dd)}>
                <Redacted chars={12} />
              </dd>

              <dt {...stylex.props(styles.dt)}>{t(ui.profile.email)}</dt>
              <dd {...stylex.props(styles.dd)}>
                <a href={`mailto:${profile.email}`} {...stylex.props(styles.link)}>
                  {profile.email}
                </a>
              </dd>
            </dl>
          </div>
        </div>

        <div {...stylex.props(styles.assessment)}>
          <h2 {...stylex.props(styles.assessmentTitle)}>{t(ui.profile.summary)}</h2>
          {profile.summary.map((p) => (
            <p key={p.en} {...stylex.props(styles.summary)}>
              {t(p)}
            </p>
          ))}
          <p {...stylex.props(styles.note)}>{t(ui.profile.note)}</p>
        </div>
      </Paper>
    </DossierSection>
  );
}
