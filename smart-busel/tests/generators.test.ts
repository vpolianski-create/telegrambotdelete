import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../src/engine/answers';
import { seeded } from '../src/engine/rng';
import { generate, generators } from '../src/generators';

describe('генераторы математики', () => {
  for (const name of Object.keys(generators)) {
    for (const difficulty of ['basic', 'advanced', 'bonus'] as const) {
      it(`${name} (${difficulty}): ответ верен и есть среди вариантов`, () => {
        const rng = seeded(7);
        for (let i = 0; i < 200; i++) {
          const t = generate({ generator: name, difficulty }, { subject: 'math', topicId: 'x' }, rng);
          expect(t.explanation.length).toBeGreaterThan(0);
          expect(t.hints.length).toBeGreaterThan(0);
          if (t.type === 'single') {
            expect(new Set(t.options).size).toBe(t.options!.length);
            expect(t.options).toContain(t.answer);
          }
          if (t.type === 'input') expect(Number.isFinite(Number(t.answer))).toBe(true);
          if (t.type !== 'truefalse') expect(String(t.answer)).not.toBe('NaN');
        }
      });
    }
  }

  it('округление: известные примеры', () => {
    const t = generate({ generator: 'math.round.nearest', difficulty: 'basic' }, { subject: 'm', topicId: 't' }, seeded(1));
    const m = t.question.match(/число ([\d ]+) до/)!;
    const n = Number(m[1].replace(/\s/g, ''));
    expect(checkAnswer(t, String(Math.round(n / 10) * 10))).toBe(true);
  });

  it('деление с остатком: проверка делитель·частное+остаток', () => {
    const rng = seeded(3);
    for (let i = 0; i < 100; i++) {
      const t = generate({ generator: 'math.divRem.remainder', difficulty: 'advanced' }, { subject: 'm', topicId: 't' }, rng);
      const [, n, d] = t.question.match(/остаток при делении ([\d ]+) на (\d+)/)!;
      const nn = Number(n.replace(/\s/g, ''));
      expect(nn % Number(d)).toBe(t.answer);
      expect(Number(t.answer)).toBeLessThan(Number(d));
    }
  });
});

import { centuryBC, toRoman } from '../src/generators/history';

describe('история и вспомогательные функции', () => {
  it('римские числа и век до н. э.', () => {
    expect([4, 8, 9, 14, 21, 35].map(toRoman)).toEqual(['IV', 'VIII', 'IX', 'XIV', 'XXI', 'XXXV']);
    expect(centuryBC(753)).toBe(8);
    expect(centuryBC(100)).toBe(1);
    expect(centuryBC(101)).toBe(2);
  });
  it('НОД/НОК/делимость: ответы совпадают с независимой проверкой', () => {
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const rng = seeded(11);
    for (let i = 0; i < 100; i++) {
      const t = generate({ generator: 'math.gcdlcm.gcd', difficulty: 'advanced' }, { subject: 'm', topicId: 't' }, rng);
      const [a, b] = [...t.question.matchAll(/\d+/g)].map((m) => Number(m[0]));
      expect(gcd(a, b)).toBe(t.answer);
    }
    for (let i = 0; i < 100; i++) {
      const t = generate({ generator: 'math.div.digit', difficulty: 'basic' }, { subject: 'm', topicId: 't' }, rng);
      expect(Number(t.answer)).toBeGreaterThanOrEqual(0);
      expect(Number(t.answer)).toBeLessThanOrEqual(9);
    }
  });
});
