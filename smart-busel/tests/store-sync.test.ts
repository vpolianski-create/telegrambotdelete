import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ans, freshStore, installFakeDisk } from './helpers/fakeApp';
import { syncMerge, type SyncMeta } from '../src/sync/merge';

let store: Awaited<ReturnType<typeof freshStore>>;
let disk: ReturnType<typeof installFakeDisk>;
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-14T12:00:00'));
  disk = installFakeDisk();
  store = await freshStore();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const st = () => store.useApp.getState();
const meta = (over: Partial<SyncMeta> = {}): SyncMeta => ({ deviceId: 'a'.repeat(32), baseline: {}, stamps: {}, removed: [], ...over });

describe('хранилище и синхронизация', () => {
  it('без синхронизации служебного поля нет и в файле его нет', () => {
    st().recordAnswer(ans());
    expect(st().sync).toBeUndefined();
    expect('sync' in (disk.content as object)).toBe(false);
  });

  it('служебное поле сохраняется в файл и возвращается после перезапуска', async () => {
    st().setSync(meta({ familyId: 'f'.repeat(32) }));
    st().recordAnswer(ans());
    store = await freshStore();
    await st().init();
    expect(st().sync?.familyId).toBe('f'.repeat(32));
  });

  it('смена PIN ставит метку времени (чтобы новый PIN дошёл до других устройств)', () => {
    st().setSync(meta());
    st().updateSettings({ pin: '5555', pinChanged: true });
    expect(st().sync!.stamps['settings.pin']).toBe(new Date('2026-11-14T12:00:00').getTime());
    expect(st().sync!.stamps['settings.theme']).toBeUndefined();
  });

  it('исправленная ошибка запоминается, чтобы не вернулась с другого устройства', () => {
    st().setSync(meta());
    st().recordAnswer(ans({ correct: false, question: 'Q1' }));
    st().resolveMistake('math-t01', 'Q1');
    expect(st().mistakes).toHaveLength(0);
    expect(st().sync!.removed).toHaveLength(1);
    expect(st().sync!.removed[0]).toContain('Q1');
  });

  it('применение общего прогресса: баллы растут, награда за порог появляется, а повтор не удваивает', () => {
    st().setSync(meta());
    st().recordAnswer(ans({ points: 60 }));
    const other = { v: 1 as const, deviceId: 'b'.repeat(32), app: 'x', data: { ...store.merge(null), points: 50 }, own: { points: 50 }, stamps: {}, removed: [] };
    for (let i = 0; i < 3; i++) {
      const r = syncMerge(store.snapshotWithSync(), st().sync!, [other]);
      st().applySynced(r.data);
    }
    expect(st().points).toBe(110);
    expect(st().rewards.map((r) => r.id)).toEqual(['r1']);
    expect((disk.content as { points: number }).points).toBe(110);
  });

  it('копия для файла (экспорт) — без служебного поля синхронизации', () => {
    st().setSync(meta());
    expect('sync' in store.snapshot()).toBe(false);
  });

  it('загрузка копии из файла отключает старые сведения синхронизации (иначе прогресс мог бы удвоиться)', () => {
    st().setSync(meta());
    st().importData({ ...store.merge(null), points: 300 });
    expect(st().points).toBe(300);
    expect(st().sync).toBeUndefined();
  });
  it('старые грамоты (за тему, серию 7 и 14 дней) удаляются при загрузке и не возвращаются с другого устройства', async () => {
    const mod = await import('../src/store/useApp');
    const loaded = mod.merge({ certificates: { 't:math-t01': '2025-01-01', 'k:7': '2025-01-02', 'k:14': '2025-01-03', 'k:30': '2025-02-01' } });
    expect(loaded.certificates).toEqual({ 'k:30': '2025-02-01' });
    st().applySynced({ ...mod.merge(null), certificates: { 't:math-t02': '2025-01-05', 'k:100': '2025-05-01' } });
    expect(st().certificates).toEqual({ 'k:100': '2025-05-01' });
  });
});
