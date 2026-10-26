import type { L10n } from '../i18n/types';

export const arsenal: { group: L10n; items: string[] }[] = [
  {
    group: { en: 'Frontend', id: 'Frontend' },
    items: ['React', 'TypeScript', 'StyleX', 'Tailwind CSS', 'TanStack', 'AngularJS', 'ECharts', 'Storybook'],
  },
  {
    group: { en: 'Backend', id: 'Backend' },
    items: ['Node.js', 'Moleculer', 'NATS', 'Go', '.NET 8', 'Java', 'Python'],
  },
  {
    group: { en: 'Data', id: 'Data' },
    items: ['PostgreSQL', 'PostGIS', 'MSSQL', 'MongoDB', 'SQLite', 'Redis', 'Mapbox / MapLibre'],
  },
  {
    group: { en: 'DevOps', id: 'DevOps' },
    items: ['Docker', 'Git', 'CI/CD', 'Playwright'],
  },
  {
    group: { en: 'BI', id: 'BI' },
    items: ['Grafana', 'Tableau', 'Power BI'],
  },
  {
    group: { en: 'AI / Bots', id: 'AI / Bot' },
    items: ['Telegram bots (grammY / Telegraf)', 'LLM integration (Ollama)'],
  },
];
