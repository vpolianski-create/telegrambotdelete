import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/rng';
import { generate } from '../src/generators';

const make = (name: string, d: 'basic' | 'advanced' | 'bonus', seed = 5) => generate({ generator: name, difficulty: d }, { subject: 'm', topicId: 't' }, seeded(seed));
const evalExpr = (s: string) => Function(`return (${s.replace(/·/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/ /g, '')})`)() as number;

describe('независимая проверка ответов генераторов', () => {
  it('числовые выражения: ответ совпадает с вычислением строки', () => {
    for (let i = 0; i < 300; i++) {
      const t = generate({ generator: 'math.expr.value', difficulty: i % 2 ? 'basic' : 'advanced' }, { subject: 'm', topicId: 't' }, seeded(i + 1));
      const e = t.question.replace('Найди значение выражения: ', '');
      expect(evalExpr(e)).toBe(t.answer);
      expect(Number.isInteger(t.answer)).toBe(true);
    }
  });
  it('сложение и вычитание столбиком', () => {
    for (let i = 0; i < 200; i++) {
      const t = generate({ generator: 'math.addsub.column', difficulty: i % 2 ? 'basic' : 'advanced' }, { subject: 'm', topicId: 't' }, seeded(i + 1));
      const e = t.question.replace('Вычисли: ', '');
      expect(evalExpr(e)).toBe(t.answer);
      expect(Number(t.answer)).toBeGreaterThanOrEqual(0);
    }
  });
  it('равенство со свойствами: ответ true/false совпадает с вычислением', () => {
    for (let i = 0; i < 200; i++) {
      const t = generate({ generator: 'math.addsub.property', difficulty: 'basic' }, { subject: 'm', topicId: 't' }, seeded(i + 1));
      const [l, r] = t.question.replace('Верно ли равенство: ', '').replace('?', '').split(' = ');
      expect(evalExpr(l) === evalExpr(r)).toBe(t.answer);
    }
  });
  it('простые числа', () => {
    for (let i = 0; i < 200; i++) {
      const t = generate({ generator: 'math.prime.is', difficulty: 'advanced' }, { subject: 'm', topicId: 't' }, seeded(i + 1));
      const n = Number(t.question.match(/\d+/)![0]);
      let p = n > 1;
      for (let k = 2; k * k <= n; k++) if (n % k === 0) p = false;
      expect(p).toBe(t.answer);
    }
  });
  it('уравнения по словесным задачам: ответ удовлетворяет условию', () => {
    for (let i = 0; i < 200; i++) {
      const t = make('math.eqword.two', 'advanced', i + 1);
      const nums = [...t.question.matchAll(/\d+/g)].map((m) => Number(m[0]));
      const [total, diff] = nums;
      const small = (total - diff) / 2;
      expect(Number.isInteger(small)).toBe(true);
      expect([small, small + diff]).toContain(t.answer);
    }
  });
  it('углы: смежные и сумма', () => {
    for (let i = 0; i < 100; i++) {
      const t = make('math.angle.adjacent', 'basic', i + 1);
      const x = Number(t.question.match(/равен (\d+)°/)![1]);
      expect(x + Number(t.answer)).toBe(180);
    }
  });
  it('перевод единиц длины', () => {
    for (let i = 0; i < 200; i++) {
      const t = make('math.len.convert', i % 2 ? 'basic' : 'advanced', i + 1);
      expect(Number(t.answer)).toBeGreaterThan(0);
      expect(t.explanation.length).toBeGreaterThan(0);
    }
  });
  it('склонение «1 десяток, 2 десятка, 5 десятков»', async () => {
    const { plural } = await import('../src/generators/math3');
    const f: [string, string, string] = ['десяток', 'десятка', 'десятков'];
    expect([1, 2, 5, 11, 12, 21, 24, 25].map((n) => plural(n, f))).toEqual(['десяток', 'десятка', 'десятков', 'десятков', 'десятков', 'десяток', 'десятка', 'десятков']);
  });
});
