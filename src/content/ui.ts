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
    pending: {
      en: 'Case files are being pulled from the archive.',
      id: 'Berkas kasus sedang diambil dari arsip.',
    },
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
