import { describe, expect, it } from 'vitest';
import { taskPoints } from '../src/engine/points';

describe('баллы за повторное прохождение уже пройденной темы — вдвое меньше', () => {
  it('в первый раз — 10 / 20 / 30', () => {
    expect([taskPoints('basic', 0), taskPoints('advanced', 0), taskPoints('bonus', 0)]).toEqual([10, 20, 30]);
    expect([taskPoints('basic', 0, false), taskPoints('advanced', 1, false)]).toEqual([10, 20]);
  });
  it('при повторе — 5 / 10 / 15', () => {
    expect([taskPoints('basic', 0, true), taskPoints('advanced', 0, true), taskPoints('bonus', 0, true)]).toEqual([5, 10, 15]);
  });
  it('первая подсказка при повторе тоже бесплатна', () => {
    expect(taskPoints('advanced', 1, true)).toBe(10);
  });
  it('две подсказки при повторе: половина от половины, но не ноль', () => {
    expect(taskPoints('basic', 2, true)).toBe(2);
    expect(taskPoints('bonus', 2, true)).toBe(7);
    expect(taskPoints('basic', 2, true)).toBeGreaterThan(0);
  });
});
