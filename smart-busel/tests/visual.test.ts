import { describe, expect, it } from 'vitest';
import { VisualSchema, TaskSchema } from '../src/content/schema';
import { angleKind, scale, timelineRange, yearLabel, yearPos, yearsApart } from '../src/engine/visual';
import { generate } from '../src/generators';
import { seeded } from '../src/engine/rng';

describe('лента времени: счёт лет', () => {
  it('подпись года: до нашей эры и нашей эры', () => {
    expect(yearLabel(-776)).toBe('776 г. до н. э.');
    expect(yearLabel(988)).toBe('988 г.');
  });
  it('нулевого года не было: после 1 г. до н. э. сразу идёт 1 г. н. э.', () => {
    expect(yearPos(1) - yearPos(-1)).toBe(1);
    expect(yearsApart(-1, 1)).toBe(1);
  });
  it('между годами до н. э. — разность чисел; через рубеж эр — сумма минус один', () => {
    expect(yearsApart(-3000, -2500)).toBe(500);
    expect(yearsApart(-2500, -3000)).toBe(500);
    expect(yearsApart(-30, 20)).toBe(49);
  });
  it('границы ленты округляются до ровных чисел и захватывают все события', () => {
    const r = timelineRange([-776, -490]);
    expect(r.from).toBeLessThanOrEqual(-776);
    expect(r.to).toBeGreaterThanOrEqual(-490);
    expect(r.ticks.length).toBeGreaterThanOrEqual(2);
    expect(r.ticks.length).toBeLessThanOrEqual(9);
    r.ticks.forEach((t) => expect(t === 1 || t % r.step === 0, String(t)).toBe(true));
    expect(r.ticks).not.toContain(0); // нулевого года на ленте нет
  });
  it('лента через рубеж эр помечает 1 г. н. э.', () => {
    const r = timelineRange([-200, 300]);
    expect(r.ticks).toContain(1);
  });
});

describe('рисунки: общие расчёты', () => {
  it('scale переводит число в координату на рисунке', () => {
    expect(scale(0, 0, 10, 40, 600)).toBe(40);
    expect(scale(10, 0, 10, 40, 600)).toBe(600);
    expect(scale(5, 0, 10, 40, 600)).toBe(320);
  });
  it('вид угла по градусной мере', () => {
    expect(angleKind(35)).toBe('острый');
    expect(angleKind(90)).toBe('прямой');
    expect(angleKind(120)).toBe('тупой');
    expect(angleKind(180)).toBe('развёрнутый');
  });
});

describe('схема: рисунок в задании и уроке', () => {
  it('принимает известные виды рисунков', () => {
    expect(VisualSchema.safeParse({ kind: 'ray', to: 10, step: 1, labels: [0, 5, 10], points: [{ at: 7, name: 'A' }] }).success).toBe(true);
    expect(VisualSchema.safeParse({ kind: 'timeline', events: [{ year: -776, label: 'Первые Олимпийские игры' }] }).success).toBe(true);
    expect(VisualSchema.safeParse({ kind: 'ruler', length: 12, a: 0, b: 7 }).success).toBe(true);
    expect(VisualSchema.safeParse({ kind: 'angles', items: [{ deg: 90, label: 'прямой' }] }).success).toBe(true);
    expect(VisualSchema.safeParse({ kind: 'dots', total: 17, perRow: 5 }).success).toBe(true);
  });
  it('отклоняет неизвестный вид и год 0', () => {
    expect(VisualSchema.safeParse({ kind: 'hologram' }).success).toBe(false);
    expect(VisualSchema.safeParse({ kind: 'timeline', events: [{ year: 0 }] }).success).toBe(false);
  });
  it('задание без рисунка по-прежнему проходит проверку', () => {
    const t = { id: 'x', subject: 's', topicId: 't', difficulty: 'basic', type: 'input', question: 'q', answer: 1, explanation: ['e'], hints: [] };
    expect(TaskSchema.safeParse(t).success).toBe(true);
    expect(TaskSchema.safeParse({ ...t, visual: { kind: 'dots', total: 6, perRow: 3 } }).success).toBe(true);
  });
});

describe('задания с рисунком', () => {
  const many = (name: string, d: 'basic' | 'advanced' | 'bonus' = 'basic') =>
    Array.from({ length: 80 }, (_, i) => generate({ generator: name, difficulty: d }, { subject: 'math', topicId: 't' }, seeded(i + 1)));

  it('«какая координата у точки A»: ответ — отмеченная точка, и её число на рисунке не подписано', () => {
    for (const d of ['basic', 'advanced'] as const) for (const t of many('math.ray.read', d)) {
      const v = t.visual!;
      expect(v.kind).toBe('ray');
      if (v.kind !== 'ray') continue;
      const a = v.points.find((p) => p.name === 'A')!;
      expect(t.answer).toBe(a.at);
      expect(v.labels).not.toContain(a.at);
      expect((a.at - (v.from ?? 0)) % v.step).toBe(0); // точка стоит на делении
      expect(a.at).toBeLessThanOrEqual(v.to);
      expect(v.labels.length).toBeGreaterThanOrEqual(2); // по двум подписям можно понять шаг
    }
  });
  it('«длина отрезка по линейке»: ответ равен разности концов', () => {
    for (const d of ['basic', 'advanced'] as const) for (const t of many('math.len.ruler', d)) {
      const v = t.visual!;
      if (v.kind !== 'ruler') throw new Error('ожидалась линейка');
      expect(t.answer).toBe(v.b - v.a);
      expect(v.b).toBeLessThanOrEqual(v.length);
      if (d === 'basic') expect(v.a).toBe(0);
    }
  });
  it('«какой это угол» по рисунку: ответ соответствует нарисованному углу, градусы не подписаны', () => {
    for (const t of many('math.angle.picture')) {
      const v = t.visual!;
      if (v.kind !== 'angles') throw new Error('ожидался угол');
      expect(t.answer).toBe(angleKind(v.items[0].deg));
      expect(v.items[0].label).toBeUndefined();
      expect(t.question).not.toMatch(/\d+°/);
    }
  });
  it('история: к заданию про годы приложена лента времени с этими же годами', () => {
    for (const t of Array.from({ length: 40 }, (_, i) => generate({ generator: 'history.era.between', difficulty: 'basic' }, { subject: 'history', topicId: 't' }, seeded(i + 1)))) {
      const v = t.visual!;
      if (v.kind !== 'timeline') throw new Error('ожидалась лента времени');
      const [a, b] = v.events.map((e) => e.year);
      expect(t.answer).toBe(yearsApart(a, b));
      expect(t.question).toContain(String(-a));
      expect(t.question).toContain(String(-b));
    }
    const e = generate({ generator: 'history.era.earlier', difficulty: 'basic' }, { subject: 'history', topicId: 't' }, seeded(3));
    expect(e.visual?.kind).toBe('timeline');
    expect(e.visualAfter).toBe(true); // лента показывается после ответа, иначе она подсказывает ответ
  });
});
