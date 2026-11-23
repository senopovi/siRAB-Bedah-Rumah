import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { DokumenRABData } from '../types/rab';
import { formatAngka, formatRupiah } from '../utils/formatters';
import { hitungRingkasanRAB } from '../utils/rabCalculator';

interface Props {
  rab: DokumenRABData;
}

interface PieDatum {
  name: string;
  value: number;
  color: string;
  persen: number;
}

interface BarDatum {
  nama: string;
  biaya: number;
  swadaya: number;
  tipe: 'material' | 'upah';
}

const COLOR_MATERIAL = '#1D4ED8';
const COLOR_UPAH = '#D97706';
const COLOR_LAINNYA = '#0F766E';
const COLOR_SWADAYA = '#16A34A';

export const VisualisasiRAB: React.FC<Props> = ({ rab }) => {
  const [terbuka, setTerbuka] = useState(true);
  const [ikutCetak, setIkutCetak] = useState(false);

  const ringkasan = useMemo(() => hitungRingkasanRAB(rab), [rab]);

  const { pieData, barData, rasioMaterialAB, rasioUpahAB } = useMemo(() => {
    const totalABC = ringkasan.totalKeseluruhanABC;
    const totalAB = ringkasan.totalAB;

    const pData: PieDatum[] = [];
    if (ringkasan.totalBahanA > 0) {
      pData.push({
        name: 'Bahan Bangunan (A)',
        value: ringkasan.totalBahanA,
        color: COLOR_MATERIAL,
        persen: totalABC > 0 ? (ringkasan.totalBahanA / totalABC) * 100 : 0,
      });
    }
    if (ringkasan.totalUpahB > 0) {
      pData.push({
        name: 'Upah Tenaga Kerja (B)',
        value: ringkasan.totalUpahB,
        color: COLOR_UPAH,
        persen: totalABC > 0 ? (ringkasan.totalUpahB / totalABC) * 100 : 0,
      });
    }
    if (ringkasan.totalLainnyaC > 0) {
      pData.push({
        name: 'Dana Lainnya / Swadaya (C)',
        value: ringkasan.totalLainnyaC,
        color: COLOR_LAINNYA,
        persen: totalABC > 0 ? (ringkasan.totalLainnyaC / totalABC) * 100 : 0,
      });
    }

    const bData: BarDatum[] = rab.kategoriPekerjaan
      .filter((kat) => kat.aktif)
      .map((kat) => {
        const biaya = kat.items.reduce(
          (s, it) => s + (Number(it.volume) || 0) * (Number(it.hargaSatuan) || 0),
          0
        );
        const swadaya = kat.items.reduce(
          (s, it) => s + (Number(it.potonganSwadaya) || 0) * (Number(it.hargaSatuan) || 0),
          0
        );
        const cleanTitle = kat.judul
          .replace(/\*\)/g, '')
          .replace(/^Pekerjaan\s+/i, '')
          .trim();
        return {
          nama: `${kat.no}. ${cleanTitle}`,
          biaya: Math.round(biaya),
          swadaya: Math.round(swadaya),
          tipe: 'material' as const,
        };
      })
      .filter((d) => d.biaya > 0 || d.swadaya > 0);

    if (ringkasan.totalUpahB > 0) {
      bData.push({
        nama: 'Upah Tenaga Kerja (B)',
        biaya: ringkasan.totalUpahB,
        swadaya: 0,
        tipe: 'upah',
      });
    }

    const rMat = totalAB > 0 ? (ringkasan.totalBahanA / totalAB) * 100 : 0;
    const rUpah = totalAB > 0 ? (ringkasan.totalUpahB / totalAB) * 100 : 0;

    return {
      pieData: pData,
      barData: bData,
      rasioMaterialAB: rMat,
      rasioUpahAB: rUpah,
    };
  }, [rab, ringkasan]);

  const formatShortRp = (val: number) => {
    if (val >= 1_000_000) return `${formatAngka(val / 1_000_000, 1)} jt`;
    if (val >= 1_000) return `${formatAngka(val / 1_000, 0)} rb`;
    return String(val);
  };

  return (
    <section
      className={`${ikutCetak ? 'print-sheet' : 'no-print'} mx-auto max-w-[1160px] rounded-xl border border-slate-200 bg-white`}
    >
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-4 w-4 text-blue-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Visualisasi Proporsi Biaya Material & Upah Tenaga Kerja
            </h3>
            <p className="text-xs text-slate-500">
              Dihitung otomatis dari data RAB aktif · Rasio Dana Bedah Rumah (AB):{' '}
              <span className="font-mono font-semibold text-blue-700 tabular-nums">
                Material {formatAngka(rasioMaterialAB, 1)}%
              </span>{' '}
              /{' '}
              <span className="font-mono font-semibold text-amber-700 tabular-nums">
                Upah {formatAngka(rasioUpahAB, 1)}%
              </span>
            </p>
          </div>
        </div>

        <div className="no-print flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={ikutCetak}
              onChange={(e) => setIkutCetak(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
            />
            Sertakan Grafik saat Cetak
          </label>
          <button
            type="button"
            onClick={() => setTerbuka((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            {terbuka ? 'Sembunyikan' : 'Tampilkan'}
            {terbuka ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {terbuka && (
        <div className="p-5">
          {ringkasan.totalKeseluruhanABC === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Belum ada nilai biaya RAB. Jalankan <strong>Sinkron & Hitung Otomatis</strong> atau isi volume material dan upah kerja terlebih dahulu.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left: Donut Chart Proporsi A vs B vs C */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b border-slate-100 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Proporsi Total Anggaran (ABC)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Perbandingan belanja bahan bangunan (A), upah kerja (B), dan dana lainnya (C)
                  </p>
                </div>

                <div className="relative my-2 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={86}
                        paddingAngle={2}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const num = Number(value) || 0;
                          const pct =
                            ringkasan.totalKeseluruhanABC > 0
                              ? (num / ringkasan.totalKeseluruhanABC) * 100
                              : 0;
                          return [
                            `${formatRupiah(num)} (${formatAngka(pct, 1)}%)`,
                            String(name || ''),
                          ];
                        }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Total Readout */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-medium text-slate-500">Total ABC</span>
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {formatShortRp(ringkasan.totalKeseluruhanABC)}
                    </span>
                  </div>
                </div>

                {/* Custom Tabular Legend */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono tabular-nums">
                        <span className="text-slate-500">{formatAngka(item.persen, 1)}%</span>
                        <span className="font-semibold text-slate-900">
                          {formatRupiah(item.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Horizontal Bar Chart Breakdown Kategori Pekerjaan vs Upah & Swadaya */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Distribusi Biaya per Kategori Pekerjaan vs Upah Kerja
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Menunjukkan pos pekerjaan terbesar serta nilai penghematan dari material swadaya
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: COLOR_MATERIAL }} />
                      Belanja Bahan
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: COLOR_UPAH }} />
                      Upah Kerja
                    </span>
                    {ringkasan.totalHematSwadayaMaterial > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: COLOR_SWADAYA }} />
                        Hemat Swadaya
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatShortRp}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="nama"
                        width={165}
                        tick={{ fontSize: 11, fill: '#0f172a' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatRupiah(Number(value) || 0),
                          name === 'biaya' ? 'Anggaran Belanja / Upah' : 'Hemat Material Swadaya',
                        ]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="biaya" stackId="a" radius={[0, 3, 3, 0]} barSize={20}>
                        {barData.map((entry, idx) => (
                          <Cell
                            key={idx}
                            fill={entry.tipe === 'upah' ? COLOR_UPAH : COLOR_MATERIAL}
                          />
                        ))}
                      </Bar>
                      {ringkasan.totalHematSwadayaMaterial > 0 && (
                        <Bar
                          dataKey="swadaya"
                          stackId="a"
                          fill={COLOR_SWADAYA}
                          radius={[0, 3, 3, 0]}
                          barSize={20}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
