import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/rng';
import { generate } from '../src/generators';

const mk = (name: string, d: 'basic' | 'advanced' | 'bonus', seed: number) => generate({ generator: name, difficulty: d }, { subject: 'm', topicId: 't' }, seeded(seed));
const nums = (s: string) => [...s.replace(/(\d)[\s\u00a0\u202f](\d{3})/g, '$1$2').replace(/(\d)[\s\u00a0\u202f](\d{3})/g, '$1$2').matchAll(/\d+/g)].map((m) => Number(m[0]));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
const D = ['basic', 'advanced'] as const;

describe('независимая проверка остальных генераторов', () => {
  it('деление с остатком', () => {
    for (let i = 1; i <= 150; i++) for (const d of D) {
      const r = mk('math.divRem.remainder', d, i); const [a, b] = nums(r.question);
      expect(r.answer).toBe(a % b);
      const q = mk('math.divRem.quotient', d, i); const [c, e] = nums(q.question);
      expect(q.answer).toBe(Math.floor(c / e));
      const v = mk('math.divRem.dividend', d, i); const [qq, dd, rr] = nums(v.question);
      expect(v.answer).toBe(qq * dd + rr);
      const p = mk('math.divRem.pack', d, i); const [cap, total] = nums(p.question);
      expect(p.answer).toBe(Math.ceil(total / cap));
      const cb = mk('math.divRem.canBe', d, i); const [div, rem] = nums(cb.question);
      expect(cb.answer).toBe(rem < div);
    }
  });
  it('НОД, НОК, делители', () => {
    for (let i = 1; i <= 150; i++) for (const d of D) {
      const g = mk('math.gcdlcm.gcd', d, i); const [a, b] = nums(g.question);
      expect(g.answer).toBe(gcd(a, b));
      const l = mk('math.gcdlcm.lcm', d, i); const [x, y] = nums(l.question);
      expect(l.answer).toBe((x * y) / gcd(x, y));
      const dv = mk('math.gcdlcm.divisors', d, i); const [n] = nums(dv.question);
      expect(dv.answer).toBe(divisors(n).length);
      const lp = mk('math.gcdlcm.lcmProblem', d, i); const [m1, m2] = nums(lp.question);
      expect(lp.answer).toBe((m1 * m2) / gcd(m1, m2));
      const gp = mk('math.gcdlcm.gcdProblem', d, i); const [c1, c2] = nums(gp.question);
      expect(gp.answer).toBe(gcd(c1, c2));
    }
  });
  it('округление', () => {
    for (let i = 1; i <= 150; i++) for (const d of D) {
      const t = mk('math.round.nearest', d, i); const [n] = nums(t.question);
      const unit = /десятков/.test(t.question) ? 10 : /сотен/.test(t.question) ? 100 : 1000;
      expect(t.answer).toBe(Math.floor(n / unit + 0.5) * unit);
    }
  });
  it('степени и квадрат', () => {
    for (let i = 1; i <= 100; i++) {
      const t = mk('math.power.compute', 'basic', i); const [b, e] = nums(t.question.replace(/[²³]/g, (c) => ' ' + (c === '²' ? 2 : 3)));
      expect(t.answer).toBe(b ** e);
      const s = mk('math.power.square', 'basic', i); const [side] = nums(s.question);
      expect(s.answer).toBe(side * side);
    }
  });
  it('простые числа: подсчёт и наибольший множитель', () => {
    const isP = (n: number) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
    for (let i = 1; i <= 100; i++) for (const d of D) {
      const c = mk('math.prime.count', d, i); const [a, b] = nums(c.question);
      let k = 0; for (let n = a; n <= b; n++) if (isP(n)) k++;
      expect(c.answer).toBe(k);
      const lg = mk('math.prime.largest', d, i); const [n] = nums(lg.question);
      let m = n; let best = 1; for (let p = 2; p <= m; p++) while (m % p === 0) { best = p; m /= p; }
      expect(lg.answer).toBe(best);
    }
  });
  it('слова-задачи и сравнение', () => {
    for (let i = 1; i <= 100; i++) for (const d of D) {
      const l = mk('math.word.left', d, i); const [total, a, b] = nums(l.question);
      expect(l.answer).toBe(total - a - b);
      const bt = mk('math.cmp.between', d, i); const [x, y] = nums(bt.question);
      expect(bt.answer).toBe(/включительно/.test(bt.question) ? y - x + 1 : y - x - 1);
    }
  });
  it('соседние числа и знаки', () => {
    for (let i = 1; i <= 100; i++) {
      const t = mk('math.nat.neighbors', 'basic', i); const [n] = nums(t.question);
      expect(t.answer).toBe(/следует/.test(t.question) ? n + 1 : n - 1);
    }
  });
});
