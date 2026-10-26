import type { L10n } from '../i18n/types';

export const profile: {
  name: 'Egie Sugina';
  role: L10n;
  summary: L10n[];
  location: L10n;
  email: string;
  links: { label: string; href: string }[];
  fileNo: string;
} = {
  name: 'Egie Sugina',
  role: {
    en: 'Senior API & Backend Developer / Full Stack Developer',
    id: 'Senior API & Backend Developer / Full Stack Developer',
  },
  summary: [
    {
      en: 'Builds scalable web applications, backend APIs and enterprise solutions, with a focus on turning large volumes of operational data into tools people actually use.',
      id: 'Membangun aplikasi web yang skalabel, API backend, dan solusi enterprise, dengan fokus mengubah data operasional yang besar menjadi alat yang benar-benar dipakai.',
    },
    {
      en: 'Frontend with React, AngularJS and Tailwind CSS. Backend with Node.js, Java and Python. Data in PostgreSQL, MongoDB, MSSQL and SQLite. DevOps with Docker, Git and CI/CD. BI with Grafana, Tableau and Power BI.',
      id: 'Frontend dengan React, AngularJS, dan Tailwind CSS. Backend dengan Node.js, Java, dan Python. Data di PostgreSQL, MongoDB, MSSQL, dan SQLite. DevOps dengan Docker, Git, dan CI/CD. BI dengan Grafana, Tableau, dan Power BI.',
    },
    {
      en: 'Has served clients in telecommunications, logistics and energy. Modernizes legacy systems and works comfortably across teams.',
      id: 'Pernah melayani klien di sektor telekomunikasi, logistik, dan energi. Memodernisasi sistem lama dan terbiasa berkolaborasi lintas tim.',
    },
  ],
  location: { en: 'Subang, West Java', id: 'Subang, Jawa Barat' },
  email: 'egiesugina704@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/EgieSugina' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/egie-sugina-857680179/' },
  ],
  fileNo: '0816-ES',
};
