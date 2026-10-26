import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../../tokens/colors.stylex';
import { fonts } from '../../../tokens/fonts.stylex';
import { useLang } from '../../../i18n/LangProvider';
import type { L10n } from '../../../i18n/types';

const styles = stylex.create({
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    // Scrolls inside itself on narrow screens; never widens the page.
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    scrollbarWidth: 'none',
    backgroundColor: colors.desk,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.paperEdge,
    boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    width: 'max-content',
    minWidth: '100%',
    padding: '10px 16px 0',
    margin: 0,
    listStyle: 'none',
  },
  tab: {
    display: 'block',
    padding: '7px 16px 6px',
    fontFamily: fonts.stamp,
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    color: {
      default: colors.inkDim,
      ':hover': colors.ink,
    },
    backgroundColor: colors.folderTab,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.paperEdge,
    borderBottomWidth: 0,
    borderBottomStyle: 'none',
    borderRadius: '6px 6px 0 0',
    outline: { default: 'none', ':focus-visible': `1px dashed ${colors.phosphor}` },
    outlineOffset: -3,
  },
  current: {
    // The open tab is the dark sheet itself, joined to the bar's bottom edge, with a red index mark.
    color: colors.ink,
    backgroundColor: colors.paper,
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderTopColor: colors.stamp,
    paddingTop: 6,
    paddingBottom: 9,
    marginBottom: -1,
  },
});

export type SectionTab = { id: string; label: L10n };

export function SectionTabs({ sections }: { sections: SectionTab[] }) {
  const { t } = useLang();
  const [current, setCurrent] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);

  const ids = sections.map((s) => s.id).join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id);
        }
      },
      // A thin band around the upper-middle of the viewport decides "which section am I in".
      { rootMargin: '-35% 0px -60% 0px', threshold: 0 },
    );
    for (const id of ids.split('|')) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);

  // Keep the open tab visible inside the horizontally scrolling bar (never scrolls the page).
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !current) return;
    const link = bar.querySelector<HTMLElement>('[aria-current="true"]');
    if (!link) return;
    bar.scrollLeft = link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2;
  }, [current]);

  return (
    <nav ref={barRef} aria-label="Dossier sections" {...stylex.props(styles.bar)}>
      <ul {...stylex.props(styles.row)}>
        {sections.map((s) => {
          const isCurrent = s.id === current;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isCurrent ? 'true' : undefined}
                {...stylex.props(styles.tab, isCurrent && styles.current)}
              >
                {t(s.label)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
