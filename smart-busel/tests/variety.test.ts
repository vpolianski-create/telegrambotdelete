import { describe, expect, it } from 'vitest';
import type { Task } from '../src/content/schema';
import { checkAnswer } from '../src/engine/answers';
import { seeded } from '../src/engine/rng';
import { canMatch, canSpell, matchTask, sentenceTask, spellTask, withVariety } from '../src/engine/variety';
import { subjects } from '../src/content/loader';

const single = (id: string, question: string, answer: string, extra: Partial<Task> = {}): Task => ({
  id, subject: 'history', topicId: 't', difficulty: 'basic', type: 'single', question,
  options: [answer, 'другое', 'третье', 'четвёртое'], answer, explanation: ['так в уроке'], hints: [], ...extra,
});

describe('проверка ответа: порядок и пары', () => {
  const order = { type: 'order' as const, answer: ['а', 'б', 'в'] };
  it('порядок: верно только в точности так же', () => {
    expect(checkAnswer(order, ['а', 'б', 'в'])).toBe(true);
    expect(checkAnswer(order, ['б', 'а', 'в'])).toBe(false);
    expect(checkAnswer(order, ['а', 'б'])).toBe(false);
    expect(checkAnswer(order, [])).toBe(false);
  });
  it('порядок: регистр и «ё» не мешают', () => {
    expect(checkAnswer({ type: 'order', answer: ['Ёж', 'Лес'] }, ['еж', 'лес'])).toBe(true);
  });
  it('пары: каждому левому — свой правый', () => {
    const match = { type: 'match' as const, answer: ['один', 'два'] };
    expect(checkAnswer(match, ['один', 'два'])).toBe(true);
    expect(checkAnswer(match, ['два', 'один'])).toBe(false);
  });
  it('одинаковые буквы в слове не путают проверку', () => {
    expect(checkAnswer({ type: 'order', answer: ['м', 'а', 'м', 'а'] }, ['м', 'а', 'м', 'а'])).toBe(true);
    expect(checkAnswer({ type: 'order', answer: ['м', 'а', 'м', 'а'] }, ['а', 'м', 'м', 'а'])).toBe(false);
  });
});

describe('«собери слово из букв»', () => {
  it('подходит вопрос с ответом в одно слово', () => {
    expect(canSpell(single('1', 'Как называется высший чиновник при фараоне?', 'чати'))).toBe(true);
    expect(canSpell(single('2', 'Как называлась столица?', 'Мемфис'))).toBe(true);
  });
  it('не подходит: несколько слов, число, слишком короткое или длинное слово', () => {
    expect(canSpell(single('1', 'Вопрос?', 'Млечный Путь'))).toBe(false);
    expect(canSpell(single('2', 'Сколько статей?', '282'))).toBe(false);
    expect(canSpell(single('3', 'Бог солнца?', 'Ра'))).toBe(false);
    expect(canSpell(single('4', 'Вопрос?', 'древнегреческий'))).toBe(false);
  });
  it('не подходит вопрос, который опирается на варианты ответа', () => {
    expect(canSpell(single('1', 'Какое из слов лишнее?', 'плуг'))).toBe(false);
    expect(canSpell(single('2', 'Что из перечисленного — источник?', 'монета'))).toBe(false);
    expect(canSpell(single('3', 'Выбери верное слово.', 'монета'))).toBe(false);
  });
  it('буквы перемешаны, ответ — исходное слово, id и вопрос сохраняются', () => {
    const base = single('h-1', 'Как называлась столица?', 'Мемфис');
    const t = spellTask(base, seeded(1));
    expect(t.type).toBe('order');
    expect(t.kind).toBe('letters');
    expect(t.id).toBe('h-1');
    expect(t.question).toBe(base.question);
    expect([...t.options!].sort()).toEqual('Мемфис'.split('').sort());
    expect(t.options).not.toEqual('Мемфис'.split(''));
    expect(checkAnswer(t, 'Мемфис'.split(''))).toBe(true);
  });
});

describe('«соедини вопрос и ответ»', () => {
  const a = single('1', 'Как называлась столица Египта?', 'Мемфис');
  const b = single('2', 'Кто вёл учёт налогов?', 'писцы');
  const c = single('3', 'Как называли царя Египта?', 'фараон');
  const d = single('4', 'Какая река течёт в Египте?', 'Нил');
  it('подходят короткие вопросы с короткими ответами', () => {
    expect(canMatch(a)).toBe(true);
    expect(canMatch(single('5', 'Почему в Египте развивалась математика и другие точные науки у жрецов?', 'считали'))).toBe(false);
    expect(canMatch(single('6', 'Почему?', 'нужно было считать продукты, поля, камни и рабочих'))).toBe(false);
    expect(canMatch(single('7', 'Какое из утверждений верно?', 'первое'))).toBe(false);
  });
  it('задание собирается из 3–4 вопросов; ответы стоят в порядке вопросов', () => {
    const t = matchTask([a, b, c, d]);
    expect(t.type).toBe('match');
    expect(t.options).toEqual([a.question, b.question, c.question, d.question]);
    expect(t.answer).toEqual(['Мемфис', 'писцы', 'фараон', 'Нил']);
    expect(t.id).toBe('1');
    expect(checkAnswer(t, ['Мемфис', 'писцы', 'фараон', 'Нил'])).toBe(true);
  });
});

describe('разнообразие при повторном прохождении темы', () => {
  const tasks = [
    single('1', 'Как называлась столица Египта?', 'Мемфис'),
    single('2', 'Кто вёл учёт налогов?', 'писцы'),
    single('3', 'Как называли царя Египта?', 'фараон'),
    single('4', 'Какая река течёт в Египте?', 'Нил'),
    single('5', 'Как называется высший чиновник?', 'чати'),
    single('6', 'Что строили для фараонов?', 'пирамиды'),
    { ...single('7', 'Жрецы вели наблюдения.', 'x'), type: 'truefalse' as const, answer: true, options: undefined },
  ];
  it('появляются задания новых видов, вопросы не теряются и не дублируются', () => {
    const out = withVariety(tasks, seeded(3));
    const kinds = out.map((t) => (t.type === 'order' ? 'spell' : t.type));
    expect(kinds.filter((k) => k === 'spell').length).toBeGreaterThanOrEqual(1);
    expect(kinds.filter((k) => k === 'spell').length).toBeLessThanOrEqual(2);
    expect(kinds.filter((k) => k === 'match')).toHaveLength(1);
    const covered = out.flatMap((t) => (t.type === 'match' ? (t.options as string[]) : [t.question]));
    expect([...covered].sort()).toEqual(tasks.map((t) => t.question).sort());
  });
  it('в парах не бывает двух одинаковых ответов', () => {
    const dup = [single('1', 'Кто бог солнца?', 'Амон'), single('2', 'Кого почитали в Фивах?', 'Амон'), single('3', 'Какая река?', 'Нил'), single('4', 'Кто правил?', 'фараон')];
    for (let seed = 1; seed < 30; seed++) {
      const m = withVariety(dup, seeded(seed)).find((t) => t.type === 'match');
      if (m) expect(new Set(m.answer as string[]).size).toBe((m.answer as string[]).length);
    }
  });
  it('если подходящих вопросов мало — задания остаются как были', () => {
    const few = [tasks[6], single('8', 'Почему разливается Нил каждый год летом в долине?', 'из-за дождей в верховьях реки')];
    expect(withVariety(few, seeded(1))).toEqual(few);
  });
  it('на настоящих уроках: всё собранное проходит проверку своим же ответом', () => {
    let changed = 0;
    for (const s of subjects) for (const sec of s.sections) for (const topic of sec.topics) {
      const statics = topic.practice.filter((e): e is Task => !('generator' in e));
      const out = withVariety(statics, seeded(topic.id.length + statics.length));
      if (out.some((t) => t.type === 'order' || t.type === 'match')) changed++;
      for (const t of out) if (t.type === 'order' || t.type === 'match') {
        expect(checkAnswer(t, t.answer as string[])).toBe(true);
        expect((t.options as string[]).length).toBe((t.answer as string[]).length);
      }
    }
    expect(changed).toBeGreaterThan(100); // разнообразие есть в большинстве тем
  });
});

describe('«собери предложение» из примера к слову', () => {
  it('слова перемешаны, ответ — исходный порядок', () => {
    const t = sentenceTask({ id: 'w1', en: 'beach', transcription: '', ru: 'пляж', example: 'There was a lot of sand on the beach.' }, seeded(2))!;
    expect(t.type).toBe('order');
    expect(t.kind).toBe('words');
    expect(t.answer).toEqual(['There', 'was', 'a', 'lot', 'of', 'sand', 'on', 'the', 'beach.']);
    expect(t.options).not.toEqual(t.answer);
    expect(checkAnswer(t, t.answer as string[])).toBe(true);
  });
  it('слишком короткий пример не годится', () => {
    expect(sentenceTask({ id: 'w', en: 'hi', transcription: '', ru: 'привет', example: 'Hi there!' }, seeded(1))).toBeUndefined();
  });
});
