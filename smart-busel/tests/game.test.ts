import { describe, expect, it } from 'vitest';
import { BADGES, computedBadges } from '../src/engine/badges';
import { openChest, STICKERS, unlockedAccessories } from '../src/engine/chest';
import { addDays } from '../src/engine/leitner';
import { seeded } from '../src/engine/rng';
import { currentStreak, weekKey } from '../src/engine/streak';

const T = '2026-10-07'; // среда
const active = (...dates: string[]) => (d: string) => dates.includes(d);

describe('серия дней', () => {
  it('считает подряд идущие дни, сегодняшний день ещё не обрывает серию', () => {
    expect(currentStreak(active('2026-10-06', '2026-10-05', '2026-10-04'), T).days).toBe(3);
    expect(currentStreak(active(T, '2026-10-06'), T).days).toBe(2);
  });
  it('один пропуск в неделю замораживается бесплатно', () => {
    // 05 (пн) и 03 (сб) активны, 04 (вс) пропущен — другая неделя, чем 05–07? Неделя пропуска 28.09–04.10
    const r = currentStreak(active('2026-10-06', '2026-10-05', '2026-10-03'), T);
    expect(r.days).toBe(3);
  });
  it('два пропуска подряд в одной неделе серию прерывают, но без штрафов', () => {
    expect(currentStreak(active('2026-10-06', '2026-10-02'), T).days).toBe(1);
    expect(currentStreak(() => false, T).days).toBe(0);
  });
  it('ключ недели — понедельник', () => {
    expect(weekKey('2026-10-07')).toBe('2026-10-05');
    expect(weekKey('2026-10-11')).toBe('2026-10-05');
    expect(addDays('2026-10-05', -1)).toBe('2026-10-04');
  });
});

describe('значки и сундук', () => {
  it('значок «7 дней подряд» и «первая тема» вычисляются из состояния', () => {
    const daily: Record<string, { tasks: number }> = {};
    for (let i = 0; i < 7; i++) daily[addDays(T, -i)] = { tasks: 1 };
    const got = computedBadges({ topicResults: { a: { done: true } }, leitner: {}, points: 0, daily }, T);
    expect(got).toContain('streak-7');
    expect(got).toContain('first-topic');
    expect(got).not.toContain('points-500');
  });
  it('у каждого значка уникальный id', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
  it('сундук не выдаёт повторов и всегда что-то даёт', () => {
    for (let seed = 1; seed < 200; seed++) {
      const r = openChest(seeded(seed), STICKERS.slice(0, 11), []);
      if (r.kind === 'sticker') expect(r.id).toBe(STICKERS[11]);
      if (r.kind === 'points') expect(r.amount).toBeGreaterThanOrEqual(10);
      if (r.kind === 'points') expect(r.amount).toBeLessThanOrEqual(30);
    }
  });
  it('аксессуары открываются по уровню и из сундука', () => {
    expect(unlockedAccessories(1, [])).toEqual([]);
    expect(unlockedAccessories(3, ['bow'])).toEqual(['scarf', 'glasses', 'bow']);
  });
});
