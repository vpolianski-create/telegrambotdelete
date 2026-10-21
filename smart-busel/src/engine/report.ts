import { addDays } from './leitner';

export interface ReportDay { date: string; sec: number; tasks: number; correct: number }
export interface WeekReport {
  from: string; to: string;
  days: ReportDay[];
  minutes: number; prevMinutes: number;
  activeDays: number; tasks: number; correct: number; percent: number;
  topicsPassed: string[]; // id тем, пройденных за неделю (без повторов)
  weakTopics: [string, number][]; // тема → число ошибок за неделю
}

export interface ReportInput {
  daily: Record<string, { sec: number; tasks: number; correct: number; topicIds?: string[] }>;
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
  return {
    from: dates[0], to, days,
    minutes: Math.round(days.reduce((a, d) => a + d.sec, 0) / 60),
    prevMinutes: Math.round(prev.reduce((a, d) => a + (s.daily[d]?.sec ?? 0), 0) / 60),
    activeDays: days.filter((d) => d.tasks > 0).length,
    tasks, correct, percent: tasks ? Math.round((correct / tasks) * 100) : 0,
    topicsPassed: passed,
    weakTopics: Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}
