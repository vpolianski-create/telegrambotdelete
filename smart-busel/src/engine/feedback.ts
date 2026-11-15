import type { Task } from '../content/schema';
import { SLOW_MS } from './engagement';
import { pick, type Rng } from './rng';

/*
 * Что Бусел говорит после ответа. Правила (см. CLAUDE.md, раздел v1.7.0):
 * — хвалим действие, а не ребёнка («нашёл сам», а не «ты умный»);
 * — обычный верный ответ — коротко; тёплые слова — на настоящих событиях, тогда они не обесцениваются;
 * — без преувеличений («блестяще», «невероятно») и без слов «неправильно», «опять ошибся».
 */

export type PraiseKind = 'fixed' | 'growth' | 'second' | 'hard' | 'streak' | 'slow' | 'hint' | 'plain';

export interface PraiseCtx {
  attempt: 1 | 2; // с какой попытки верно
  hints: number; // сколько подсказок взял сам
  difficulty: Task['difficulty'];
  streak: number; // верных подряд вместе с этим ответом
  retry: boolean; // это вопрос, на котором он ошибся раньше в этом уроке
  pastMistake: boolean; // этот вопрос есть в его прошлых ошибках
  ms: number; // сколько думал
}

const PHRASES: Record<Exclude<PraiseKind, 'streak'>, string[]> = {
  fixed: ['Исправил! Теперь ты это знаешь.', 'Исправил! Эта ошибка больше не твоя.'],
  growth: ['В прошлый раз здесь была ошибка. А сейчас — сам и верно. Вот это рост.', 'Раньше здесь не получалось, а сейчас получилось. Ты растёшь.'],
  second: ['Нашёл ответ сам — это и есть настоящая работа.', 'Со второй попытки — и сам. Так и учатся.'],
  hard: ['Это был непростой вопрос — и ты разобрался.', 'Трудный вопрос, и ты его решил.'],
  slow: ['Ты не спешил и подумал — и получилось.', 'Подумал как следует — и верно.'],
  hint: ['Подсказка помогла, а довёл до ответа ты сам.', 'С подсказкой — и сам до конца. Верно.'],
  plain: ['Верно.', 'Да, так.', 'Точно.', 'Верно!'],
};
const STREAK: Record<number, string> = {
  3: 'Три подряд — ты внимательно читаешь вопросы.',
  5: 'Пять подряд! Видно, что тема понятна.',
  8: 'Восемь подряд! Ты уверенно держишь тему.',
};
const streakText = (n: number) => STREAK[n] ?? `${n} подряд! Отличная серия — ты не сбиваешься.`;
const isStreak = (n: number) => n === 3 || n === 5 || n === 8 || (n >= 10 && n % 5 === 0);

/** Похвала после верного ответа: побеждает первое подходящее событие по списку. */
export function praiseFor(c: PraiseCtx, rng: Rng = Math.random): { kind: PraiseKind; text: string } {
  const kind: PraiseKind = c.retry ? 'fixed'
    : c.pastMistake && c.attempt === 1 ? 'growth'
      : c.attempt === 2 ? 'second'
        : c.difficulty !== 'basic' && c.hints === 0 ? 'hard'
          : isStreak(c.streak) ? 'streak'
            : c.ms > SLOW_MS && c.hints === 0 ? 'slow'
              : c.hints > 0 ? 'hint'
                : 'plain';
  return { kind, text: kind === 'streak' ? streakText(c.streak) : pick(rng, PHRASES[kind]) };
}

const RETRY = [
  'Не совсем. Перечитай вопрос — в нём есть подсказка.',
  'Почти. Посмотри на подсказку и попробуй ещё раз.',
  'Не совсем. Подумай ещё — у тебя есть вторая попытка.',
];
/** После первой ошибки: приглашение подумать ещё раз. */
export const retryPrompt = (rng: Rng = Math.random) => pick(rng, RETRY);

const EXPLAIN = ['Давай разберём.', 'Разберём вместе.', 'Посмотрим, как здесь правильно.'];
/** Заголовок разбора после итоговой ошибки. */
export const explainTitle = (rng: Rng = Math.random) => pick(rng, EXPLAIN);

/** Что будет дальше после итоговой ошибки — чтобы ошибка не казалась концом. */
export function wrongNote(next: 'similar' | 'end' | 'review' | 'none'): string {
  if (next === 'end') return 'Этот вопрос вернётся в конце урока — проверим, запомнилось ли.';
  if (next === 'similar') return 'Следующий вопрос будет похожим — попробуешь ещё раз.';
  if (next === 'review') return 'Мы вернёмся к нему в «Работе над ошибками». Теперь ты знаешь на одну вещь больше.';
  return 'Теперь ты знаешь на одну вещь больше.';
}

/** Мягкое напоминание, если ребёнок долго ничего не делает. */
export const IDLE_TEXT = 'Задумался? Можно взять подсказку или сделать перерыв — всё сохранится.';
