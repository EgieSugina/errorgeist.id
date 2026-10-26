import * as stylex from '@stylexjs/stylex';

/**
 * "Top Secret Dossier" palette (dark only). Contrast ratios (WCAG, computed):
 *   ink       on paper : 14.20:1
 *   inkDim    on paper :  6.14:1
 *   stamp     on paper :  4.83:1
 *   phosphor  on desk  : 14.56:1
 *   phosphorDim on desk:  5.67:1
 *   amber     on desk  :  8.89:1
 */
export const colors = stylex.defineVars({
  /** Page / desk background. */
  desk: '#0b0d0c',
  /** Manila paper face. */
  paper: '#f0e8d2',
  /** Paper edge / fold shading (decorative). */
  paperEdge: '#d6c9a6',
  /** Primary text on paper: 14.20:1 on paper. */
  ink: '#1c1a17',
  /** Secondary text on paper: 6.14:1 on paper. */
  inkDim: '#5a5448',
  /** Stamp red: 4.83:1 on paper. */
  stamp: '#c0262d',
  /** Terminal green: 14.56:1 on desk. */
  phosphor: '#39ff6a',
  /** Inactive terminal green: 5.67:1 on desk. */
  phosphorDim: '#2f9e4a',
  /** Warning amber: 8.89:1 on desk. */
  amber: '#e0a526',
  /** Redaction bar (purely visual). */
  redaction: '#000',
});
