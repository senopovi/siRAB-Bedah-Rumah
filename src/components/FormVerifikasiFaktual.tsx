import React, { useState } from 'react';
import { AlertCircle, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  KONDISI_KESEHATAN_ITEMS,
  KONDISI_NON_STRUKTUR_ITEMS,
  KONDISI_STRUKTUR_ITEMS,
} from '../data/defaults';
import { GradeAB, GradeABC, GradeAC, VerifikasiFaktualData, YaTidak } from '../types/rab';
import { formatAngka, formatRupiah } from '../utils/formatters';
import { evaluasiVerifikasi } from '../utils/rabCalculator';
import { validateVerifikasiFaktual } from '../utils/validation';

interface Props {
  data: VerifikasiFaktualData;
  validationAttempted: boolean;
  onChange: (next: VerifikasiFaktualData) => void;
  onNextStep: () => void;
}

export const FormVerifikasiFaktual: React.FC<Props> = ({
  data,
  validationAttempted,
  onChange,
  onNextStep,
}) => {
  const [showPetunjuk, setShowPetunjuk] = useState(false);

  const evaluasi = evaluasiVerifikasi(data);
  const validation = validateVerifikasiFaktual(data);
  const showErrors = validationAttempted && !validation.isValid;

  const updateField = <K extends keyof VerifikasiFaktualData>(
    key: K,
    value: VerifikasiFaktualData[K]
  ) => {
    const updated = { ...data, [key]: value };
    // Otomatis hitung saran kecukupan luas jika luasRumah atau jumlahPenghuni berubah
    if (key === 'luasRumah' || key === 'jumlahPenghuni') {
      const penghuni = Math.max(1, Number(key === 'jumlahPenghuni' ? value : updated.jumlahPenghuni) || 1);
      const luas = Math.max(0, Number(key === 'luasRumah' ? value : updated.luasRumah) || 0);
      if (luas > 0) {
        updated.kondisiRumah = {
          ...updated.kondisiRumah,
          kesehatan: {
            ...updated.kondisiRumah.kesehatan,
            kecukupanLuas: luas / penghuni >= 7.2 ? 'A' : 'B',
          },
        };
      }
    }
    onChange(updated);
  };

  const setStruktur = (key: keyof VerifikasiFaktualData['kondisiRumah']['struktur'], val: GradeABC) => {
    onChange({
      ...data,
      kondisiRumah: {
        ...data.kondisiRumah,
        struktur: { ...data.kondisiRumah.struktur, [key]: val },
      },
    });
  };

  const setNonStruktur = (
    key: keyof VerifikasiFaktualData['kondisiRumah']['nonStruktur'],
    val: GradeABC
  ) => {
    onChange({
      ...data,
      kondisiRumah: {
        ...data.kondisiRumah,
        nonStruktur: { ...data.kondisiRumah.nonStruktur, [key]: val },
      },
    });
  };

  const setKesehatan = (
    key: keyof VerifikasiFaktualData['kondisiRumah']['kesehatan'],
    val: GradeABC | GradeAC
  ) => {
    onChange({
      ...data,
      kondisiRumah: {
        ...data.kondisiRumah,
        kesehatan: { ...data.kondisiRumah.kesehatan, [key]: val },
      },
    });
  };

  const setStatusLahan = (val: GradeAB) => {
    onChange({
      ...data,
      kondisiRumah: {
        ...data.kondisiRumah,
        statusLahan: { statusLahan: val },
      },
    });
  };

  const inputClass = (hasError: boolean, mono = false) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      mono ? 'font-mono tabular-nums ' : ''
    }${
      hasError
        ? 'border-red-500 bg-red-50/30 text-slate-900 focus:border-red-600 focus:ring-red-600/20'
        : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600/20'
    }`;

  const gradeBadgeStyle = (grade: string, active: boolean) => {
    if (!active) {
      return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
    }
    if (grade === 'A') return 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600';
    if (grade === 'B') return 'border-amber-600 bg-amber-50/70 text-amber-950 ring-1 ring-amber-600';
    return 'border-red-600 bg-red-50/70 text-red-950 ring-1 ring-red-600';
  };

  const renderGradeCell = (
    grade: 'A' | 'B' | 'C',
    text: string | null,
    selected: string,
    onSelect: () => void
  ) => {
    if (!text) {
      return (
        <td className="border-b border-r border-slate-200 bg-slate-50/60 p-2.5 text-center text-xs text-slate-400">
          —
        </td>
      );
    }
    const isActive = selected === grade;
    return (
      <td className="border-b border-r border-slate-200 p-1.5 align-top">
        <button
          type="button"
          onClick={onSelect}
          className={`flex w-full min-h-[44px] items-start gap-2 rounded-md border p-2 text-left text-xs leading-relaxed transition-colors ${gradeBadgeStyle(
            grade,
            isActive
          )}`}
        >
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
              isActive
                ? grade === 'A'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : grade === 'B'
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-red-600 bg-red-600 text-white'
                : 'border-slate-300 bg-white text-transparent'
            }`}
          >
            <Check className="h-3 w-3" />
          </span>
          <span>{text}</span>
        </button>
      </td>
    );
  };

  return (
    <div className="space-y-6">
      {/* Validation Error Alert Summary */}
      {showErrors && (
        <div
          id="verifikasi-error-banner"
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Lengkapi field wajib pada Verifikasi Faktual sebelum melanjutkan
              </h3>
              <p className="mt-1 text-xs text-red-800">
                Masih terdapat {validation.summaryList.length} bagian yang belum lengkap atau belum valid:
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-red-800 sm:grid-cols-2 lg:grid-cols-3 list-disc pl-4">
                {validation.summaryList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Formulir Input 1 · Halaman - 6 - · Tanda <span className="text-red-600">*</span> wajib diisi
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Lembaran Hasil Verifikasi Faktual Calon Penerima Bantuan Bedah Rumah
            </h2>
          </div>
          <div className="w-full md:w-72">
            <label className="block text-xs font-medium text-slate-600">Nomor Verifikasi</label>
            <input
              type="text"
              value={data.nomorVerifikasi}
              onChange={(e) => updateField('nomorVerifikasi', e.target.value)}
              placeholder="Contoh: 042/VF-BSPS/PKP/2026"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* 2-Column Metadata Grid matching Image 1 */}
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Nama KK <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.namaKK}
                  onChange={(e) => updateField('namaKK', e.target.value)}
                  placeholder="Nama lengkap Kepala Keluarga / Pemilik Rumah"
                  className={inputClass(showErrors && !!validation.errors.namaKK)}
                />
                {showErrors && validation.errors.namaKK && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.namaKK}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                NIK <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  maxLength={16}
                  value={data.nik}
                  onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                  placeholder="16 digit NIK"
                  className={inputClass(showErrors && !!validation.errors.nik, true)}
                />
                {showErrors && validation.errors.nik && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.nik}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Nomor KK</label>
              <input
                type="text"
                maxLength={16}
                value={data.nomorKK}
                onChange={(e) => updateField('nomorKK', e.target.value.replace(/\D/g, ''))}
                placeholder="16 digit Nomor KK"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Jenis Kelamin (L/P) <span className="text-red-600">*</span>
              </label>
              <div>
                <div className="flex gap-2">
                  {(['L', 'P'] as const).map((jk) => (
                    <button
                      key={jk}
                      type="button"
                      onClick={() => updateField('jenisKelamin', jk)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        data.jenisKelamin === jk
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : showErrors && validation.errors.jenisKelamin
                          ? 'border-red-400 bg-red-50/30 text-slate-700 hover:bg-red-50/50'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {jk === 'L' ? 'L · Laki-laki' : 'P · Perempuan'}
                    </button>
                  ))}
                </div>
                {showErrors && validation.errors.jenisKelamin && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.jenisKelamin}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Umur</label>
              <input
                type="text"
                value={data.umur}
                onChange={(e) => updateField('umur', e.target.value)}
                placeholder="Contoh: 48 Tahun"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Alamat RTLH <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.alamatRTLH}
                  onChange={(e) => updateField('alamatRTLH', e.target.value)}
                  placeholder="Jalan / Dusun / Kampung"
                  className={inputClass(showErrors && !!validation.errors.alamatRTLH)}
                />
                {showErrors && validation.errors.alamatRTLH && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.alamatRTLH}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">RT / RW</label>
              <input
                type="text"
                value={data.rtRw}
                onChange={(e) => updateField('rtRw', e.target.value)}
                placeholder="Contoh: 003 / 002"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Desa / Kelurahan <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.desaKelurahan}
                  onChange={(e) => updateField('desaKelurahan', e.target.value)}
                  placeholder="Nama Desa atau Kelurahan"
                  className={inputClass(showErrors && !!validation.errors.desaKelurahan)}
                />
                {showErrors && validation.errors.desaKelurahan && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.desaKelurahan}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Kecamatan <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.kecamatan}
                  onChange={(e) => updateField('kecamatan', e.target.value)}
                  placeholder="Nama Kecamatan"
                  className={inputClass(showErrors && !!validation.errors.kecamatan)}
                />
                {showErrors && validation.errors.kecamatan && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.kecamatan}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Kabupaten / Kota <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.kabupatenKota}
                  onChange={(e) => updateField('kabupatenKota', e.target.value)}
                  placeholder="Nama Kabupaten atau Kota"
                  className={inputClass(showErrors && !!validation.errors.kabupatenKota)}
                />
                {showErrors && validation.errors.kabupatenKota && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.kabupatenKota}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Provinsi <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="text"
                  value={data.provinsi}
                  onChange={(e) => updateField('provinsi', e.target.value)}
                  placeholder="Nama Provinsi"
                  className={inputClass(showErrors && !!validation.errors.provinsi)}
                />
                {showErrors && validation.errors.provinsi && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.provinsi}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Penghasilan KK per bulan (Rp)</label>
              <input
                type="number"
                min={0}
                step={50000}
                value={data.penghasilanPerBulan || ''}
                onChange={(e) => updateField('penghasilanPerBulan', Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">
                Nilai UMP/UMK <span className="italic text-slate-500">(pilih yg tertinggi)</span>
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={data.nilaiUmpUmk || ''}
                onChange={(e) => updateField('nilaiUmpUmk', Number(e.target.value) || 0)}
                placeholder="2500000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Pernah dapat Bedah Rumah / BSPS / FLPP / BP2BT</label>
              <div className="flex gap-2">
                {(['Ya', 'Tidak'] as YaTidak[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('pernahDapatBantuan', opt)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      data.pernahDapatBantuan === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">
                Tahun dapat bantuan <span className="italic text-slate-500">(isi 0 jika tidak)</span>
              </label>
              <input
                type="text"
                value={data.tahunDapatBantuan}
                onChange={(e) => updateField('tahunDapatBantuan', e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Berapa tahun menghuni rumah</label>
              <input
                type="number"
                min={0}
                value={data.lamaMenghuniTahun}
                onChange={(e) => updateField('lamaMenghuniTahun', Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Memiliki aset rumah lainnya</label>
              <div className="flex gap-2">
                {(['Ya', 'Tidak'] as YaTidak[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('memilikiAsetLain', opt)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      data.memilikiAsetLain === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Jumlah penghuni (jiwa) <span className="text-red-600">*</span>
              </label>
              <div>
                <input
                  type="number"
                  min={1}
                  value={data.jumlahPenghuni || ''}
                  onChange={(e) => updateField('jumlahPenghuni', Number(e.target.value) || 0)}
                  className={inputClass(showErrors && !!validation.errors.jumlahPenghuni, true)}
                />
                {showErrors && validation.errors.jumlahPenghuni && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.jumlahPenghuni}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-start">
              <label className="pt-2 text-sm font-medium text-slate-700">
                Luas rumah (m²) <span className="text-red-600">*</span>
              </label>
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={data.luasRumah || ''}
                    onChange={(e) => updateField('luasRumah', Number(e.target.value) || 0)}
                    className={inputClass(showErrors && !!validation.errors.luasRumah, true)}
                  />
                  <span className="whitespace-nowrap font-mono text-xs text-slate-500 tabular-nums">
                    {formatAngka(evaluasi.luasPerJiwa, 1)} m²/jiwa
                  </span>
                </div>
                {showErrors && validation.errors.luasRumah && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{validation.errors.luasRumah}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Bersedia mengikuti ketentuan program</label>
              <div className="flex gap-2">
                {(['Ya', 'Tidak'] as YaTidak[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('bersediaKetentuan', opt)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      data.bersediaKetentuan === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center">
              <label className="text-sm font-medium text-slate-700">Titik Koordinat</label>
              <input
                type="text"
                value={data.titikKoordinat}
                onChange={(e) => updateField('titikKoordinat', e.target.value)}
                placeholder="Contoh: -7.481240, 110.098420"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kondisi Rumah Matrix Table (Matches Image 1) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Penilaian Aspek / Komponen Kondisi Rumah <span className="text-red-600">*</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih satu kondisi (A, B, atau C) pada seluruh komponen. Komponen bernilai B atau C akan masuk otomatis ke daftar pekerjaan RAB.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-medium text-emerald-700">A · Baik</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-amber-700">B · Rusak Sebagian</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-red-700">C · Rusak Berat / Tidak Ada</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                <th className="w-48 border-b border-r border-slate-200 px-4 py-3 text-left">ASPEK / KOMPONEN</th>
                <th className="border-b border-r border-slate-200 px-4 py-2.5 text-center">KONDISI A</th>
                <th className="border-b border-r border-slate-200 px-4 py-2.5 text-center">KONDISI B</th>
                <th className="border-b border-slate-200 px-4 py-2.5 text-center">KONDISI C</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. STRUKTUR */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="border-b border-slate-200 px-4 py-2 text-xs font-bold tracking-wide text-slate-800">
                  1. STRUKTUR
                </td>
              </tr>
              {KONDISI_STRUKTUR_ITEMS.map((item) => {
                const val = data.kondisiRumah.struktur[item.key];
                const isMissing = showErrors && !val;
                return (
                  <tr key={item.key} className={isMissing ? 'bg-red-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-900">
                      <div>{item.label}</div>
                      {isMissing && (
                        <div className="mt-1 text-[11px] font-semibold text-red-600">Wajib dipilih</div>
                      )}
                    </td>
                    {renderGradeCell('A', item.A, val, () => setStruktur(item.key, 'A'))}
                    {renderGradeCell('B', item.B, val, () => setStruktur(item.key, 'B'))}
                    {renderGradeCell('C', item.C, val, () => setStruktur(item.key, 'C'))}
                  </tr>
                );
              })}

              {/* 2. NON-STRUKTUR */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="border-b border-slate-200 px-4 py-2 text-xs font-bold tracking-wide text-slate-800">
                  2. NON-STRUKTUR
                </td>
              </tr>
              {KONDISI_NON_STRUKTUR_ITEMS.map((item) => {
                const val = data.kondisiRumah.nonStruktur[item.key];
                const isMissing = showErrors && !val;
                return (
                  <tr key={item.key} className={isMissing ? 'bg-red-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-900">
                      <div>{item.label}</div>
                      {isMissing && (
                        <div className="mt-1 text-[11px] font-semibold text-red-600">Wajib dipilih</div>
                      )}
                    </td>
                    {renderGradeCell('A', item.A, val, () => setNonStruktur(item.key, 'A'))}
                    {renderGradeCell('B', item.B, val, () => setNonStruktur(item.key, 'B'))}
                    {renderGradeCell('C', item.C, val, () => setNonStruktur(item.key, 'C'))}
                  </tr>
                );
              })}

              {/* 3. KESEHATAN & KECUKUPAN LUAS */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="border-b border-slate-200 px-4 py-2 text-xs font-bold tracking-wide text-slate-800">
                  3. KESEHATAN & KECUKUPAN LUAS
                </td>
              </tr>
              {KONDISI_KESEHATAN_ITEMS.map((item) => {
                const val = data.kondisiRumah.kesehatan[item.key];
                const isMissing = showErrors && !val;
                return (
                  <tr key={item.key} className={isMissing ? 'bg-red-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-900">
                      <div>{item.label}</div>
                      {item.key === 'kecukupanLuas' && (
                        <div className="mt-1 font-mono text-[11px] font-normal text-slate-500 tabular-nums">
                          Hasil: {formatAngka(evaluasi.luasPerJiwa, 1)} m²/jiwa ({evaluasi.luasPerJiwa >= 7.2 ? '≥ 7,2 m²' : '< 7,2 m²'})
                        </div>
                      )}
                      {isMissing && (
                        <div className="mt-1 text-[11px] font-semibold text-red-600">Wajib dipilih</div>
                      )}
                    </td>
                    {renderGradeCell('A', item.A, val, () => setKesehatan(item.key, 'A'))}
                    {renderGradeCell('B', item.B, val, () => setKesehatan(item.key, 'B' as GradeABC))}
                    {renderGradeCell('C', item.C, val, () => setKesehatan(item.key, 'C'))}
                  </tr>
                );
              })}

              {/* 4. STATUS LAHAN */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="border-b border-slate-200 px-4 py-2 text-xs font-bold tracking-wide text-slate-800">
                  4. STATUS LAHAN
                </td>
              </tr>
              <tr className={showErrors && !data.kondisiRumah.statusLahan.statusLahan ? 'bg-red-50/40' : ''}>
                <td className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-900">
                  <div>Status lahan</div>
                  {showErrors && !data.kondisiRumah.statusLahan.statusLahan && (
                    <div className="mt-1 text-[11px] font-semibold text-red-600">Wajib dipilih</div>
                  )}
                </td>
                {renderGradeCell(
                  'A',
                  'Milik sendiri, ada bukti sah',
                  data.kondisiRumah.statusLahan.statusLahan,
                  () => setStatusLahan('A')
                )}
                {renderGradeCell(
                  'B',
                  'Penguasaan rumah tidak layak huni/lahan*)',
                  data.kondisiRumah.statusLahan.statusLahan,
                  () => setStatusLahan('B')
                )}
                <td className="border-b border-slate-200 bg-slate-50/60 p-2.5 text-center text-xs text-slate-400">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Evaluation Summary + Petunjuk */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Evaluasi Otomatis Kriteria RTLH & Kelayakan</h4>
            <span
              className={`text-xs font-semibold ${
                evaluasi.isRTLH ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {evaluasi.isRTLH ? 'Status: Memenuhi Kriteria RTLH' : 'Status: Belum Terdeteksi RTLH'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Temuan Komponen RTLH ({evaluasi.alasanRTLH.length}):</p>
              {evaluasi.alasanRTLH.length > 0 ? (
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate-700">
                  {evaluasi.alasanRTLH.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-slate-500">
                  Pilih nilai B atau C pada tabel kondisi rumah di atas untuk menandai bagian yang perlu diperbaiki.
                </p>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-800">Pengecekan Persyaratan Administratif:</p>
              {evaluasi.alasanAdministratif.length === 0 ? (
                <p className="mt-1.5 text-emerald-700">
                  Penghasilan ({formatRupiah(data.penghasilanPerBulan)}) ≤ UMP/UMK ({formatRupiah(data.nilaiUmpUmk)}), lama huni ≥ 1 tahun, dan syarat administratif terpenuhi.
                </p>
              ) : (
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-red-700">
                  {evaluasi.alasanAdministratif.map((item) => (
                    <li key={item.nomor}>{item.keterangan}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {validation.isValid
                ? 'Semua field wajib sudah lengkap. Siap lanjut ke langkah berikutnya.'
                : `${validation.summaryList.length} field wajib belum dilengkapi.`}
            </p>
            <button
              type="button"
              onClick={onNextStep}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              Lanjut ke Keswadayaan & Kesimpulan →
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <button
            type="button"
            onClick={() => setShowPetunjuk((v) => !v)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
          >
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-500" />
              Petunjuk Pengisian & Keterangan
            </span>
            {showPetunjuk ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showPetunjuk ? (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
              <p>1. Penilaian kualitas rumah meliputi rumah tembok, setengah tembok, kayu tapak, maupun kayu panggung.</p>
              <p>
                2. Kategori RTLH terpenuhi jika minimal 1 kondisi: (a) komponen struktur bernilai C; (b) komponen non-struktur bernilai B; dan/atau (c) komponen kesehatan & kecukupan luas bernilai C.
              </p>
              <p>
                3. Penghasilan per bulan tidak melebihi UMP atau UMK tertinggi, menghuni ≥ 1 tahun, belum pernah menerima bantuan sejenis dalam 5 tahun terakhir.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Klik untuk membaca aturan resmi penilaian kualitas rumah dan persyaratan penerima bantuan sesuai formulir halaman 6.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
