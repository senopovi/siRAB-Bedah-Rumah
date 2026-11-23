import {
  KONDISI_KESEHATAN_ITEMS,
  KONDISI_NON_STRUKTUR_ITEMS,
  KONDISI_STRUKTUR_ITEMS,
} from '../data/defaults';
import { VerifikasiFaktualData } from '../types/rab';

export type VerifikasiFieldKey =
  | 'namaKK'
  | 'nik'
  | 'jenisKelamin'
  | 'alamatRTLH'
  | 'desaKelurahan'
  | 'kecamatan'
  | 'kabupatenKota'
  | 'provinsi'
  | 'jumlahPenghuni'
  | 'luasRumah'
  | 'kondisiStruktur'
  | 'kondisiNonStruktur'
  | 'kondisiKesehatan'
  | 'statusLahan';

export interface VerifikasiValidationResult {
  isValid: boolean;
  errors: Partial<Record<VerifikasiFieldKey, string>>;
  missingConditionKeys: string[];
  summaryList: string[];
}

export function validateVerifikasiFaktual(
  data: VerifikasiFaktualData
): VerifikasiValidationResult {
  const errors: Partial<Record<VerifikasiFieldKey, string>> = {};
  const missingConditionKeys: string[] = [];
  const summaryList: string[] = [];

  if (!data.namaKK.trim()) {
    errors.namaKK = 'Nama KK / pemilik rumah wajib diisi.';
    summaryList.push('Nama KK / Pemilik Rumah');
  }

  if (!data.nik.trim()) {
    errors.nik = 'NIK wajib diisi.';
    summaryList.push('NIK');
  } else if (!/^\d{16}$/.test(data.nik.trim())) {
    errors.nik = 'NIK harus terdiri dari 16 digit angka.';
    summaryList.push('NIK (16 digit angka)');
  }

  if (!data.jenisKelamin) {
    errors.jenisKelamin = 'Pilih jenis kelamin (L atau P).';
    summaryList.push('Jenis Kelamin (L/P)');
  }

  if (!data.alamatRTLH.trim()) {
    errors.alamatRTLH = 'Alamat lengkap RTLH wajib diisi.';
    summaryList.push('Alamat RTLH');
  }

  if (!data.desaKelurahan.trim()) {
    errors.desaKelurahan = 'Desa / Kelurahan wajib diisi.';
    summaryList.push('Desa / Kelurahan');
  }

  if (!data.kecamatan.trim()) {
    errors.kecamatan = 'Kecamatan wajib diisi.';
    summaryList.push('Kecamatan');
  }

  if (!data.kabupatenKota.trim()) {
    errors.kabupatenKota = 'Kabupaten / Kota wajib diisi.';
    summaryList.push('Kabupaten / Kota');
  }

  if (!data.provinsi.trim()) {
    errors.provinsi = 'Provinsi wajib diisi.';
    summaryList.push('Provinsi');
  }

  if (!data.jumlahPenghuni || Number(data.jumlahPenghuni) < 1) {
    errors.jumlahPenghuni = 'Jumlah penghuni minimal 1 jiwa.';
    summaryList.push('Jumlah Penghuni');
  }

  if (!data.luasRumah || Number(data.luasRumah) <= 0) {
    errors.luasRumah = 'Luas rumah harus lebih dari 0 m².';
    summaryList.push('Luas Rumah (m²)');
  }

  // Kondisi Rumah: Struktur
  const missingStruktur: string[] = [];
  KONDISI_STRUKTUR_ITEMS.forEach((it) => {
    if (!data.kondisiRumah.struktur[it.key]) {
      missingStruktur.push(it.label);
      missingConditionKeys.push(`struktur.${it.key}`);
    }
  });
  if (missingStruktur.length > 0) {
    errors.kondisiStruktur = `Pilih kondisi (A/B/C) untuk: ${missingStruktur.join(', ')}.`;
    summaryList.push(`Kondisi Struktur (${missingStruktur.join(', ')})`);
  }

  // Kondisi Rumah: Non-Struktur
  const missingNonStruktur: string[] = [];
  KONDISI_NON_STRUKTUR_ITEMS.forEach((it) => {
    if (!data.kondisiRumah.nonStruktur[it.key]) {
      missingNonStruktur.push(it.label);
      missingConditionKeys.push(`nonStruktur.${it.key}`);
    }
  });
  if (missingNonStruktur.length > 0) {
    errors.kondisiNonStruktur = `Pilih kondisi (A/B/C) untuk: ${missingNonStruktur.join(', ')}.`;
    summaryList.push(`Kondisi Non-Struktur (${missingNonStruktur.join(', ')})`);
  }

  // Kondisi Rumah: Kesehatan & Kecukupan Luas
  const missingKesehatan: string[] = [];
  KONDISI_KESEHATAN_ITEMS.forEach((it) => {
    if (!data.kondisiRumah.kesehatan[it.key]) {
      missingKesehatan.push(it.label);
      missingConditionKeys.push(`kesehatan.${it.key}`);
    }
  });
  if (missingKesehatan.length > 0) {
    errors.kondisiKesehatan = `Pilih kondisi untuk: ${missingKesehatan.join(', ')}.`;
    summaryList.push(`Kesehatan & Kecukupan Luas (${missingKesehatan.join(', ')})`);
  }

  // Status Lahan
  if (!data.kondisiRumah.statusLahan.statusLahan) {
    errors.statusLahan = 'Pilih status lahan (A atau B).';
    missingConditionKeys.push('statusLahan.statusLahan');
    summaryList.push('Status Lahan');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingConditionKeys,
    summaryList,
  };
}
