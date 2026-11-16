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
