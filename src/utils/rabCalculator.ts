import { DEFAULT_HARGA_SATUAN, createDefaultKategoriPekerjaan } from '../data/defaults';
import {
  DokumenRABData,
  HargaSatuanPreset,
  KategoriPekerjaanRAB,
  KeswadayaanData,
  UpahKerjaItem,
  VerifikasiFaktualData,
} from '../types/rab';

export interface HasilEvaluasiVerifikasi {
  luasPerJiwa: number;
  kecukupanLuasSuggested: 'A' | 'B';
  isRTLH: boolean;
  alasanRTLH: string[];
  alasanAdministratif: { nomor: number; keterangan: string }[];
  suggestedRekomendasi: 'direkomendasikan' | 'tidak_direkomendasikan';
  suggestedAlasanIds: number[];
}

export function evaluasiVerifikasi(v: VerifikasiFaktualData): HasilEvaluasiVerifikasi {
  const penghuni = Math.max(1, Number(v.jumlahPenghuni) || 1);
  const luas = Math.max(0, Number(v.luasRumah) || 0);
  const luasPerJiwa = luas / penghuni;
  const kecukupanLuasSuggested = luasPerJiwa >= 7.2 ? 'A' : 'B';

  const alasanRTLH: string[] = [];
  const { struktur, nonStruktur, kesehatan, statusLahan } = v.kondisiRumah;

  // Kriteria 2a: salah satu komponen struktur bernilai C
  (Object.entries(struktur) as [string, string][]).forEach(([k, val]) => {
    if (val === 'C') {
      alasanRTLH.push(`Struktur (${k}) bernilai C`);
    }
  });

  // Kriteria 2b: salah satu komponen non-struktur bernilai B (atau C)
  (Object.entries(nonStruktur) as [string, string][]).forEach(([k, val]) => {
    if (val === 'B' || val === 'C') {
      alasanRTLH.push(`Non-struktur (${k}) bernilai ${val}`);
    }
  });

  // Kriteria 2c: komponen kesehatan dan kecukupan luas salah satunya bernilai C
  (Object.entries(kesehatan) as [string, string][]).forEach(([k, val]) => {
    if (val === 'C') {
      alasanRTLH.push(`Kesehatan & kecukupan luas (${k}) bernilai C`);
    }
  });

  const isRTLH = alasanRTLH.length > 0;

  const alasanAdministratif: { nomor: number; keterangan: string }[] = [];
  const suggestedAlasanIds: number[] = [];

  if (!isRTLH && Object.values(struktur).some(Boolean)) {
    suggestedAlasanIds.push(3);
    alasanAdministratif.push({ nomor: 3, keterangan: 'Rumah sudah memenuhi kategori layak huni' });
  }
  if (v.memilikiAsetLain === 'Ya') {
    suggestedAlasanIds.push(4);
    alasanAdministratif.push({ nomor: 4, keterangan: 'Memiliki aset rumah lain (>1)' });
  }
  if (Number(v.lamaMenghuniTahun) > 0 && Number(v.lamaMenghuniTahun) < 1) {
    suggestedAlasanIds.push(5);
    alasanAdministratif.push({ nomor: 5, keterangan: 'Rumah dihuni kurang dari 1 tahun' });
  }
  const tahunBantuan = parseInt(v.tahunDapatBantuan || '0', 10);
  const currentYear = new Date().getFullYear();
  if (
    v.pernahDapatBantuan === 'Ya' &&
    (!Number.isFinite(tahunBantuan) || tahunBantuan === 0 || currentYear - tahunBantuan <= 5)
  ) {
    suggestedAlasanIds.push(6);
    alasanAdministratif.push({
      nomor: 6,
      keterangan: 'Pernah memperoleh bantuan perumahan dalam 5 tahun terakhir',
    });
  }
  if (Number(v.nilaiUmpUmk) > 0 && Number(v.penghasilanPerBulan) > Number(v.nilaiUmpUmk)) {
    suggestedAlasanIds.push(7);
    alasanAdministratif.push({
      nomor: 7,
      keterangan: 'Penghasilan KK per bulan melebihi UMP/UMK tertinggi',
    });
  }
  if (v.bersediaKetentuan === 'Tidak') {
    suggestedAlasanIds.push(11);
    alasanAdministratif.push({
      nomor: 11,
      keterangan: 'Tidak bersedia mengikuti ketentuan program',
    });
  }
  if (statusLahan.statusLahan === 'B') {
    // Penguasaan rumah tidak layak huni/lahan memerlukan surat keterangan tambahan, tidak otomatis ditolak, tapi dicatat
  }

  const suggestedRekomendasi =
    isRTLH && alasanAdministratif.length === 0
      ? 'direkomendasikan'
      : 'tidak_direkomendasikan';

  return {
    luasPerJiwa,
    kecukupanLuasSuggested,
    isRTLH,
    alasanRTLH,
    alasanAdministratif,
    suggestedRekomendasi,
    suggestedAlasanIds,
  };
}

export type SwadayaStockMap = Record<
  'kayu_balok' | 'kayu_kaso' | 'genteng' | 'bata_merah' | 'pasir' | 'kerikil' | 'lainnya',
  number
>;

export function getSwadayaMaterialTotals(keswadayaan: KeswadayaanData): SwadayaStockMap {
  const totals: SwadayaStockMap = {
    kayu_balok: 0,
    kayu_kaso: 0,
    genteng: 0,
    bata_merah: 0,
    pasir: 0,
    kerikil: 0,
    lainnya: 0,
  };

  const allRows = [...keswadayaan.materialBekas, ...keswadayaan.materialBaru];
  allRows.forEach((row) => {
    if (row.status === 'ada' && row.jumlahAngka > 0) {
      const target = row.kategoriTarget || 'lainnya';
      totals[target] += Number(row.jumlahAngka) || 0;
    }
  });

  return totals;
}

export function hitungRABOtomatis(
  verifikasi: VerifikasiFaktualData,
  keswadayaan: KeswadayaanData,
  currentRab: DokumenRABData,
  harga: HargaSatuanPreset = DEFAULT_HARGA_SATUAN
): DokumenRABData {
  const luas = Math.max(18, Number(verifikasi.luasRumah) || 36);
  const sisi = Math.sqrt(luas);
  const keliling = Math.round(sisi * 4 * 10) / 10; // meter lari dinding luar
  const luasDindingNet = Math.round(keliling * 2.85 * 0.85 * 10) / 10; // dikurangi bukaan pintu/jendela ~15%
  const luasAtap = Math.round(luas * 1.35 * 10) / 10; // kemiringan atap + overstek

  const { struktur, nonStruktur, kesehatan } = verifikasi.kondisiRumah;
  const metode = keswadayaan.kesimpulan.metodeKonstruksi || 'konvensional';

  // Tentukan komponen mana yang perlu pekerjaan perbaikan berdasarkan nilai B atau C
  const butuhTimbunan = nonStruktur.lantai === 'C' || struktur.pondasi === 'B' || struktur.pondasi === 'C';
  const butuhLantai = nonStruktur.lantai === 'B' || nonStruktur.lantai === 'C' || nonStruktur.lantai === '';
  const butuhDinding = nonStruktur.dinding === 'B' || nonStruktur.dinding === 'C' || nonStruktur.dinding === '';
  const butuhAtap =
    struktur.rangkaAtap === 'B' ||
    struktur.rangkaAtap === 'C' ||
    nonStruktur.penutupAtap === 'B' ||
    nonStruktur.penutupAtap === 'C' ||
    nonStruktur.penutupAtap === '';
  const butuhMCK = kesehatan.aksesSanitasi === 'B' || kesehatan.aksesSanitasi === 'C' || kesehatan.aksesSanitasi === '';
  const butuhStruktur =
    struktur.pondasi === 'B' ||
    struktur.pondasi === 'C' ||
    struktur.sloof === 'B' ||
    struktur.sloof === 'C' ||
    struktur.kolom === 'B' ||
    struktur.kolom === 'C' ||
    struktur.ringBalok === 'B' ||
    struktur.ringBalok === 'C';

  // Intensitas perbaikan (B = sebagian ~60%, C = penuh 100%)
  const faktorLantai = nonStruktur.lantai === 'B' ? 0.65 : 1;
  const faktorDinding = nonStruktur.dinding === 'B' ? 0.6 : 1;
  const faktorRangkaAtap =
    struktur.rangkaAtap === 'C' ? 1 : struktur.rangkaAtap === 'B' ? 0.65 : 0.35;
  const faktorPenutupAtap =
    nonStruktur.penutupAtap === 'C' ? 1 : nonStruktur.penutupAtap === 'B' ? 0.7 : 0.35;

  const baseCategories = createDefaultKategoriPekerjaan(harga);
  // Preserve existing custom prices from currentRab if matching item ID
  const existingPriceMap = new Map<string, number>();
  currentRab.kategoriPekerjaan.forEach((kat) => {
    kat.items.forEach((it) => {
      existingPriceMap.set(it.id, it.hargaSatuan);
    });
  });

  // Remaining swadaya pool so each unit is only deducted once across categories
  const remainingSwadaya = getSwadayaMaterialTotals(keswadayaan);

  const applySwadaya = (kebutuhan: number, key?: keyof SwadayaStockMap): { kotor: number; potong: number; beli: number } => {
    const kotor = Math.round(kebutuhan * 100) / 100;
    if (!key || remainingSwadaya[key] <= 0 || kotor <= 0) {
      return { kotor, potong: 0, beli: kotor };
    }
    const potong = Math.min(kotor, remainingSwadaya[key]);
    remainingSwadaya[key] = Math.round((remainingSwadaya[key] - potong) * 100) / 100;
    const beli = Math.max(0, Math.round((kotor - potong) * 100) / 100);
    return { kotor, potong: Math.round(potong * 100) / 100, beli };
  };

  const roundInt = (n: number) => Math.max(0, Math.round(n));
  const roundDec = (n: number) => Math.max(0, Math.round(n * 10) / 10);

  const populatedCategories: KategoriPekerjaanRAB[] = baseCategories.map((kat) => {
    const updatedKat = { ...kat };
    if (kat.id === 'kat-1') {
      updatedKat.aktif = butuhTimbunan;
      const volPasirUrug = butuhTimbunan ? roundDec(luas * 0.08) : 0;
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        const calc = applySwadaya(volPasirUrug, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    } else if (kat.id === 'kat-2') {
      updatedKat.aktif = butuhLantai;
      const area = butuhLantai ? luas * faktorLantai : 0;
      const volSemen = roundInt(area * 0.35);
      const volPasir = roundDec(area * 0.045);
      const volKerikil = roundInt(area * 42);
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        let raw = 0;
        if (it.id === 'k2-a') raw = volSemen;
        if (it.id === 'k2-b') raw = volPasir;
        if (it.id === 'k2-c') raw = volKerikil;
        const calc = applySwadaya(raw, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    } else if (kat.id === 'kat-3') {
      updatedKat.aktif = butuhDinding;
      const area = butuhDinding ? luasDindingNet * faktorDinding : 0;
      // Ferosemen memakai lebih sedikit bata merah & lebih fokus spesi/plester
      const volBata = metode === 'ferosemen' ? roundInt(area * 18) : roundInt(area * 65);
      const volSemen = metode === 'ferosemen' ? roundInt(area * 0.42) : roundInt(area * 0.32);
      const volPasir = roundDec(area * 0.042);
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        let raw = 0;
        if (it.id === 'k3-a') raw = volBata;
        if (it.id === 'k3-b') raw = volSemen;
        if (it.id === 'k3-c') raw = volPasir;
        const calc = applySwadaya(raw, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    } else if (kat.id === 'kat-4') {
      updatedKat.aktif = butuhAtap;
      const effRangka = butuhAtap ? luasAtap * faktorRangkaAtap : 0;
      const effPenutup = butuhAtap ? luasAtap * faktorPenutupAtap : 0;
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        let raw = 0;
        if (it.id === 'k4-a') raw = roundInt(effRangka * 0.25); // balok 6x12
        if (it.id === 'k4-b') raw = roundInt(effRangka * 0.65); // kaso 5/7
        if (it.id === 'k4-c') raw = roundInt(effRangka * 1.15); // reng 2/3
        if (it.id === 'k4-d') raw = roundInt(effRangka * 0.28); // besi strip kg
        if (it.id === 'k4-e') raw = roundInt(effRangka * 0.14); // paku 12 cm
        if (it.id === 'k4-f') raw = roundInt(effRangka * 0.18); // paku 5-10 cm
        if (it.id === 'k4-g') raw = roundInt(effPenutup * 24); // genteng palentong
        if (it.id === 'k4-h') raw = roundInt(sisi * 2.2 * faktorPenutupAtap); // nok genteng
        if (it.id === 'k4-i') raw = roundInt(sisi * 0.35 * faktorPenutupAtap); // semen nok
        if (it.id === 'k4-j') raw = roundDec(sisi * 0.05 * faktorPenutupAtap); // pasir pasang nok
        const calc = applySwadaya(raw, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    } else if (kat.id === 'kat-5') {
      updatedKat.aktif = butuhMCK;
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        let raw = 0;
        if (butuhMCK) {
          if (it.id === 'k5-a') raw = 2; // kran air
          if (it.id === 'k5-b') raw = 450; // bata merah MCK
          if (it.id === 'k5-c') raw = 5; // semen MCK
          if (it.id === 'k5-d') raw = 0.8; // pasir MCK
          if (it.id === 'k5-e') raw = 2; // sealtape
          if (it.id === 'k5-f') raw = 4; // pipa PVC
        }
        const calc = applySwadaya(raw, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    } else if (kat.id === 'kat-6') {
      updatedKat.aktif = butuhStruktur;
      const skorStruktur =
        (struktur.pondasi === 'C' ? 1 : struktur.pondasi === 'B' ? 0.5 : 0) +
        (struktur.sloof === 'C' ? 1 : struktur.sloof === 'B' ? 0.5 : 0) +
        (struktur.kolom === 'C' ? 1 : struktur.kolom === 'B' ? 0.5 : 0) +
        (struktur.ringBalok === 'C' ? 1 : struktur.ringBalok === 'B' ? 0.5 : 0);
      updatedKat.items = kat.items.map((it) => {
        const hs = existingPriceMap.get(it.id) ?? it.hargaSatuan;
        let raw = 0;
        if (butuhStruktur) {
          if (it.id === 'k6-a') raw = roundInt(keliling * 0.75 * Math.max(0.5, skorStruktur / 2));
          if (it.id === 'k6-b') raw = roundDec((struktur.pondasi === 'C' ? 4.5 : struktur.pondasi === 'B' ? 2 : 0.8));
          if (it.id === 'k6-c') raw = roundInt(6 + skorStruktur * 4);
        }
        const calc = applySwadaya(raw, it.swadayaKey);
        return { ...it, hargaSatuan: hs, volumeKebutuhan: calc.kotor, potonganSwadaya: calc.potong, volume: calc.beli };
      });
    }
    return updatedKat;
  });

  // Preserve custom categories added by user beyond kat-1..kat-6
  const customCats = currentRab.kategoriPekerjaan.filter(
    (c) => !['kat-1', 'kat-2', 'kat-3', 'kat-4', 'kat-5', 'kat-6'].includes(c.id)
  );

  // Hitung estimasi jangka waktu & HOK tenaga kerja otomatis
  const activeCount = populatedCategories.filter((c) => c.aktif).length;
  const hariKerja = Math.max(7, Math.min(24, Math.round(6 + activeCount * 2.5)));

  // Cek apakah ada tenaga kerja swadaya (Tenaga sendiri / dukungan keluarga / tetangga)
  const swadayaOrang = keswadayaan.tenagaKerja
    .filter((tk) => tk.status === 'ada')
    .reduce((acc, tk) => acc + Math.max(1, Number(tk.jumlahOrang) || 1), 0);

  const jumlahTukang = activeCount >= 4 ? 2 : 1;
  // Jika ada tenaga swadaya >= 2 orang, kebutuhan pekerja pembantu berbayar berkurang
  const kebutuhanPekerjaKotor = activeCount >= 3 ? 2 : 1;
  const jumlahPekerjaBerbayar = Math.max(0, kebutuhanPekerjaKotor - (swadayaOrang >= 2 ? 1 : 0));

  const tarifTukang = currentRab.upahKerja.items[0]?.tarifHarian || harga.upahTukangHari;
  const tarifPekerja = currentRab.upahKerja.items[1]?.tarifHarian || harga.upahPekerjaHari;

  const upahItems: UpahKerjaItem[] = [
    {
      id: 'up-1',
      no: '1',
      uraian: `Upah Tukang (${jumlahTukang} orang × ${hariKerja} hari)`,
      jumlahOrang: jumlahTukang,
      hariKerja,
      tarifHarian: tarifTukang,
      biaya: jumlahTukang * hariKerja * tarifTukang,
      modeHitung: 'hok',
    },
  ];

  if (jumlahPekerjaBerbayar > 0) {
    upahItems.push({
      id: 'up-2',
      no: '2',
      uraian:
        swadayaOrang > 0
          ? `Upah Pekerja / Pembantu Tukang (${jumlahPekerjaBerbayar} org berbayar, dibantu ${swadayaOrang} org swadaya)`
          : `Upah Pekerja / Pembantu Tukang (${jumlahPekerjaBerbayar} orang × ${hariKerja} hari)`,
      jumlahOrang: jumlahPekerjaBerbayar,
      hariKerja,
      tarifHarian: tarifPekerja,
      biaya: jumlahPekerjaBerbayar * hariKerja * tarifPekerja,
      modeHitung: 'hok',
    });
  } else {
    upahItems.push({
      id: 'up-2',
      no: '2',
      uraian: `Pekerja / Pembantu Tukang (Swadaya Gotong Royong ${swadayaOrang} orang — Rp 0)`,
      jumlahOrang: 0,
      hariKerja,
      tarifHarian: tarifPekerja,
      biaya: 0,
      modeHitung: 'hok',
    });
  }

  // Sinkronisasi Dana Lainnya dari Keswadayaan Uang
  const danaLainnyaItems = currentRab.danaLainnya.sinkronDariSwadayaUang
    ? keswadayaan.uang
        .filter((u) => u.status === 'ada' && u.nilai > 0)
        .map((u, idx) => ({
          id: `dl-${u.id}`,
          no: String(idx + 1),
          uraian: `Dana Swadaya (${u.sumber})`,
          biaya: Number(u.nilai) || 0,
        }))
    : currentRab.danaLainnya.items;

  return {
    ...currentRab,
    nomorKode: currentRab.nomorKode || verifikasi.nomorVerifikasi || '',
    kategoriPekerjaan: [...populatedCategories, ...customCats],
    upahKerja: {
      jangkaWaktuHari: hariKerja,
      items: upahItems,
    },
    danaLainnya: {
      ...currentRab.danaLainnya,
      items: danaLainnyaItems,
    },
    penandatangan: {
      ...currentRab.penandatangan,
      namaCPB: currentRab.penandatangan.namaCPB || verifikasi.namaKK || keswadayaan.kesimpulan.namaCPB,
      namaTPM: currentRab.penandatangan.namaTPM || keswadayaan.kesimpulan.namaTPM,
      instansiTPM: currentRab.penandatangan.instansiTPM || keswadayaan.kesimpulan.instansiTPM,
      kotaKoordinator:
        currentRab.penandatangan.kotaKoordinator ||
        verifikasi.kabupatenKota ||
        keswadayaan.kesimpulan.pemeriksaKota,
      namaKoordinator: currentRab.penandatangan.namaKoordinator || keswadayaan.kesimpulan.namaKoordinator,
      tempatTanggal: currentRab.penandatangan.tempatTanggal || keswadayaan.kesimpulan.tempatTanggal,
    },
  };
}

export interface RingkasanRAB {
  totalBahanA: number;
  totalUpahB: number;
  totalAB: number;
  totalLainnyaC: number;
  totalKeseluruhanABC: number;
  totalHematSwadayaMaterial: number;
}

export function hitungRingkasanRAB(rab: DokumenRABData): RingkasanRAB {
  let totalBahanA = 0;
  let totalHematSwadayaMaterial = 0;

  rab.kategoriPekerjaan.forEach((kat) => {
    if (!kat.aktif) return;
    kat.items.forEach((item) => {
      totalBahanA += (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0);
      totalHematSwadayaMaterial += (Number(item.potonganSwadaya) || 0) * (Number(item.hargaSatuan) || 0);
    });
  });

  const totalUpahB = rab.upahKerja.items.reduce((sum, it) => sum + (Number(it.biaya) || 0), 0);
  const totalAB = totalBahanA + totalUpahB;
  const totalLainnyaC = rab.danaLainnya.items.reduce((sum, it) => sum + (Number(it.biaya) || 0), 0);
  const totalKeseluruhanABC = totalAB + totalLainnyaC;

  return {
    totalBahanA: Math.round(totalBahanA),
    totalUpahB: Math.round(totalUpahB),
    totalAB: Math.round(totalAB),
    totalLainnyaC: Math.round(totalLainnyaC),
    totalKeseluruhanABC: Math.round(totalKeseluruhanABC),
    totalHematSwadayaMaterial: Math.round(totalHematSwadayaMaterial),
  };
}
