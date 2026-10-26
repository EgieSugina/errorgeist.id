import type { L10n } from '../i18n/types';

/** Dossier page chrome: section names, field labels and small UI copy (bilingual). */
export const sections: { id: string; label: L10n }[] = [
  { id: 'profile', label: { en: 'Subject Profile', id: 'Profil Subjek' } },
  { id: 'record', label: { en: 'Service Record', id: 'Riwayat Dinas' } },
  { id: 'operations', label: { en: 'Operations', id: 'Operasi' } },
  { id: 'arsenal', label: { en: 'Arsenal', id: 'Arsenal' } },
  { id: 'education', label: { en: 'Education & Training', id: 'Pendidikan & Pelatihan' } },
  { id: 'contact', label: { en: 'Secure Channel', id: 'Saluran Aman' } },
];

export const ui = {
  redaction: {
    /** Accessible name of a redaction bar. */
    label: { en: 'redacted', id: 'disensor' },
  },
  profile: {
    subject: { en: 'Subject', id: 'Subjek' },
    photoAlt: { en: 'Subject photo', id: 'Foto subjek' },
    active: { en: 'Active', id: 'Aktif' },
    /** `{n}` is replaced by whole years since CAREER_START. */
    years: { en: '{n}+ years', id: '{n}+ tahun' },
    since: { en: 'since Aug 2016', id: 'sejak Agu 2016' },
    location: { en: 'Location', id: 'Lokasi' },
    address: { en: 'Address', id: 'Alamat' },
    phone: { en: 'Phone', id: 'Telepon' },
    email: { en: 'Email', id: 'Email' },
    summary: { en: 'Assessment', id: 'Penilaian' },
    note: { en: 'reliable. recommend contact.', id: 'bisa diandalkan. segera hubungi.' },
  },
  record: {
    clients: { en: 'Clients', id: 'Klien' },
    present: { en: 'Present', id: 'Sekarang' },
    months: {
      en: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec',
      id: 'Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des',
    },
  },
  operations: {
    intro: {
      en: 'Featured case files. Client work stays classified: the names are withheld, the engineering is not. Open a file for the full brief.',
      id: 'Berkas kasus unggulan. Pekerjaan klien tetap rahasia: namanya disembunyikan, rekayasanya tidak. Buka berkas untuk laporan lengkapnya.',
    },
    client: { en: 'CLIENT', id: 'KLIEN' },
    personal: { en: 'PERSONAL FILE', id: 'BERKAS PRIBADI' },
    /** `{n}` is the number of stack items not shown on the card. */
    more: { en: '+{n} more', id: '+{n} lagi' },
    open: { en: 'open file', id: 'buka berkas' },
    close: { en: 'close file', id: 'tutup berkas' },
    caseFile: { en: 'CASE FILE', id: 'BERKAS KASUS' },
    kind: { en: 'Type', id: 'Jenis' },
    role: { en: 'Role', id: 'Peran' },
    summary: { en: 'Brief', id: 'Ringkasan' },
    stack: { en: 'Equipment', id: 'Perlengkapan' },
    highlights: { en: 'Field notes', id: 'Catatan lapangan' },
    links: { en: 'Links', id: 'Tautan' },
    linksWithheld: {
      en: 'No public links. Client property, withheld.',
      id: 'Tanpa tautan publik. Milik klien, ditahan.',
    },
    linksPrivate: {
      en: 'Source code held privately.',
      id: 'Kode sumber disimpan privat.',
    },
    end: { en: 'END OF CASE FILE', id: 'AKHIR BERKAS KASUS' },
  },
  archive: {
    tab: { en: 'ARCHIVE', id: 'ARSIP' },
    title: { en: 'Operations archive', id: 'Arsip operasi' },
    intro: {
      en: 'Smaller operations on record, grouped by family. Client names withheld; personal projects are named.',
      id: 'Operasi lain yang tercatat, dikelompokkan per keluarga. Nama klien disembunyikan; projek pribadi disebut.',
    },
  },
  education: {
    thesis: { en: 'Thesis', id: 'Skripsi' },
  },
  arsenal: {
    intro: {
      en: 'Issued and field-tested. No percentage bars, only what has shipped.',
      id: 'Sudah dibagikan dan teruji di lapangan. Tanpa bar persentase, hanya yang sudah dipakai.',
    },
  },
  contact: {
    open: { en: 'open secure line', id: 'buka saluran aman' },
    status: { en: 'line encrypted. awaiting your message.', id: 'saluran terenkripsi. menunggu pesan Anda.' },
    email: { en: 'EMAIL', id: 'EMAIL' },
    phone: { en: 'PHONE', id: 'TELEPON' },
  },
  footer: {
    replay: { en: 'replay boot', id: 'putar ulang boot' },
    end: { en: 'END OF FILE', id: 'AKHIR BERKAS' },
  },
} satisfies Record<string, Record<string, L10n>>;
