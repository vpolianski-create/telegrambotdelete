/** Уровень растёт от общего числа баллов; каждый следующий требует чуть больше. */
export function levelFor(points: number): { level: number; into: number; need: number } {
  let level = 1;
  let need = 100;
  let left = points;
  while (left >= need) {
    left -= need;
    level++;
    need += 50;
  }
  return { level, into: left, need };
}
