import { app, safeStorage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Секреты синхронизации (семейный код, пропуск входа) — в отдельном файле, зашифрованном средствами Windows (DPAPI):
 * прочитать его может только эта учётная запись Windows. В резервные копии прогресса и в файл экспорта он не попадает.
 */
const FILE = 'sync-secret.bin';
const PLAIN = Buffer.from('PLAIN1:');
const file = () => path.join(app.getPath('userData'), FILE);

export function getSecret(): string | null {
  try {
    if (!fs.existsSync(file())) return null;
    const buf = fs.readFileSync(file());
    if (buf.subarray(0, PLAIN.length).equals(PLAIN)) return buf.subarray(PLAIN.length).toString('utf8');
    return safeStorage.decryptString(buf);
  } catch {
    return null;
  }
}

export function setSecret(value: unknown): void {
  if (value === null) { fs.rmSync(file(), { force: true }); return; }
  if (typeof value !== 'string' || value.length > 10_000) throw new Error('bad secret');
  // шифрование Windows доступно всегда; запасной вариант — для систем без хранилища ключей
  const data = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(value) : Buffer.concat([PLAIN, Buffer.from(value, 'utf8')]);
  const tmp = file() + '.tmp';
  fs.writeFileSync(tmp, data, { mode: 0o600 });
  fs.renameSync(tmp, file());
}
