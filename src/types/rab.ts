export type GradeABC = 'A' | 'B' | 'C' | '';
export type GradeAC = 'A' | 'C' | '';
export type GradeAB = 'A' | 'B' | '';
export type YaTidak = 'Ya' | 'Tidak' | '';

export interface VerifikasiFaktualData {
  nomorVerifikasi: string;
  namaKK: string;
  nik: string;
  nomorKK: string;
  jenisKelamin: 'L' | 'P' | '';
  umur: string;
  alamatRTLH: string;
  rtRw: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  penghasilanPerBulan: number;
  nilaiUmpUmk: number;
  pernahDapatBantuan: YaTidak;
  tahunDapatBantuan: string;
  lamaMenghuniTahun: number;
  memilikiAsetLain: YaTidak;
  jumlahPenghuni: number;
  luasRumah: number;
  bersediaKetentuan: YaTidak;
  titikKoordinat: string;
  kondisiRumah: {
    struktur: {
      pondasi: GradeABC;
      sloof: GradeABC;
      kolom: GradeABC;
      ringBalok: GradeABC;
      rangkaAtap: GradeABC;
    };
    nonStruktur: {
      dinding: GradeABC;
      lantai: GradeABC;
      penutupAtap: GradeABC;
    };
    kesehatan: {
      aksesAirMinum: GradeAC;
      aksesSanitasi: GradeABC;
      pencahayaan: GradeABC;
      penghawaan: GradeABC;
      kecukupanLuas: GradeABC;
    };
    statusLahan: {
      statusLahan: GradeAB;
    };
  };
}

export type AdaTidak = 'ada' | 'tidak_ada' | '';

export interface MaterialSwadayaRow {
  id: string;
  no: string;
  bentuk: string;
  isSubRow?: boolean;
  isEditableName?: boolean;
  status: AdaTidak;
  jumlahAngka: number;
  satuan: string;
  ceklisFoto: boolean;
  kategoriTarget?: 'kayu_balok' | 'kayu_kaso' | 'genteng' | 'bata_merah' | 'pasir' | 'kerikil' | 'lainnya';
}

export interface UangSwadayaRow {
  id: string;
  no: string;
  sumber: string;
  isEditableName?: boolean;
  status: AdaTidak;
  nilai: number;
}

export interface TenagaKerjaSwadayaRow {
  id: string;
  no: string;
  sumber: string;
  isEditableName?: boolean;
  status: AdaTidak;
  nama: string;
  jumlahOrang: number;
}

export interface KesimpulanVerifikasi {
  statusRekomendasi: 'direkomendasikan' | 'tidak_direkomendasikan' | '';
  metodeKonstruksi: 'konvensional' | 'ferosemen' | '';
  alasanTidakDirekomendasikan: number[]; // 1..11
  alasanLainnya: string;
  pemeriksaKota: string;
  namaKoordinator: string;
  namaCPB: string;
  tempatTanggal: string;
  namaTPM: string;
  instansiTPM: string;
}

export interface KeswadayaanData {
  materialBekas: MaterialSwadayaRow[];
  materialBaru: MaterialSwadayaRow[];
  uang: UangSwadayaRow[];
  tenagaKerja: TenagaKerjaSwadayaRow[];
  kesimpulan: KesimpulanVerifikasi;
}

export interface MaterialRABItem {
  id: string;
  kode: string;
  uraian: string;
  volumeKebutuhan: number;
  potonganSwadaya: number;
  volume: number; // volumeKebutuhan - potonganSwadaya (editable directly or auto-computed)
  satuan: string;
  hargaSatuan: number;
  swadayaKey?: 'kayu_balok' | 'kayu_kaso' | 'genteng' | 'bata_merah' | 'pasir' | 'kerikil' | 'lainnya';
}

export interface KategoriPekerjaanRAB {
  id: string;
  no: string;
  judul: string;
  isCustomTitle?: boolean;
  aktif: boolean;
  items: MaterialRABItem[];
}

export interface UpahKerjaItem {
  id: string;
  no: string;
  uraian: string;
  jumlahOrang: number;
  hariKerja: number;
  tarifHarian: number;
  biaya: number; // jumlahOrang * hariKerja * tarifHarian (or direct input)
  modeHitung: 'hok' | 'borongan';
}

export interface DanaLainnyaItem {
  id: string;
  no: string;
  uraian: string;
  biaya: number;
}

export interface DokumenRABData {
  nomorKode: string;
  jenisKegiatan: string;
  fotoPerspektif: string; // Data URL or empty
  kategoriPekerjaan: KategoriPekerjaanRAB[];
  upahKerja: {
    jangkaWaktuHari: number;
    items: UpahKerjaItem[];
  };
  danaLainnya: {
    sinkronDariSwadayaUang: boolean;
    items: DanaLainnyaItem[];
  };
  penandatangan: {
    tempatTanggal: string;
    ketuaKelompok: string;
    namaCPB: string;
    instansiTPM: string;
    namaTPM: string;
    kotaKoordinator: string;
    namaKoordinator: string;
  };
}

export interface DossierRAB {
  id: string;
  updatedAt: string;
  verifikasi: VerifikasiFaktualData;
  keswadayaan: KeswadayaanData;
  rab: DokumenRABData;
}

export interface HargaSatuanPreset {
  pasirUrug: number;
  pasirBeton: number;
  pasirPasang: number;
  kerikilKg: number;
  semenSak: number;
  bataMerah: number;
  balokKayu612: number;
  kaso57: number;
  reng23: number;
  besiStripKg: number;
  paku12Kg: number;
  paku510Kg: number;
  gentengPalentong: number;
  nokGenteng: number;
  kranAir: number;
  sealtape: number;
  pipaPvcD: number;
  besiBetonBtg: number;
  batuKaliM3: number;
  upahTukangHari: number;
  upahPekerjaHari: number;
}
