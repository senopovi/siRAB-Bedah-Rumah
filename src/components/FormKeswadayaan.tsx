import React from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { ALASAN_TIDAK_DIREKOMENDASIKAN } from '../data/defaults';
import {
  AdaTidak,
  KeswadayaanData,
  MaterialSwadayaRow,
  VerifikasiFaktualData,
} from '../types/rab';
import { formatRupiah } from '../utils/formatters';
import { evaluasiVerifikasi } from '../utils/rabCalculator';

interface Props {
  verifikasi: VerifikasiFaktualData;
  data: KeswadayaanData;
  onChange: (next: KeswadayaanData) => void;
  onGenerateRAB: () => void;
}

export const FormKeswadayaan: React.FC<Props> = ({
  verifikasi,
  data,
  onChange,
  onGenerateRAB,
}) => {
  const evaluasi = evaluasiVerifikasi(verifikasi);

  const updateMaterialRow = (
    listKey: 'materialBekas' | 'materialBaru',
    id: string,
    patch: Partial<MaterialSwadayaRow>
  ) => {
    const nextList = data[listKey].map((row) => (row.id === id ? { ...row, ...patch } : row));
    onChange({ ...data, [listKey]: nextList });
  };

  const addMaterialRow = (listKey: 'materialBekas' | 'materialBaru') => {
    const current = data[listKey];
    const nextNo =
      current.filter((r) => !r.isSubRow).length + 1;
    const newRow: MaterialSwadayaRow = {
      id: `${listKey}-${Date.now()}`,
      no: String(nextNo),
      bentuk: '',
      isEditableName: true,
      status: 'ada',
      jumlahAngka: 0,
      satuan: 'unit',
      ceklisFoto: false,
      kategoriTarget: 'lainnya',
    };
    onChange({ ...data, [listKey]: [...current, newRow] });
  };

  const removeMaterialRow = (listKey: 'materialBekas' | 'materialBaru', id: string) => {
    onChange({
      ...data,
      [listKey]: data[listKey].filter((r) => r.id !== id),
    });
  };

  const applyEvaluasiOtomatis = () => {
    onChange({
      ...data,
      kesimpulan: {
        ...data.kesimpulan,
        statusRekomendasi: evaluasi.suggestedRekomendasi,
        alasanTidakDirekomendasikan:
          evaluasi.suggestedRekomendasi === 'tidak_direkomendasikan'
            ? evaluasi.suggestedAlasanIds
            : [],
        namaCPB: data.kesimpulan.namaCPB || verifikasi.namaKK,
        pemeriksaKota: data.kesimpulan.pemeriksaKota || verifikasi.kabupatenKota,
      },
    });
  };

  const toggleAlasan = (alasanId: number) => {
    const current = data.kesimpulan.alasanTidakDirekomendasikan;
    const next = current.includes(alasanId)
      ? current.filter((i) => i !== alasanId)
      : [...current, alasanId];
    onChange({
      ...data,
      kesimpulan: {
        ...data.kesimpulan,
        statusRekomendasi: 'tidak_direkomendasikan',
        alasanTidakDirekomendasikan: next,
      },
    });
  };

  const totalSwadayaUang = data.uang
    .filter((u) => u.status === 'ada')
    .reduce((sum, u) => sum + (Number(u.nilai) || 0), 0);

  const renderMaterialTable = (
    title: string,
    listKey: 'materialBekas' | 'materialBaru',
    rows: MaterialSwadayaRow[]
  ) => (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <button
          type="button"
          onClick={() => addMaterialRow(listKey)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Baris
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
              <th className="w-9 px-2.5 py-2.5 text-center font-semibold">No</th>
              <th className="px-2.5 py-2.5 text-left font-semibold">Bentuk</th>
              <th className="w-28 px-2 py-2.5 text-center font-semibold">Status</th>
              <th className="w-36 px-2.5 py-2.5 text-left font-semibold">Jika Ada, Jumlah</th>
              <th className="w-16 px-2 py-2.5 text-center font-semibold">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="px-2.5 py-2 text-center font-mono text-slate-500">{row.no}</td>
                <td className="px-2.5 py-2">
                  {row.isEditableName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={row.bentuk}
                        onChange={(e) => updateMaterialRow(listKey, row.id, { bentuk: e.target.value })}
                        placeholder="Material lainnya..."
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                      />
                      {row.id.includes('-') && !['mb-4', 'mb-5', 'mn-6', 'mn-7'].includes(row.id) && (
                        <button
                          type="button"
                          onClick={() => removeMaterialRow(listKey, row.id)}
                          aria-label="Hapus baris"
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className={row.isSubRow ? 'pl-3 text-slate-600' : 'font-medium text-slate-900'}>
                      {row.bentuk}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                    {(['ada', 'tidak_ada'] as AdaTidak[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() =>
                          updateMaterialRow(listKey, row.id, {
                            status: row.status === st ? '' : st,
                            jumlahAngka: st === 'tidak_ada' ? 0 : row.jumlahAngka,
                          })
                        }
                        className={`flex-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                          row.status === st
                            ? st === 'ada'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st === 'ada' ? 'Ada' : 'Tidak'}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-2.5 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      disabled={row.status === 'tidak_ada'}
                      value={row.jumlahAngka || ''}
                      onChange={(e) =>
                        updateMaterialRow(listKey, row.id, {
                          status: Number(e.target.value) > 0 ? 'ada' : row.status,
                          jumlahAngka: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="w-16 rounded border border-slate-300 px-2 py-1 font-mono text-xs tabular-nums disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      disabled={row.status === 'tidak_ada'}
                      value={row.satuan}
                      onChange={(e) => updateMaterialRow(listKey, row.id, { satuan: e.target.value })}
                      className="w-12 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-600 disabled:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.ceklisFoto}
                    onChange={(e) => updateMaterialRow(listKey, row.id, { ceklisFoto: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Formulir Input 2 · Halaman - 7 -</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              I. Identifikasi Keswadayaan & II. Kesimpulan Verifikasi
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Material yang sudah tersedia dan tenaga kerja swadaya akan otomatis mengurangi kebutuhan belanja material dan upah berbayar di RAB.
            </p>
          </div>
          <button
            type="button"
            onClick={applyEvaluasiOtomatis}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Wand2 className="h-4 w-4 text-blue-600" />
            Terapkan Evaluasi Otomatis
          </button>
        </div>
      </div>

      {/* A. Barang/Material */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">A. Barang / Material Swadaya</h3>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {renderMaterialTable(
            'a. Material Yang Sudah Ada / Bekas Layak Pakai',
            'materialBekas',
            data.materialBekas
          )}
          {renderMaterialTable('b. Material Baru / Stok', 'materialBaru', data.materialBaru)}
        </div>
      </div>

      {/* B. Uang & C. Tenaga Kerja */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* B. Uang */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">B. Uang (Dana Swadaya)</h3>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              Total: {formatRupiah(totalSwadayaUang)}
            </span>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <th className="w-10 px-3 py-2.5 text-center font-semibold">No</th>
                <th className="px-3 py-2.5 text-left font-semibold">Sumber</th>
                <th className="w-28 px-2 py-2.5 text-center font-semibold">Status</th>
                <th className="w-40 px-3 py-2.5 text-right font-semibold">Jika Ada, Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.uang.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 text-center font-mono text-slate-500">{row.no}</td>
                  <td className="px-3 py-2.5">
                    {row.isEditableName ? (
                      <input
                        type="text"
                        value={row.sumber}
                        onChange={(e) => {
                          const next = data.uang.map((u) =>
                            u.id === row.id ? { ...u, sumber: e.target.value } : u
                          );
                          onChange({ ...data, uang: next });
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{row.sumber}</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                      {(['ada', 'tidak_ada'] as AdaTidak[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            const next = data.uang.map((u) =>
                              u.id === row.id
                                ? {
                                    ...u,
                                    status: u.status === st ? '' : st,
                                    nilai: st === 'tidak_ada' ? 0 : u.nilai,
                                  }
                                : u
                            );
                            onChange({ ...data, uang: next });
                          }}
                          className={`flex-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors ${
                            row.status === st
                              ? st === 'ada'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          {st === 'ada' ? 'Ada' : 'Tidak'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      disabled={row.status === 'tidak_ada'}
                      value={row.nilai || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        const next = data.uang.map((u) =>
                          u.id === row.id
                            ? { ...u, status: val > 0 ? 'ada' : u.status, nilai: val }
                            : u
                        );
                        onChange({ ...data, uang: next });
                      }}
                      placeholder="0"
                      className="w-full rounded border border-slate-300 px-2 py-1 text-right font-mono text-xs tabular-nums disabled:bg-slate-100 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* C. Tenaga Kerja */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">C. Tenaga Kerja Swadaya</h3>
            <span className="text-xs text-slate-500">Mengurangi HOK pekerja berbayar</span>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <th className="w-10 px-3 py-2.5 text-center font-semibold">No</th>
                <th className="px-3 py-2.5 text-left font-semibold">Sumber</th>
                <th className="w-28 px-2 py-2.5 text-center font-semibold">Status</th>
                <th className="px-3 py-2.5 text-left font-semibold">Jika Ada, Sebutkan Nama & Jml Org</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.tenagaKerja.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 text-center font-mono text-slate-500">{row.no}</td>
                  <td className="px-3 py-2.5">
                    {row.isEditableName ? (
                      <input
                        type="text"
                        value={row.sumber}
                        onChange={(e) => {
                          const next = data.tenagaKerja.map((tk) =>
                            tk.id === row.id ? { ...tk, sumber: e.target.value } : tk
                          );
                          onChange({ ...data, tenagaKerja: next });
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{row.sumber}</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                      {(['ada', 'tidak_ada'] as AdaTidak[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            const next = data.tenagaKerja.map((tk) =>
                              tk.id === row.id
                                ? {
                                    ...tk,
                                    status: tk.status === st ? '' : st,
                                    jumlahOrang: st === 'ada' ? Math.max(1, tk.jumlahOrang) : 0,
                                  }
                                : tk
                            );
                            onChange({ ...data, tenagaKerja: next });
                          }}
                          className={`flex-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors ${
                            row.status === st
                              ? st === 'ada'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          {st === 'ada' ? 'Ada' : 'Tidak'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        disabled={row.status === 'tidak_ada'}
                        value={row.nama}
                        onChange={(e) => {
                          const next = data.tenagaKerja.map((tk) =>
                            tk.id === row.id
                              ? {
                                  ...tk,
                                  status: e.target.value ? 'ada' : tk.status,
                                  nama: e.target.value,
                                }
                              : tk
                          );
                          onChange({ ...data, tenagaKerja: next });
                        }}
                        placeholder="Nama tenaga kerja"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100 focus:border-blue-600 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        disabled={row.status === 'tidak_ada'}
                        value={row.jumlahOrang || ''}
                        onChange={(e) => {
                          const qty = Number(e.target.value) || 0;
                          const next = data.tenagaKerja.map((tk) =>
                            tk.id === row.id
                              ? { ...tk, status: qty > 0 ? 'ada' : tk.status, jumlahOrang: qty }
                              : tk
                          );
                          onChange({ ...data, tenagaKerja: next });
                        }}
                        title="Jumlah orang"
                        placeholder="Org"
                        className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center font-mono text-xs tabular-nums disabled:bg-slate-100 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* II. KESIMPULAN */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">II. KESIMPULAN</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Direkomendasikan */}
          <div
            className={`rounded-xl border p-4 transition-colors ${
              data.kesimpulan.statusRekomendasi === 'direkomendasikan'
                ? 'border-emerald-600 bg-emerald-50/40'
                : 'border-slate-200 bg-slate-50/40'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="rekomendasi"
                checked={data.kesimpulan.statusRekomendasi === 'direkomendasikan'}
                onChange={() =>
                  onChange({
                    ...data,
                    kesimpulan: {
                      ...data.kesimpulan,
                      statusRekomendasi: 'direkomendasikan',
                      alasanTidakDirekomendasikan: [],
                    },
                  })
                }
                className="h-4 w-4 text-emerald-600"
              />
              <span className="text-sm font-bold text-slate-900">Direkomendasikan Bedah Rumah</span>
            </label>

            <div className="mt-4 space-y-2.5 pl-7">
              <p className="text-xs font-medium text-slate-600">Pilih Metode Konstruksi:</p>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <input
                  type="radio"
                  name="metode"
                  checked={data.kesimpulan.metodeKonstruksi === 'konvensional'}
                  onChange={() =>
                    onChange({
                      ...data,
                      kesimpulan: {
                        ...data.kesimpulan,
                        statusRekomendasi: 'direkomendasikan',
                        metodeKonstruksi: 'konvensional',
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-slate-800">Konvensional</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <input
                  type="radio"
                  name="metode"
                  checked={data.kesimpulan.metodeKonstruksi === 'ferosemen'}
                  onChange={() =>
                    onChange({
                      ...data,
                      kesimpulan: {
                        ...data.kesimpulan,
                        statusRekomendasi: 'direkomendasikan',
                        metodeKonstruksi: 'ferosemen',
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-slate-800">
                  Ferosemen <span className="text-xs font-normal text-slate-500">(untuk rumah tembok tanpa struktur)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Tidak Direkomendasikan */}
          <div
            className={`rounded-xl border p-4 transition-colors ${
              data.kesimpulan.statusRekomendasi === 'tidak_direkomendasikan'
                ? 'border-red-600 bg-red-50/40'
                : 'border-slate-200 bg-slate-50/40'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="rekomendasi"
                checked={data.kesimpulan.statusRekomendasi === 'tidak_direkomendasikan'}
                onChange={() =>
                  onChange({
                    ...data,
                    kesimpulan: {
                      ...data.kesimpulan,
                      statusRekomendasi: 'tidak_direkomendasikan',
                    },
                  })
                }
                className="h-4 w-4 text-red-600"
              />
              <span className="text-sm font-bold text-slate-900">Tidak Direkomendasikan Bedah Rumah, alasan:</span>
            </label>

            <div className="mt-3 grid grid-cols-1 gap-1.5 pl-7 sm:grid-cols-2">
              {ALASAN_TIDAK_DIREKOMENDASIKAN.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={data.kesimpulan.alasanTidakDirekomendasikan.includes(item.id)}
                    onChange={() => toggleAlasan(item.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-red-600"
                  />
                  <span>
                    <span className="font-mono font-semibold">{item.id}.</span> {item.label}
                  </span>
                </label>
              ))}
            </div>
            {data.kesimpulan.alasanTidakDirekomendasikan.includes(11) && (
              <div className="mt-2 pl-7">
                <input
                  type="text"
                  value={data.kesimpulan.alasanLainnya}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      kesimpulan: { ...data.kesimpulan, alasanLainnya: e.target.value },
                    })
                  }
                  placeholder="Sebutkan alasan lainnya..."
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Signature Fields for Page 7 (Image 2) */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Diperiksa oleh: Koordinator Kabupaten/Kota
            </label>
            <input
              type="text"
              value={data.kesimpulan.pemeriksaKota}
              onChange={(e) =>
                onChange({
                  ...data,
                  kesimpulan: { ...data.kesimpulan, pemeriksaKota: e.target.value },
                })
              }
              placeholder="Kabupaten/Kota"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            />
            <input
              type="text"
              value={data.kesimpulan.namaKoordinator}
              onChange={(e) =>
                onChange({
                  ...data,
                  kesimpulan: { ...data.kesimpulan, namaKoordinator: e.target.value },
                })
              }
              placeholder="Nama Koordinator (tanpa gelar)"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Diketahui oleh: Calon Penerima Bantuan
            </label>
            <input
              type="text"
              value={data.kesimpulan.namaCPB}
              onChange={(e) =>
                onChange({
                  ...data,
                  kesimpulan: { ...data.kesimpulan, namaCPB: e.target.value },
                })
              }
              placeholder="Nama Calon Penerima Bantuan"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Dilakukan oleh: Tenaga Pendamping Masyarakat (TPM)
            </label>
            <input
              type="text"
              value={data.kesimpulan.tempatTanggal}
              onChange={(e) =>
                onChange({
                  ...data,
                  kesimpulan: { ...data.kesimpulan, tempatTanggal: e.target.value },
                })
              }
              placeholder="Tempat, Tanggal (mis. Magelang, 20 Nov 2026)"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.kesimpulan.namaTPM}
                onChange={(e) =>
                  onChange({
                    ...data,
                    kesimpulan: { ...data.kesimpulan, namaTPM: e.target.value },
                  })
                }
                placeholder="Nama TPM"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                value={data.kesimpulan.instansiTPM}
                onChange={(e) =>
                  onChange({
                    ...data,
                    kesimpulan: { ...data.kesimpulan, instansiTPM: e.target.value },
                  })
                }
                placeholder="Instansi/Wilayah"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Primary Action CTA to Auto-Compute RAB */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-4 sm:flex-row">
          <p className="text-xs text-slate-700">
            Siap menghitung RAB secara otomatis dari kondisi rumah, material swadaya, dan tenaga kerja yang sudah diisi?
          </p>
          <button
            type="button"
            onClick={onGenerateRAB}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            <Wand2 className="h-4 w-4" />
            Hitung RAB Otomatis Sekarang →
          </button>
        </div>
      </div>
    </div>
  );
};
