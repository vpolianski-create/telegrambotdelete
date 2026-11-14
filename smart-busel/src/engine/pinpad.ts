/** Ввод PIN кнопками на телефоне: цифры добавляются (не больше 6), «⌫» стирает последнюю. */
export const PIN_MAX = 6;
export function pinPress(current: string, key: string): string {
  if (key === 'back') return current.slice(0, -1);
  if (/^\d$/.test(key) && current.length < PIN_MAX) return current + key;
  return current;
}
