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
    links: [{ label: 'GitHub', href: 'https://github.com/EgieSugina/S.P.E.C.T.R.E' }],
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
    links: [{ label: 'GitHub', href: 'https://github.com/EgieSugina/tsukimi.my' }],
  },
  {
    id: 'lucy',
    codename: 'LUCY',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Discord voice assistant bot',
      id: 'Bot asisten suara Discord',
    },
    summary: {
      en: 'A personal project: a Discord bot persona for Indonesian-speaking servers that answers questions out loud in voice channels while the music keeps playing.',
      id: 'Projek pribadi: persona bot Discord untuk server berbahasa Indonesia yang menjawab pertanyaan dengan suara di voice channel sementara musik tetap berputar.',
    },
    role: { en: 'Sole developer', id: 'Developer tunggal' },
    stack: [
      'Groq (Whisper + LLM)', 'Fish Audio TTS', 'discord.js voice', 'Node.js', 'Opus', 'prism-media',
      'sherpa-onnx', 'yt-dlp', 'ffmpeg', 'Docker', 'k3s',
    ],
    highlights: [
      {
        en: 'Answers /ask questions in the voice channel while YouTube music plays, ducking the music as she speaks.',
        id: 'Menjawab pertanyaan /ask di voice channel sambil memutar musik YouTube, volume musik diturunkan saat dia bicara.',
      },
      {
        en: 'Custom PCM mixer that blends speech and music into a single Opus stream.',
        id: 'Mixer PCM buatan sendiri yang menyatukan suara dan musik dalam satu stream Opus.',
      },
      {
        en: 'Multi-model LLM fallback chain, tuned with measured latencies.',
        id: 'Rantai fallback LLM multi-model, disetel dari latensi yang diukur.',
      },
      {
        en: 'Automatic web search for time-sensitive questions.',
        id: 'Pencarian web otomatis untuk pertanyaan yang sensitif waktu.',
      },
      {
        en: 'Per-server conversation memory, with /forget to clear it.',
        id: 'Memori percakapan per server, bisa dihapus dengan /forget.',
      },
      {
        en: 'Emotion-tagged speech and a wake-word listener.',
        id: 'Suara berlabel emosi dan pendeteksi wake-word.',
      },
      {
        en: 'Playlists, autoplay, loop, shuffle and auto-leave, covered by unit tests.',
        id: 'Playlist, autoplay, loop, shuffle, dan auto-leave, dilengkapi unit test.',
      },
      {
        en: 'Containerized and deployed on k3s.',
        id: 'Dikemas dalam container dan dijalankan di k3s.',
      },
    ],
    links: [],
  },
  {
    id: 'homechef',
    codename: 'HOME CHEF AI',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'AI cooking-assistant chat web app, with a fine-tuned model',
      id: 'Aplikasi web chat asisten memasak AI, dengan model hasil fine-tuning',
    },
    summary: {
      en: 'A personal project: a chat-style web app where users talk to a cooking assistant, backed by a small language model fine-tuned on Indonesian recipes.',
      id: 'Projek pribadi: aplikasi web bergaya chat untuk berbincang dengan asisten memasak, ditenagai model bahasa kecil yang di-fine-tune pada resep Indonesia.',
    },
    role: { en: 'Sole developer', id: 'Developer tunggal' },
    stack: [
      'Next.js 15', 'Qwen2.5 + LoRA', 'FastAPI', 'NextAuth', 'React 19', 'TypeScript', 'Tailwind CSS 4',
      'shadcn/ui', 'Radix UI', 'Prisma', 'SQLite', 'zod', 'Nodemailer', 'PEFT', 'PyTorch',
    ],
    highlights: [
      {
        en: 'Full auth flow: credentials and Google sign-in, email OTP verification, password reset and change.',
        id: 'Alur autentikasi lengkap: kredensial dan login Google, verifikasi OTP email, reset dan ganti password.',
      },
      {
        en: 'Chat channels with full CRUD and a public share link for each chat.',
        id: 'Channel chat dengan CRUD lengkap dan tautan berbagi publik untuk tiap chat.',
      },
      {
        en: 'Route-protection middleware that keeps private pages behind sign-in.',
        id: 'Middleware proteksi rute yang menjaga halaman privat tetap di balik login.',
      },
      {
        en: 'Qwen2.5-0.5B fine-tuned with LoRA into an Indonesian-cuisine chef model.',
        id: 'Qwen2.5-0.5B di-fine-tune dengan LoRA menjadi model chef masakan Indonesia.',
      },
      {
        en: 'Recipes, cooking Q&A and ingredient-based recommendations.',
        id: 'Resep, tanya jawab memasak, dan rekomendasi berdasarkan bahan.',
      },
      {
        en: 'Model served behind a FastAPI inference server.',
        id: 'Model dilayani lewat server inferensi FastAPI.',
      },
    ],
    links: [
      {
        label: 'GitHub — model training',
        href: 'https://github.com/EgieSugina/Training-Model-Chef-AI-Indonesia',
      },
    ],
  },
  {
    id: 'lawang',
    codename: 'LAWANG',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Least-privilege database gateway for AI agents (MCP server)',
      id: 'Gateway database least-privilege untuk agen AI (server MCP)',
    },
    summary: {
      en: 'A personal project in active development: a database gateway that lets AI agents read what is whitelisted and write only after a human approves. The name is Sundanese for "gate".',
      id: 'Projek pribadi yang masih dikembangkan: gateway database yang membiarkan agen AI membaca apa yang masuk whitelist dan menulis hanya setelah manusia menyetujui. Namanya bahasa Sunda untuk "pintu".',
    },
    role: { en: 'Sole developer', id: 'Developer tunggal' },
    stack: [
      'TypeScript', 'MCP SDK', 'Drizzle ORM', 'SQLite', 'Node.js', 'PostgreSQL', 'React', 'StyleX', 'Vite',
      'Docker Compose',
    ],
    highlights: [
      {
        en: 'Whitelists down to the table and column: anything not listed is invisible to the agent.',
        id: 'Whitelist sampai tingkat tabel dan kolom: yang tidak terdaftar tidak terlihat oleh agen.',
      },
      {
        en: 'Read-only by default, with create, update and delete switched on per table.',
        id: 'Hanya-baca secara default, dengan create, update, dan delete diaktifkan per tabel.',
      },
      {
        en: 'Every write is held as a pending action with a SQL and affected-row preview until a human approves it.',
        id: 'Setiap penulisan ditahan sebagai aksi tertunda dengan pratinjau SQL dan baris terdampak sampai manusia menyetujuinya.',
      },
      {
        en: 'AST-validated SQL: one statement per query, no DDL, and a WHERE clause required on updates and deletes.',
        id: 'SQL divalidasi lewat AST: satu statement per query, tanpa DDL, dan klausa WHERE wajib pada update dan delete.',
      },
      {
        en: 'Data source credentials encrypted with AES-256-GCM.',
        id: 'Kredensial sumber data dienkripsi dengan AES-256-GCM.',
      },
      {
        en: 'Audit log of every tool call and executed statement, exportable as CSV or JSON.',
        id: 'Log audit untuk setiap pemanggilan tool dan statement yang dijalankan, bisa diekspor ke CSV atau JSON.',
      },
      {
        en: 'React console for client tokens, whitelists and the approval queue.',
        id: 'Konsol React untuk token klien, whitelist, dan antrean persetujuan.',
      },
    ],
    links: [],
  },
  {
    id: 'kinanti',
    codename: 'KINANTI',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Visual AI-agent workflow platform',
      id: 'Platform workflow agen AI visual',
    },
    summary: {
      en: 'A personal project in active development: draw an agent workflow on a canvas, then run it as a chat or call it as an API. The name is a Sundanese poetic form meaning "to be guided".',
      id: 'Projek pribadi yang masih dikembangkan: gambar workflow agen di kanvas, lalu jalankan sebagai chat atau panggil sebagai API. Namanya bentuk puisi Sunda yang berarti "dibimbing".',
    },
    role: { en: 'Sole developer', id: 'Developer tunggal' },
    stack: [
      'FastAPI', 'LangGraph', 'React Flow', 'pgvector', 'Python', 'PostgreSQL', 'Redis', 'React', 'StyleX',
      'Turborepo', 'MCP', 'Kubernetes',
    ],
    highlights: [
      {
        en: 'Node-based studio with LLM, agent, tool, router, sub-workflow and human-in-the-loop nodes.',
        id: 'Studio berbasis node dengan node LLM, agent, tool, router, sub-workflow, dan human-in-the-loop.',
      },
      {
        en: 'A saved workflow is compiled into a LangGraph graph at run time, with checkpoints in Postgres.',
        id: 'Workflow yang disimpan dikompilasi menjadi graf LangGraph saat dijalankan, dengan checkpoint di Postgres.',
      },
      {
        en: 'MCP tools: register servers, discover their tools and attach them to nodes.',
        id: 'Tool MCP: daftarkan server, temukan tool-nya, dan pasang ke node.',
      },
      {
        en: 'Workflow-as-API in sync, SSE streaming and webhook modes, plus an OpenAI-compatible endpoint.',
        id: 'Workflow-as-API dalam mode sync, streaming SSE, dan webhook, plus endpoint yang kompatibel dengan OpenAI.',
      },
      {
        en: 'Multi-provider LLM routing with encrypted keys and a model chosen per node.',
        id: 'Routing LLM multi-provider dengan key terenkripsi dan model yang dipilih per node.',
      },
      {
        en: 'Workspaces, roles and hashed API keys with scopes, expiry and rate limits.',
        id: 'Workspace, peran, dan API key ter-hash dengan scope, masa berlaku, dan rate limit.',
      },
      {
        en: 'Docker Compose for local work, Kubernetes for production.',
        id: 'Docker Compose untuk lokal, Kubernetes untuk produksi.',
      },
    ],
    links: [],
  },
  {
    id: 'phantomportal',
    codename: '0xPHANTOMPORTAL',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Desktop SSH tunnel manager with an SFTP tab',
      id: 'Pengelola tunnel SSH desktop dengan tab SFTP',
    },
    summary: {
      en: 'A personal project: a desktop app that keeps SSH tunnels alive and doubles as a file manager for remote servers.',
      id: 'Projek pribadi: aplikasi desktop yang menjaga tunnel SSH tetap hidup sekaligus berfungsi sebagai pengelola file untuk server jarak jauh.',
    },
    role: { en: 'Author', id: 'Pembuat' },
    stack: ['Python', 'PySide6', 'OpenSSH', 'keyring', 'sshpass', 'PyInstaller'],
    highlights: [
      {
        en: 'SOCKS5, local and remote port forwards, each with auto-reconnect.',
        id: 'SOCKS5, port forward lokal dan remote, masing-masing dengan auto-reconnect.',
      },
      {
        en: 'SFTP tab with drag-and-drop upload of files and folders, and a progress bar.',
        id: 'Tab SFTP dengan upload drag-and-drop untuk file dan folder, plus progress bar.',
      },
      {
        en: 'Parallel upload workers, adjustable from one to ten.',
        id: 'Worker upload paralel, bisa diatur dari satu sampai sepuluh.',
      },
      {
        en: 'Multiple saved SFTP accounts, with secrets kept in the system keyring.',
        id: 'Beberapa akun SFTP tersimpan, dengan rahasia disimpan di keyring sistem.',
      },
      {
        en: 'Standalone Linux binary built with PyInstaller, published as beta releases.',
        id: 'Binary Linux mandiri yang dibangun dengan PyInstaller, dirilis sebagai rilis beta.',
      },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/EgieSugina/0xPhantomPortal' }],
  },
  {
    id: 'asmodeus',
    codename: 'A.S.M.O.D.E.U.S',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'API uptime monitor and status page',
      id: 'Monitor uptime API dan halaman status',
    },
    summary: {
      en: 'A status page for backend services that probes each one, charts its uptime and opens and closes incidents on its own.',
      id: 'Halaman status untuk layanan backend yang memeriksa tiap layanan, menampilkan grafik uptime-nya, dan membuka serta menutup insiden secara otomatis.',
    },
    role: { en: 'Sole developer', id: 'Developer tunggal' },
    stack: [
      'Go', 'chi', 'SQLite', 'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'ECharts', 'Docker',
    ],
    highlights: [
      {
        en: 'Polls the health endpoints of every registered backend service.',
        id: 'Memeriksa endpoint health setiap layanan backend yang terdaftar.',
      },
      {
        en: 'Opens an incident after repeated failed checks and resolves it after repeated healthy ones, so one blip does not flap the status.',
        id: 'Membuka insiden setelah pemeriksaan gagal berulang dan menutupnya setelah pemeriksaan sehat berulang, jadi satu gangguan sesaat tidak membuat status bolak-balik.',
      },
      {
        en: 'A service with several targets shows the worst status of any of them.',
        id: 'Layanan dengan beberapa target menampilkan status terburuk dari semuanya.',
      },
      {
        en: 'Services live in a registry managed through the UI, not in config files.',
        id: 'Layanan disimpan di registry yang dikelola lewat UI, bukan di file konfigurasi.',
      },
      {
        en: 'Uptime calendar heatmap, manual incident updates and an operator audit trail.',
        id: 'Heatmap kalender uptime, update insiden manual, dan jejak audit operator.',
      },
      {
        en: 'One binary with an embedded frontend and a cgo-free SQLite, shipped by a multi-stage Docker build.',
        id: 'Satu binary dengan frontend tertanam dan SQLite tanpa cgo, dikirim lewat build Docker multi-stage.',
      },
    ],
    links: [],
  },
  {
    id: 'thesis',
    codename: 'THESIS // S.Kom',
    clearance: 'declassified',
    client: null,
    kind: {
      en: 'Undergraduate thesis: Telegram AI agent for network data analysis',
      id: 'Skripsi: agen AI Telegram untuk analisis data jaringan',
    },
    summary: {
      en: 'The S1 thesis: a Telegram agent that takes a plain-language question about network data, works out what is being asked and answers with a chart, a summary or a plain reply.',
      id: 'Skripsi S1: agen Telegram yang menerima pertanyaan bahasa sehari-hari tentang data jaringan, memahami maksudnya, lalu menjawab dengan chart, ringkasan, atau balasan biasa.',
    },
    role: { en: 'Author', id: 'Penulis' },
    stack: [
      'n8n', 'Google Gemini', 'PostgreSQL', 'Docker Compose', 'Telegram Bot API', 'NLP', 'LLM prompting',
    ],
    highlights: [
      {
        en: 'An LLM turns each natural-language question into a structured intent.',
        id: 'Sebuah LLM mengubah tiap pertanyaan bahasa alami menjadi intent terstruktur.',
      },
      {
        en: 'The same LLM writes read-only PostgreSQL queries for questions about network KPIs such as throughput, latency, jitter and coverage.',
        id: 'LLM yang sama menulis query PostgreSQL hanya-baca untuk pertanyaan soal KPI jaringan seperti throughput, latensi, jitter, dan coverage.',
      },
      {
        en: 'Routing by intent: a chart layer that returns generated chart images, a summary layer, or a non-data reply.',
        id: 'Routing berdasarkan intent: lapisan chart yang mengirim gambar chart hasil generate, lapisan ringkasan, atau balasan non-data.',
      },
      {
        en: 'Every NLP and SQL step is logged to Postgres, so each answer can be traced.',
        id: 'Setiap langkah NLP dan SQL dicatat ke Postgres, sehingga tiap jawaban bisa ditelusuri.',
      },
      {
        en: 'The whole pipeline is an n8n workflow, run with Docker Compose.',
        id: 'Seluruh pipeline adalah workflow n8n yang dijalankan dengan Docker Compose.',
      },
    ],
    links: [],
  },
];

type ArchiveFamily =
  | { family: L10n; clearance: 'classified'; items: L10n[] }
  | {
      family: L10n;
      clearance: 'declassified';
      items: { name: string; text: L10n; href?: string }[];
    };

export const archive: ArchiveFamily[] = [
  {
    family: { en: 'Network portals & CMS', id: 'Portal & CMS jaringan' },
    clearance: 'classified',
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
    clearance: 'classified',
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
    clearance: 'classified',
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
    clearance: 'classified',
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
    clearance: 'classified',
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
    clearance: 'classified',
    items: [
      {
        en: 'Role-based helpdesk bot with SLA cron jobs and periodic reports',
        id: 'Bot helpdesk berbasis peran, dengan SLA cron dan laporan berkala',
      },
    ],
  },
  {
    family: { en: 'Standalone dashboards', id: 'Dashboard tunggal' },
    clearance: 'classified',
    items: [
      { en: 'Network capacity', id: 'Kapasitas jaringan' },
      { en: 'Infrastructure project tracker', id: 'Tracker projek infrastruktur' },
      { en: 'Regional performance cards', id: 'Kartu performa regional' },
      {
        en: 'O&M contract billing summary',
        id: 'Ringkasan tagihan kontrak O&M',
      },
      {
        en: 'Suite of telecom KPI analytics dashboards on a shared React starter',
        id: 'Rangkaian dashboard analitik KPI telekomunikasi di atas starter React bersama',
      },
    ],
  },
  {
    family: { en: 'Platform & data APIs', id: 'Platform & API data' },
    clearance: 'classified',
    items: [
      {
        en: 'Dynamic data-API gateway re-implemented on .NET, with caching and token and role middleware',
        id: 'Gateway API data dinamis ditulis ulang di .NET, dengan caching serta middleware token dan peran',
      },
      {
        en: 'Microservice authentication service with TOTP and realm-based access control',
        id: 'Service autentikasi microservice dengan TOTP dan kontrol akses berbasis realm',
      },
      {
        en: 'Service that turns database tables and queries into REST endpoints',
        id: 'Service yang mengubah tabel dan query database menjadi endpoint REST',
      },
    ],
  },
  {
    family: { en: 'Alerting & automation', id: 'Alerting & otomasi' },
    clearance: 'classified',
    items: [
      {
        en: 'Network KPI alert and notification orchestrator with templated messages',
        id: 'Orkestrator alert dan notifikasi KPI jaringan dengan pesan bertemplate',
      },
    ],
  },
  {
    family: { en: 'Integration', id: 'Integrasi' },
    clearance: 'classified',
    items: [
      {
        en: 'Middleware syncing digital customer forms between systems (Python)',
        id: 'Middleware sinkronisasi formulir pelanggan digital antar-sistem (Python)',
      },
    ],
  },
  {
    family: { en: 'Personal field kit', id: 'Peralatan lapangan pribadi' },
    clearance: 'declassified',
    items: [
      {
        name: 'G14-Slash-Lighting-Events',
        text: {
          en: 'Drives the ROG Zephyrus G14 Slash LED from charger and desktop-notification events (asusctl, udev, systemd, KDE)',
          id: 'Menggerakkan LED Slash ROG Zephyrus G14 dari event charger dan notifikasi desktop (asusctl, udev, systemd, KDE)',
        },
        href: 'https://github.com/EgieSugina/G14-Slash-Lighting-Events',
      },
      {
        name: 'axios-supply-chain-scanner-for-pnpm',
        text: {
          en: 'Cross-platform IOC scanner for the axios npm supply-chain incident, covering the pnpm store and project folders',
          id: 'Pemindai IOC lintas platform untuk insiden supply-chain npm axios, mencakup store pnpm dan folder projek',
        },
        href: 'https://github.com/EgieSugina/axios-supply-chain-scanner-for-pnpm',
      },
    ],
  },
];

export function operationsCount(): number {
  return operations.length + archive.reduce((n, g) => n + g.items.length, 0);
}
