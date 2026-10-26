import * as stylex from '@stylexjs/stylex';

/**
 * "Top Secret Dossier" palette (dark only). Contrast ratios (WCAG, computed):
 *   ink         on paper     : 13.19:1
 *   inkDim      on paper     :  7.40:1
 *   ink         on folderTab : 11.24:1
 *   inkDim      on folderTab :  6.31:1
 *   clipMetal   on paper     :  7.8:1
 *   stamp       on paper     :  3.05:1  (large decorative stamp text only; WCAG large/graphic >= 3:1)
 *   stamp       on desk      :  3.30:1  (large or decorative elements only)
 *   phosphor    on desk      : 14.56:1
 *   phosphorDim on desk      :  5.67:1
 *   amber       on desk      :  8.89:1
 * Body text on paper must use ink or inkDim (both >= 4.5:1). Never use stamp for body text.
 */
export const colors = stylex.defineVars({
  /** Page / desk background. */
  desk: '#0b0d0c',
  /** Dark case-file folder / paper face (mockup A). */
  paper: '#1a1612',
  /** Paper edge, folder border and fold lines (decorative). */
  paperEdge: '#3a3226',
  /** Primary cream typewriter text on paper: 13.19:1 on paper. */
  ink: '#e6dcc4',
  /** Secondary cream text on paper: 7.40:1 on paper, 6.31:1 on folderTab. */
  inkDim: '#b3a586',
  /** Folder tab face: 11.24:1 with ink, 6.31:1 with inkDim. */
  folderTab: '#2b241a',
  /** Paper-clip steel (decorative): 7.8:1 on paper. */
  clipMetal: '#a9adb0',
  /** Stamp red: 3.05:1 on paper, 3.30:1 on desk (large decorative only). */
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
