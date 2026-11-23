import React, { useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { ALASAN_TIDAK_DIREKOMENDASIKAN, KONDISI_KESEHATAN_ITEMS, KONDISI_NON_STRUKTUR_ITEMS, KONDISI_STRUKTUR_ITEMS } from '../data/defaults';
import { DokumenRABData, KeswadayaanData, VerifikasiFaktualData } from '../types/rab';
import { formatAngka, formatRupiah, terbilangRupiah } from '../utils/formatters';
import { hitungRingkasanRAB } from '../utils/rabCalculator';
import { VisualisasiRAB } from './VisualisasiRAB';

interface Props {
  verifikasi: VerifikasiFaktualData;
  keswadayaan: KeswadayaanData;
  rab: DokumenRABData;
}

export const DokumenRABOutput: React.FC<Props> = ({ verifikasi, keswadayaan, rab }) => {
  const [docTab, setDocTab] = useState<'rab' | 'verifikasi'>('rab');
  const ringkasan = hitungRingkasanRAB(rab);

  const aktifCategories = rab.kategoriPekerjaan.filter((k) => k.aktif);
  // Split material categories cleanly across Page 1 (Image 3) and Page 2 (Image 4)
  // Categories 1-3 + first 7 items of 4 on Page 1, rest on Page 2 (matching official layout)
  const page1Categories = aktifCategories.filter((k) => ['kat-1', 'kat-2', 'kat-3'].includes(k.id));
  const kat4 = aktifCategories.find((k) => k.id === 'kat-4');
  const kat4Part1Items = kat4 ? kat4.items.slice(0, 7) : [];
  const kat4Part2Items = kat4 ? kat4.items.slice(7) : [];
  const page2OtherCategories = aktifCategories.filter(
    (k) => !['kat-1', 'kat-2', 'kat-3', 'kat-4'].includes(k.id)
  );

  const exportCsv = () => {
    const rows: string[][] = [
      ['DOKUMEN RENCANA ANGGARAN BIAYA BEDAH RUMAH'],
      ['Nomor/Kode', rab.nomorKode || verifikasi.nomorVerifikasi || '-'],
      ['NIK', `'${verifikasi.nik || '-'}`],
      ['Nama CPB', verifikasi.namaKK || '-'],
      ['Alamat', `${verifikasi.alamatRTLH || ''} RT/RW ${verifikasi.rtRw || ''}`],
      ['Desa/Kelurahan', verifikasi.desaKelurahan || '-'],
      ['Kecamatan', verifikasi.kecamatan || '-'],
      ['Kabupaten/Kota', verifikasi.kabupatenKota || '-'],
      ['Provinsi', verifikasi.provinsi || '-'],
      [],
      ['1. DAFTAR BAHAN BANGUNAN'],
      ['No', 'Uraian Pekerjaan / Bahan Bangunan', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Harga Total (Rp)'],
    ];

    aktifCategories.forEach((kat) => {
      rows.push([kat.no, kat.judul, '', '', '', '']);
      kat.items.forEach((it) => {
        const tot = (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0);
        rows.push([
          it.kode,
          it.uraian,
          String(it.volume),
          it.satuan,
          String(it.hargaSatuan),
          String(Math.round(tot)),
        ]);
      });
    });

    rows.push(['', 'Total Harga Bahan Bangunan (A)', '', '', '', String(ringkasan.totalBahanA)]);
    rows.push(['', `Terbilang: ${terbilangRupiah(ringkasan.totalBahanA)}`]);
    rows.push([]);
    rows.push(['2. UPAH KERJA']);
    rows.push(['No', 'Uraian', 'Biaya/Nilai (Rp)']);
    rab.upahKerja.items.forEach((u) => rows.push([u.no, u.uraian, String(u.biaya)]));
    rows.push(['', 'Total Upah Kerja (B)', String(ringkasan.totalUpahB)]);
    rows.push([]);
    rows.push(['3. DANA LAINNYA']);
    rab.danaLainnya.items.forEach((d) => rows.push([d.no, d.uraian, String(d.biaya)]));
    rows.push(['', 'Total Dana Lainnya (C)', String(ringkasan.totalLainnyaC)]);
    rows.push([]);
    rows.push(['4. REKAPITULASI']);
    rows.push(['Total Harga Bahan Bangunan (A)', String(ringkasan.totalBahanA)]);
    rows.push(['Total Upah Kerja (B)', String(ringkasan.totalUpahB)]);
    rows.push(['Total Dana Bedah Rumah (AB=A+B)', String(ringkasan.totalAB)]);
    rows.push(['Total Dana Lainnya (C)', String(ringkasan.totalLainnyaC)]);
    rows.push(['Total Keseluruhan Dana Renovasi (ABC=AB+C)', String(ringkasan.totalKeseluruhanABC)]);
    rows.push(['Terbilang', terbilangRupiah(ringkasan.totalKeseluruhanABC)]);

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAB_${(verifikasi.namaKK || 'Bedah_Rumah').replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const payload = { verifikasi, keswadayaan, rab, ringkasan };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Berkas_RAB_${(verifikasi.namaKK || 'CPB').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const valOrDots = (val?: string | number | null) =>
    val !== undefined && val !== null && String(val).trim() !== '' ? String(val) : '..................................................';

  return (
    <div className="space-y-6">
      {/* Toolbar (hidden on print) */}
      <div className="no-print flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setDocTab('rab')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              docTab === 'rab'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Output RAB Resmi (Gambar 3, 4 & 5)
          </button>
          <button
            type="button"
            onClick={() => setDocTab('verifikasi')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              docTab === 'verifikasi'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lampiran Form Verifikasi (Gambar 1 & 2)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
            Ekspor CSV / Excel
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Simpan Berkas JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Grafik Proporsi Biaya Material & Upah Tenaga Kerja */}
      {docTab === 'rab' && <VisualisasiRAB rab={rab} />}

      {/* OUTPUT DOKUMEN RAB (GAMBAR 3, 4, 5) */}
      {docTab === 'rab' && (
        <div className="space-y-8 font-serif text-black">
          {/* ===================== HALAMAN - 6 - (GAMBAR 3) ===================== */}
          <article className="print-sheet mx-auto max-w-[820px] rounded-sm border border-slate-300 bg-white p-8 shadow-sm sm:p-12">
            <div className="text-center text-xs mb-4">- 6 -</div>

            <p className="text-sm font-semibold tracking-wide">
              C.&nbsp;&nbsp;&nbsp;DOKUMEN RENCANA ANGGARAN BIAYA BEDAH RUMAH
            </p>

            <div className="my-5 text-center">
              <h2 className="text-base font-bold uppercase tracking-wide">RENCANA ANGGARAN BIAYA</h2>
              <h3 className="text-base font-bold uppercase tracking-wide">BEDAH RUMAH</h3>
            </div>

            {/* Identitas CPB */}
            <table className="mb-5 w-full text-xs leading-relaxed">
              <tbody>
                <tr>
                  <td className="w-60 py-0.5">Nomor/kode</td>
                  <td className="w-4 text-center">:</td>
                  <td className="font-mono">{valOrDots(rab.nomorKode || verifikasi.nomorVerifikasi)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Nomor Induk Kependudukan (NIK)</td>
                  <td className="text-center">:</td>
                  <td className="font-mono tabular-nums">{valOrDots(verifikasi.nik)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Nama Calon Penerima Bantuan (CPB)</td>
                  <td className="text-center">:</td>
                  <td className="font-semibold">{valOrDots(verifikasi.namaKK)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Alamat</td>
                  <td className="text-center">:</td>
                  <td>
                    {verifikasi.alamatRTLH
                      ? `${verifikasi.alamatRTLH}${verifikasi.rtRw ? ` RT/RW ${verifikasi.rtRw}` : ''}`
                      : valOrDots('')}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5">Desa/Kelurahan</td>
                  <td className="text-center">:</td>
                  <td>{valOrDots(verifikasi.desaKelurahan)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Kecamatan</td>
                  <td className="text-center">:</td>
                  <td>{valOrDots(verifikasi.kecamatan)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Kabupaten/Kota</td>
                  <td className="text-center">:</td>
                  <td>{valOrDots(verifikasi.kabupatenKota)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Provinsi</td>
                  <td className="text-center">:</td>
                  <td>{valOrDots(verifikasi.provinsi)}</td>
                </tr>
              </tbody>
            </table>

            {/* A. GAMBAR RENCANA TEKNIS */}
            <div className="mb-5">
              <p className="text-xs font-bold">
                A.&nbsp;&nbsp;&nbsp;&nbsp;GAMBAR RENCANA TEKNIS
              </p>
              <p className="mt-2 pl-6 text-xs">
                Jenis Kegiatan : <span className="font-medium">{rab.jenisKegiatan}</span>
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-4 pl-6 sm:grid-cols-[240px_1fr]">
                <div className="flex h-36 items-center justify-center border border-black p-2 text-center">
                  {rab.fotoPerspektif ? (
                    <img
                      src={rab.fotoPerspektif}
                      alt="Foto perspektif kondisi awal rumah"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] italic text-slate-700">
                      (FOTO PERSPEKTIF KONDISI AWAL RUMAH)
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">
                  <p className="text-center font-semibold">Ketentuan Pembuatan Gambar Rencana Teknis</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-justify">
                    <li>
                      CPB dapat membuat sendiri atau dibantu oleh Tenaga Pendamping Masyarakat (TPM) atau pegawai Kementerian Perumahan dan Kawasan Permukiman (PKP) yang ditugaskan.
                    </li>
                    <li>
                      Templat gambar rencana teknis renovasi rumah dapat disediakan oleh unit organisasi teknis di lingkungan PKP.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* B. DAFTAR RENCANA PEMANFAATAN BANTUAN */}
            <div>
              <p className="text-xs font-bold">
                B.&nbsp;&nbsp;&nbsp;&nbsp;DAFTAR RENCANA PEMANFAATAN BANTUAN
              </p>
              <p className="mt-2 pl-6 text-xs leading-relaxed">
                1.&nbsp;&nbsp;&nbsp;&nbsp;Jumlah Dana Yang Akan Ditransfer Ke Toko/Penyedia Bahan Bangunan Untuk Pembelian Bahan Bangunan
              </p>

              <table className="mt-2 ml-6 w-[calc(100%-1.5rem)] border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th rowSpan={2} className="w-8 border border-black px-1.5 py-1 text-center font-semibold">
                      No
                    </th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">
                      Uraian Pekerjaan*)
                    </th>
                    <th rowSpan={2} className="w-16 border border-black px-1.5 py-1 text-center font-semibold">
                      Volume
                    </th>
                    <th rowSpan={2} className="w-14 border border-black px-1.5 py-1 text-center font-semibold">
                      Satuan
                    </th>
                    <th rowSpan={2} className="w-24 border border-black px-1.5 py-1 text-center font-semibold">
                      Harga Satuan (Rp)
                    </th>
                    <th rowSpan={2} className="w-28 border border-black px-1.5 py-1 text-center font-semibold">
                      Harga Total (Rp)
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-1 text-center font-semibold">
                      Bahan Bangunan
                    </th>
                  </tr>
                  <tr className="italic text-[10px]">
                    <th className="border border-black py-0.5 text-center font-normal">1</th>
                    <th className="border border-black py-0.5 text-center font-normal">2</th>
                    <th className="border border-black py-0.5 text-center font-normal">3</th>
                    <th className="border border-black py-0.5 text-center font-normal">4</th>
                    <th className="border border-black py-0.5 text-center font-normal">5</th>
                    <th className="border border-black py-0.5 text-center font-normal">6=3x5</th>
                  </tr>
                </thead>
                <tbody>
                  {page1Categories.map((kat) => (
                    <React.Fragment key={kat.id}>
                      <tr>
                        <td className="border border-black px-1.5 py-1 text-center font-semibold">{kat.no}</td>
                        <td className="border border-black px-2 py-1 font-semibold">{kat.judul}</td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                      </tr>
                      {kat.items.map((it) => {
                        const total = (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0);
                        return (
                          <tr key={it.id}>
                            <td className="border border-black px-1.5 py-1"></td>
                            <td className="border border-black px-2 py-1">
                              {it.kode} {it.uraian}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatAngka(it.volume) : ''}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-center">{it.satuan}</td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatRupiah(it.hargaSatuan, false) : ''}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatRupiah(total, false) : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}

                  {kat4 && (
                    <React.Fragment>
                      <tr>
                        <td className="border border-black px-1.5 py-1 text-center font-semibold">{kat4.no}</td>
                        <td className="border border-black px-2 py-1 font-semibold">{kat4.judul}</td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                      </tr>
                      {kat4Part1Items.map((it) => {
                        const total = (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0);
                        return (
                          <tr key={it.id}>
                            <td className="border border-black px-1.5 py-1"></td>
                            <td className="border border-black px-2 py-1">
                              {it.kode} {it.uraian}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatAngka(it.volume) : ''}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-center">{it.satuan}</td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatRupiah(it.hargaSatuan, false) : ''}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                              {it.volume > 0 ? formatRupiah(total, false) : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* ===================== HALAMAN - 7 - (GAMBAR 4) ===================== */}
          <article className="print-sheet print-page-break mx-auto max-w-[820px] rounded-sm border border-slate-300 bg-white p-8 shadow-sm sm:p-12">
            <div className="text-center text-xs mb-4">- 7 -</div>

            <table className="ml-6 w-[calc(100%-1.5rem)] border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th rowSpan={2} className="w-8 border border-black px-1.5 py-1 text-center font-semibold">
                    No
                  </th>
                  <th className="border border-black px-2 py-1 text-center font-semibold">
                    Uraian Pekerjaan*)
                  </th>
                  <th rowSpan={2} className="w-16 border border-black px-1.5 py-1 text-center font-semibold">
                    Volume
                  </th>
                  <th rowSpan={2} className="w-14 border border-black px-1.5 py-1 text-center font-semibold">
                    Satuan
                  </th>
                  <th rowSpan={2} className="w-24 border border-black px-1.5 py-1 text-center font-semibold">
                    Harga Satuan (Rp)
                  </th>
                  <th rowSpan={2} className="w-28 border border-black px-1.5 py-1 text-center font-semibold">
                    Harga Total (Rp)
                  </th>
                </tr>
                <tr>
                  <th className="border border-black px-2 py-1 text-center font-semibold">
                    Bahan Bangunan
                  </th>
                </tr>
                <tr className="italic text-[10px]">
                  <th className="border border-black py-0.5 text-center font-normal">1</th>
                  <th className="border border-black py-0.5 text-center font-normal">2</th>
                  <th className="border border-black py-0.5 text-center font-normal">3</th>
                  <th className="border border-black py-0.5 text-center font-normal">4</th>
                  <th className="border border-black py-0.5 text-center font-normal">5</th>
                  <th className="border border-black py-0.5 text-center font-normal">6=3x5</th>
                </tr>
              </thead>
              <tbody>
                {kat4Part2Items.map((it) => {
                  const total = (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0);
                  return (
                    <tr key={it.id}>
                      <td className="border border-black px-1.5 py-1"></td>
                      <td className="border border-black px-2 py-1">
                        {it.kode} {it.uraian}
                      </td>
                      <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                        {it.volume > 0 ? formatAngka(it.volume) : ''}
                      </td>
                      <td className="border border-black px-1.5 py-1 text-center">{it.satuan}</td>
                      <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                        {it.volume > 0 ? formatRupiah(it.hargaSatuan, false) : ''}
                      </td>
                      <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                        {it.volume > 0 ? formatRupiah(total, false) : ''}
                      </td>
                    </tr>
                  );
                })}

                {page2OtherCategories.map((kat) => (
                  <React.Fragment key={kat.id}>
                    <tr>
                      <td className="border border-black px-1.5 py-1 text-center font-semibold">{kat.no}</td>
                      <td className="border border-black px-2 py-1 font-semibold">{kat.judul}</td>
                      <td className="border border-black px-1.5 py-1"></td>
                      <td className="border border-black px-1.5 py-1"></td>
                      <td className="border border-black px-1.5 py-1"></td>
                      <td className="border border-black px-1.5 py-1"></td>
                    </tr>
                    {kat.items.map((it) => {
                      const total = (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0);
                      return (
                        <tr key={it.id}>
                          <td className="border border-black px-1.5 py-1"></td>
                          <td className="border border-black px-2 py-1">
                            {it.kode} {it.uraian}
                          </td>
                          <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                            {it.volume > 0 ? formatAngka(it.volume) : ''}
                          </td>
                          <td className="border border-black px-1.5 py-1 text-center">{it.satuan}</td>
                          <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                            {it.volume > 0 ? formatRupiah(it.hargaSatuan, false) : ''}
                          </td>
                          <td className="border border-black px-1.5 py-1 text-right font-mono tabular-nums">
                            {it.volume > 0 ? formatRupiah(total, false) : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                <tr>
                  <td className="border border-black px-1.5 py-1.5"></td>
                  <td colSpan={4} className="border border-black px-2 py-1.5 text-center font-bold">
                    Total Harga Bahan Bangunan (A)
                  </td>
                  <td className="border border-black px-1.5 py-1.5 text-right font-mono font-bold tabular-nums">
                    {formatRupiah(ringkasan.totalBahanA, false)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-black px-2 py-1.5 text-[11px]">
                    <span className="font-semibold">Terbilang:</span>{' '}
                    <span className="italic">{terbilangRupiah(ringkasan.totalBahanA)}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Keterangan */}
            <div className="mt-2 ml-6 text-[10px] leading-relaxed">
              <p>Keterangan:</p>
              <ol className="list-decimal pl-5 text-justify">
                <li>
                  *) = uraian pekerjaan dan bahan pada tabel di atas merupakan contoh, bagian/tabel uraian pekerjaan dan bahan bangunan disesuaikan dengan perbaikan yang dilakukan oleh Penerima Bantuan (PB).
                </li>
                <li>
                  Bagian/tabel ini dapat digunakan untuk pelaksanaan Pemilihan Terbuka Toko/Penyedia Bahan Bangunan (PTT) atau Tender Rakyat. Termasuk juga dapat digunakan untuk pelaksanaan Fasilitasi Kerja Sama Pendistribusian Terkendali Bahan Bangunan Khusus Bedah Rumah (FASERBA).
                </li>
              </ol>
            </div>

            {/* 2. UPAH KERJA */}
            <div className="mt-5">
              <p className="pl-6 text-xs">
                2.&nbsp;&nbsp;&nbsp;&nbsp;Jumlah Dana Yang Akan Ditarik Tunai/Transfer Untuk Upah Kerja
              </p>
              <table className="mt-1.5 ml-10 w-[calc(100%-2.5rem)] border-collapse border border-black text-[11px]">
                <thead>
                  <tr>
                    <th className="w-10 border border-black px-2 py-1 text-center font-semibold">No</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Uraian</th>
                    <th className="w-36 border border-black px-2 py-1 text-center font-semibold">Biaya/Nilai (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {rab.upahKerja.items.map((u) => (
                    <tr key={u.id}>
                      <td className="border border-black px-2 py-1 text-center font-mono">{u.no}</td>
                      <td className="border border-black px-2 py-1">{u.uraian}</td>
                      <td className="border border-black px-2 py-1 text-right font-mono tabular-nums">
                        {formatRupiah(u.biaya, false)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="border border-black px-2 py-1 text-center font-bold">
                      Total Upah Kerja (B)
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-mono font-bold tabular-nums">
                      {formatRupiah(ringkasan.totalUpahB, false)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border border-black px-2 py-1">
                      <span className="font-semibold">Terbilang :</span>{' '}
                      <span className="italic">{terbilangRupiah(ringkasan.totalUpahB)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-2 ml-10 text-[10.5px] leading-relaxed">
                <p>Selain rencana penarikan/transfer dana tersebut, ditegaskan juga hal sebagai berikut:</p>
                <ol className="mt-1 list-[lower-alpha] space-y-0.5 pl-5 text-justify">
                  <li>penunjukan tukang/pekerja bangunan yang memudahkan;</li>
                  <li>
                    pekerjaan oleh tukang/pekerja bangunan untuk jangka waktu{' '}
                    <span className="font-semibold">{rab.upahKerja.jangkaWaktuHari} hari kerja</span>;
                  </li>
                  <li>pekerjaan oleh tukang/pekerja akan di awasi oleh TPM atau pegawai PKP;</li>
                  <li>
                    sumber dana untuk pembayaran upah kerja berasal dari dana Bedah Rumah, dana swadaya bagi yang mampu, dan/atau dana lainnya;
                  </li>
                  <li>
                    tukang/pekerja bangunan berjanji untuk bekerja sebaik-baiknya dan bertanggung jawab penuh atas pelaksanaan pekerjaannya; dan
                  </li>
                  <li>
                    semua perselisihan yang mungkin timbul/terjadi, baik yang bersifat teknis maupun nonteknis diselesaikan berdasarkan prinsip musyawarah untuk mufakat.
                  </li>
                </ol>
              </div>
            </div>

            {/* 3. DANA LAINNYA */}
            <div className="mt-5">
              <p className="pl-6 text-xs">
                3.&nbsp;&nbsp;&nbsp;&nbsp;Jumlah Dana Lainnya, Jika Ada Karena Tidak Diwajibkan Lagi
              </p>
              <table className="mt-1.5 ml-10 w-[calc(100%-2.5rem)] border-collapse border border-black text-[11px]">
                <thead>
                  <tr>
                    <th className="w-10 border border-black px-2 py-1 text-center font-semibold">No</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Uraian</th>
                    <th className="w-36 border border-black px-2 py-1 text-center font-semibold">Biaya/Nilai (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {rab.danaLainnya.items.length === 0 ? (
                    <tr>
                      <td className="border border-black px-2 py-2 text-center">-</td>
                      <td className="border border-black px-2 py-2">-</td>
                      <td className="border border-black px-2 py-2 text-right font-mono">0</td>
                    </tr>
                  ) : (
                    rab.danaLainnya.items.map((d) => (
                      <tr key={d.id}>
                        <td className="border border-black px-2 py-1 text-center font-mono">{d.no}</td>
                        <td className="border border-black px-2 py-1">{d.uraian}</td>
                        <td className="border border-black px-2 py-1 text-right font-mono tabular-nums">
                          {formatRupiah(d.biaya, false)}
                        </td>
                      </tr>
                    ))
                  )}
                  <tr>
                    <td colSpan={2} className="border border-black px-2 py-1 text-center font-bold">
                      Total Dana Lainnya (C)
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-mono font-bold tabular-nums">
                      {formatRupiah(ringkasan.totalLainnyaC, false)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border border-black px-2 py-1">
                      <span className="font-semibold">Terbilang :</span>{' '}
                      <span className="italic">{terbilangRupiah(ringkasan.totalLainnyaC)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* ===================== HALAMAN - 8 - (GAMBAR 5) ===================== */}
          <article className="print-sheet print-page-break mx-auto max-w-[820px] rounded-sm border border-slate-300 bg-white p-8 shadow-sm sm:p-12">
            <div className="text-center text-xs mb-6">- 8 -</div>

            <p className="pl-6 text-xs font-semibold">
              4.&nbsp;&nbsp;&nbsp;&nbsp;Total Dana Bedah Rumah (A + B)
            </p>

            <table className="mt-2 ml-10 w-[calc(100%-2.5rem)] border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="border border-black px-2.5 py-1.5">Total Harga Bahan Bangunan (A) (Rp)</td>
                  <td className="w-44 border border-black px-2.5 py-1.5 text-right font-mono tabular-nums">
                    {formatRupiah(ringkasan.totalBahanA, false)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2.5 py-1.5">Total Upah Kerja (B) (Rp)</td>
                  <td className="border border-black px-2.5 py-1.5 text-right font-mono tabular-nums">
                    {formatRupiah(ringkasan.totalUpahB, false)}
                  </td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-black px-2.5 py-1.5">Total Dana Bedah Rumah (AB=A+B) (Rp)</td>
                  <td className="border border-black px-2.5 py-1.5 text-right font-mono tabular-nums">
                    {formatRupiah(ringkasan.totalAB, false)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2.5 py-1.5">Total Dana Lainnya (C) (Rp)</td>
                  <td className="border border-black px-2.5 py-1.5 text-right font-mono tabular-nums">
                    {formatRupiah(ringkasan.totalLainnyaC, false)}
                  </td>
                </tr>
                <tr className="font-bold bg-slate-50/70">
                  <td className="border border-black px-2.5 py-1.5">
                    Total Keseluruhan Dana Renovasi (ABC=AB+C) (Rp)
                  </td>
                  <td className="border border-black px-2.5 py-1.5 text-right font-mono tabular-nums">
                    {formatRupiah(ringkasan.totalKeseluruhanABC, false)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-black px-2.5 py-2">
                    <span className="font-semibold">Terbilang :</span>{' '}
                    <span className="italic">{terbilangRupiah(ringkasan.totalKeseluruhanABC)}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Signature Block matching Image 5 */}
            <div className="mt-12 px-6 text-xs">
              <div className="text-right mb-4">
                {rab.penandatangan.tempatTanggal || '..., ... 20...'}
              </div>

              <div className="grid grid-cols-2 gap-12 text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p>(Jika ada) Ketua Kelompok</p>
                  <p>Calon Penerima Bantuan,</p>
                  <div className="h-16 flex items-center justify-center italic text-[11px] text-slate-600">
                    tanda tangan/cap jari
                  </div>
                  <p className="font-semibold">
                    {rab.penandatangan.ketuaKelompok || 'nama tanpa gelar'}
                  </p>
                </div>

                <div>
                  <p className="invisible">Mengetahui,</p>
                  <p>Diajukan oleh,</p>
                  <p>Calon Penerima Bantuan,</p>
                  <div className="h-16 flex items-center justify-center italic text-[11px] text-slate-600">
                    tanda tangan/cap jari
                  </div>
                  <p className="font-semibold">
                    {rab.penandatangan.namaCPB || verifikasi.namaKK || 'nama tanpa gelar'}
                  </p>
                </div>

                <div className="mt-4">
                  <p>Didampingi oleh,</p>
                  <p>Tenaga Pendamping Masyarakat</p>
                  <p>/Pegawai {rab.penandatangan.instansiTPM || '...'},</p>
                  <div className="h-16 flex items-center justify-center italic text-[11px] text-slate-600">
                    tanda tangan
                  </div>
                  <p className="font-semibold">
                    {rab.penandatangan.namaTPM || 'nama tanpa gelar'}
                  </p>
                </div>

                <div className="mt-4">
                  <p>Diperiksa oleh,</p>
                  <p>Koordinator Kabupaten/Kota</p>
                  <p>{rab.penandatangan.kotaKoordinator || verifikasi.kabupatenKota || '...'},</p>
                  <div className="h-16 flex items-center justify-center italic text-[11px] text-slate-600">
                    tanda tangan
                  </div>
                  <p className="font-semibold">
                    {rab.penandatangan.namaKoordinator || 'nama tanpa gelar'}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* LAMPIRAN FORM VERIFIKASI (GAMBAR 1 & 2) */}
      {docTab === 'verifikasi' && (
        <div className="space-y-8 font-serif text-black">
          {/* HALAMAN - 6 - (GAMBAR 1) */}
          <article className="print-sheet mx-auto max-w-[820px] rounded-sm border border-slate-300 bg-white p-8 shadow-sm sm:p-10">
            <div className="text-center text-xs mb-3">- 6 -</div>
            <p className="text-xs font-bold">B.&nbsp;&nbsp;&nbsp;LEMBARAN HASIL VERIFIKASI FAKTUAL</p>
            <div className="my-3 text-center">
              <h2 className="text-sm font-bold">LEMBARAN HASIL VERIFIKASI FAKTUAL</h2>
              <h3 className="text-sm font-bold">CALON PENERIMA BANTUAN BEDAH RUMAH</h3>
              <p className="text-xs font-semibold">
                NOMOR {verifikasi.nomorVerifikasi || '...'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10.5px] leading-snug mb-3">
              <table className="w-full">
                <tbody>
                  <tr><td className="w-28">Nama KK</td><td>: {verifikasi.namaKK || '-'}</td></tr>
                  <tr><td>NIK</td><td className="font-mono">: {verifikasi.nik || '-'}</td></tr>
                  <tr><td>Nomor KK</td><td className="font-mono">: {verifikasi.nomorKK || '-'}</td></tr>
                  <tr><td>Jenis Kelamin (L/P)</td><td>: {verifikasi.jenisKelamin || '-'}</td></tr>
                  <tr><td>Umur</td><td>: {verifikasi.umur || '-'}</td></tr>
                  <tr><td>Alamat RTLH</td><td>: {verifikasi.alamatRTLH || '-'}</td></tr>
                  <tr><td>RT/RW</td><td>: {verifikasi.rtRw || '-'}</td></tr>
                  <tr><td>Desa/Kelurahan</td><td>: {verifikasi.desaKelurahan || '-'}</td></tr>
                  <tr><td>Kecamatan</td><td>: {verifikasi.kecamatan || '-'}</td></tr>
                  <tr><td>Kabupaten/Kota</td><td>: {verifikasi.kabupatenKota || '-'}</td></tr>
                  <tr><td>Provinsi</td><td>: {verifikasi.provinsi || '-'}</td></tr>
                </tbody>
              </table>
              <table className="w-full">
                <tbody>
                  <tr><td className="w-44">Penghasilan KK/bln (Rp)</td><td className="font-mono">: {formatRupiah(verifikasi.penghasilanPerBulan)}</td></tr>
                  <tr><td>Nilai UMP/UMK</td><td className="font-mono">: {formatRupiah(verifikasi.nilaiUmpUmk)}</td></tr>
                  <tr><td>Pernah dapat bantuan</td><td>: {verifikasi.pernahDapatBantuan}</td></tr>
                  <tr><td>Tahun dapat bantuan</td><td>: {verifikasi.tahunDapatBantuan}</td></tr>
                  <tr><td>Lama menghuni (thn)</td><td>: {verifikasi.lamaMenghuniTahun}</td></tr>
                  <tr><td>Memiliki aset lain</td><td>: {verifikasi.memilikiAsetLain}</td></tr>
                  <tr><td>Jumlah penghuni (jiwa)</td><td>: {verifikasi.jumlahPenghuni}</td></tr>
                  <tr><td>Luas rumah (m²)</td><td>: {verifikasi.luasRumah}</td></tr>
                  <tr><td>Bersedia ketentuan</td><td>: {verifikasi.bersediaKetentuan}</td></tr>
                  <tr><td>Titik Koordinat</td><td className="font-mono">: {verifikasi.titikKoordinat || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr>
                  <th rowSpan={2} className="w-28 border border-black p-1 text-center">ASPEK/KOMPONEN</th>
                  <th colSpan={3} className="border border-black p-1 text-center">KONDISI RUMAH</th>
                </tr>
                <tr>
                  <th className="w-1/3 border border-black p-0.5 text-center">A</th>
                  <th className="w-1/3 border border-black p-0.5 text-center">B</th>
                  <th className="w-1/3 border border-black p-0.5 text-center">C</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={4} className="border border-black bg-slate-100 p-1 text-center font-bold">1. STRUKTUR</td></tr>
                {KONDISI_STRUKTUR_ITEMS.map((it) => {
                  const val = verifikasi.kondisiRumah.struktur[it.key];
                  return (
                    <tr key={it.key}>
                      <td className="border border-black p-1">{it.label}</td>
                      <td className="border border-black p-1">{val === 'A' ? '☑' : '☐'} {it.A}</td>
                      <td className="border border-black p-1">{val === 'B' ? '☑' : '☐'} {it.B}</td>
                      <td className="border border-black p-1">{val === 'C' ? '☑' : '☐'} {it.C}</td>
                    </tr>
                  );
                })}
                <tr><td colSpan={4} className="border border-black bg-slate-100 p-1 text-center font-bold">2. NON-STRUKTUR</td></tr>
                {KONDISI_NON_STRUKTUR_ITEMS.map((it) => {
                  const val = verifikasi.kondisiRumah.nonStruktur[it.key];
                  return (
                    <tr key={it.key}>
                      <td className="border border-black p-1">{it.label}</td>
                      <td className="border border-black p-1">{val === 'A' ? '☑' : '☐'} {it.A}</td>
                      <td className="border border-black p-1">{val === 'B' ? '☑' : '☐'} {it.B}</td>
                      <td className="border border-black p-1">{val === 'C' ? '☑' : '☐'} {it.C}</td>
                    </tr>
                  );
                })}
                <tr><td colSpan={4} className="border border-black bg-slate-100 p-1 text-center font-bold">3. KESEHATAN & KECUKUPAN LUAS</td></tr>
                {KONDISI_KESEHATAN_ITEMS.map((it) => {
                  const val = verifikasi.kondisiRumah.kesehatan[it.key];
                  return (
                    <tr key={it.key}>
                      <td className="border border-black p-1">{it.label}</td>
                      <td className="border border-black p-1">{val === 'A' ? '☑' : '☐'} {it.A}</td>
                      <td className="border border-black p-1">{it.B ? `${val === 'B' ? '☑' : '☐'} ${it.B}` : ''}</td>
                      <td className="border border-black p-1">{val === 'C' ? '☑' : '☐'} {it.C}</td>
                    </tr>
                  );
                })}
                <tr><td colSpan={4} className="border border-black bg-slate-100 p-1 text-center font-bold">4. STATUS LAHAN</td></tr>
                <tr>
                  <td className="border border-black p-1">Status lahan</td>
                  <td className="border border-black p-1">{verifikasi.kondisiRumah.statusLahan.statusLahan === 'A' ? '☑' : '☐'} Milik sendiri, ada bukti sah</td>
                  <td className="border border-black p-1">{verifikasi.kondisiRumah.statusLahan.statusLahan === 'B' ? '☑' : '☐'} Penguasaan rumah tidak layak huni/lahan*)</td>
                  <td className="border border-black p-1"></td>
                </tr>
              </tbody>
            </table>
          </article>

          {/* HALAMAN - 7 - (GAMBAR 2) */}
          <article className="print-sheet print-page-break mx-auto max-w-[820px] rounded-sm border border-slate-300 bg-white p-8 shadow-sm sm:p-10">
            <div className="text-center text-xs mb-3">- 7 -</div>
            <p className="text-xs font-bold mb-2">I. IDENTIFIKASI KESWADAYAAN</p>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <p className="font-semibold mb-1">a. Material Yang Sudah Ada/Bekas Layak Pakai</p>
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr>
                      <th className="border border-black p-1">No</th>
                      <th className="border border-black p-1">Bentuk</th>
                      <th className="border border-black p-1">Ada</th>
                      <th className="border border-black p-1">Tidak</th>
                      <th className="border border-black p-1">Jumlah</th>
                      <th className="border border-black p-1">Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keswadayaan.materialBekas.map((r) => (
                      <tr key={r.id}>
                        <td className="border border-black p-1 text-center">{r.no}</td>
                        <td className="border border-black p-1">{r.bentuk || '...'}</td>
                        <td className="border border-black p-1 text-center">{r.status === 'ada' ? '✓' : ''}</td>
                        <td className="border border-black p-1 text-center">{r.status === 'tidak_ada' ? '✓' : ''}</td>
                        <td className="border border-black p-1 text-right">{r.jumlahAngka > 0 ? `${r.jumlahAngka} ${r.satuan}` : ''}</td>
                        <td className="border border-black p-1 text-center">{r.ceklisFoto ? '✓' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <p className="font-semibold mb-1">b. Material Baru/Stok</p>
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr>
                      <th className="border border-black p-1">No</th>
                      <th className="border border-black p-1">Bentuk</th>
                      <th className="border border-black p-1">Ada</th>
                      <th className="border border-black p-1">Tidak</th>
                      <th className="border border-black p-1">Jumlah</th>
                      <th className="border border-black p-1">Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keswadayaan.materialBaru.map((r) => (
                      <tr key={r.id}>
                        <td className="border border-black p-1 text-center">{r.no}</td>
                        <td className="border border-black p-1">{r.bentuk || '...'}</td>
                        <td className="border border-black p-1 text-center">{r.status === 'ada' ? '✓' : ''}</td>
                        <td className="border border-black p-1 text-center">{r.status === 'tidak_ada' ? '✓' : ''}</td>
                        <td className="border border-black p-1 text-right">{r.jumlahAngka > 0 ? `${r.jumlahAngka} ${r.satuan}` : ''}</td>
                        <td className="border border-black p-1 text-center">{r.ceklisFoto ? '✓' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-[10.5px]">
              <p className="font-bold">II. KESIMPULAN</p>
              <table className="mt-1 w-full border-collapse border border-black">
                <tbody>
                  <tr>
                    <td className="w-1/2 border border-black p-2 align-top">
                      <p className="font-semibold">
                        {keswadayaan.kesimpulan.statusRekomendasi === 'direkomendasikan' ? '☑' : '☐'} Direkomendasikan Bedah Rumah
                      </p>
                      <p className="mt-2 pl-4">
                        {keswadayaan.kesimpulan.metodeKonstruksi === 'konvensional' ? '☑' : '☐'} Konvensional
                      </p>
                      <p className="mt-1 pl-4">
                        {keswadayaan.kesimpulan.metodeKonstruksi === 'ferosemen' ? '☑' : '☐'} Ferosemen (untuk rumah tembok tanpa struktur)
                      </p>
                    </td>
                    <td className="w-1/2 border border-black p-2 align-top">
                      <p className="font-semibold">
                        {keswadayaan.kesimpulan.statusRekomendasi === 'tidak_direkomendasikan' ? '☑' : '☐'} Tidak Direkomendasikan Bedah Rumah, alasan:
                      </p>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-[9.5px]">
                        {ALASAN_TIDAK_DIREKOMENDASIKAN.map((a) => (
                          <div key={a.id}>
                            {a.id}. {keswadayaan.kesimpulan.alasanTidakDirekomendasikan.includes(a.id) ? '☑' : '☐'} {a.label}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-[10.5px]">
              <div>
                <p>Diperiksa oleh,</p>
                <p>Koordinator Kabupaten/Kota {keswadayaan.kesimpulan.pemeriksaKota || '...'}</p>
                <div className="h-12 flex items-center justify-center italic text-slate-500">tanda tangan</div>
                <p className="font-semibold">{keswadayaan.kesimpulan.namaKoordinator || 'nama tanpa gelar'}</p>
              </div>
              <div>
                <p>Diketahui oleh,</p>
                <p>Calon Penerima Bantuan,</p>
                <div className="h-12 flex items-center justify-center italic text-slate-500">tanda tangan</div>
                <p className="font-semibold">{keswadayaan.kesimpulan.namaCPB || verifikasi.namaKK || 'nama tanpa gelar'}</p>
              </div>
              <div>
                <p>{keswadayaan.kesimpulan.tempatTanggal || '..., ... 20...'}</p>
                <p>Dilakukan oleh, Tenaga Pendamping Masyarakat</p>
                <div className="h-12 flex items-center justify-center italic text-slate-500">tanda tangan</div>
                <p className="font-semibold">{keswadayaan.kesimpulan.namaTPM || 'nama tanpa gelar'}</p>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
