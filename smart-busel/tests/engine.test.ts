import { describe, expect, it } from 'vitest';
import { comboBonus, taskPoints } from '../src/engine/points';
import { levelFor } from '../src/engine/level';
import { newRewards, progressToNext } from '../src/engine/rewards';

describe('rewards', () => {
  it('не создаёт награду до порога', () => {
    expect(newRewards(99, 100, [])).toHaveLength(0);
  });
  it('создаёт ровно одну награду на пороге', () => {
    const r = newRewards(100, 100, []);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ points: 100, status: 'pending', text: '1 час игры на компьютере' });
  });
  it('не дублирует существующие и догоняет пропущенные', () => {
    const first = newRewards(100, 100, []);
    expect(newRewards(150, 100, first)).toHaveLength(0);
    expect(newRewards(320, 100, first).map((r) => r.points)).toEqual([200, 300]);
  });
  it('считает прогресс до следующей награды', () => {
    expect(progressToNext(130, 100)).toMatchObject({ into: 30, left: 70 });
  });
});

describe('points', () => {
  it('10/20/30 и половина после второй подсказки', () => {
    expect(taskPoints('basic', 0)).toBe(10);
    expect(taskPoints('advanced', 1)).toBe(20);
    expect(taskPoints('bonus', 2)).toBe(15);
  });
  it('комбо каждые 5 правильных подряд', () => {
    expect([0, 4, 5, 9, 10].map(comboBonus)).toEqual([0, 0, 10, 0, 10]);
  });
});

describe('level', () => {
  it('растёт от баллов', () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(249).level).toBe(2);
    expect(levelFor(250).level).toBe(3);
  });
});

describe('награды: отсчёт от точки смены порога', () => {
  it('без точки отсчёта всё считается от нуля, как раньше', () => {
    expect(newRewards(250, 100, []).map((r) => r.points)).toEqual([100, 200]);
  });
  it('с точкой отсчёта считается только то, что набрано после смены порога', () => {
    const base = { points: 350, count: 3 };
    const have = newRewards(350, 100, []).map((r, i) => ({ ...r, id: `r${i + 1}` })); // три прежние награды
    expect(have).toHaveLength(3);
    expect(newRewards(380, 50, have, undefined, new Date(), base)).toEqual([]);
    expect(newRewards(400, 50, have, undefined, new Date(), base).map((r) => r.points)).toEqual([400]);
  });
  it('прогресс до следующей награды считается от точки отсчёта', () => {
    expect(progressToNext(380, 50, { points: 355, count: 3 })).toMatchObject({ into: 25, left: 25 });
    expect(progressToNext(380, 100)).toMatchObject({ into: 80, left: 20 });
  });
});
