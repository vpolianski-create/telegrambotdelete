export interface Reward {
  id: string;
  points: number; // порог, при котором награда получена
  text: string;
  status: 'pending' | 'given';
  date: string;
}

export const DEFAULT_THRESHOLD = 100;
export const DEFAULT_REWARD_TEXT = '1 час игры на компьютере';

/** Сколько порогов уже пройдено минус сколько наград уже создано — не теряем и не дублируем. */
export function newRewards(
  totalPoints: number,
  threshold: number,
  existing: Reward[],
  textFor: (points: number) => string = () => DEFAULT_REWARD_TEXT,
  now: Date = new Date(),
): Reward[] {
  const reached = Math.floor(totalPoints / threshold);
  const created = existing.length;
  const out: Reward[] = [];
  for (let i = created + 1; i <= reached; i++) {
    const points = i * threshold;
    out.push({ id: `r${i}`, points, text: textFor(points), status: 'pending', date: now.toISOString() });
  }
  return out;
}

export function progressToNext(totalPoints: number, threshold: number) {
  const into = totalPoints % threshold;
  return { into, left: threshold - into, ratio: into / threshold };
}
