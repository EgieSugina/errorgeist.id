import type { L10n } from '../i18n/types';

export type Experience = {
  title: L10n;
  org: string;
  period: { from: string; to: string | null };
  clients: string[];
  points: L10n[];
};

export const experience: Experience[] = [
  {
    title: { en: 'Senior API & Backend Developer', id: 'Senior API & Backend Developer' },
    org: 'PT. Neural Technologies Indonesia (NTI)',
    period: { from: '2018-09', to: null },
    clients: ['TELKOMSEL'],
    points: [
      {
        en: 'Built enterprise web applications and data visualization for a large telecommunications operator.',
        id: 'Membangun aplikasi web enterprise dan visualisasi data untuk operator telekomunikasi besar.',
      },
      {
        en: 'React and Tailwind on the frontend; Node.js, Java and Python behind the APIs.',
        id: 'React dan Tailwind di frontend; Node.js, Java, dan Python di balik API.',
      },
      {
        en: 'Delivered BI dashboards with Grafana, Tableau and Power BI.',
        id: 'Menghadirkan dashboard BI dengan Grafana, Tableau, dan Power BI.',
      },
      {
        en: 'Designed scalable architectures with CI/CD, Docker and monitoring.',
        id: 'Merancang arsitektur yang skalabel dengan CI/CD, Docker, dan monitoring.',
      },
    ],
  },
  {
    title: { en: 'Full Stack Developer', id: 'Full Stack Developer' },
    org: 'Hirata.id',
    period: { from: '2016-08', to: '2018-08' },
    clients: ['Pertamina Lubricants', 'JICT'],
    points: [
      {
        en: 'Built an enterprise web application for Pertamina Lubricants.',
        id: 'Membangun aplikasi web enterprise untuk Pertamina Lubricants.',
      },
      {
        en: 'Delivered a mobile solution for Jakarta International Container Terminal (JICT).',
        id: 'Menghadirkan solusi mobile untuk Jakarta International Container Terminal (JICT).',
      },
      {
        en: 'AngularJS on the frontend; Node.js and Java on the backend.',
        id: 'AngularJS di frontend; Node.js dan Java di backend.',
      },
      {
        en: 'Migrated legacy systems and improved the team workflow.',
        id: 'Memigrasikan sistem lama dan memperbaiki alur kerja tim.',
      },
    ],
  },
];
