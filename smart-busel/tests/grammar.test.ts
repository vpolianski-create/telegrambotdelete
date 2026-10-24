import { describe, expect, it } from 'vitest';
import { fixPlurals } from '../src/generators/grammar';

describe('согласование существительных с числами', () => {
  it('исправляет формы', () => {
    expect(fixPlurals('подарили 4 марок, стало 49 марок')).toBe('подарили 4 марки, стало 49 марок');
    expect(fixPlurals('через 23 дней')).toBe('через 23 дня');
    expect(fixPlurals('72 учеников, 21 учеников, 11 ученика')).toBe('72 ученика, 21 ученик, 11 учеников');
    expect(fixPlurals('20 конфет и 24 печений')).toBe('20 конфет и 24 печенья');
    expect(fixPlurals('94 карандашей, на 2 карандашей больше')).toBe('94 карандаша, на 2 карандаша больше');
    expect(fixPlurals('3 единичных отрезков')).toBe('3 единичных отрезка');
    expect(fixPlurals('1 000 человек и 2 человек')).toBe('1 000 человек и 2 человека');
  });
  it('не трогает остальное', () => {
    expect(fixPlurals('Реши: 5 · 3 = 15 (ост. 2)')).toBe('Реши: 5 · 3 = 15 (ост. 2)');
  });
});
