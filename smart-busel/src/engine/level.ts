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

const TITLES = ['Ученик', 'Любознайка', 'Исследователь', 'Знаток', 'Эрудит', 'Мудрец', 'Профессор', 'Академик', 'Мастер знаний', 'Хранитель знаний'];

/** Звание растёт вместе с уровнем. После десятого уровня — «Легенда Бусела». */
export const levelTitle = (level: number) => TITLES[level - 1] ?? 'Легенда Бусела';

/** Звёзды за тему: 80% — одна, 90% — две, 100% — три. */
export const starsFor = (percent: number) => (percent >= 100 ? 3 : percent >= 90 ? 2 : percent >= 80 ? 1 : 0);
export const STAR_BONUS = [0, 0, 15, 25]; // +баллы за новую вторую и третью звезду (за первую даётся бонус темы)
