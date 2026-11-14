/**
 * Синхронизация в приложении: одна служба на всё приложение и правила «когда синхронизироваться».
 * - при запуске;
 * - после занятий: не чаще раза в 90 секунд, пока ребёнок что-то делает;
 * - каждые 5 минут, пока программа открыта (чтобы увидеть занятия на другом устройстве);
 * - при сворачивании программы и при появлении интернета.
 * Данные проекта Firebase — в firebase-config.json (они не секретны: доступ защищают правила базы и шифрование).
 */
import config from './firebase-config.json';
import { SyncService } from './service';
import { onAppState, secretStore } from '../platform';
import { snapshotWithSync, useApp, type Data } from '../store/useApp';

let applying = false;

export const syncService = new SyncService({
  config: config.apiKey && config.projectId ? config : null,
  secrets: secretStore,
  getData: snapshotWithSync,
  applyData: (d: Data) => { applying = true; try { useApp.getState().applySynced(d); } finally { applying = false; } },
  setMeta: (m) => useApp.getState().setSync(m),
  appVersion: __APP_VERSION__,
});

const AFTER_CHANGE_MS = 90_000;
const PERIODIC_MS = 5 * 60_000;
let started = false;
let pending: ReturnType<typeof setTimeout> | null = null;

const now = () => { if (pending) { clearTimeout(pending); pending = null; } void syncService.syncNow(); };

/** Запускается один раз после загрузки прогресса. */
export function startAutoSync(): void {
  if (started) return;
  started = true;
  void syncService.start();
  useApp.subscribe((s, prev) => {
    if (applying || !s.ready || !s.sync?.familyId) return;
    const changed = s.points !== prev.points || s.daily !== prev.daily || s.topicResults !== prev.topicResults || s.settings !== prev.settings
      || s.rewards !== prev.rewards || s.mistakes !== prev.mistakes || s.leitner !== prev.leitner || s.plan !== prev.plan || s.badges !== prev.badges;
    if (changed && !pending) pending = setTimeout(now, AFTER_CHANGE_MS);
  });
  setInterval(() => { if (document.visibilityState === 'visible') void syncService.syncNow(); }, PERIODIC_MS);
  onAppState((active) => { if (!active) now(); else void syncService.syncNow(); });
  window.addEventListener('online', now);
}
