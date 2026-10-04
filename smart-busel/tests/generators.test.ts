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
