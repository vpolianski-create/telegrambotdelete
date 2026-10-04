export interface WordState {
  box: number; // 1..5
  due: string; // YYYY-MM-DD
}

/** Через сколько дней слово вернётся из коробки 1..5. Коробка 1 — в каждом занятии. */
export const BOX_DAYS = [0, 1, 3, 7, 14];
export const LEARNED_BOX = 4;

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function afterAnswer(state: WordState | undefined, correct: boolean, today: string): WordState {
  const box = correct ? Math.min(5, (state?.box ?? 1) + 1) : 1;
  return { box, due: addDays(today, BOX_DAYS[box - 1]) };
}

/** Сначала слова из младших коробок (ошибочные чаще), потом новые. */
export function pickSession<T extends { id: string }>(
  words: T[],
  states: Record<string, WordState>,
  today: string,
  n: number,
): T[] {
  const due = words.filter((w) => states[w.id] && states[w.id].due <= today);
  due.sort((a, b) => states[a.id].box - states[b.id].box);
  const fresh = words.filter((w) => !states[w.id]);
  return [...due, ...fresh].slice(0, n);
}

export function boxCounts(words: { id: string }[], states: Record<string, WordState>): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const w of words) if (states[w.id]) counts[states[w.id].box - 1]++;
  return counts;
}
