import type { L10n } from '../i18n/types';

export type Operation = {
  id: string;
  codename: string;
  clearance: 'classified' | 'declassified';
  client: 'TELKOMSEL' | null;
  kind: L10n;
  summary: L10n;
  role: L10n;
  stack: string[];
  highlights: L10n[];
  links: { label: string; href: string }[];
};

export const operations: Operation[] = [
  {
    id: 'hivemind',
    codename: 'HIVEMIND',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'API gateway & data platform',
      id: 'API gateway & platform data',
    },
    summary: {
      en: 'An admin console and a workflow ETL engine on top of a microservice backbone. Most other dashboards draw their data from it.',
      id: 'Konsol admin dan engine ETL workflow di atas tulang punggung microservice. Sebagian besar dashboard lain mengambil datanya dari sini.',
    },
    role: {
      en: 'Full stack: backend platform and admin console',
      id: 'Full stack: platform backend dan konsol admin',
    },
    stack: [
      'Node.js', 'Moleculer', 'NATS', 'Redis', 'Sequelize', 'PostgreSQL', 'MSSQL', 'Bull', 'MinIO', 'tRPC',
      'React', 'StyleX', 'CodeMirror', 'xyflow',
    ],
    highlights: [
      { en: 'Dozens of microservices working together.', id: 'Puluhan microservice yang bekerja bersama.' },
      {
        en: 'SQL tables and queries are registered as REST endpoints without writing a new service.',
        id: 'Tabel dan query SQL didaftarkan sebagai endpoint REST tanpa menulis service baru.',
      },
      { en: 'A custom query filter language.', id: 'Bahasa filter query buatan sendiri.' },
      { en: 'Charts rendered on the server.', id: 'Chart dirender di server.' },
      {
        en: 'DAG-based ETL engine with encrypted connections and Telegram alerts.',
        id: 'Engine ETL berbasis DAG dengan koneksi terenkripsi dan alert Telegram.',
      },
      {
        en: 'Can be installed offline through Docker.',
        id: 'Bisa dipasang secara offline lewat Docker.',
      },
    ],
    links: [],
  },
  {
    id: 'crowdwatch',
    codename: 'CROWDWATCH',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'Monitoring dashboard for a national-scale event',
      id: 'Dashboard monitoring untuk event berskala nasional',
    },
    summary: {
      en: 'A real-time operations dashboard with a map-first view of customer movement, backed by a dedicated tracking service.',
      id: 'Dashboard operasional real-time dengan tampilan peta untuk pergerakan pelanggan, ditopang service pelacakan tersendiri.',
    },
    role: { en: 'Full stack developer', id: 'Full stack developer' },
    stack: [
      'React', 'TanStack Router', 'TanStack Query', 'HeroUI', 'Mapbox', 'ECharts', 'TipTap',
      '.NET 8', 'EF Core', 'PostgreSQL', 'Redis', 'Serilog', 'Elasticsearch',
    ],
    highlights: [
      { en: 'Many modules inside one dashboard.', id: 'Banyak modul dalam satu dashboard.' },
      { en: 'Map of customer movement.', id: 'Peta pergerakan pelanggan.' },
      { en: 'Roamer and 5G analytics.', id: 'Analitik roamer dan 5G.' },
      { en: 'Live CCTV video.', id: 'Video CCTV langsung.' },
      { en: 'Rich-text news feed.', id: 'Berita rich-text.' },
      { en: 'Excel export.', id: 'Export Excel.' },
      { en: 'Load-tested with JMeter.', id: 'Diuji beban dengan JMeter.' },
    ],
    links: [],
  },
  {
    id: 'courier',
    codename: 'COURIER',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'Telegram KPI bot (rewrite) plus web console',
      id: 'Bot KPI Telegram (rewrite) plus konsol web',
    },
    summary: {
      en: 'A rewrite of a KPI reporting bot, paired with a web console to manage it.',
      id: 'Penulisan ulang bot pelaporan KPI, dipasangkan dengan konsol web untuk mengelolanya.',
    },
    role: { en: 'Full stack developer', id: 'Full stack developer' },
    stack: ['TypeScript', 'Moleculer', 'grammY', 'ECharts SSR', 'resvg', 'PostgreSQL', 'croner', 'React', 'StyleX'],
    highlights: [
      {
        en: 'One button sends an album of several chart images.',
        id: 'Satu tombol mengirim album berisi beberapa gambar chart.',
      },
      {
        en: 'Per-user roles with admin approval.',
        id: 'Peran per pengguna dengan persetujuan admin.',
      },
      {
        en: 'Web console with live updates over SSE.',
        id: 'Konsol web dengan update langsung lewat SSE.',
      },
      {
        en: 'Adding a command takes a single file.',
        id: 'Menambah satu perintah cukup dengan satu file.',
      },
    ],
    links: [],
  },
  {
    id: 'oracle',
    codename: 'ORACLE',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'AI assistant answering broadband network KPI questions',
      id: 'Asisten AI yang menjawab pertanyaan KPI jaringan broadband',
    },
    summary: {
      en: 'A chat assistant that understands questions about network KPIs and answers with data and charts, running on a local LLM.',
      id: 'Asisten chat yang memahami pertanyaan soal KPI jaringan dan menjawab dengan data serta chart, berjalan di LLM lokal.',
    },
    role: { en: 'Backend & AI integration developer', id: 'Developer backend & integrasi AI' },
    stack: ['TypeScript', 'grammY', 'Ollama', 'Qwen', 'OpenAI-compatible API', 'PostgreSQL', 'ECharts', 'resvg'],
    highlights: [
      {
        en: 'Intent detection and agent scenarios.',
        id: 'Deteksi intent dan skenario agent.',
      },
      {
        en: 'Answers come with chart images.',
        id: 'Jawaban disertai gambar chart.',
      },
      {
        en: 'Suggests follow-up questions.',
        id: 'Menyarankan pertanyaan lanjutan.',
      },
      {
        en: 'Ships with an evaluation question set.',
        id: 'Dilengkapi set pertanyaan evaluasi.',
      },
    ],
    links: [],
  },
  {
    id: 'fiberline',
    codename: 'FIBERLINE',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'Fiber-optic infrastructure mapping plus map server',
      id: 'Pemetaan infrastruktur fiber optik plus server peta',
    },
    summary: {
      en: 'A map-centric web app for planning and inspecting fiber infrastructure, served by a dedicated geospatial backend.',
      id: 'Aplikasi web berbasis peta untuk merencanakan dan memeriksa infrastruktur fiber, dilayani backend geospasial tersendiri.',
    },
    role: { en: 'Full stack developer', id: 'Full stack developer' },
    stack: [
      'React', 'TanStack', 'HeroUI', 'Mapbox', 'Google Maps', 'turf', 'ECharts', 'ExcelJS', 'pptxgenjs',
      'Go', 'Fiber', 'pgx', 'PostGIS', 'Redis',
    ],
    highlights: [
      {
        en: 'Bulk nearest-point lookup for distribution points.',
        id: 'Pencarian titik distribusi terdekat secara massal.',
      },
      {
        en: 'Map layers by administrative region.',
        id: 'Layer peta per wilayah administratif.',
      },
      {
        en: 'Vector tiles (MVT) streamed straight from PostGIS.',
        id: 'Vector tile (MVT) di-stream langsung dari PostGIS.',
      },
      {
        en: 'Slide-deck guides generated automatically.',
        id: 'Panduan berbentuk slide dibuat otomatis.',
      },
    ],
    links: [],
  },
  {
    id: 'armory',
    codename: 'ARMORY',
    clearance: 'classified',
    client: 'TELKOMSEL',
    kind: {
      en: 'Design system for monitoring dashboards',
      id: 'Design system untuk dashboard monitoring',
    },
    summary: {
      en: 'A shared component library that gives monitoring dashboards one consistent, accessible look.',
      id: 'Library komponen bersama yang memberi dashboard monitoring tampilan yang konsisten dan aksesibel.',
    },
    role: { en: 'Frontend & design system developer', id: 'Developer frontend & design system' },
    stack: ['React', 'StyleX', 'react-aria', 'ECharts', 'MapLibre', 'Storybook', 'Playwright', 'axe'],
    highlights: [
      { en: 'Dark and light design tokens.', id: 'Design token gelap dan terang.' },
      { en: 'Accessible components.', id: 'Komponen yang aksesibel.' },
      { en: 'Charts and maps are lazy-loaded.', id: 'Chart dan peta di-lazy-load.' },
      { en: 'Automated accessibility tests.', id: 'Tes aksesibilitas otomatis.' },
    ],
    links: [],
  },
  {
    id: 'spectre',
    codename: 'S.P.E.C.T.R.E',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Terminal app for managing SSH SOCKS proxies, with a dashboard',
      id: 'Aplikasi terminal untuk mengelola proxy SSH SOCKS, lengkap dengan dashboard',
    },
    summary: {
      en: 'A personal project: a terminal UI that manages SSH SOCKS proxies and charts their health live.',
      id: 'Projek pribadi: antarmuka terminal untuk mengelola proxy SSH SOCKS dan menampilkan kondisinya secara langsung.',
    },
    role: { en: 'Author', id: 'Pembuat' },
    stack: ['Go', 'Bubble Tea', 'Lip Gloss', 'x/crypto/ssh', 'systray'],
    highlights: [
      {
        en: 'Throughput and latency charts drawn from braille characters.',
        id: 'Chart throughput dan latensi dari karakter braille.',
      },
      {
        en: 'Latency measured from SSH keep-alives.',
        id: 'Latensi diukur dari SSH keep-alive.',
      },
      {
        en: 'UDP relay and chained hops.',
        id: 'Relay UDP dan hop berantai.',
      },
      {
        en: 'Background mode with a tray icon and a control socket.',
        id: 'Mode latar dengan ikon tray dan socket kontrol.',
      },
      {
        en: 'Roughly ten thousand lines of Go, with tests.',
        id: 'Sekitar sepuluh ribu baris Go, dilengkapi tes.',
      },
    ],
    links: [],
  },
  {
    id: 'tsukimi',
    codename: 'TSUKIMI',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'UI component library for anime and comic streaming sites, plus its product plan',
      id: 'Library komponen UI untuk situs streaming anime dan komik, plus rencana produknya',
    },
    summary: {
      en: 'A personal project: the building blocks of a streaming front end, from a custom video player to a remote-friendly TV interface.',
      id: 'Projek pribadi: blok pembangun front end streaming, dari video player buatan sendiri sampai antarmuka TV yang ramah remote.',
    },
    role: { en: 'Author', id: 'Pembuat' },
    stack: ['React', 'StyleX', 'Motion', 'Storybook', 'TypeScript', 'Vite'],
    highlights: [
      {
        en: 'Custom video player with subtitles, chapters, PiP and gestures.',
        id: 'Video player buatan sendiri dengan subtitle, chapter, PiP, dan gestur.',
      },
      {
        en: 'Manga and webtoon reader.',
        id: 'Pembaca manga dan webtoon.',
      },
      {
        en: 'TV interface navigable with a remote control.',
        id: 'Antarmuka TV yang bisa dinavigasi dengan remote.',
      },
      { en: 'SEO optimizer.', id: 'SEO optimizer.' },
    ],
    links: [],
  },
];

export const archive: { family: L10n; items: L10n[] }[] = [
  {
    family: { en: 'Network portals & CMS', id: 'Portal & CMS jaringan' },
    items: [
      {
        en: 'Monorepo CMS for a unified landing, with Web Push and menu click analytics',
        id: 'CMS monorepo untuk landing terpadu, dengan Web Push dan analitik klik menu',
      },
      { en: 'Incident ticketing system as a PWA', id: 'Sistem tiket insiden berbentuk PWA' },
      { en: 'Landing page', id: 'Halaman landing' },
    ],
  },
  {
    family: { en: 'Executive dashboard suite', id: 'Rangkaian dashboard eksekutif' },
    items: [
      {
        en: 'Financial and network performance dashboard',
        id: 'Dashboard performa finansial dan jaringan',
      },
      { en: 'Strategic program tracking', id: 'Tracking program strategis' },
      { en: 'Landing page', id: 'Halaman landing' },
    ],
  },
  {
    family: { en: 'Event monitoring', id: 'Monitoring event' },
    items: [
      { en: 'Event landing page', id: 'Landing event' },
      {
        en: 'Field-operations support API with Tableau integration',
        id: 'API pendukung operasional lapangan + integrasi Tableau',
      },
      {
        en: 'Landing page for streaming service monitoring',
        id: 'Landing monitoring layanan streaming',
      },
    ],
  },
  {
    family: { en: 'Fixed broadband & fiber', id: 'Fixed broadband & fiber' },
    items: [
      { en: 'Broadband operations dashboard', id: 'Dashboard operasional broadband' },
      { en: 'Risk analytics dashboard', id: 'Dashboard analitik risiko' },
      {
        en: 'Landing page and service for a convergence offering',
        id: 'Landing dan service untuk layanan konvergensi',
      },
    ],
  },
  {
    family: { en: 'Data quality', id: 'Kualitas data' },
    items: [
      { en: 'KPI data quality checker dashboard', id: 'Dashboard pemeriksa kualitas data KPI' },
      {
        en: 'Rewrite in Go with a query builder and audit log',
        id: 'Rewrite ke Go dengan pembuat query dan log audit',
      },
    ],
  },
  {
    family: { en: 'Telegram helpdesk bot', id: 'Bot helpdesk Telegram' },
    items: [
      {
        en: 'Role-based helpdesk bot with SLA cron jobs and periodic reports',
        id: 'Bot helpdesk berbasis peran, dengan SLA cron dan laporan berkala',
      },
    ],
  },
  {
    family: { en: 'Standalone dashboards', id: 'Dashboard tunggal' },
    items: [
      { en: 'Network capacity', id: 'Kapasitas jaringan' },
      { en: 'Infrastructure project tracker', id: 'Tracker projek infrastruktur' },
      { en: 'Regional performance cards', id: 'Kartu performa regional' },
      {
        en: 'O&M contract billing summary',
        id: 'Ringkasan tagihan kontrak O&M',
      },
    ],
  },
  {
    family: { en: 'Integration', id: 'Integrasi' },
    items: [
      {
        en: 'Middleware syncing digital customer forms between systems (Python)',
        id: 'Middleware sinkronisasi formulir pelanggan digital antar-sistem (Python)',
      },
    ],
  },
];

export function operationsCount(): number {
  return operations.length + archive.reduce((n, g) => n + g.items.length, 0);
}
