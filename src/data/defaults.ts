import {
  DossierRAB,
  HargaSatuanPreset,
  KategoriPekerjaanRAB,
  KeswadayaanData,
  VerifikasiFaktualData,
} from '../types/rab';

export const DEFAULT_HARGA_SATUAN: HargaSatuanPreset = {
  pasirUrug: 195000,
  pasirBeton: 265000,
  pasirPasang: 250000,
  kerikilKg: 320,
  semenSak: 68000,
  bataMerah: 950,
  balokKayu612: 145000,
  kaso57: 62000,
  reng23: 28000,
  besiStripKg: 19500,
  paku12Kg: 24000,
  paku510Kg: 23000,
  gentengPalentong: 3200,
  nokGenteng: 8500,
  kranAir: 35000,
  sealtape: 8000,
  pipaPvcD: 58000,
  besiBetonBtg: 78000,
  batuKaliM3: 285000,
  upahTukangHari: 135000,
  upahPekerjaHari: 100000,
};

export const KONDISI_STRUKTUR_ITEMS = [
  {
    key: 'pondasi' as const,
    label: 'Pondasi',
    A: 'ada, kondisi baik, kokoh',
    B: 'ada, sebagian rapuh, tidak kokoh',
    C: 'tidak ada, seluruhnya rapuh',
  },
  {
    key: 'sloof' as const,
    label: 'Sloof',
    A: 'ada, kondisi baik, kokoh',
    B: 'ada, sebagian rapuh, tidak kokoh',
    C: 'tidak ada, seluruhnya rapuh',
  },
  {
    key: 'kolom' as const,
    label: 'Kolom',
    A: 'ada, kondisi baik, kokoh',
    B: 'ada, sebagian rapuh, tidak kokoh',
    C: 'tidak ada, seluruhnya rapuh',
  },
  {
    key: 'ringBalok' as const,
    label: 'Ring Balok',
    A: 'ada, kondisi baik, kokoh',
    B: 'ada, sebagian rapuh, tidak kokoh',
    C: 'tidak ada, seluruhnya rapuh',
  },
  {
    key: 'rangkaAtap' as const,
    label: 'Rangka Atap',
    A: 'ada, kondisi baik, kokoh',
    B: 'ada, sebagian rapuh, tidak kokoh',
    C: 'tidak ada, seluruhnya rapuh',
  },
];

export const KONDISI_NON_STRUKTUR_ITEMS = [
  {
    key: 'dinding' as const,
    label: 'Dinding',
    A: 'Tembok/setengah tembok diplester, papan kayu berkualitas, bahan dinding dengan kondisi kokoh dan kedap air',
    B: 'Tembok kondisi sebagian besar retak, papan atau bahan lain yang kurang kokoh dan tidak kedap air',
    C: 'Anyaman bambu tipis, triplek, papan, tembok, atau bahan lain yang rapuh dan tidak kedap air',
  },
  {
    key: 'lantai' as const,
    label: 'Lantai',
    A: 'Plester/ubin/keramik/papan/bahan lain kondisi baik, kedap air',
    B: 'Papan atau bahan lain dengan kondisi rusak, plester sebagian besar pecah',
    C: 'Tanah, papan atau bahan lain yang rapuh dan tidak kedap air',
  },
  {
    key: 'penutupAtap' as const,
    label: 'Penutup Atap',
    A: 'Genteng/seng/spandek, bahan tradisional (ijuk/rumbia)/bahan lain kondisi baik, tidak bocor',
    B: 'Genteng/Seng/Spandek, bahan tradisional (ijuk/rumbia)/bahan lain, kondisi rusak sebagian, bocor jika terjadi hujan lebat',
    C: 'Asbes, bahan non asbes dengan kondisi rusak berat, sering bocor jika hujan, rawan ambruk',
  },
];

export const KONDISI_KESEHATAN_ITEMS = [
  {
    key: 'aksesAirMinum' as const,
    label: 'Akses Air Minum',
    A: 'Ada',
    B: null,
    C: 'Tidak Ada',
  },
  {
    key: 'aksesSanitasi' as const,
    label: 'Akses Sanitasi',
    A: 'Ada, septiktang, kamar mandi berfungsi',
    B: 'Ada, septiktang, kamar mandi rusak, kurang berfungsi',
    C: 'Tidak Ada',
  },
  {
    key: 'pencahayaan' as const,
    label: 'Pencahayaan',
    A: 'Terang, dapat digunakan membaca dengan normal tanpa pencahayaan buatan pada siang hari',
    B: 'kurang terang sehingga kurang jelas untuk membaca dengan normal, memerlukan pencahayaan buatan pada siang hari',
    C: 'Gelap, tidak dapat digunakan untuk membaca tanpa pencahayaan buatan pada siang hari',
  },
  {
    key: 'penghawaan' as const,
    label: 'Penghawaan',
    A: 'Cukup ventilasi, sirkulasi udara baik',
    B: 'ventilasi kurang, agak pengap',
    C: 'Tidak ada ventilasi, pengap, lembab',
  },
  {
    key: 'kecukupanLuas' as const,
    label: 'Kecukupan luas ruang',
    A: 'Luas rumah dibagi jumlah penghuni, lebih atau sama dengan 7,2 m²',
    B: 'luas rumah dibagi jumlah penghuni, kurang dari 7,2 m²',
    C: 'Luas rumah dibagi jumlah penghuni, kurang dari 7,2 m²',
  },
];

export const ALASAN_TIDAK_DIREKOMENDASIKAN = [
  { id: 1, label: 'Rumah tidak ada' },
  { id: 2, label: 'Tanah bersengketa' },
  { id: 3, label: 'Rumah layak huni' },
  { id: 4, label: 'Memiliki rumah >1' },
  { id: 5, label: 'Rumah yang dihuni <1 tahun' },
  {
    id: 6,
    label: 'Pernah memperoleh Bedah Rumah/BSPS/FLPP/BP2BT/lainnya bagi MBR dalam 5 (lima) tahun terakhir, kecuali karena bencana/kebakaran/penataan kumuh',
  },
  { id: 7, label: 'Penghasilan >UMP/UMK' },
  { id: 8, label: 'Rumah tidak dihuni/pindah rumah' },
  { id: 9, label: 'Meninggal dunia' },
  { id: 10, label: 'Pindah domisili' },
  { id: 11, label: 'Lainnya sebutkan' },
];

export function createDefaultKategoriPekerjaan(harga = DEFAULT_HARGA_SATUAN): KategoriPekerjaanRAB[] {
  return [
    {
      id: 'kat-1',
      no: '1',
      judul: 'Pekerjaan Timbunan dan Pemadatan*)',
      aktif: true,
      items: [
        {
          id: 'k1-a',
          kode: 'a.',
          uraian: 'pasir urug',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.pasirUrug,
          swadayaKey: 'pasir',
        },
      ],
    },
    {
      id: 'kat-2',
      no: '2',
      judul: 'Pekerjaan Lantai*)',
      aktif: true,
      items: [
        {
          id: 'k2-a',
          kode: 'a.',
          uraian: 'semen',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'sak',
          hargaSatuan: harga.semenSak,
        },
        {
          id: 'k2-b',
          kode: 'b.',
          uraian: 'pasir beton',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.pasirBeton,
          swadayaKey: 'pasir',
        },
        {
          id: 'k2-c',
          kode: 'c.',
          uraian: 'kerikil',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'kg',
          hargaSatuan: harga.kerikilKg,
          swadayaKey: 'kerikil',
        },
      ],
    },
    {
      id: 'kat-3',
      no: '3',
      judul: 'Pekerjaan Dinding*)',
      aktif: true,
      items: [
        {
          id: 'k3-a',
          kode: 'a.',
          uraian: 'bata merah',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.bataMerah,
          swadayaKey: 'bata_merah',
        },
        {
          id: 'k3-b',
          kode: 'b.',
          uraian: 'semen',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'sak',
          hargaSatuan: harga.semenSak,
        },
        {
          id: 'k3-c',
          kode: 'c.',
          uraian: 'pasir pasang',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.pasirPasang,
          swadayaKey: 'pasir',
        },
      ],
    },
    {
      id: 'kat-4',
      no: '4',
      judul: 'Pekerjaan Atap*)',
      aktif: true,
      items: [
        {
          id: 'k4-a',
          kode: 'a.',
          uraian: 'balok kayu kelas II uk. 6x12 cm',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'btg',
          hargaSatuan: harga.balokKayu612,
          swadayaKey: 'kayu_balok',
        },
        {
          id: 'k4-b',
          kode: 'b.',
          uraian: 'kaso 5/7 kayu kelas II',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'btg',
          hargaSatuan: harga.kaso57,
          swadayaKey: 'kayu_kaso',
        },
        {
          id: 'k4-c',
          kode: 'c.',
          uraian: 'reng 2/3 kayu kelas II',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'btg',
          hargaSatuan: harga.reng23,
        },
        {
          id: 'k4-d',
          kode: 'd.',
          uraian: 'besi strip tebal 5 mm',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'kg',
          hargaSatuan: harga.besiStripKg,
        },
        {
          id: 'k4-e',
          kode: 'e.',
          uraian: 'paku 12 cm',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'kg',
          hargaSatuan: harga.paku12Kg,
        },
        {
          id: 'k4-f',
          kode: 'f.',
          uraian: 'paku 5-10 cm',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'kg',
          hargaSatuan: harga.paku510Kg,
        },
        {
          id: 'k4-g',
          kode: 'g.',
          uraian: 'genteng palentong kecil',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.gentengPalentong,
          swadayaKey: 'genteng',
        },
        {
          id: 'k4-h',
          kode: 'h.',
          uraian: 'nok genteng palentong kecil',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.nokGenteng,
        },
        {
          id: 'k4-i',
          kode: 'i.',
          uraian: 'semen ... 60 kg',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'sak',
          hargaSatuan: harga.semenSak,
        },
        {
          id: 'k4-j',
          kode: 'j.',
          uraian: 'pasir pasang',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.pasirPasang,
          swadayaKey: 'pasir',
        },
      ],
    },
    {
      id: 'kat-5',
      no: '5',
      judul: 'Mandi Cuci Kakus*)',
      aktif: true,
      items: [
        {
          id: 'k5-a',
          kode: 'a.',
          uraian: 'kran air diameter 3/4 inch',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.kranAir,
        },
        {
          id: 'k5-b',
          kode: 'b.',
          uraian: 'bata merah',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.bataMerah,
          swadayaKey: 'bata_merah',
        },
        {
          id: 'k5-c',
          kode: 'c.',
          uraian: 'semen ... 60 kg',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'sak',
          hargaSatuan: harga.semenSak,
        },
        {
          id: 'k5-d',
          kode: 'd.',
          uraian: 'pasir pasang',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.pasirPasang,
          swadayaKey: 'pasir',
        },
        {
          id: 'k5-e',
          kode: 'e.',
          uraian: 'selotip pipa (sealtape)',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'bh',
          hargaSatuan: harga.sealtape,
        },
        {
          id: 'k5-f',
          kode: 'f.',
          uraian: 'pipa PVC D; DN 1 1/2" (40 mm) + fitting & aksesoris',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'btg',
          hargaSatuan: harga.pipaPvcD,
        },
      ],
    },
    {
      id: 'kat-6',
      no: '6',
      judul: 'Pekerjaan Struktur (Pondasi/Sloof/Kolom/Ring Balok)',
      isCustomTitle: true,
      aktif: false,
      items: [
        {
          id: 'k6-a',
          kode: 'a.',
          uraian: 'besi beton Ø10 mm',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'btg',
          hargaSatuan: harga.besiBetonBtg,
        },
        {
          id: 'k6-b',
          kode: 'b.',
          uraian: 'batu kali / belah',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'm³',
          hargaSatuan: harga.batuKaliM3,
        },
        {
          id: 'k6-c',
          kode: 'c.',
          uraian: 'semen',
          volumeKebutuhan: 0,
          potonganSwadaya: 0,
          volume: 0,
          satuan: 'sak',
          hargaSatuan: harga.semenSak,
        },
      ],
    },
  ];
}

export function createEmptyVerifikasi(): VerifikasiFaktualData {
  return {
    nomorVerifikasi: '',
    namaKK: '',
    nik: '',
    nomorKK: '',
    jenisKelamin: '',
    umur: '',
    alamatRTLH: '',
    rtRw: '',
    desaKelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
    penghasilanPerBulan: 0,
    nilaiUmpUmk: 2500000,
    pernahDapatBantuan: 'Tidak',
    tahunDapatBantuan: '0',
    lamaMenghuniTahun: 1,
    memilikiAsetLain: 'Tidak',
    jumlahPenghuni: 1,
    luasRumah: 36,
    bersediaKetentuan: 'Ya',
    titikKoordinat: '',
    kondisiRumah: {
      struktur: {
        pondasi: '',
        sloof: '',
        kolom: '',
        ringBalok: '',
        rangkaAtap: '',
      },
      nonStruktur: {
        dinding: '',
        lantai: '',
        penutupAtap: '',
      },
      kesehatan: {
        aksesAirMinum: '',
        aksesSanitasi: '',
        pencahayaan: '',
        penghawaan: '',
        kecukupanLuas: '',
      },
      statusLahan: {
        statusLahan: '',
      },
    },
  };
}

export function createEmptyKeswadayaan(): KeswadayaanData {
  return {
    materialBekas: [
      { id: 'mb-1', no: '1', bentuk: 'Kayu', status: '', jumlahAngka: 0, satuan: 'btg', ceklisFoto: false, kategoriTarget: 'kayu_kaso' },
      { id: 'mb-1a', no: '', bentuk: 'Balok Kayu', isSubRow: true, status: '', jumlahAngka: 0, satuan: 'btg', ceklisFoto: false, kategoriTarget: 'kayu_balok' },
      { id: 'mb-1b', no: '', bentuk: 'Kusen', isSubRow: true, status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'lainnya' },
      { id: 'mb-1c', no: '', bentuk: 'Daun Pintu', isSubRow: true, status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'lainnya' },
      { id: 'mb-1d', no: '', bentuk: 'Jendela', isSubRow: true, status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'lainnya' },
      { id: 'mb-2', no: '2', bentuk: 'Genteng', status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'genteng' },
      { id: 'mb-3', no: '3', bentuk: 'Batu Bata', status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'bata_merah' },
      { id: 'mb-4', no: '4', bentuk: '', isEditableName: true, status: '', jumlahAngka: 0, satuan: 'unit', ceklisFoto: false, kategoriTarget: 'lainnya' },
      { id: 'mb-5', no: '5', bentuk: '', isEditableName: true, status: '', jumlahAngka: 0, satuan: 'unit', ceklisFoto: false, kategoriTarget: 'lainnya' },
    ],
    materialBaru: [
      { id: 'mn-1', no: '1', bentuk: 'Kayu', status: '', jumlahAngka: 0, satuan: 'btg', ceklisFoto: false, kategoriTarget: 'kayu_kaso' },
      { id: 'mn-2', no: '2', bentuk: 'Genteng', status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'genteng' },
      { id: 'mn-3', no: '3', bentuk: 'Batu Bata', status: '', jumlahAngka: 0, satuan: 'bh', ceklisFoto: false, kategoriTarget: 'bata_merah' },
      { id: 'mn-4', no: '4', bentuk: 'Pasir', status: '', jumlahAngka: 0, satuan: 'm³', ceklisFoto: false, kategoriTarget: 'pasir' },
      { id: 'mn-5', no: '5', bentuk: 'Kerikil', status: '', jumlahAngka: 0, satuan: 'kg', ceklisFoto: false, kategoriTarget: 'kerikil' },
      { id: 'mn-6', no: '6', bentuk: '', isEditableName: true, status: '', jumlahAngka: 0, satuan: 'unit', ceklisFoto: false, kategoriTarget: 'lainnya' },
      { id: 'mn-7', no: '7', bentuk: '', isEditableName: true, status: '', jumlahAngka: 0, satuan: 'unit', ceklisFoto: false, kategoriTarget: 'lainnya' },
    ],
    uang: [
      { id: 'u-1', no: '1', sumber: 'Tabungan', status: '', nilai: 0 },
      { id: 'u-2', no: '2', sumber: 'Hasil jual panen/ternak', status: '', nilai: 0 },
      { id: 'u-3', no: '3', sumber: 'Bantuan keluarga/kerabat', status: '', nilai: 0 },
      { id: 'u-4', no: '4', sumber: 'Lainnya ...', isEditableName: true, status: '', nilai: 0 },
    ],
    tenagaKerja: [
      { id: 'tk-1', no: '1', sumber: 'Tenaga Sendiri', status: '', nama: '', jumlahOrang: 1 },
      { id: 'tk-2', no: '2', sumber: 'Dukungan keluarga', status: '', nama: '', jumlahOrang: 0 },
      { id: 'tk-3', no: '3', sumber: 'Dukungan tetangga/kerabat', status: '', nama: '', jumlahOrang: 0 },
      { id: 'tk-4', no: '4', sumber: 'Lainnya ...', isEditableName: true, status: '', nama: '', jumlahOrang: 0 },
    ],
    kesimpulan: {
      statusRekomendasi: '',
      metodeKonstruksi: 'konvensional',
      alasanTidakDirekomendasikan: [],
      alasanLainnya: '',
      pemeriksaKota: '',
      namaKoordinator: '',
      namaCPB: '',
      tempatTanggal: '',
      namaTPM: '',
      instansiTPM: '',
    },
  };
}

export function createEmptyDossier(): DossierRAB {
  const id = `rab-${Date.now()}`;
  return {
    id,
    updatedAt: new Date().toISOString(),
    verifikasi: createEmptyVerifikasi(),
    keswadayaan: createEmptyKeswadayaan(),
    rab: {
      nomorKode: '',
      jenisKegiatan: 'peningkatan kualitas/renovasi/perbaikan rumah',
      fotoPerspektif: '',
      kategoriPekerjaan: createDefaultKategoriPekerjaan(),
      upahKerja: {
        jangkaWaktuHari: 14,
        items: [
          {
            id: 'up-1',
            no: '1',
            uraian: 'Tukang Batu / Kayu (Upah Harian)',
            jumlahOrang: 1,
            hariKerja: 14,
            tarifHarian: DEFAULT_HARGA_SATUAN.upahTukangHari,
            biaya: 1 * 14 * DEFAULT_HARGA_SATUAN.upahTukangHari,
            modeHitung: 'hok',
          },
          {
            id: 'up-2',
            no: '2',
            uraian: 'Pekerja / Pembantu Tukang',
            jumlahOrang: 1,
            hariKerja: 14,
            tarifHarian: DEFAULT_HARGA_SATUAN.upahPekerjaHari,
            biaya: 1 * 14 * DEFAULT_HARGA_SATUAN.upahPekerjaHari,
            modeHitung: 'hok',
          },
        ],
      },
      danaLainnya: {
        sinkronDariSwadayaUang: true,
        items: [],
      },
      penandatangan: {
        tempatTanggal: '',
        ketuaKelompok: '',
        namaCPB: '',
        instansiTPM: '',
        namaTPM: '',
        kotaKoordinator: '',
        namaKoordinator: '',
      },
    },
  };
}

export function createSampleDossier(): DossierRAB {
  const base = createEmptyDossier();
  base.id = 'sample-cpb-01';
  base.verifikasi = {
    nomorVerifikasi: '042/VF-BSPS/PKP/2026',
    namaKK: 'Slamet Riyadi',
    nik: '3308121405780003',
    nomorKK: '3308120911080012',
    jenisKelamin: 'L',
    umur: '48 Tahun',
    alamatRTLH: 'Dusun Krajan RT 003 / RW 002',
    rtRw: '003 / 002',
    desaKelurahan: 'Sukomakmur',
    kecamatan: 'Kajoran',
    kabupatenKota: 'Magelang',
    provinsi: 'Jawa Tengah',
    penghasilanPerBulan: 1450000,
    nilaiUmpUmk: 2467000,
    pernahDapatBantuan: 'Tidak',
    tahunDapatBantuan: '0',
    lamaMenghuniTahun: 16,
    memilikiAsetLain: 'Tidak',
    jumlahPenghuni: 4,
    luasRumah: 36,
    bersediaKetentuan: 'Ya',
    titikKoordinat: '-7.481240, 110.098420',
    kondisiRumah: {
      struktur: {
        pondasi: 'B',
        sloof: 'C',
        kolom: 'B',
        ringBalok: 'C',
        rangkaAtap: 'B',
      },
      nonStruktur: {
        dinding: 'C',
        lantai: 'C',
        penutupAtap: 'B',
      },
      kesehatan: {
        aksesAirMinum: 'A',
        aksesSanitasi: 'C',
        pencahayaan: 'B',
        penghawaan: 'B',
        kecukupanLuas: 'A',
      },
      statusLahan: {
        statusLahan: 'A',
      },
    },
  };

  base.keswadayaan = createEmptyKeswadayaan();
  base.keswadayaan.materialBekas[1].status = 'ada'; // Balok Kayu
  base.keswadayaan.materialBekas[1].jumlahAngka = 4;
  base.keswadayaan.materialBekas[1].ceklisFoto = true;
  base.keswadayaan.materialBekas[5].status = 'ada'; // Genteng
  base.keswadayaan.materialBekas[5].jumlahAngka = 400;
  base.keswadayaan.materialBekas[5].ceklisFoto = true;
  base.keswadayaan.materialBekas[6].status = 'ada'; // Batu Bata
  base.keswadayaan.materialBekas[6].jumlahAngka = 350;
  base.keswadayaan.materialBekas[6].ceklisFoto = true;

  base.keswadayaan.materialBaru[3].status = 'ada'; // Pasir
  base.keswadayaan.materialBaru[3].jumlahAngka = 1.5;
  base.keswadayaan.materialBaru[3].ceklisFoto = true;

  base.keswadayaan.uang[0].status = 'ada'; // Tabungan
  base.keswadayaan.uang[0].nilai = 1200000;
  base.keswadayaan.uang[2].status = 'ada'; // Bantuan keluarga
  base.keswadayaan.uang[2].nilai = 500000;

  base.keswadayaan.tenagaKerja[0].status = 'ada';
  base.keswadayaan.tenagaKerja[0].nama = 'Slamet Riyadi (CPB)';
  base.keswadayaan.tenagaKerja[0].jumlahOrang = 1;
  base.keswadayaan.tenagaKerja[1].status = 'ada';
  base.keswadayaan.tenagaKerja[1].nama = 'Agus Santoso (Adik)';
  base.keswadayaan.tenagaKerja[1].jumlahOrang = 1;

  base.keswadayaan.kesimpulan = {
    statusRekomendasi: 'direkomendasikan',
    metodeKonstruksi: 'konvensional',
    alasanTidakDirekomendasikan: [],
    alasanLainnya: '',
    pemeriksaKota: 'Magelang',
    namaKoordinator: 'Ir. Hendra Wijaya',
    namaCPB: 'Slamet Riyadi',
    tempatTanggal: 'Magelang, 18 November 2026',
    namaTPM: 'Budi Prasetyo',
    instansiTPM: 'PKP Kab. Magelang',
  };

  base.rab.nomorKode = 'RAB-042/BSPS-2026';
  base.rab.penandatangan = {
    tempatTanggal: 'Magelang, 20 November 2026',
    ketuaKelompok: 'Suparman',
    namaCPB: 'Slamet Riyadi',
    instansiTPM: 'PKP Kab. Magelang',
    namaTPM: 'Budi Prasetyo',
    kotaKoordinator: 'Magelang',
    namaKoordinator: 'Ir. Hendra Wijaya',
  };

  return base;
}
