import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let dir = '';
let available = true;
// «шифрование Windows»: в тесте — обратимое преобразование, чтобы проверить, что открытого текста в файле нет
vi.mock('electron', () => ({
  app: { getPath: () => dir },
  safeStorage: {
    isEncryptionAvailable: () => available,
    encryptString: (s: string) => Buffer.from(Buffer.from(s, 'utf8').map((b) => b ^ 0x5a)),
    decryptString: (b: Buffer) => Buffer.from(b.map((x) => x ^ 0x5a)).toString('utf8'),
  },
}));
const secret = () => import('../electron/secret');

beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'busel-secret-')); available = true; });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('секреты синхронизации на Windows (electron/secret.ts)', () => {
  it('сохраняются зашифрованными и читаются обратно', async () => {
    const { getSecret, setSecret } = await secret();
    expect(getSecret()).toBeNull();
    setSecret('{"code":"ABCD-EFGH"}');
    expect(getSecret()).toBe('{"code":"ABCD-EFGH"}');
    expect(fs.readFileSync(path.join(dir, 'sync-secret.bin')).toString('utf8')).not.toContain('ABCD');
  });
  it('null — файл удаляется', async () => {
    const { getSecret, setSecret } = await secret();
    setSecret('x'); setSecret(null);
    expect(getSecret()).toBeNull();
    expect(fs.existsSync(path.join(dir, 'sync-secret.bin'))).toBe(false);
  });
  it('не строка или слишком длинное — отказ', async () => {
    const { setSecret } = await secret();
    expect(() => setSecret(42)).toThrow();
    expect(() => setSecret('x'.repeat(20_000))).toThrow();
  });
  it('без хранилища ключей — запасной вариант, но всё работает', async () => {
    available = false;
    const { getSecret, setSecret } = await secret();
    setSecret('abc');
    expect(getSecret()).toBe('abc');
  });
});
