import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../src/engine/answers';
import { addDays, afterAnswer, boxCounts, pickSession } from '../src/engine/leitner';

const input = (answer: string | number) => ({ type: 'input' as const, answer });

describe('проверка ответов', () => {
  it('игнорирует регистр, пробелы, ё/е', () => {
    expect(checkAnswer(input('Ёлка'), '  елка ')).toBe(true);
    expect(checkAnswer(input('мама мыла'), 'Мама   мыла')).toBe(true);
  });
  it('числа: пробелы-разделители и запятая', () => {
    expect(checkAnswer(input(3850), '3 850')).toBe(true);
    expect(checkAnswer(input(2.5), '2,5')).toBe(true);
    expect(checkAnswer(input(3850), '3851')).toBe(false);
  });
  it('белорусский: ў и у, і и и — разные буквы', () => {
    expect(checkAnswer(input('вучань'), 'вучань')).toBe(true);
    expect(checkAnswer(input('воўк'), 'воук')).toBe(false);
    expect(checkAnswer(input('сіні'), 'сині')).toBe(false);
    expect(checkAnswer(input("аб'ект"), 'аб’ект')).toBe(true);
  });
  it('верно/неверно, один и несколько ответов', () => {
    expect(checkAnswer({ type: 'truefalse', answer: false }, false)).toBe(true);
    expect(checkAnswer({ type: 'single', answer: '80' }, '80')).toBe(true);
    expect(checkAnswer({ type: 'multi', answer: ['a', 'b'] }, ['b', 'a'])).toBe(true);
    expect(checkAnswer({ type: 'multi', answer: ['a', 'b'] }, ['a'])).toBe(false);
  });
});

describe('Лейтнер', () => {
  const today = '2026-10-04';
  it('верный ответ поднимает коробку, ошибка возвращает в первую', () => {
    const s1 = afterAnswer(undefined, true, today);
    expect(s1).toEqual({ box: 2, due: addDays(today, 1) });
    expect(afterAnswer({ box: 5, due: today }, true, today).box).toBe(5);
    expect(afterAnswer({ box: 4, due: today }, false, today)).toEqual({ box: 1, due: today });
  });
  it('в занятие сначала попадают слова из младших коробок', () => {
    const words = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
    const states = { a: { box: 3, due: today }, b: { box: 1, due: today }, c: { box: 5, due: '2026-10-20' } };
    expect(pickSession(words, states, today, 3).map((w) => w.id)).toEqual(['b', 'a', 'd']);
    expect(boxCounts(words, states)).toEqual([1, 0, 1, 0, 1]);
  });
});
