import * as stylex from '@stylexjs/stylex';

/** Families are loaded from Google Fonts in index.html; stacks below are fallbacks. */
export const fonts = stylex.defineVars({
  typewriter: "'Special Elite', 'Courier New', Courier, monospace",
  terminal: "'VT323', 'Lucida Console', 'Courier New', monospace",
  stamp: "'Oswald', 'Arial Narrow', Impact, sans-serif",
  body: "'Courier Prime', 'Courier New', Courier, monospace",
});
