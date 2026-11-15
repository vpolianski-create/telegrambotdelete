/**
 * Связь с Firebase (Google) напрямую через REST — без библиотеки Firebase.
 * Используются только три службы Google:
 *  - identitytoolkit / securetoken — анонимный вход (без почты и паролей; нужен, чтобы база пускала только приложение);
 *  - firestore — хранение зашифрованных документов: families/{семья}/devices/{устройство}.
 * Правила доступа к базе — в файле firestore.rules (в корне smart-busel).
 */
import type { Sealed } from './crypto';

export interface FirebaseConfig { apiKey: string; projectId: string }

/** Разрешённые адреса (их же пропускает политика безопасности страницы). */
export const FIREBASE_HOSTS = ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://firestore.googleapis.com'];

export type SyncErrorKind = 'offline' | 'denied' | 'quota' | 'config' | 'error';
export class SyncError extends Error {
  constructor(public kind: SyncErrorKind, message: string) { super(message); }
}

export interface DeviceDoc extends Sealed { id: string; at?: string }

type Fetch = typeof fetch;

/** Сохранённый «пропуск» анонимного входа (refresh-токен), чтобы не создавать нового пользователя при каждом запуске. */
export interface AuthStore { get(): Promise<string | null>; set(token: string | null): Promise<void> }

export class FirebaseClient {
  private idToken = '';
  private expiresAt = 0;

  constructor(private cfg: FirebaseConfig, private auth: AuthStore, private http: Fetch = (...a) => fetch(...a)) {
    if (!/^[A-Za-z0-9_-]{20,60}$/.test(cfg.apiKey) || !/^[a-z0-9-]{4,40}$/.test(cfg.projectId)) throw new SyncError('config', 'Firebase не настроен');
  }

  private async call(url: string, init: RequestInit): Promise<Response> {
    let res: Response;
    try {
      res = await this.http(url, { ...init, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    } catch {
      throw new SyncError('offline', 'Нет связи с интернетом');
    }
    if (res.ok) return res;
    if (res.status === 401 || res.status === 403) throw new SyncError('denied', `Доступ запрещён (${res.status})`);
    if (res.status === 429) throw new SyncError('quota', 'Слишком много запросов, попробуем позже');
    if (res.status === 400 && url.includes('key=')) {
      const text = await res.text().catch(() => '');
      if (/API_KEY|API key/i.test(text)) throw new SyncError('config', 'Неверный ключ Firebase');
      if (/TOKEN_EXPIRED|INVALID_REFRESH_TOKEN|USER_NOT_FOUND|USER_DISABLED/.test(text)) throw new SyncError('denied', 'Вход устарел');
      throw new SyncError('error', `Ошибка входа (${res.status})`);
    }
    throw new SyncError(res.status >= 500 ? 'offline' : 'error', `Ошибка сервера (${res.status})`);
  }

  /** Действующий токен: из памяти, по сохранённому пропуску или новый анонимный вход. */
  async token(): Promise<string> {
    if (this.idToken && Date.now() < this.expiresAt - 60_000) return this.idToken;
    const saved = await this.auth.get();
    if (saved) {
      try {
        const r = await this.call(`https://securetoken.googleapis.com/v1/token?key=${this.cfg.apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: saved }).toString(),
        });
        const j = await r.json() as { id_token: string; refresh_token: string; expires_in: string };
        return this.remember(j.id_token, j.refresh_token, j.expires_in);
      } catch (e) {
        if (!(e instanceof SyncError) || e.kind !== 'denied') throw e;
        await this.auth.set(null); // пропуск больше не действует — войдём заново
      }
    }
    const r = await this.call(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.cfg.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
    });
    const j = await r.json() as { idToken: string; refreshToken: string; expiresIn: string };
    return this.remember(j.idToken, j.refreshToken, j.expiresIn);
  }

  private async remember(idToken: string, refresh: string, expiresIn: string): Promise<string> {
    this.idToken = idToken;
    this.expiresAt = Date.now() + Number(expiresIn || '3600') * 1000;
    await this.auth.set(refresh);
    return idToken;
  }

  private docs(path: string) {
    return `https://firestore.googleapis.com/v1/projects/${this.cfg.projectId}/databases/(default)/documents/${path}`;
  }
  private async authed(url: string, init: RequestInit = {}) {
    const t = await this.token();
    return this.call(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${t}` } });
  }

  async listDevices(familyId: string): Promise<DeviceDoc[]> {
    check(familyId);
    const out: DeviceDoc[] = [];
    let page = '';
    for (let i = 0; i < 10; i++) {
      const r = await this.authed(`${this.docs(`families/${familyId}/devices`)}?pageSize=50${page ? `&pageToken=${encodeURIComponent(page)}` : ''}`);
      const j = await r.json() as { documents?: { name: string; fields?: Record<string, { stringValue?: string; timestampValue?: string }> }[]; nextPageToken?: string };
      for (const d of j.documents ?? []) {
        const f = d.fields ?? {};
        if (f.iv?.stringValue && f.ct?.stringValue) out.push({ id: d.name.split('/').pop()!, iv: f.iv.stringValue, ct: f.ct.stringValue, at: f.at?.timestampValue });
      }
      if (!j.nextPageToken) break;
      page = j.nextPageToken;
    }
    return out;
  }

  async putDevice(familyId: string, deviceId: string, s: Sealed): Promise<void> {
    check(familyId); check(deviceId);
    await this.authed(this.docs(`families/${familyId}/devices/${deviceId}`), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { v: { integerValue: '1' }, iv: { stringValue: s.iv }, ct: { stringValue: s.ct }, at: { timestampValue: new Date().toISOString() } } }),
    });
  }

  async deleteDevice(familyId: string, deviceId: string): Promise<void> {
    check(familyId); check(deviceId);
    await this.authed(this.docs(`families/${familyId}/devices/${deviceId}`), { method: 'DELETE' });
  }

  /** Удалить анонимного пользователя (при отключении синхронизации). Ошибки не важны. */
  async deleteAccount(): Promise<void> {
    try {
      const t = await this.token();
      await this.call(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${this.cfg.apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: t }),
      });
    } catch { /* не страшно */ }
    this.idToken = '';
    await this.auth.set(null);
  }
}

/** Номера семьи и устройства — только 32 шестнадцатеричных знака (ничего лишнего в адрес не попадёт). */
function check(id: string) {
  if (!/^[0-9a-f]{32}$/.test(id)) throw new SyncError('error', 'Неверный номер');
}
