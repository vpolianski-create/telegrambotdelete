import type { Task } from '../content/schema';

export const BASE_POINTS: Record<Task['difficulty'], number> = { basic: 10, advanced: 20, bonus: 30 };
export const COMBO_EVERY = 5;
export const COMBO_BONUS = 10;
export const TOPIC_PASS_PERCENT = 80;
export const TOPIC_PASS_BONUS = 50;
export const DAILY_GOAL_BONUS = 20;

/** Вторая подсказка уменьшает баллы вдвое; первая бесплатна. */
export function taskPoints(difficulty: Task['difficulty'], hintsUsed: number): number {
  const base = BASE_POINTS[difficulty];
  return hintsUsed >= 2 ? Math.floor(base / 2) : base;
}

/** Бонус за серию: каждые 5 правильных подряд. Ошибка серию обнуляет, но баллов не отнимает. */
export function comboBonus(streakAfterAnswer: number): number {
  return streakAfterAnswer > 0 && streakAfterAnswer % COMBO_EVERY === 0 ? COMBO_BONUS : 0;
}
