import { vi } from 'vitest';
import type { Data } from '../../src/store/useApp';

/** «Файл» прогресса в памяти: так в тестах работает window.busel (как в настоящем приложении). */
export function installFakeDisk(initial: unknown = null) {
  const disk = { content: initial as unknown, saves: 0, failLoad: false };
  const busel = {
    load: async () => { if (disk.failLoad) throw new Error('файл повреждён'); return disk.content as Data | null; },
    save: async (d: Data) => { disk.content = JSON.parse(JSON.stringify(d)); disk.saves++; },
  };
  vi.stubGlobal('window', { busel });
  return disk;
}

/** Чистое состояние хранилища, как при первом запуске. */
export async function freshStore() {
  const mod = await import('../../src/store/useApp');
  mod.useApp.setState({ ...mod.merge(null), rewardBase: undefined, toasts: [], ready: false });
  return mod;
}

export const ans = (over: Partial<{ points: number; correct: boolean; question: string; subject: string; topicId: string }> = {}) => ({
  subject: 'math', topicId: 'math-t01', question: 'Сколько будет 2+2?', correct: true, points: 10, ...over,
});
