import { describe, expect, it } from 'vitest';
import { PIN_MAX, pinPress } from '../src/engine/pinpad';

describe('ввод PIN кнопками (телефон)', () => {
  it('цифры добавляются по одной', () => {
    expect(['1', '2', '3', '4'].reduce(pinPress, '')).toBe('1234');
  });
  it('не больше 6 цифр', () => {
    expect(Array(10).fill('7').reduce(pinPress, '')).toHaveLength(PIN_MAX);
  });
  it('«⌫» стирает последнюю цифру, на пустом — ничего', () => {
    expect(pinPress('123', 'back')).toBe('12');
    expect(pinPress('', 'back')).toBe('');
  });
  it('посторонние клавиши не попадают в PIN', () => {
    expect(pinPress('12', 'a')).toBe('12');
    expect(pinPress('12', '12')).toBe('12');
  });
});
