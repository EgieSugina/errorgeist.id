import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/colors.stylex';
import { fonts } from '../tokens/fonts.stylex';
import { useLang } from './LangProvider';
import type { Lang } from './types';

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontFamily: fonts.terminal,
    fontSize: '1.25rem',
    lineHeight: 1,
    color: colors.phosphorDim,
  },
  bracket: { color: colors.phosphorDim },
  sep: { color: colors.phosphorDim },
  btn: {
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '4px 6px',
    margin: 0,
    font: 'inherit',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    color: {
      default: colors.phosphorDim,
      ':hover': colors.phosphor,
      ':focus-visible': colors.phosphor,
    },
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
  },
  active: {
    color: colors.phosphor,
    textShadow: `0 0 6px ${colors.phosphor}`,
  },
});

const OPTIONS: Lang[] = ['en', 'id'];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Language" {...stylex.props(styles.group)}>
      <span aria-hidden="true" {...stylex.props(styles.bracket)}>
        [
      </span>
      {OPTIONS.map((l, i) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && (
            <span aria-hidden="true" {...stylex.props(styles.sep)}>
              |
            </span>
          )}
          <button
            type="button"
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
            {...stylex.props(styles.btn, lang === l && styles.active)}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
      <span aria-hidden="true" {...stylex.props(styles.bracket)}>
        ]
      </span>
    </div>
  );
}
