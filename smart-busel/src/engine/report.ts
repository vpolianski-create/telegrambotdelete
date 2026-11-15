import { addDays } from './leitner';

export interface ReportDay { date: string; sec: number; tasks: number; correct: number }
export interface WeekReport {
  from: string; to: string;
  prevPercent: number; // верно с первого раза неделей раньше
  fixed: number; secondTry: number; guesses: number; abandoned: number; harder: number;
  days: ReportDay[];
  minutes: number; prevMinutes: number;
  activeDays: number; tasks: number; correct: number; percent: number;
  topicsPassed: string[]; // id тем, пройденных за неделю (без повторов)
  weakTopics: [string, number][]; // тема → число ошибок за неделю
}

export interface ReportInput {
  daily: Record<string, { sec: number; tasks: number; correct: number; topicIds?: string[]; fixed?: number; secondTry?: number; guesses?: number; abandoned?: number; harder?: number }>;
  mistakes: { topicId: string; date: string }[];
}

/** Отчёт за 7 дней, заканчивающихся датой `to`. */
export function weekReport(s: ReportInput, to: string): WeekReport {
  const dates = Array.from({ length: 7 }, (_, k) => addDays(to, k - 6));
  const days = dates.map((date) => ({ date, sec: s.daily[date]?.sec ?? 0, tasks: s.daily[date]?.tasks ?? 0, correct: s.daily[date]?.correct ?? 0 }));
  const prev = Array.from({ length: 7 }, (_, k) => addDays(to, k - 13));
  const tasks = days.reduce((a, d) => a + d.tasks, 0);
  const correct = days.reduce((a, d) => a + d.correct, 0);
  const passed = [...new Set(dates.flatMap((d) => s.daily[d]?.topicIds ?? []))];
  const weak: Record<string, number> = {};
  s.mistakes.filter((m) => dates.includes(m.date)).forEach((m) => { weak[m.topicId] = (weak[m.topicId] ?? 0) + 1; });
  const sum = (k: 'fixed' | 'secondTry' | 'guesses' | 'abandoned' | 'harder') => dates.reduce((a, d) => a + (s.daily[d]?.[k] ?? 0), 0);
  const prevTasks = prev.reduce((a, d) => a + (s.daily[d]?.tasks ?? 0), 0);
  const prevCorrect = prev.reduce((a, d) => a + (s.daily[d]?.correct ?? 0), 0);
  return {
    from: dates[0], to, days,
    prevPercent: prevTasks ? Math.round((prevCorrect / prevTasks) * 100) : 0,
    fixed: sum('fixed'), secondTry: sum('secondTry'), guesses: sum('guesses'), abandoned: sum('abandoned'), harder: sum('harder'),
    minutes: Math.round(days.reduce((a, d) => a + d.sec, 0) / 60),
    prevMinutes: Math.round(prev.reduce((a, d) => a + (s.daily[d]?.sec ?? 0), 0) / 60),
    activeDays: days.filter((d) => d.tasks > 0).length,
    tasks, correct, percent: tasks ? Math.round((correct / tasks) * 100) : 0,
    topicsPassed: passed,
    weakTopics: Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};

/**
 * «За что похвалить на этой неделе»: готовые фразы родителю, построенные на настоящих успехах ребёнка.
 * Похвала за действие («исправил», «не бросил»), а не за ум. Не больше четырёх.
 */
export function praiseIdeas(r: WeekReport, o: { title(id: string): string }): string[] {
  const out: string[] = [];
  if (r.topicsPassed.length === 1) out.push(`Ты прошёл тему «${o.title(r.topicsPassed[0])}» — довёл дело до конца.`);
  if (r.topicsPassed.length > 1) out.push(`Ты прошёл ${r.topicsPassed.length} ${plural(r.topicsPassed.length, 'тему', 'темы', 'тем')} за неделю — например, «${o.title(r.topicsPassed[0])}».`);
  if (r.fixed > 0) out.push(`Ты исправил ${r.fixed} ${plural(r.fixed, 'ошибку', 'ошибки', 'ошибок')} — не бросил, а разобрался.`);
  if (r.secondTry > 0) out.push(`${r.secondTry} ${plural(r.secondTry, 'раз', 'раза', 'раз')} ты нашёл ответ сам со второй попытки.`);
  if (r.prevPercent > 0 && r.percent >= r.prevPercent + 5) out.push(`Верных ответов с первого раза стало больше: было ${r.prevPercent}%, стало ${r.percent}%.`);
  if (r.activeDays >= 4) out.push(`Ты занимался ${r.activeDays} ${plural(r.activeDays, 'день', 'дня', 'дней')} из 7 — это настоящее упорство.`);
  if (r.harder > 0) out.push(`Ты сам выбирал вопросы посложнее (${r.harder}) — смелое решение.`);
  if (!out.length) return [r.tasks > 0 ? 'Похвалите за то, что сел заниматься: начать — самое трудное.' : 'Занятий на этой неделе не было. Предложите начать с одной короткой темы — без упрёков.'];
  return out.slice(0, 4);
}
