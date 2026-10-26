import type { Lang } from '../i18n/types';

export type BootLine = { text: string; tone: 'dim' | 'normal' | 'warn' };

/** Terminal boot script. System strings stay English for flavour; the skip hint is localized. */
export function bootLines(lang: Lang, opsCount: number): BootLine[] {
  const id = lang === 'id';
  return [
    { text: 'CIA//NCS SECURE TERMINAL v7.2', tone: 'normal' },
    { text: 'ESTABLISHING UPLINK.......... OK', tone: 'normal' },
    { text: '> AUTH OPERATOR: GUEST', tone: 'normal' },
    { text: id ? '!! CLEARANCE LEVEL: TERBATAS' : '!! CLEARANCE LEVEL: LIMITED', tone: 'warn' },
    { text: '> query --subject "EGIE SUGINA"', tone: 'normal' },
    { text: '  MATCH FOUND [1]', tone: 'normal' },
    { text: id ? `  OPERASI: ${opsCount}` : `  OPERATIONS: ${opsCount}`, tone: 'normal' },
    { text: '> decrypt subject_file.dsr', tone: 'normal' },
    { text: '  [██████████░░░] 78%', tone: 'dim' },
    {
      text: id ? '[ tekan tombol apa saja untuk lewati ]' : '[ press any key to skip ]',
      tone: 'dim',
    },
  ];
}
