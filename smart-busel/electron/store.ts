import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const file = (name: string) => path.join(app.getPath('userData'), name);

export function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file(name), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

/** Атомарная запись: сначала во временный файл, потом переименование. */
export function writeJson(name: string, data: unknown): void {
  const target = file(name);
  const tmp = target + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, target);
}

/** Резервная копия при запуске; хранятся последние 7. */
export function backupOnStart(name: string): void {
  const src = file(name);
  if (!fs.existsSync(src)) return;
  const dir = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(src, path.join(dir, `${stamp}-${name}`));
  const old = fs.readdirSync(dir).filter((f) => f.endsWith(name)).sort().slice(0, -7);
  old.forEach((f) => fs.unlinkSync(path.join(dir, f)));
}
