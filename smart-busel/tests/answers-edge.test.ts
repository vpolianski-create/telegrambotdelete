import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../src/engine/answers';

const input = (answer: string | number) => ({ type: 'input' as const, answer });
const single = (answer: string) => ({ type: 'single' as const, answer });

describe('проверка ответов: граничные случаи', () => {
  it('правильный ответ принимается, неправильный нет', () => {
    expect(checkAnswer(input('Минск'), 'Минск')).toBe(true);
    expect(checkAnswer(input('Минск'), 'Гомель')).toBe(false);
  });
  it('пустой ответ и ответ из одних пробелов — неверно', () => {
    expect(checkAnswer(input('Минск'), '')).toBe(false);
    expect(checkAnswer(input('Минск'), '   ')).toBe(false);
    expect(checkAnswer(single('да'), '')).toBe(false);
  });
  it('лишние пробелы по краям и внутри не мешают', () => {
    expect(checkAnswer(input('Нил'), '  Нил  ')).toBe(true);
    expect(checkAnswer(input('Жан-Франсуа Шампольон'), 'Жан-Франсуа    Шампольон')).toBe(true);
    expect(checkAnswer(input('красная глина'), 'красная глина')).toBe(true);
  });
  it('большие и маленькие буквы не различаются (в том числе кириллица)', () => {
    expect(checkAnswer(input('Минск'), 'МИНСК')).toBe(true);
    expect(checkAnswer(input('Минск'), 'минск')).toBe(true);
    expect(checkAnswer(input('Ў'), 'ў')).toBe(true);
  });
  it('«ё» и «е» считаются одной буквой — в обе стороны', () => {
    expect(checkAnswer(input('ёж'), 'еж')).toBe(true);
    expect(checkAnswer(input('еж'), 'ёж')).toBe(true);
    expect(checkAnswer(input('Фёдор'), 'ФЕДОР')).toBe(true);
  });
  it('белорусские «ў» и «і» — отдельные буквы: «у» вместо «ў» и «и» вместо «і» не засчитываются', () => {
    expect(checkAnswer(input('вучань'), 'вучань')).toBe(true);
    expect(checkAnswer(input('саўка'), 'саука')).toBe(false);
    expect(checkAnswer(input('сіні'), 'сини')).toBe(false);
    expect(checkAnswer(input('ўвесь'), 'увесь')).toBe(false);
    expect(checkAnswer(input('ўвесь'), 'ЎВЕСЬ')).toBe(true);
  });
  it('апострофы белорусского письма разных видов равны', () => {
    expect(checkAnswer(input("сям'я"), 'сям’я')).toBe(true);
    expect(checkAnswer(input('сям’я'), "сям'я")).toBe(true);
    expect(checkAnswer(input('сям’я'), 'сямʼя')).toBe(true);
  });
  it('числа: запятая и точка, пробелы-разделители, нули', () => {
    expect(checkAnswer(input(1000), '1 000')).toBe(true);
    expect(checkAnswer(input(1000), '1000')).toBe(true);
    expect(checkAnswer(input(2.5), '2,5')).toBe(true);
    expect(checkAnswer(input(2.5), '2.5')).toBe(true);
    expect(checkAnswer(input(5), '5,0')).toBe(true);
    expect(checkAnswer(input(5), '05')).toBe(true);
    expect(checkAnswer(input(5), '6')).toBe(false);
    expect(checkAnswer(input(5), 'пять')).toBe(false);
  });
  it('отрицательные числа', () => {
    expect(checkAnswer(input(-3), '-3')).toBe(true);
    expect(checkAnswer(input(-3), '3')).toBe(false);
  });
  it('единицы измерения в ответе не принимаются: «15 см» вместо «15»', () => {
    expect(checkAnswer(input(15), '15 см')).toBe(false);
  });
  it('верно/неверно: строго логическое значение', () => {
    const t = { type: 'truefalse' as const, answer: true };
    expect(checkAnswer(t, true)).toBe(true);
    expect(checkAnswer(t, false)).toBe(false);
    expect(checkAnswer({ ...t, answer: false }, false)).toBe(true);
  });
  it('несколько ответов: порядок не важен, лишний и недостающий — ошибка', () => {
    const m = { type: 'multi' as const, answer: ['а', 'б'] as string[] };
    expect(checkAnswer(m, ['б', 'а'])).toBe(true);
    expect(checkAnswer(m, ['а'])).toBe(false);
    expect(checkAnswer(m, ['а', 'б', 'в'])).toBe(false);
    expect(checkAnswer(m, [])).toBe(false);
  });
  it('выбор из вариантов сравнивается без учёта регистра', () => {
    expect(checkAnswer(single('Нил'), 'нил')).toBe(true);
  });
});
