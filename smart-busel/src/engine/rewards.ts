export interface Reward {
  id: string;
  points: number; // порог, при котором награда получена
  text: string;
  status: 'pending' | 'given';
  date: string;
}

export const DEFAULT_THRESHOLD = 100;
export const DEFAULT_REWARD_TEXT = '1 час игры на компьютере';

/** Точка отсчёта: при смене порога новый порог действует только вперёд — от набранных к этому моменту баллов. */
export interface RewardBase { points: number; count: number }
const ZERO: RewardBase = { points: 0, count: 0 };

/** Сколько порогов уже пройдено минус сколько наград уже создано — не теряем и не дублируем. */
export function newRewards(
  totalPoints: number,
  threshold: number,
  existing: Reward[],
  textFor: (points: number) => string = () => DEFAULT_REWARD_TEXT,
  now: Date = new Date(),
  base: RewardBase = ZERO,
): Reward[] {
  const reached = base.count + Math.floor(Math.max(0, totalPoints - base.points) / threshold);
  const created = existing.length;
  const out: Reward[] = [];
  for (let i = created + 1; i <= reached; i++) {
    const points = base.points + (i - base.count) * threshold;
    out.push({ id: `r${i}`, points, text: textFor(points), status: 'pending', date: now.toISOString() });
  }
  return out;
}

export function progressToNext(totalPoints: number, threshold: number, base: RewardBase = ZERO) {
  const into = Math.max(0, totalPoints - base.points) % threshold;
  return { into, left: threshold - into, ratio: into / threshold };
}
