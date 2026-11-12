// «Разминка дня»: пройденные темы возвращаются через растущие промежутки, чтобы знания не забывались.

/** Через сколько дней повторять тему на каждой ступени. */
export const REVIEW_DAYS = [3, 7, 21, 60];
/** Сколько тем и вопросов из каждой берётся в одну разминку. */
export const WARMUP_TOPICS = 3;
export const WARMUP_PER_TOPIC = 2;
/** Бонус за разминку — один раз в день. */
export const WARMUP_BONUS = 15;

export interface ReviewState { done: boolean; reviewed?: string; stage?: number }

const dayNumber = (date: string) => { const [y, m, d] = date.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
const interval = (stage = 0) => REVIEW_DAYS[Math.min(stage, REVIEW_DAYS.length - 1)];

/** Сколько дней тема уже ждёт повторения (0 и больше — пора). Тема без даты ждёт «давно». */
function overdue(r: ReviewState, today: string): number {
  if (!r.reviewed) return 100000;
  return dayNumber(today) - dayNumber(r.reviewed) - interval(r.stage);
}

export function isDue(r: ReviewState, today: string): boolean {
  return r.done && overdue(r, today) >= 0;
}

/** Темы для разминки: сначала те, что ждут дольше всех. */
export function dueTopics(results: Record<string, ReviewState>, today: string, limit: number): string[] {
  return Object.entries(results)
    .filter(([, r]) => isDue(r, today))
    .sort((a, b) => overdue(b[1], today) - overdue(a[1], today) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

/** После разминки: всё верно — следующая ступень, была ошибка — тема вернётся через 3 дня. */
export function afterReview<T extends ReviewState>(r: T, allCorrect: boolean, today: string): T {
  return { ...r, reviewed: today, stage: allCorrect ? (r.stage ?? 0) + 1 : 0 };
}
