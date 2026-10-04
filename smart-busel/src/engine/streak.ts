import { addDays } from './leitner';

/** Понедельник недели, в которую попадает дата (ключ недели). */
export function weekKey(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return addDays(date, -((d.getDay() + 6) % 7));
}

/**
 * Серия дней. Никаких наказаний: один пропущенный день в неделю «замораживается»
 * бесплатно, а сегодняшний день, пока он не закончился, серию не обрывает.
 */
export function currentStreak(isActive: (date: string) => boolean, today: string) {
  let d = isActive(today) ? today : addDays(today, -1);
  let days = 0;
  const frozenWeeks = new Set<string>();
  for (let guard = 0; guard < 800; guard++) {
    if (isActive(d)) {
      days++;
    } else {
      const wk = weekKey(d);
      const canFreeze = !frozenWeeks.has(wk) && isActive(addDays(d, -1));
      if (!canFreeze) break;
      frozenWeeks.add(wk);
    }
    d = addDays(d, -1);
  }
  return { days, freezeAvailable: !frozenWeeks.has(weekKey(today)) };
}
