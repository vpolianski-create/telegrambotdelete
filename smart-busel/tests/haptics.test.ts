import { describe, expect, it } from 'vitest';
import { HAPTIC } from '../src/audio/sfx';
import { merge } from '../src/store/useApp';
import { syncMerge, SHARED_SETTINGS } from '../src/sync/merge';

describe('вибрация', () => {
  it('только на радостные события; за ошибку — ничего (без «наказаний»)', () => {
    expect(HAPTIC.correct).toBe('success');
    expect(HAPTIC.reward).toBe('celebrate');
    expect(HAPTIC.soft).toBeUndefined();
  });
  it('по умолчанию включена', () => {
    expect(merge(null).settings.vibration).toBe(true);
  });
  it('у каждого устройства своя: синхронизация её не переносит', () => {
    expect(SHARED_SETTINGS).not.toContain('vibration');
    const base = merge(null);
    const phone = { ...base, settings: { ...base.settings, vibration: false }, sync: { deviceId: 'p', baseline: {}, stamps: { 'settings.vibration': 9e12 }, removed: [] } };
    const pc = { v: 1 as const, deviceId: 'c', app: '', data: { ...base, settings: { ...base.settings, vibration: true } }, own: {}, stamps: { 'settings.vibration': 9e13 }, removed: [] };
    expect(syncMerge(phone, phone.sync, [pc]).data.settings.vibration).toBe(false);
  });
});
