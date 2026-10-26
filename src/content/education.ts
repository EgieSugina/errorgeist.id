import type { L10n } from '../i18n/types';

export const education: {
  primary: { degree: L10n; school: string; status: L10n };
  others: { label: L10n; detail?: L10n }[];
} = {
  primary: {
    degree: {
      en: "Bachelor's in Information Systems (S.Kom)",
      id: 'S1 Sistem Informasi (S.Kom)',
    },
    school: 'Universitas Subang (UNSUB)',
    status: { en: 'Graduated, Odd Semester 2025/2026', id: 'Lulus, Ganjil 2025/2026' },
  },
  others: [
    {
      label: { en: 'SMKN 2 Subang', id: 'SMKN 2 Subang' },
      detail: { en: 'Software Engineering (RPL)', id: 'Rekayasa Perangkat Lunak (RPL)' },
    },
    { label: { en: 'NDG Linux Unhatched & Essentials', id: 'NDG Linux Unhatched & Essentials' } },
    {
      label: { en: 'TOEFL', id: 'TOEFL' },
      detail: { en: 'Score 487', id: 'Skor 487' },
    },
    {
      label: {
        en: 'Cisco: Next Generation Network IPv6',
        id: 'Cisco: Next Generation Network IPv6',
      },
      detail: { en: 'UNSUB, online, August 2023', id: 'UNSUB, daring, Agustus 2023' },
    },
  ],
};
