export function formatRupiah(value: number, withPrefix = true): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function formatAngka(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
];

function terbilangRekursif(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} Belas`;
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return `${SATUAN[puluh]} Puluh${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 1000) {
    const ratus = Math.floor(n / 100);
    const sisa = n % 100;
    return `${SATUAN[ratus]} Ratus${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 1_000_000) {
    const ribu = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${terbilangRekursif(ribu)} Ribu${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 1_000_000_000) {
    const juta = Math.floor(n / 1_000_000);
    const sisa = n % 1_000_000;
    return `${terbilangRekursif(juta)} Juta${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  if (n < 1_000_000_000_000) {
    const miliar = Math.floor(n / 1_000_000_000);
    const sisa = n % 1_000_000_000;
    return `${terbilangRekursif(miliar)} Miliar${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
  }
  const triliun = Math.floor(n / 1_000_000_000_000);
  const sisa = n % 1_000_000_000_000;
  return `${terbilangRekursif(triliun)} Triliun${sisa ? ' ' + terbilangRekursif(sisa) : ''}`;
}

export function terbilangRupiah(angka: number): string {
  const n = Math.round(Number.isFinite(angka) ? Math.abs(angka) : 0);
  if (n === 0) return 'Nol Rupiah';
  const words = terbilangRekursif(n).replace(/\s+/g, ' ').trim();
  return `${angka < 0 ? 'Minus ' : ''}${words} Rupiah`;
}
