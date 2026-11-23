import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  ImagePlus,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {
  DokumenRABData,
  HargaSatuanPreset,
  KategoriPekerjaanRAB,
  KeswadayaanData,
  MaterialRABItem,
  UpahKerjaItem,
  VerifikasiFaktualData,
} from '../types/rab';
import { formatAngka, formatRupiah, terbilangRupiah } from '../utils/formatters';
import { hitungRingkasanRAB } from '../utils/rabCalculator';

interface Props {
  verifikasi: VerifikasiFaktualData;
  keswadayaan: KeswadayaanData;
  rab: DokumenRABData;
  hargaPreset: HargaSatuanPreset;
  onChangeHargaPreset: (next: HargaSatuanPreset) => void;
  onChangeRab: (next: DokumenRABData) => void;
  onAutoCalculate: () => void;
  onGoToOutput: () => void;
}

const HURUF_KODE = 'abcdefghijklmnopqrstuvwxyz';

export const KalkulatorRAB: React.FC<Props> = ({
  keswadayaan,
  rab,
  hargaPreset,
  onChangeHargaPreset,
  onChangeRab,
  onAutoCalculate,
  onGoToOutput,
}) => {
  const [showHsd, setShowHsd] = useState(false);

  const ringkasan = hitungRingkasanRAB(rab);

  const updateKategori = (katId: string, patch: Partial<KategoriPekerjaanRAB>) => {
    onChangeRab({
      ...rab,
      kategoriPekerjaan: rab.kategoriPekerjaan.map((k) =>
        k.id === katId ? { ...k, ...patch } : k
      ),
    });
  };

  const updateMaterialItem = (
    katId: string,
    itemId: string,
    patch: Partial<MaterialRABItem>
  ) => {
    const nextCats = rab.kategoriPekerjaan.map((kat) => {
      if (kat.id !== katId) return kat;
      return {
        ...kat,
        items: kat.items.map((it) => {
          if (it.id !== itemId) return it;
          const merged = { ...it, ...patch };
          // If volumeKebutuhan or potonganSwadaya changed, recalculate net volume
          if (patch.volumeKebutuhan !== undefined || patch.potonganSwadaya !== undefined) {
            merged.volume = Math.max(
              0,
              Math.round((merged.volumeKebutuhan - merged.potonganSwadaya) * 100) / 100
            );
          }
          return merged;
        }),
      };
    });
    onChangeRab({ ...rab, kategoriPekerjaan: nextCats });
  };

  const addMaterialItem = (katId: string) => {
    const nextCats = rab.kategoriPekerjaan.map((kat) => {
      if (kat.id !== katId) return kat;
      const nextIndex = kat.items.length;
      const kode = `${HURUF_KODE[nextIndex] || nextIndex + 1}.`;
      const newItem: MaterialRABItem = {
        id: `${katId}-${Date.now()}`,
        kode,
        uraian: 'Material tambahan',
        volumeKebutuhan: 1,
        potonganSwadaya: 0,
        volume: 1,
        satuan: 'bh',
        hargaSatuan: 0,
      };
      return { ...kat, aktif: true, items: [...kat.items, newItem] };
    });
    onChangeRab({ ...rab, kategoriPekerjaan: nextCats });
  };

  const removeMaterialItem = (katId: string, itemId: string) => {
    const nextCats = rab.kategoriPekerjaan.map((kat) => {
      if (kat.id !== katId) return kat;
      const filtered = kat.items
        .filter((it) => it.id !== itemId)
        .map((it, idx) => ({ ...it, kode: `${HURUF_KODE[idx] || idx + 1}.` }));
      return { ...kat, items: filtered };
    });
    onChangeRab({ ...rab, kategoriPekerjaan: nextCats });
  };

  const addCustomKategori = () => {
    const nextNo = String(rab.kategoriPekerjaan.length + 1);
    const newKat: KategoriPekerjaanRAB = {
      id: `kat-custom-${Date.now()}`,
      no: nextNo,
      judul: 'Pekerjaan Tambahan (sesuai kebutuhan)',
      isCustomTitle: true,
      aktif: true,
      items: [
        {
          id: `item-${Date.now()}`,
          kode: 'a.',
          uraian: 'Material sesuai kebutuhan',
          volumeKebutuhan: 1,
          potonganSwadaya: 0,
          volume: 1,
          satuan: 'bh',
          hargaSatuan: 0,
        },
      ],
    };
    onChangeRab({ ...rab, kategoriPekerjaan: [...rab.kategoriPekerjaan, newKat] });
  };

  const updateUpahItem = (id: string, patch: Partial<UpahKerjaItem>) => {
    const nextItems = rab.upahKerja.items.map((it) => {
      if (it.id !== id) return it;
      const merged = { ...it, ...patch };
      if (merged.modeHitung === 'hok' && patch.biaya === undefined) {
        merged.biaya = Math.round(
          (Number(merged.jumlahOrang) || 0) *
            (Number(merged.hariKerja) || 0) *
            (Number(merged.tarifHarian) || 0)
        );
      }
      return merged;
    });
    onChangeRab({
      ...rab,
      upahKerja: { ...rab.upahKerja, items: nextItems },
    });
  };

  const addUpahItem = () => {
    const nextNo = String(rab.upahKerja.items.length + 1);
    const newUpah: UpahKerjaItem = {
      id: `up-${Date.now()}`,
      no: nextNo,
      uraian: 'Tenaga Kerja Tambahan',
      jumlahOrang: 1,
      hariKerja: rab.upahKerja.jangkaWaktuHari || 14,
      tarifHarian: hargaPreset.upahPekerjaHari,
      biaya: (rab.upahKerja.jangkaWaktuHari || 14) * hargaPreset.upahPekerjaHari,
      modeHitung: 'hok',
    };
    onChangeRab({
      ...rab,
      upahKerja: { ...rab.upahKerja, items: [...rab.upahKerja.items, newUpah] },
    });
  };

  const removeUpahItem = (id: string) => {
    const filtered = rab.upahKerja.items
      .filter((it) => it.id !== id)
      .map((it, idx) => ({ ...it, no: String(idx + 1) }));
    onChangeRab({
      ...rab,
      upahKerja: { ...rab.upahKerja, items: filtered },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeRab({ ...rab, fotoPerspektif: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const hsdFields: { key: keyof HargaSatuanPreset; label: string; unit: string }[] = [
    { key: 'semenSak', label: 'Semen', unit: 'sak' },
    { key: 'bataMerah', label: 'Bata Merah', unit: 'bh' },
    { key: 'pasirUrug', label: 'Pasir Urug', unit: 'm³' },
    { key: 'pasirBeton', label: 'Pasir Beton', unit: 'm³' },
    { key: 'pasirPasang', label: 'Pasir Pasang', unit: 'm³' },
    { key: 'kerikilKg', label: 'Kerikil', unit: 'kg' },
    { key: 'balokKayu612', label: 'Balok Kayu 6x12', unit: 'btg' },
    { key: 'kaso57', label: 'Kaso 5/7', unit: 'btg' },
    { key: 'reng23', label: 'Reng 2/3', unit: 'btg' },
    { key: 'gentengPalentong', label: 'Genteng Palentong', unit: 'bh' },
    { key: 'nokGenteng', label: 'Nok Genteng', unit: 'bh' },
    { key: 'upahTukangHari', label: 'Upah Tukang', unit: 'hari' },
    { key: 'upahPekerjaHari', label: 'Upah Pekerja', unit: 'hari' },
  ];

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Kalkulator Otomatis Material & Tenaga Kerja (RAB)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Volume material dihitung otomatis dari luas rumah & komponen rusak (nilai B/C), lalu dikurangi stok material swadaya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowHsd((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Harga Satuan Daerah (HSD)
              {showHsd ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={onAutoCalculate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
            >
              <Calculator className="h-3.5 w-3.5" />
              Hitung Ulang Otomatis
            </button>
            <button
              type="button"
              onClick={onGoToOutput}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" />
              Lihat Dokumen Output →
            </button>
          </div>
        </div>

        {/* Collapsible HSD Settings */}
        {showHsd && (
          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">
                Sesuaikan Harga Satuan Dasar (Rp) lalu klik "Hitung Ulang Otomatis" untuk menerapkan ke seluruh item RAB.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hsdFields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    {f.label} <span className="text-slate-400">/{f.unit}</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={hargaPreset[f.key]}
                    onChange={(e) =>
                      onChangeHargaPreset({
                        ...hargaPreset,
                        [f.key]: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4-Column Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Bahan Bangunan (A)</p>
          <p className="mt-1.5 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(ringkasan.totalBahanA)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Hemat swadaya material: {formatRupiah(ringkasan.totalHematSwadayaMaterial)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Upah Kerja (B)</p>
          <p className="mt-1.5 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(ringkasan.totalUpahB)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Jangka waktu: {rab.upahKerja.jangkaWaktuHari} hari kerja
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Dana Bedah Rumah (AB = A+B)</p>
          <p className="mt-1.5 font-mono text-xl font-bold text-blue-700 tabular-nums">
            {formatRupiah(ringkasan.totalAB)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Dana bantuan bahan + upah</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Keseluruhan (ABC = AB+C)</p>
          <p className="mt-1.5 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(ringkasan.totalKeseluruhanABC)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Termasuk Dana Lainnya (C): {formatRupiah(ringkasan.totalLainnyaC)}
          </p>
        </div>
      </div>

      {/* Identitas Dokumen & Foto Perspektif */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Nomor / Kode RAB</label>
              <input
                type="text"
                value={rab.nomorKode}
                onChange={(e) => onChangeRab({ ...rab, nomorKode: e.target.value })}
                placeholder="Contoh: RAB-042/BSPS-2026"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Jenis Kegiatan</label>
              <input
                type="text"
                value={rab.jenisKegiatan}
                onChange={(e) => onChangeRab({ ...rab, jenisKegiatan: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tempat & Tanggal Pengajuan</label>
              <input
                type="text"
                value={rab.penandatangan.tempatTanggal}
                onChange={(e) =>
                  onChangeRab({
                    ...rab,
                    penandatangan: { ...rab.penandatangan, tempatTanggal: e.target.value },
                  })
                }
                placeholder="Magelang, 20 November 2026"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Nama Ketua Kelompok CPB (Jika Ada)</label>
              <input
                type="text"
                value={rab.penandatangan.ketuaKelompok}
                onChange={(e) =>
                  onChangeRab({
                    ...rab,
                    penandatangan: { ...rab.penandatangan, ketuaKelompok: e.target.value },
                  })
                }
                placeholder="Nama tanpa gelar"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Foto Perspektif Kondisi Awal Rumah (for Output Image 3) */}
          <div className="flex flex-col justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Foto Perspektif Kondisi Awal Rumah</span>
              {rab.fotoPerspektif && (
                <button
                  type="button"
                  onClick={() => onChangeRab({ ...rab, fotoPerspektif: '' })}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {rab.fotoPerspektif ? (
              <img
                src={rab.fotoPerspektif}
                alt="Foto perspektif kondisi awal rumah"
                className="mt-2 h-28 w-full rounded object-cover"
              />
            ) : (
              <label className="mt-2 flex h-28 cursor-pointer flex-col items-center justify-center rounded border border-slate-200 bg-white text-center hover:bg-slate-50">
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="mt-1 text-xs font-medium text-slate-600">Unggah Foto Rumah (Opsional)</span>
                <span className="text-[11px] text-slate-400">Tampil di kotak Gambar Rencana Teknis</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 1. Daftar Bahan Bangunan */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Daftar Bahan Bangunan (Transfer ke Toko / Penyedia)
            </h3>
            <p className="text-xs text-slate-500">
              Centang kategori pekerjaan yang dilaksanakan. Kolom Volume Beli = Kebutuhan Kotor − Potongan Swadaya.
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomKategori}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Kategori Pekerjaan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-12 px-3 py-2.5 text-center font-semibold">No</th>
                <th className="px-3 py-2.5 text-left font-semibold">Uraian Pekerjaan / Bahan Bangunan</th>
                <th className="w-24 px-2 py-2.5 text-right font-semibold">Kebutuhan</th>
                <th className="w-24 px-2 py-2.5 text-right font-semibold">Swadaya</th>
                <th className="w-24 px-2 py-2.5 text-right font-semibold">Volume Beli</th>
                <th className="w-20 px-2 py-2.5 text-center font-semibold">Satuan</th>
                <th className="w-32 px-2 py-2.5 text-right font-semibold">Harga Satuan (Rp)</th>
                <th className="w-36 px-3 py-2.5 text-right font-semibold">Harga Total (Rp)</th>
                <th className="w-10 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rab.kategoriPekerjaan.map((kat) => {
                const subtotalKat = kat.aktif
                  ? kat.items.reduce((s, i) => s + (Number(i.volume) || 0) * (Number(i.hargaSatuan) || 0), 0)
                  : 0;
                return (
                  <React.Fragment key={kat.id}>
                    <tr className={kat.aktif ? 'bg-slate-100/80' : 'bg-slate-50/50 opacity-60'}>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{kat.no}</td>
                      <td colSpan={6} className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={kat.aktif}
                            onChange={(e) => updateKategori(kat.id, { aktif: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          {kat.isCustomTitle ? (
                            <input
                              type="text"
                              value={kat.judul}
                              onChange={(e) => updateKategori(kat.id, { judul: e.target.value })}
                              className="w-80 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
                            />
                          ) : (
                            <span className="font-bold text-slate-900">{kat.judul}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => addMaterialItem(kat.id)}
                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" />
                            Item
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800 tabular-nums">
                        {formatRupiah(subtotalKat)}
                      </td>
                      <td className="px-2 py-2.5"></td>
                    </tr>

                    {kat.aktif &&
                      kat.items.map((item) => {
                        const totalItem = (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-right font-mono text-slate-500">{item.kode}</td>
                            <td className="px-3 py-1.5">
                              <input
                                type="text"
                                value={item.uraian}
                                onChange={(e) => updateMaterialItem(kat.id, item.id, { uraian: e.target.value })}
                                className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-slate-900 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={item.volumeKebutuhan}
                                onChange={(e) =>
                                  updateMaterialItem(kat.id, item.id, {
                                    volumeKebutuhan: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded border border-slate-200 px-2 py-1 text-right font-mono text-xs tabular-nums focus:border-blue-600 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={item.potonganSwadaya}
                                onChange={(e) =>
                                  updateMaterialItem(kat.id, item.id, {
                                    potonganSwadaya: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded border border-slate-200 bg-emerald-50/40 px-2 py-1 text-right font-mono text-xs text-emerald-800 tabular-nums focus:border-blue-600 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={item.volume}
                                onChange={(e) =>
                                  updateMaterialItem(kat.id, item.id, {
                                    volume: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.satuan}
                                onChange={(e) => updateMaterialItem(kat.id, item.id, { satuan: e.target.value })}
                                className="w-full rounded border border-slate-200 px-1.5 py-1 text-center text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step={500}
                                value={item.hargaSatuan}
                                onChange={(e) =>
                                  updateMaterialItem(kat.id, item.id, {
                                    hargaSatuan: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded border border-slate-200 px-2 py-1 text-right font-mono text-xs tabular-nums focus:border-blue-600 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                              {formatRupiah(totalItem)}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeMaterialItem(kat.id, item.id)}
                                aria-label="Hapus item"
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={7} className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                  Total Harga Bahan Bangunan (A)
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm font-bold text-slate-900 tabular-nums">
                  {formatRupiah(ringkasan.totalBahanA)}
                </td>
                <td></td>
              </tr>
              <tr className="border-t border-slate-200 bg-white">
                <td colSpan={9} className="px-4 py-2.5 text-xs text-slate-700">
                  <span className="font-semibold">Terbilang:</span>{' '}
                  <span className="italic">{terbilangRupiah(ringkasan.totalBahanA)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. Upah Kerja & 3. Dana Lainnya */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upah Kerja (B) */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Upah Kerja (Tarik Tunai / Transfer)</h3>
              <p className="text-[11px] text-slate-500">Hitung otomatis via HOK (Orang × Hari × Tarif) atau edit langsung</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Durasi (hari):</label>
              <input
                type="number"
                min={1}
                value={rab.upahKerja.jangkaWaktuHari}
                onChange={(e) => {
                  const hari = Math.max(1, Number(e.target.value) || 1);
                  const nextItems = rab.upahKerja.items.map((it) =>
                    it.modeHitung === 'hok'
                      ? {
                          ...it,
                          hariKerja: hari,
                          biaya: it.jumlahOrang * hari * it.tarifHarian,
                        }
                      : it
                  );
                  onChangeRab({
                    ...rab,
                    upahKerja: { jangkaWaktuHari: hari, items: nextItems },
                  });
                }}
                className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-center font-mono text-xs tabular-nums"
              />
              <button
                type="button"
                onClick={addUpahItem}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Upah
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <th className="w-9 px-2.5 py-2 text-center font-semibold">No</th>
                  <th className="px-2.5 py-2 text-left font-semibold">Uraian</th>
                  <th className="w-14 px-1.5 py-2 text-center font-semibold">Org</th>
                  <th className="w-14 px-1.5 py-2 text-center font-semibold">Hari</th>
                  <th className="w-24 px-2 py-2 text-right font-semibold">Tarif/Hr</th>
                  <th className="w-28 px-2.5 py-2 text-right font-semibold">Biaya (Rp)</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rab.upahKerja.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2.5 py-2 text-center font-mono text-slate-500">{item.no}</td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={item.uraian}
                        onChange={(e) => updateUpahItem(item.id, { uraian: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        min={0}
                        value={item.jumlahOrang}
                        onChange={(e) =>
                          updateUpahItem(item.id, {
                            modeHitung: 'hok',
                            jumlahOrang: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-200 px-1 py-1 text-center font-mono text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        min={0}
                        value={item.hariKerja}
                        onChange={(e) =>
                          updateUpahItem(item.id, {
                            modeHitung: 'hok',
                            hariKerja: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-200 px-1 py-1 text-center font-mono text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-1.5 py-1.5">
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={item.tarifHarian}
                        onChange={(e) =>
                          updateUpahItem(item.id, {
                            modeHitung: 'hok',
                            tarifHarian: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-200 px-1.5 py-1 text-right font-mono text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={item.biaya}
                        onChange={(e) =>
                          updateUpahItem(item.id, {
                            modeHitung: 'borongan',
                            biaya: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1 text-right font-mono text-xs font-semibold tabular-nums"
                      />
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeUpahItem(item.id)}
                        aria-label="Hapus upah"
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td colSpan={5} className="px-3 py-2.5 text-right font-bold text-slate-900">
                    Total Upah Kerja (B)
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatRupiah(ringkasan.totalUpahB)}
                  </td>
                  <td></td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td colSpan={7} className="px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold">Terbilang:</span>{' '}
                    <span className="italic">{terbilangRupiah(ringkasan.totalUpahB)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Dana Lainnya (C) */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Jumlah Dana Lainnya (C)</h3>
              <p className="text-[11px] text-slate-500">Dana swadaya uang / tambahan di luar bantuan</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={rab.danaLainnya.sinkronDariSwadayaUang}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const syncedItems = checked
                      ? keswadayaan.uang
                          .filter((u) => u.status === 'ada' && u.nilai > 0)
                          .map((u, idx) => ({
                            id: `dl-${u.id}`,
                            no: String(idx + 1),
                            uraian: `Dana Swadaya (${u.sumber})`,
                            biaya: Number(u.nilai) || 0,
                          }))
                      : rab.danaLainnya.items;
                    onChangeRab({
                      ...rab,
                      danaLainnya: {
                        sinkronDariSwadayaUang: checked,
                        items: syncedItems,
                      },
                    });
                  }}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                />
                Sinkron Swadaya Uang
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextNo = String(rab.danaLainnya.items.length + 1);
                  onChangeRab({
                    ...rab,
                    danaLainnya: {
                      ...rab.danaLainnya,
                      sinkronDariSwadayaUang: false,
                      items: [
                        ...rab.danaLainnya.items,
                        { id: `dl-${Date.now()}`, no: nextNo, uraian: 'Dana Swadaya / Lainnya', biaya: 0 },
                      ],
                    },
                  });
                }}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Baris
              </button>
            </div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <th className="w-10 px-3 py-2 text-center font-semibold">No</th>
                <th className="px-3 py-2 text-left font-semibold">Uraian</th>
                <th className="w-36 px-3 py-2 text-right font-semibold">Biaya/Nilai (Rp)</th>
                <th className="w-9"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rab.danaLainnya.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-400">
                    Tidak ada dana lainnya tercatat. Tambahkan baris atau isi Bagian B (Uang) di Form 2.
                  </td>
                </tr>
              ) : (
                rab.danaLainnya.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-center font-mono text-slate-500">{item.no}</td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={item.uraian}
                        onChange={(e) => {
                          const next = rab.danaLainnya.items.map((d) =>
                            d.id === item.id ? { ...d, uraian: e.target.value } : d
                          );
                          onChangeRab({
                            ...rab,
                            danaLainnya: { ...rab.danaLainnya, sinkronDariSwadayaUang: false, items: next },
                          });
                        }}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={item.biaya}
                        onChange={(e) => {
                          const next = rab.danaLainnya.items.map((d) =>
                            d.id === item.id ? { ...d, biaya: Number(e.target.value) || 0 } : d
                          );
                          onChangeRab({
                            ...rab,
                            danaLainnya: { ...rab.danaLainnya, sinkronDariSwadayaUang: false, items: next },
                          });
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-right font-mono text-xs font-semibold tabular-nums"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = rab.danaLainnya.items
                            .filter((d) => d.id !== item.id)
                            .map((d, idx) => ({ ...d, no: String(idx + 1) }));
                          onChangeRab({
                            ...rab,
                            danaLainnya: { ...rab.danaLainnya, sinkronDariSwadayaUang: false, items: filtered },
                          });
                        }}
                        aria-label="Hapus baris"
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={2} className="px-3 py-2.5 text-right font-bold text-slate-900">
                  Total Dana Lainnya (C)
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(ringkasan.totalLainnyaC)}
                </td>
                <td></td>
              </tr>
              <tr className="border-t border-slate-200">
                <td colSpan={4} className="px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold">Terbilang:</span>{' '}
                  <span className="italic">{terbilangRupiah(ringkasan.totalLainnyaC)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Ringkasan Final & Tombol Cetak Output */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Keseluruhan Dana Renovasi (ABC = AB + C)</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(ringkasan.totalKeseluruhanABC)}
            </p>
            <p className="mt-1 text-xs italic text-slate-600">
              Terbilang: {terbilangRupiah(ringkasan.totalKeseluruhanABC)}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToOutput}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4" />
            Buka Dokumen Output Resmi (Gambar 3, 4 & 5) →
          </button>
        </div>
      </div>
    </div>
  );
};
