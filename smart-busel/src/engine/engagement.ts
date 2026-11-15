import type { Task } from '../content/schema';

/*
 * Распознавание состояния ребёнка по ответам. Время меряется незаметно: на экране таймеров нет,
 * баллы от скорости не зависят. Время нужно только, чтобы понять, читает ли он вопрос.
 */

export const READ_BASE_MS = 1500;
export const READ_PER_CHAR_MS = 40;
/** Дольше этого — «долго думал». */
export const SLOW_MS = 20_000;
/** Столько без действий — мягкое напоминание. */
export const IDLE_MS = 90_000;
/** Пауза перед вариантами ответа после «угадывания». */
export const SLOWDOWN_MS = 1500;

/** Минимальное время, чтобы прочитать вопрос и варианты: 1,5 с + 0,04 с на каждую букву. */
export function minReadMs(task: Pick<Task, 'question' | 'options'>): number {
  const letters = (task.question + (task.options ?? []).join('')).replace(/\s/g, '').length;
  return READ_BASE_MS + READ_PER_CHAR_MS * letters;
}

export interface AnswerSignal { correct: boolean; firstTry: boolean; hints: number; guess: boolean; ms: number }
export type Nudge = 'guess' | 'stuck' | 'tired' | 'easy';

/**
 * Нужна ли подсказка Бусела после очередного ответа. history — ответы урока по порядку,
 * minutes — сколько длится урок, since — после какого по счёту ответа каждое предложение уже показывали
 * (чтобы не повторять его, пока не наберутся новые ответы).
 * Порядок важности: угадывает → устал → застрял → слишком легко.
 */
export function nudgeAfter(history: AnswerSignal[], minutes: number, opts: { canHarder?: boolean }, since: Partial<Record<Nudge, number>> = {}): Nudge | undefined {
  const fresh = (n: Nudge) => history.slice(since[n] ?? 0);
  const last = (n: Nudge, k: number) => { const h = fresh(n); return h.length >= k ? h.slice(-k) : undefined; };
  const g = last('guess', 2);
  if (g && g.every((x) => x.guess)) return 'guess';
  const t = last('tired', 6);
  if (minutes >= 20 && t && t.filter((x) => !x.firstTry).length >= 4) return 'tired';
  const s = last('stuck', 2);
  if (s && s.every((x) => !x.correct)) return 'stuck';
  const e = last('easy', 8);
  if (opts.canHarder && e && e.every((x) => x.firstTry && x.correct && x.hints === 0)) return 'easy';
  return undefined;
}

/** Слова Бусела для каждого состояния. */
export const NUDGE_TEXT: Record<Nudge, string> = {
  guess: 'Ой, быстро! Давай медленнее: прочитай вопрос до конца — я подожду.',
  stuck: 'Эта часть пока трудная — так бывает со всем новым. Перечитаем объяснение и попробуем снова?',
  tired: 'Похоже, ты устал. Можно отдохнуть — баллы за ответы уже сохранены.',
  easy: 'Восемь подряд без подсказок! Хочешь вопрос посложнее? Это по желанию.',
};
