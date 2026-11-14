import { describe, expect, it } from 'vitest';
import { merge, type Data } from '../src/store/useApp';
import { SyncService, useSyncStatus, type SyncSecrets } from '../src/sync/service';
import { deriveFamily, generateFamilyCode, normalizeCode, open, seal } from '../src/sync/crypto';
import type { SyncMeta } from '../src/sync/merge';

/** Поддельное облако Firebase: отвечает на те же адреса, что и настоящее, и хранит документы в памяти. */
function fakeCloud() {
  const docs = new Map<string, Record<string, { stringValue?: string; integerValue?: string; timestampValue?: string }>>();
  let users = 0;
  const tokens = new Set<string>();
  const seen: string[] = [];
  let offline = false;
  const fetchFn = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    if (offline) throw new TypeError('Failed to fetch');
    const url = String(input);
    seen.push(`${init.method ?? 'GET'} ${url}`);
    const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
    if (url.includes('accounts:signUp')) { users++; const t = `id${users}`; tokens.add(t); return json({ idToken: t, refreshToken: `rt${users}`, expiresIn: '3600', localId: `u${users}` }); }
    if (url.includes('securetoken')) { const rt = new URLSearchParams(String(init.body)).get('refresh_token')!; const t = `id-${rt}`; tokens.add(t); return json({ id_token: t, refresh_token: rt, expires_in: '3600' }); }
    if (url.includes('accounts:delete')) return json({});
    const auth = (init.headers as Record<string, string>)?.Authorization?.replace('Bearer ', '');
    if (!auth || !tokens.has(auth)) return json({ error: 'unauth' }, 403);
    const path = decodeURIComponent(url.split('/documents/')[1].split('?')[0]);
    if ((init.method ?? 'GET') === 'GET') {
      const prefix = path + '/';
      const list = [...docs].filter(([k]) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
        .map(([k, fields]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields }));
      return json(list.length ? { documents: list } : {});
    }
    if (init.method === 'PATCH') { docs.set(path, JSON.parse(String(init.body)).fields); return json({}); }
    if (init.method === 'DELETE') { docs.delete(path); return json({}); }
    return json({}, 404);
  };
  return { docs, fetchFn, seen, users: () => users, setOffline: (v: boolean) => { offline = v; } };
}

/** Устройство: свой «диск» с прогрессом и секретами + служба синхронизации. */
function device(cloud: ReturnType<typeof fakeCloud>, data: Partial<Data> = {}) {
  const state = { data: { ...merge(null), ...data } as Data, secrets: null as SyncSecrets | null };
  const svc = new SyncService({
    config: { apiKey: 'AIzaTestKey_0123456789abcdef', projectId: 'busel-test' },
    secrets: { get: async () => state.secrets, set: async (s) => { state.secrets = s; } },
    getData: () => state.data,
    applyData: (d) => { state.data = d; },
    setMeta: (m?: SyncMeta) => { state.data = { ...state.data, sync: m }; },
    appVersion: '1.7.0',
    fetch: cloud.fetchFn as typeof fetch,
  });
  return { state, svc, earn: (n: number) => { state.data = { ...state.data, points: state.data.points + n }; } };
}

describe('служба синхронизации (поддельное облако)', () => {
  it('компьютер создаёт семью, телефон подключается по коду — баллы общие', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 120 });
    const code = await pc.svc.createFamily();
    expect(normalizeCode(code)).not.toBeNull();

    const phone = device(cloud);
    const check = await phone.svc.checkCode(code);
    expect(check).toMatchObject({ exists: true, devices: 1, known: false, localProgress: false });
    await phone.svc.join(code, 'add');
    expect(phone.state.data.points).toBe(120);

    phone.earn(15); await phone.svc.syncNow();
    pc.earn(5); await pc.svc.syncNow();
    await phone.svc.syncNow();
    expect(pc.state.data.points).toBe(140);
    expect(phone.state.data.points).toBe(140);
    expect(useSyncStatus.getState()).toMatchObject({ state: 'idle', devices: 2 });
  });

  it('в облаке только шифр: ни имени, ни PIN, ни баллов открытым текстом', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 777, settings: { ...merge(null).settings, name: 'Женя', pin: '4321' } });
    await pc.svc.createFamily();
    const stored = JSON.stringify([...cloud.docs]);
    expect(stored).not.toContain('Женя');
    expect(stored).not.toContain('4321');
    expect(stored).not.toContain('777');
    // в адресах — только номера из 32 знаков, сам код туда не попадает
    const code = (await pc.svc.code())!;
    expect(cloud.seen.join('\n')).not.toContain(normalizeCode(code)!);
  });

  it('неверный код: семья не найдена', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud); await pc.svc.createFamily();
    const phone = device(cloud);
    const check = await phone.svc.checkCode(generateFamilyCode());
    expect(check.exists).toBe(false);
    await expect(phone.svc.checkCode('ABC')).rejects.toThrow();
  });

  it('подключение с заменой: прогресс телефона заменяется общим и не прибавляется', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 200 }); const code = await pc.svc.createFamily();
    const phone = device(cloud, { points: 200 }); // например, раньше загрузили копию с компьютера
    const check = await phone.svc.checkCode(code);
    expect(check.localProgress).toBe(true);
    await phone.svc.join(code, 'replace');
    expect(phone.state.data.points).toBe(200);
    await pc.svc.syncNow();
    expect(pc.state.data.points).toBe(200);
  });

  it('повторное подключение того же устройства ничего не удваивает', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 50 }); const code = await pc.svc.createFamily();
    const phone = device(cloud); await phone.svc.join(code, 'add');
    phone.earn(10); await phone.svc.syncNow();
    await phone.svc.disconnect(false);
    expect(await phone.svc.enabled()).toBe(false);
    const check = await phone.svc.checkCode(code);
    expect(check.known).toBe(true);
    await phone.svc.join(code, 'resume');
    await pc.svc.syncNow();
    expect(phone.state.data.points).toBe(60);
    expect(pc.state.data.points).toBe(60);
  });

  it('нет интернета — прогресс не теряется, статус «синхронизируем позже»', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 5 }); await pc.svc.createFamily();
    cloud.setOffline(true);
    pc.earn(5); await pc.svc.syncNow();
    expect(useSyncStatus.getState().state).toBe('offline');
    expect(pc.state.data.points).toBe(10);
    cloud.setOffline(false);
    await pc.svc.syncNow();
    expect(useSyncStatus.getState().state).toBe('idle');
  });

  it('удалить данные из облака: документы семьи исчезают, синхронизация выключена', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 5 }); await pc.svc.createFamily();
    expect(cloud.docs.size).toBe(1);
    await pc.svc.disconnect(true);
    expect(cloud.docs.size).toBe(0);
    expect(pc.state.secrets).toBeNull();
    expect(pc.state.data.sync).toBeUndefined();
    expect(pc.state.data.points).toBe(5);
  });

  it('новый код: старый код больше не работает, прогресс переносится', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 30 }); const old = await pc.svc.createFamily();
    const fresh = await pc.svc.changeCode();
    expect(fresh).not.toBe(old);
    const thief = device(cloud);
    expect((await thief.svc.checkCode(old)).exists).toBe(false);
    const phone = device(cloud); await phone.svc.join(fresh, 'add');
    expect(phone.state.data.points).toBe(30);
  });

  it('подменённый документ в облаке отбрасывается, а не ломает прогресс', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 10 }); const code = await pc.svc.createFamily();
    const keys = await deriveFamily(code);
    // злоумышленник без ключа кладёт свой документ
    const fake = await seal(await deriveFamily(generateFamilyCode()), 'b'.repeat(32), { v: 1, deviceId: 'b'.repeat(32), own: { points: 100000 } });
    cloud.docs.set(`families/${keys.familyId}/devices/${'b'.repeat(32)}`, { iv: { stringValue: fake.iv }, ct: { stringValue: fake.ct } });
    await pc.svc.syncNow();
    expect(pc.state.data.points).toBe(10);
  });

  it('шифр привязан к устройству: документ, переложенный под чужой номер, не расшифровывается', async () => {
    const keys = await deriveFamily(generateFamilyCode());
    const s = await seal(keys, 'a'.repeat(32), { hello: 1 });
    await expect(open(keys, 'a'.repeat(32), s)).resolves.toEqual({ hello: 1 });
    await expect(open(keys, 'b'.repeat(32), s)).rejects.toThrow();
  });

  it('пропуск входа сохраняется: при следующих синхронизациях новый пользователь не создаётся', async () => {
    const cloud = fakeCloud();
    const pc = device(cloud, { points: 1 }); await pc.svc.createFamily();
    const before = cloud.users();
    const again = new SyncService({
      config: { apiKey: 'AIzaTestKey_0123456789abcdef', projectId: 'busel-test' },
      secrets: { get: async () => pc.state.secrets, set: async (s) => { pc.state.secrets = s; } },
      getData: () => pc.state.data, applyData: (d) => { pc.state.data = d; }, setMeta: () => undefined,
      appVersion: '1.7.0', fetch: cloud.fetchFn as typeof fetch,
    });
    await again.syncNow();
    expect(cloud.users()).toBe(before);
  });
});

describe('семейный код', () => {
  it('20 знаков без похожих букв, каждый раз новый', () => {
    const a = generateFamilyCode(); const b = generateFamilyCode();
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){4}$/);
    expect(a).not.toBe(b);
  });
  it('пробелы, строчные буквы, O вместо 0 и I вместо 1 не мешают', () => {
    const code = '0123-4567-89AB-CDEF-GHJK';
    expect(normalizeCode(' o123 4567 89ab cdef ghjk ')).toBe(normalizeCode(code));
    expect(normalizeCode('I123456789ABCDEFGHJK')).toBe('1123456789ABCDEFGHJK');
    expect(normalizeCode('0123-4567-89AB-CDEF-GHJ')).toBeNull();
    expect(normalizeCode('0123-4567-89AB-CDEF-GHJU')).toBeNull();
  });
  it('один и тот же код → один и тот же номер семьи; разные коды → разные номера', async () => {
    const c = generateFamilyCode();
    expect((await deriveFamily(c)).familyId).toBe((await deriveFamily(c.toLowerCase())).familyId);
    expect((await deriveFamily(c)).familyId).not.toBe((await deriveFamily(generateFamilyCode())).familyId);
    expect((await deriveFamily(c)).familyId).toMatch(/^[0-9a-f]{32}$/);
  });
});
