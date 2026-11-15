import { describe, expect, it } from 'vitest';
import { interceptBack, runBackInterceptors } from '../src/platform';

describe('кнопка «Назад» на Android: сначала экран сам закрывает раздел', () => {
  it('последний добавленный обработчик срабатывает первым; после снятия — не срабатывает', () => {
    const log: string[] = [];
    const offA = interceptBack(() => { log.push('раздел'); return true; });
    const offB = interceptBack(() => { log.push('грамота'); return true; });
    expect(runBackInterceptors()).toBe(true);
    expect(log).toEqual(['грамота']);
    offB();
    expect(runBackInterceptors()).toBe(true);
    expect(log).toEqual(['грамота', 'раздел']);
    offA();
    expect(runBackInterceptors()).toBe(false); // дальше — обычный переход по экранам
  });
});
