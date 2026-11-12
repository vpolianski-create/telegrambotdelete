import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SubjectSchema, VisualSchema, type Task, type Visual } from '../src/content/schema';
import { projectMap } from '../src/engine/visual';
import { canMatch, canSpell } from '../src/engine/variety';
import { checkAnswer } from '../src/engine/answers';

const dir = path.resolve(__dirname, '../content');
const maps = Object.fromEntries(fs.readdirSync(path.join(dir, 'maps')).filter((f) => f.endsWith('.json')).map((f) => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'maps', f), 'utf8'));
  return [m.id, m];
}));
const subjects = fs.readdirSync(path.join(dir, 'subjects')).filter((f) => f.endsWith('.json'))
  .map((f) => SubjectSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, 'subjects', f), 'utf8'))));
const topics = subjects.flatMap((s) => s.sections.flatMap((sec) => sec.topics));
const tasks = topics.flatMap((t) => [...t.selfCheck, ...t.practice, ...t.bonus, ...t.pool]).filter((e): e is Task => !('generator' in e));
type MapV = Extract<Visual, { kind: 'map' }>;
const isMap = (v?: Visual): v is MapV => v?.kind === 'map';

describe('карты: расчёт положения точки', () => {
  const frame = { w: 640, h: 320, west: 20, east: 30, south: 50, north: 55 };
  it('углы карты переходят в углы рисунка', () => {
    expect(projectMap(frame, 20, 55)).toEqual({ x: 0, y: 0 });
    expect(projectMap(frame, 30, 50)).toEqual({ x: 640, y: 320 });
  });
  it('середина — в середине; восток правее, север выше', () => {
    expect(projectMap(frame, 25, 52.5)).toEqual({ x: 320, y: 160 });
    expect(projectMap(frame, 27, 52).x).toBeGreaterThan(projectMap(frame, 23, 52).x);
    expect(projectMap(frame, 25, 54).y).toBeLessThan(projectMap(frame, 25, 51).y);
  });
});

describe('карты в уроках', () => {
  const inLessons = topics.flatMap((t) => (t.visuals ?? []).map((x) => ({ id: t.id, v: x.visual }))).filter((x) => isMap(x.v));
  const inTasks = tasks.filter((t) => isMap(t.visual));

  it('для каждой карты из схемы есть файл с контуром', () => {
    for (const id of ['world', 'ancient', 'mediterranean', 'neareast', 'empire', 'greece', 'belarus']) {
      expect(maps[id], id).toBeDefined();
      expect(maps[id].land.length, id).toBeGreaterThan(100);
      expect(VisualSchema.safeParse({ kind: 'map', map: id, points: [{ name: 'x', lon: 0, lat: 0 }] }).success, id).toBe(true);
    }
    expect(VisualSchema.safeParse({ kind: 'map', map: 'atlantis', points: [{ name: 'x', lon: 0, lat: 0 }] }).success).toBe(false);
  });
  it('карты есть в истории, «Человеке и мире» и «Кругозоре»', () => {
    for (const s of ['history', 'world', 'krugozor']) expect(inLessons.some((x) => x.id.startsWith(s)), s).toBe(true);
  });
  it('каждая точка попадает в границы своей карты', () => {
    for (const { id, v } of [...inLessons, ...inTasks.map((t) => ({ id: t.id, v: t.visual }))]) {
      if (!isMap(v)) continue;
      const m = maps[v.map];
      for (const p of v.points) {
        const { x, y } = projectMap(m, p.lon, p.lat);
        expect(x > 8 && x < m.w - 8 && y > 8 && y < m.h - 8, `${id}: ${p.name}`).toBe(true);
      }
    }
  });
  it('«покажи на карте»: варианты — это точки карты, верный ответ среди них, подписи не повторяются', () => {
    const picks = inTasks.filter((t) => isMap(t.visual) && t.visual.pick);
    expect(picks.length).toBeGreaterThan(10);
    for (const t of picks) {
      const v = t.visual as MapV;
      const spots = v.points.filter((p) => p.type === 'city' || p.type === 'spot').map((p) => p.name);
      expect(t.type, t.id).toBe('single');
      expect([...spots].sort(), t.id).toEqual([...(t.options ?? [])].sort());
      expect(new Set(spots).size, t.id).toBe(spots.length);
      expect(spots.length, t.id).toBeGreaterThanOrEqual(3);
      expect(checkAnswer(t, t.answer as string), t.id).toBe(true);
      expect(spots, t.id).toContain(t.answer);
      expect(t.ref, t.id).toBeDefined();
    }
  });
  it('задание с рисунком не превращается в «собери слово» или «соедини пары»: без рисунка оно теряет смысл', () => {
    const base = { id: 'a', subject: 's', topicId: 't', difficulty: 'basic', type: 'single', question: 'Покажи на карте: Афины.', options: ['Афины', 'Спарта', 'Троя'], answer: 'Афины', explanation: ['e'], hints: [] } as Task;
    expect(canSpell(base)).toBe(true); // обычный вопрос с таким ответом годится
    const withMap = { ...base, visual: { kind: 'map', map: 'greece', pick: true, points: [{ name: 'Афины', lon: 23.7, lat: 38, type: 'city' }] } } as Task;
    expect(canSpell(withMap)).toBe(false);
    expect(canMatch(withMap)).toBe(false);
    expect(canSpell({ ...base, image: 'art/x.jpg' })).toBe(false);
  });
});
