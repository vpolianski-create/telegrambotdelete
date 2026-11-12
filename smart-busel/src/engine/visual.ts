// Расчёты для рисунков: лента времени, координатный луч, углы. Чистые функции — без экрана.

/** Подпись года: −776 → «776 г. до н. э.», 988 → «988 г.». */
export const yearLabel = (year: number) => (year < 0 ? `${-year} г. до н. э.` : `${year} г.`);

/**
 * Место года на ленте времени. Нулевого года не было: после 1 г. до н. э. сразу идёт 1 г. н. э.,
 * поэтому годы до нашей эры сдвинуты на один.
 */
export const yearPos = (year: number) => (year < 0 ? year + 1 : year);

/** Сколько лет прошло между двумя годами (с учётом того, что года 0 не было). */
export const yearsApart = (a: number, b: number) => Math.abs(yearPos(a) - yearPos(b));

const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
const noZero = (y: number) => (y === 0 ? 1 : y);

/** Границы ленты и ровные деления для набора годов. Вместо года 0 стоит 1 г. н. э. */
export function timelineRange(years: number[]): { from: number; to: number; step: number; ticks: number[] } {
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  const span = Math.max(yearsApart(lo, hi), 1);
  const step = STEPS.find((s) => (span * 1.3) / s <= 6) ?? 10000;
  const pad = span * 0.1;
  const a = Math.floor((lo - pad) / step) * step;
  let b = Math.ceil((hi + pad) / step) * step;
  if (b === a) b = a + step;
  const ticks: number[] = [];
  for (let t = a; t <= b; t += step) ticks.push(noZero(t));
  return { from: noZero(a), to: noZero(b), step, ticks };
}

/** Перевод числа в координату на рисунке: from → x0, to → x1. */
export const scale = (value: number, from: number, to: number, x0: number, x1: number) =>
  x0 + ((value - from) / (to - from)) * (x1 - x0);

export type AngleKind = 'острый' | 'прямой' | 'тупой' | 'развёрнутый';
/** Вид угла по градусной мере. */
export const angleKind = (deg: number): AngleKind => (deg < 90 ? 'острый' : deg === 90 ? 'прямой' : deg < 180 ? 'тупой' : 'развёрнутый');
