/**
 * Служба синхронизации: когда и что отправлять, как подключать устройство к «семье».
 *
 * Порядок одной синхронизации:
 *  1) войти (анонимно) → 2) скачать зашифрованные документы других устройств семьи → 3) расшифровать →
 *  4) слить со своим прогрессом (src/sync/merge.ts) → 5) применить → 6) зашифровать и отправить свой документ.
 * Шаги 4–5 выполняются сразу друг за другом, поэтому ответы ребёнка во время синхронизации не теряются.
 */
import { create } from 'zustand';
import { deriveFamily, formatCode, generateFamilyCode, normalizeCode, open, randomId, seal, type FamilyKeys } from './crypto';
import { FirebaseClient, SyncError, type AuthStore, type FirebaseConfig, type SyncErrorKind } from './firebase';
import { founderStamps, hasProgress, syncMerge, type SyncMeta, type SyncPayload } from './merge';
import { CONTENT_REV, merge, resetRewrittenTopics, type Data } from '../store/useApp';

/** Секреты этого устройства: семейный код и пропуск анонимного входа. Хранятся отдельно от прогресса (защищённо). Пустой code — синхронизация выключена. */
export interface SyncSecrets { code: string; refreshToken?: string }
export interface SecretStore { get(): Promise<SyncSecrets | null>; set(s: SyncSecrets | null): Promise<void> }

export interface SyncDeps {
  config: FirebaseConfig | null;
  secrets: SecretStore;
  getData(): Data;
  applyData(d: Data): void;
  setMeta(m: SyncMeta | undefined): void;
  appVersion: string;
  fetch?: typeof fetch;
}

export type SyncState = 'off' | 'idle' | 'syncing' | 'offline' | 'error';
export interface SyncStatus {
  state: SyncState;
  /** Понятное родителю сообщение о последней ошибке. */
  message: string;
  lastSync?: string;
  devices: number;
  /** На другом устройстве стоит более новая версия программы. */
  outdated: boolean;
}
export const useSyncStatus = create<SyncStatus>(() => ({ state: 'off', message: '', devices: 0, outdated: false }));

const MESSAGES: Record<SyncErrorKind, string> = {
  offline: 'Нет интернета — синхронизируем, когда он появится.',
  denied: 'Облако не пустило приложение. Проверьте правила доступа Firebase (инструкция для родителя).',
  quota: 'Облако временно перегружено — повторим позже.',
  config: 'Синхронизация не настроена: нет данных проекта Firebase.',
  error: 'Не получилось синхронизировать. Повторим позже.',
};

export interface FamilyCheck { exists: boolean; devices: number; known: boolean; localProgress: boolean }
export type JoinMode = 'resume' | 'add' | 'replace';

export class SyncService {
  private client: FirebaseClient | null = null;
  private keys: FamilyKeys | null = null;
  private running: Promise<void> | null = null;
  private again = false;

  constructor(private deps: SyncDeps) {}

  get configured(): boolean { return !!this.deps.config?.apiKey && !!this.deps.config.projectId; }

  private status(p: Partial<SyncStatus>) { useSyncStatus.setState(p); }

  private authStore(): AuthStore {
    return {
      get: async () => (await this.deps.secrets.get())?.refreshToken ?? null,
      set: async (token) => {
        const cur = await this.deps.secrets.get();
        const code = cur?.code ?? '';
        await this.deps.secrets.set(code || token ? { code, refreshToken: token ?? undefined } : null);
      },
    };
  }

  private api(): FirebaseClient {
    if (!this.configured) throw new SyncError('config', MESSAGES.config);
    this.client ??= new FirebaseClient(this.deps.config!, this.authStore(), this.deps.fetch);
    return this.client;
  }

  /** Включена ли синхронизация на этом устройстве (есть код и служебные сведения). */
  async enabled(): Promise<boolean> {
    return !!(await this.deps.secrets.get())?.code && !!this.deps.getData().sync?.familyId;
  }

  /** Запуск программы: показать состояние и сразу синхронизироваться. */
  async start(): Promise<void> {
    if (await this.enabled()) {
      this.status({ state: 'idle', lastSync: this.deps.getData().sync?.lastSync });
      await this.syncNow();
    } else this.status({ state: 'off' });
  }

  private async family(): Promise<FamilyKeys> {
    const s = await this.deps.secrets.get();
    if (!s?.code) throw new SyncError('error', 'Синхронизация выключена');
    if (!this.keys) this.keys = await deriveFamily(s.code);
    return this.keys;
  }

  /** Скачать и расшифровать документы семьи. Чужие/повреждённые документы пропускаются. */
  private async remotes(keys: FamilyKeys): Promise<SyncPayload[]> {
    const docs = await this.api().listDevices(keys.familyId);
    const payloads: SyncPayload[] = [];
    for (const d of docs) {
      try {
        const p = await open<SyncPayload>(keys, d.id, d);
        if (p.v === 1 && p.deviceId === d.id) payloads.push(prepare(p));
      } catch { /* не расшифровался — не наш или испорчен: пропускаем */ }
    }
    return payloads;
  }

  /** Синхронизация сейчас. Если уже идёт — повторится сразу после неё. */
  syncNow(): Promise<void> {
    if (this.running) { this.again = true; return this.running; }
    this.running = (async () => {
      try {
        do { this.again = false; await this.once(); } while (this.again);
      } finally { this.running = null; }
    })();
    return this.running;
  }

  private async once(): Promise<void> {
    if (!(await this.enabled())) { this.status({ state: 'off' }); return; }
    this.status({ state: 'syncing' });
    try {
      const keys = await this.family();
      const payloads = await this.remotes(keys);
      // слияние и применение — без пауз, чтобы не потерять ответы, данные за время скачивания
      const local = this.deps.getData();
      const meta = local.sync!;
      const lastSync = new Date().toISOString();
      const { data, payload } = syncMerge(local, { ...meta, lastSync }, payloads, this.deps.appVersion);
      this.deps.applyData(data);
      await this.api().putDevice(keys.familyId, meta.deviceId, await seal(keys, meta.deviceId, payload));
      const newer = payloads.some((p) => (p.data.contentRev ?? 0) > CONTENT_REV || newerVersion(p.app, this.deps.appVersion));
      this.status({ state: 'idle', message: '', lastSync, devices: new Set([...payloads.map((p) => p.deviceId), meta.deviceId]).size, outdated: newer });
    } catch (e) {
      const kind: SyncErrorKind = e instanceof SyncError ? e.kind : 'error';
      this.status({ state: kind === 'offline' || kind === 'quota' ? 'offline' : 'error', message: MESSAGES[kind] });
    }
  }

  // ——— подключение и отключение ———

  /** Первое устройство: создать семью. Возвращает семейный код (показать родителю). */
  async createFamily(): Promise<string> {
    const code = generateFamilyCode();
    await this.startFamily(code);
    return code;
  }

  /** Новый код (например, если телефон потерян): весь прогресс переносится в новую семью, старая удаляется. */
  async changeCode(): Promise<string> {
    const oldKeys = await this.family().catch(() => null);
    const code = generateFamilyCode();
    await this.startFamily(code);
    if (oldKeys) await this.deleteFamilyDocs(oldKeys).catch(() => undefined);
    return code;
  }

  private async startFamily(code: string) {
    this.api();
    const keys = await deriveFamily(code);
    const d = this.deps.getData();
    await this.deps.secrets.set({ code, refreshToken: (await this.deps.secrets.get())?.refreshToken });
    this.keys = keys;
    // всё, что есть на устройстве, — его вклад; его настройки главнее настроек по умолчанию на новых устройствах
    this.deps.setMeta({ deviceId: d.sync?.deviceId ?? randomId(), familyId: keys.familyId, baseline: {}, stamps: founderStamps(d.sync?.stamps ?? {}), removed: d.sync?.removed ?? [] });
    await this.syncNow();
    if (useSyncStatus.getState().state === 'error') throw new SyncError('error', useSyncStatus.getState().message);
  }

  /** Проверить код перед подключением: есть ли такая семья, было ли это устройство в ней. */
  async checkCode(input: string): Promise<FamilyCheck> {
    const code = normalizeCode(input);
    if (!code) throw new SyncError('error', 'Код набран не полностью или с ошибкой');
    const keys = await deriveFamily(code);
    const docs = await this.api().listDevices(keys.familyId);
    const d = this.deps.getData();
    const known = !!d.sync && d.sync.familyId === keys.familyId && docs.some((x) => x.id === d.sync!.deviceId);
    return { exists: docs.length > 0, devices: docs.length, known, localProgress: hasProgress(d) };
  }

  /**
   * Подключиться к семье по коду.
   * resume — устройство уже было в этой семье; add — прибавить прогресс устройства к общему;
   * replace — прогресс этого устройства заменить общим (то, что было на устройстве, не считается).
   */
  async join(input: string, mode: JoinMode): Promise<void> {
    const code = normalizeCode(input);
    if (!code) throw new SyncError('error', 'Код набран не полностью или с ошибкой');
    const keys = await deriveFamily(code);
    const cur = await this.deps.secrets.get();
    await this.deps.secrets.set({ code: formatCode(code), refreshToken: cur?.refreshToken });
    this.keys = keys;
    const d = this.deps.getData();
    const deviceId = d.sync?.deviceId ?? randomId();
    if (mode === 'resume' && d.sync?.familyId === keys.familyId) {
      // как было: свой вклад и вклады других уже известны
    } else if (mode === 'replace') {
      const fresh = merge(null);
      const keep = { theme: d.settings.theme, fontScale: d.settings.fontScale, sound: d.settings.sound };
      this.deps.applyData({ ...fresh, settings: { ...fresh.settings, ...keep }, sync: { deviceId, familyId: keys.familyId, baseline: {}, stamps: {}, removed: [] } });
    } else {
      this.deps.setMeta({ deviceId, familyId: keys.familyId, baseline: {}, stamps: {}, removed: d.sync?.removed ?? [] });
    }
    await this.syncNow();
  }

  /**
   * Отключить синхронизацию на этом устройстве. Прогресс на устройстве остаётся.
   * deleteCloud — удалить документы всей семьи из облака (на других устройствах прогресс тоже останется, но обмен прекратится).
   */
  async disconnect(deleteCloud: boolean): Promise<void> {
    const keys = await this.family().catch(() => null);
    if (deleteCloud && keys) await this.deleteFamilyDocs(keys);
    if (this.configured) await this.api().deleteAccount().catch(() => undefined);
    await this.deps.secrets.set(null);
    this.keys = null;
    this.client = null;
    const meta = this.deps.getData().sync;
    // номер устройства и вклады помним: при повторном подключении к той же семье ничего не удвоится
    if (deleteCloud) this.deps.setMeta(undefined);
    else if (meta) this.deps.setMeta({ ...meta });
    this.status({ state: 'off', message: '', devices: 0 });
  }

  private async deleteFamilyDocs(keys: FamilyKeys) {
    const docs = await this.api().listDevices(keys.familyId);
    for (const d of docs) await this.api().deleteDevice(keys.familyId, d.id);
  }

  /** Показать семейный код ещё раз (в родительском режиме). */
  async code(): Promise<string | null> {
    const s = await this.deps.secrets.get();
    return s?.code ? formatCode(normalizeCode(s.code) ?? s.code) : null;
  }
}

/** Прогресс с устройства, где стоит старая версия уроков: сбросить отметки переписанных тем (как при обновлении). */
function prepare(p: SyncPayload): SyncPayload {
  if ((p.data.contentRev ?? 0) >= CONTENT_REV) return p;
  return { ...p, data: resetRewrittenTopics({ ...merge(null), ...p.data } as Data) };
}

export function newerVersion(theirs: string | undefined, mine: string): boolean {
  if (!theirs) return false;
  const a = theirs.split('.').map(Number); const b = mine.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((a[i] ?? 0) > (b[i] ?? 0)) return true; if ((a[i] ?? 0) < (b[i] ?? 0)) return false; }
  return false;
}
