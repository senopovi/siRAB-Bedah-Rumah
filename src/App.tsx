import React, { useEffect, useState } from 'react';
import { FilePlus2, FolderOpen, Printer, RotateCcw, Sparkles, Trash2, Upload } from 'lucide-react';
import { DokumenRABOutput } from './components/DokumenRABOutput';
import { FormKeswadayaan } from './components/FormKeswadayaan';
import { FormVerifikasiFaktual } from './components/FormVerifikasiFaktual';
import { KalkulatorRAB } from './components/KalkulatorRAB';
import {
  DEFAULT_HARGA_SATUAN,
  createEmptyDossier,
  createSampleDossier,
} from './data/defaults';
import {
  DokumenRABData,
  DossierRAB,
  HargaSatuanPreset,
  KeswadayaanData,
  VerifikasiFaktualData,
} from './types/rab';
import { formatRupiah } from './utils/formatters';
import { hitungRABOtomatis, hitungRingkasanRAB } from './utils/rabCalculator';
import { validateVerifikasiFaktual } from './utils/validation';

type ActiveTab = 'verifikasi' | 'keswadayaan' | 'kalkulator' | 'output';

const STORAGE_KEY = 'sirab_bedah_rumah_dossiers_v1';
const HARGA_STORAGE_KEY = 'sirab_harga_satuan_v1';

function loadInitialDossiers(): DossierRAB[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DossierRAB[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  const sample = createSampleDossier();
  sample.rab = hitungRABOtomatis(sample.verifikasi, sample.keswadayaan, sample.rab, DEFAULT_HARGA_SATUAN);
  return [sample];
}

function loadInitialHarga(): HargaSatuanPreset {
  try {
    const raw = localStorage.getItem(HARGA_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_HARGA_SATUAN, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_HARGA_SATUAN;
}

export default function App() {
  const [dossiers, setDossiers] = useState<DossierRAB[]>(loadInitialDossiers);
  const [activeId, setActiveId] = useState<string>(() => dossiers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<ActiveTab>('verifikasi');
  const [hargaPreset, setHargaPreset] = useState<HargaSatuanPreset>(loadInitialHarga);
  const [notice, setNotice] = useState<string>('');
  const [validationAttempted, setValidationAttempted] = useState<boolean>(false);

  const activeDossier = dossiers.find((d) => d.id === activeId) || dossiers[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    } catch {
      // ignore quota errors
    }
  }, [dossiers]);

  useEffect(() => {
    try {
      localStorage.setItem(HARGA_STORAGE_KEY, JSON.stringify(hargaPreset));
    } catch {
      // ignore
    }
  }, [hargaPreset]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const updateActiveDossier = (updater: (d: DossierRAB) => DossierRAB) => {
    setDossiers((prev) =>
      prev.map((d) =>
        d.id === activeDossier.id
          ? { ...updater(d), updatedAt: new Date().toISOString() }
          : d
      )
    );
  };

  const handleVerifikasiChange = (verifikasi: VerifikasiFaktualData) => {
    updateActiveDossier((d) => ({ ...d, verifikasi }));
  };

  const handleKeswadayaanChange = (keswadayaan: KeswadayaanData) => {
    updateActiveDossier((d) => ({ ...d, keswadayaan }));
  };

  const handleRabChange = (rab: DokumenRABData) => {
    updateActiveDossier((d) => ({ ...d, rab }));
  };

  const navigateToTab = (target: ActiveTab): boolean => {
    if (target !== 'verifikasi') {
      const check = validateVerifikasiFaktual(activeDossier.verifikasi);
      if (!check.isValid) {
        setValidationAttempted(true);
        setActiveTab('verifikasi');
        setTimeout(() => {
          const el = document.getElementById('verifikasi-error-banner');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 40);
        return false;
      }
    }
    setValidationAttempted(false);
    setActiveTab(target);
    return true;
  };

  const handleAutoCalculate = (goToTab?: ActiveTab) => {
    if (goToTab && !navigateToTab(goToTab)) {
      return;
    }
    updateActiveDossier((d) => ({
      ...d,
      rab: hitungRABOtomatis(d.verifikasi, d.keswadayaan, d.rab, hargaPreset),
    }));
    setNotice('RAB material, potongan swadaya, dan upah kerja berhasil dihitung otomatis.');
  };

  const handleNewBlank = () => {
    const fresh = createEmptyDossier();
    setDossiers((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setValidationAttempted(false);
    setActiveTab('verifikasi');
    setNotice('Berkas baru kosong dibuat.');
  };

  const handleLoadSample = () => {
    const sample = createSampleDossier();
    sample.id = `sample-${Date.now()}`;
    sample.rab = hitungRABOtomatis(sample.verifikasi, sample.keswadayaan, sample.rab, hargaPreset);
    setDossiers((prev) => [sample, ...prev]);
    setActiveId(sample.id);
    setValidationAttempted(false);
    setNotice('Contoh data Verifikasi & RAB Bedah Rumah dimuat.');
  };

  const handleDeleteCurrent = () => {
    setValidationAttempted(false);
    if (dossiers.length <= 1) {
      const fresh = createEmptyDossier();
      setDossiers([fresh]);
      setActiveId(fresh.id);
      setActiveTab('verifikasi');
      setNotice('Data berkas direset ke formulir kosong.');
      return;
    }
    const remaining = dossiers.filter((d) => d.id !== activeDossier.id);
    setDossiers(remaining);
    setActiveId(remaining[0].id);
    setNotice('Berkas aktif dihapus.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.verifikasi && parsed.keswadayaan && parsed.rab) {
          const imported: DossierRAB = {
            id: `imp-${Date.now()}`,
            updatedAt: new Date().toISOString(),
            verifikasi: parsed.verifikasi,
            keswadayaan: parsed.keswadayaan,
            rab: parsed.rab,
          };
          setDossiers((prev) => [imported, ...prev]);
          setActiveId(imported.id);
          setValidationAttempted(false);
          setNotice('Berkas JSON berhasil diimpor.');
        }
      } catch {
        setNotice('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const ringkasan = hitungRingkasanRAB(activeDossier.rab);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'verifikasi', label: '1. Verifikasi Faktual' },
    { id: 'keswadayaan', label: '2. Keswadayaan' },
    { id: 'kalkulator', label: '3. Kalkulator RAB' },
    { id: 'output', label: '4. Dokumen Output' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single-element Brand wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('verifikasi');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            SiRAB Bedah Rumah
          </a>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateToTab(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'font-semibold text-slate-900 after:absolute after:inset-x-0 after:-bottom-3.5 after:h-0.5 after:bg-blue-700'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (navigateToTab('output')) {
                  setTimeout(() => window.print(), 150);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Dokumen
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Tab Switcher */}
        <div className="flex overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToTab(item.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Workspace Toolbar */}
      <div className="no-print border-b border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-slate-500" />
              <select
                aria-label="Pilih Berkas CPB"
                value={activeDossier.id}
                onChange={(e) => {
                  setActiveId(e.target.value);
                  setValidationAttempted(false);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.verifikasi.namaKK || 'CPB Tanpa Nama'} — {d.verifikasi.desaKelurahan || 'Belum diisi'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNewBlank}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              Berkas Baru
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Muat Contoh Data
            </button>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap">
              <Upload className="h-3.5 w-3.5" />
              Impor JSON
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleDeleteCurrent}
              title="Hapus / Reset berkas aktif"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:text-red-700 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </div>

          {/* Unboxed clean metadata summary */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>
              Bahan (A): <strong className="font-mono text-slate-900 tabular-nums">{formatRupiah(ringkasan.totalBahanA)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Upah (B): <strong className="font-mono text-slate-900 tabular-nums">{formatRupiah(ringkasan.totalUpahB)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Total (AB): <strong className="font-mono text-blue-700 tabular-nums">{formatRupiah(ringkasan.totalAB)}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleAutoCalculate('kalkulator')}
              className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sinkron & Hitung Otomatis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6">
        {notice && (
          <div className="no-print mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-900">
            {notice}
          </div>
        )}

        {activeTab === 'verifikasi' && (
          <FormVerifikasiFaktual
            data={activeDossier.verifikasi}
            validationAttempted={validationAttempted}
            onChange={handleVerifikasiChange}
            onNextStep={() => navigateToTab('keswadayaan')}
          />
        )}

        {activeTab === 'keswadayaan' && (
          <FormKeswadayaan
            verifikasi={activeDossier.verifikasi}
            data={activeDossier.keswadayaan}
            onChange={handleKeswadayaanChange}
            onGenerateRAB={() => handleAutoCalculate('kalkulator')}
          />
        )}

        {activeTab === 'kalkulator' && (
          <KalkulatorRAB
            verifikasi={activeDossier.verifikasi}
            keswadayaan={activeDossier.keswadayaan}
            rab={activeDossier.rab}
            hargaPreset={hargaPreset}
            onChangeHargaPreset={setHargaPreset}
            onChangeRab={handleRabChange}
            onAutoCalculate={() => handleAutoCalculate()}
            onGoToOutput={() => setActiveTab('output')}
          />
        )}

        {activeTab === 'output' && (
          <DokumenRABOutput
            verifikasi={activeDossier.verifikasi}
            keswadayaan={activeDossier.keswadayaan}
            rab={activeDossier.rab}
          />
        )}
      </main>
    </div>
  );
}
