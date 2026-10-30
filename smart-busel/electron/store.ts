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

const isValidJson = (p: string): boolean => {
  try { JSON.parse(fs.readFileSync(p, 'utf8')); return true; } catch { return false; }
};

/** Резервная копия при запуске; хранятся последние 7. Повреждённый файл в копии не берём. */
export function backupOnStart(name: string): void {
  const src = file(name);
  if (!fs.existsSync(src) || !isValidJson(src)) return;
  const dir = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(src, path.join(dir, `${stamp}-${name}`));
  const old = fs.readdirSync(dir).filter((f) => f.endsWith(name)).sort().slice(0, -7);
  old.forEach((f) => fs.unlinkSync(path.join(dir, f)));
}

/**
 * Чтение прогресса с защитой от повреждения.
 * Файла нет — null. Файл повреждён — он откладывается как `<имя>.corrupt-<время>` (не затирается),
 * а данные берутся из самой свежей рабочей копии в backups и записываются обратно.
 */
export function loadData<T>(name: string): T | null {
  const src = file(name);
  if (!fs.existsSync(src)) return null;
  if (isValidJson(src)) return readJson<T | null>(name, null);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.renameSync(src, `${src}.corrupt-${stamp}`);
  const dir = path.join(app.getPath('userData'), 'backups');
  const copies = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(name)).sort().reverse() : [];
  for (const f of copies) {
    const p = path.join(dir, f);
    if (!isValidJson(p)) continue;
    const data = JSON.parse(fs.readFileSync(p, 'utf8')) as T;
    writeJson(name, data);
    return data;
  }
  return null;
}
