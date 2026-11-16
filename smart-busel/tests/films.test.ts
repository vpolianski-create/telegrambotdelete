import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FILMS, filmBeat, filmFor, filmUrl } from '../src/content/films';
import { subjects } from '../src/content/loader';
import { isGeneratorRef } from '../src/content/schema';

const topics = new Map(subjects.flatMap((s) => s.sections.flatMap((sec) => sec.topics)).map((t) => [t.id, t]));

describe('мультуроки', () => {
  it('у каждого ролика есть тема и все файлы; части совпадают с частями на странице ролика', () => {
    for (const [id, film] of Object.entries(FILMS)) {
      expect(topics.has(id), id).toBe(true);
      const page = path.join('public', film.src);
      expect(fs.existsSync(page), page).toBe(true);
      const html = fs.readFileSync(page, 'utf8');
      // порядок частей на странице: ['intro', 'Начало', …], ['divisors', …]
      const onPage = [...html.matchAll(/^\s*\['([a-z0-9-]+)', '[^']*', \(m/gm)].map((x) => x[1]);
      expect(onPage, id).toEqual(film.beats);
      const dir = path.dirname(page);
      for (const f of ['lib/engine.js', 'lib/engine.css', 'audio/ru/timings.js']) expect(fs.existsSync(path.join(dir, f)), `${id}: ${f}`).toBe(true);
      for (const b of film.beats) expect(fs.existsSync(path.join(dir, 'audio/ru', `${b}.mp3`)), `${id}: озвучка ${b}`).toBe(true);
    }
  });

  it('ролик работает без интернета: страница не загружает ничего снаружи', () => {
    for (const film of Object.values(FILMS)) {
      const dir = path.dirname(path.join('public', film.src));
      for (const f of ['index.html', 'lib/engine.js', 'lib/engine.css', 'lib/book.css']) {
        const text = fs.readFileSync(path.join(dir, f), 'utf8');
        expect(/(src|href)=["']https?:/i.test(text) || /@import\s+url\(["']?https?:/i.test(text), `${f}`).toBe(false);
      }
    }
  });

  it('каждый генератор темы ведёт на существующую часть ролика', () => {
    for (const [id, film] of Object.entries(FILMS)) {
      const t = topics.get(id)!;
      for (const e of [...t.practice, ...t.bonus]) {
        if (!isGeneratorRef(e)) continue;
        const beat = filmBeat(film, { generator: e.generator, question: '' });
        expect(beat, `${id}: ${e.generator}`).toBeDefined();
        expect(film.beats).toContain(beat);
      }
    }
  });

  it('обычные вопросы — по словам вопроса', () => {
    const film = filmFor('math-t12')!;
    expect(filmBeat(film, { question: 'Чему равно НОК(2, 3)?' })).toBe('lcm');
    expect(filmBeat(film, { question: 'Найди НОД(8, 12)' })).toBe('gcd');
    expect(filmBeat(film, { question: 'Какое число является делителем числа 20?' })).toBe('divisors');
    expect(filmBeat(film, { question: 'Выбери число, кратное 7' })).toBe('multiples');
    expect(filmBeat(film, { question: '4 — делитель 12 или 12 — кратное 4?' })).toBe('link');
    expect(filmBeat(film, { question: 'Сколько будет 2 + 2?' })).toBeUndefined();
  });

  it('тема 13: часть ролика — по признаку из вопроса', () => {
    const film = filmFor('math-t13')!;
    const can = (q: string) => filmBeat(film, { generator: 'math.div.can', question: q });
    expect(can('Число 4 512 делится на 3 без остатка.')).toBe('three');
    expect(can('Число 2 358 делится на 9 без остатка.')).toBe('nine');
    expect(can('Число 345 делится на 5 без остатка.')).toBe('last');
    expect(can('Число 340 делится на 10 без остатка.')).toBe('last');
    expect(can('')).toBe('last');
    expect(filmBeat(film, { generator: 'math.div.choose', question: 'Какое из чисел делится на 9?' })).toBe('nine');
    expect(filmBeat(film, { generator: 'math.div.choose', question: 'Какое из чисел делится на 2?' })).toBe('last');
    expect(filmBeat(film, { generator: 'math.div.digit', question: 'Какую наименьшую цифру нужно поставить вместо *, чтобы число 7*4 делилось на 9?' })).toBe('digit');
    expect(filmBeat(film, { generator: 'math.div.six', question: 'Число 1 254 делится на 6.' })).toBe('six');
    expect(filmBeat(film, { question: 'Какое число делится на 4?' })).toBe('four');
    expect(filmBeat(film, { question: 'Число 3 754 делится на 4.' })).toBe('four');
    expect(filmBeat(film, { question: 'Число 124 делится на 3.' })).toBe('three');
    expect(filmBeat(film, { question: 'Найди сумму цифр числа 512' })).toBe('three');
    expect(filmUrl(film, 'digit')).toBe('films/math-t13/index.html?beat=9');
  });

  it('темы 14, 15, 17, 19: часть ролика — по смыслу задания', () => {
    const at = (topic: string, generator: string | undefined, question: string) => filmBeat(filmFor(topic)!, { generator, question });
    // 14 — простые числа
    expect(at('math-t14', 'math.prime.is', 'Число 91 — простое.')).toBe('check');
    expect(at('math-t14', 'math.prime.count', 'Сколько простых чисел в промежутке от 10 до 30 (включая концы)?')).toBe('sieve');
    expect(at('math-t14', 'math.prime.largest', 'Найди наибольший простой множитель числа 84.')).toBe('count');
    expect(at('math-t14', undefined, 'Какое простое число чётное?')).toBe('two');
    expect(at('math-t14', undefined, 'Найди НОД(72; 162) по разложению на множители.')).toBe('gcd');
    expect(at('math-t14', undefined, 'Число 1 — простое.')).toBe('defs');
    // 15 — выражения
    expect(at('math-t15', 'math.expr.value', 'Найди значение выражения: 96 − (12 + 8) · 2')).toBe('plan');
    expect(at('math-t15', 'math.expr.first', 'Какое действие в выражении 5 + 3 · 4 нужно выполнить первым?')).toBe('order');
    expect(at('math-t15', 'math.expr.first', 'Какое действие в выражении (5 + 3) · 4 нужно выполнить первым?')).toBe('brackets');
    expect(at('math-t15', 'math.expr.compose', 'Из суммы чисел 12 и 8 вычти 5. Чему равен результат?')).toBe('words');
    expect(at('math-t15', undefined, 'Чему равно значение выражения 2 + 3 · 4?')).toBe('trap');
    // 17 — уравнение
    expect(at('math-t17', 'math.eq.simple', 'Реши уравнение: x + 5 = 12')).toBe('parts');
    expect(at('math-t17', 'math.eq.simple', 'Реши уравнение: x − 14 = 25')).toBe('minus');
    expect(at('math-t17', 'math.eq.simple', 'Реши уравнение: 40 − x = 15')).toBe('sub');
    expect(at('math-t17', 'math.eq.simple', 'Реши уравнение: 4 · x = 28')).toBe('mult');
    expect(at('math-t17', 'math.eq.simple', 'Реши уравнение: x : 3 = 6')).toBe('mult');
    expect(at('math-t17', 'math.eq.root', 'Число 7 является корнем уравнения x + 5 = 12.')).toBe('root');
    expect(at('math-t17', 'math.eq.twoStep', 'Реши уравнение: 3 · x + 4 = 19')).toBe('chain');
    expect(at('math-t17', 'math.eq.word', 'Я задумал число…')).toBe('think');
    // 19 — задачи уравнением
    expect(at('math-t19', 'math.eqword.simple', 'У Максима было несколько марок. Когда ему подарили 8 марок, у него стало 23.')).toBe('before');
    expect(at('math-t19', 'math.eqword.simple', 'В 3 одинаковых коробках лежит поровну конфет, всего 36 конфет.')).toBe('notebook');
    expect(at('math-t19', 'math.eqword.two', 'В двух коробках вместе 20 карандашей.')).toBe('which');
    expect(at('math-t19', 'math.eqword.ratio', 'Арбуз в 3 раза тяжелее дыни…')).toBe('ratio');
  });

  it('тема 20: часть ролика — по смыслу задания', () => {
    const at = (generator: string | undefined, question: string) => filmBeat(filmFor('math-t20')!, { generator, question });
    expect(at('math.angle.type', 'Какой это угол: 120°?')).toBe('types');
    expect(at('math.angle.picture', 'Посмотри на рисунок. Какой это угол?')).toBe('types');
    expect(at('math.angle.adjacent', 'Развёрнутый угол разделили лучом на два угла.')).toBe('straight');
    expect(at('math.angle.sum', 'Луч OB лежит внутри угла AOC.')).toBe('sum');
    expect(at('math.angle.half', 'Луч-биссектриса делит угол…')).toBe('half');
    expect(at('math.angle.clock', 'Какой угол образуют стрелки часов в 4:00?')).toBe('clock');
    expect(at(undefined, 'Какой угол равен 90°?')).toBe('types');
    expect(at(undefined, 'Тупой угол меньше 90°.')).toBe('types');
    expect(at(undefined, 'Чем измеряют углы? Транспортиром.')).toBe('protractor');
  });

  it('адрес: с частью — сразу на ней, без части или с первой — с заставки', () => {
    const film = filmFor('math-t12')!;
    expect(filmUrl(film)).toBe('films/math-t12/index.html');
    expect(filmUrl(film, 'gcd')).toBe('films/math-t12/index.html?beat=6');
    expect(filmUrl(film, 'intro')).toBe('films/math-t12/index.html');
    expect(filmUrl(film, 'нет такой')).toBe('films/math-t12/index.html');
    expect(filmFor('math-t01')).toBeUndefined();
  });
});

describe('поворот экрана для мультурока', () => {
  it('на время ролика — горизонтально; после — телефон вертикально, планшет как удобно', async () => {
    const { orientationFor } = await import('../src/platform');
    expect(orientationFor(true, 390)).toBe('landscape');
    expect(orientationFor(true, 800)).toBe('landscape');
    expect(orientationFor(false, 390)).toBe('portrait');
    expect(orientationFor(false, 599)).toBe('portrait');
    expect(orientationFor(false, 600)).toBe('any');
  });
});
