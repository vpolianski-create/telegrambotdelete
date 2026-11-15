import type { Task } from '../content/schema';

export const BASE_POINTS: Record<Task['difficulty'], number> = { basic: 10, advanced: 20, bonus: 30 };
export const COMBO_EVERY = 5;
export const COMBO_BONUS = 10;
export const TOPIC_PASS_PERCENT = 80;
export const TOPIC_PASS_BONUS = 50;
export const DAILY_GOAL_BONUS = 20;

/** Верный ответ со второй попытки (после ошибки и наводящей подсказки) — чуть меньше полных баллов. */
export const SECOND_TRY_SHARE = 0.8;

/**
 * Вторая подсказка уменьшает баллы вдвое; первая бесплатна.
 * Если тема уже пройдена (repeat), баллы за повтор вдвое меньше.
 * Верный ответ со второй попытки (secondTry) — 80 % от этого, но не меньше 1 балла.
 */
export function taskPoints(difficulty: Task['difficulty'], hintsUsed: number, repeat = false, secondTry = false): number {
  const base = repeat ? Math.floor(BASE_POINTS[difficulty] / 2) : BASE_POINTS[difficulty];
  const pts = hintsUsed >= 2 ? Math.floor(base / 2) : base;
  return secondTry ? Math.max(1, Math.floor(pts * SECOND_TRY_SHARE)) : pts;
}

/** Бонус за серию: каждые 5 правильных подряд. Ошибка серию обнуляет, но баллов не отнимает. */
export function comboBonus(streakAfterAnswer: number): number {
  return streakAfterAnswer > 0 && streakAfterAnswer % COMBO_EVERY === 0 ? COMBO_BONUS : 0;
}
