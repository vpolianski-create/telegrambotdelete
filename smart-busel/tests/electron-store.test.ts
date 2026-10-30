import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let dir = '';
vi.mock('electron', () => ({ app: { getPath: () => dir } }));

const store = () => import('../electron/store');

beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'busel-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); vi.useRealTimers(); });

describe('файл прогресса на диске (electron/store.ts)', () => {
  it('записывает и читает обратно, русские буквы целы', async () => {
    const { readJson, writeJson } = await store();
    writeJson('data.json', { points: 120, name: 'Женя', ў: 'і' });
    expect(readJson('data.json', null)).toEqual({ points: 120, name: 'Женя', ў: 'і' });
  });
  it('запись атомарная: временного файла после записи не остаётся', async () => {
    const { writeJson } = await store();
    writeJson('data.json', { a: 1 });
    expect(fs.readdirSync(dir)).toEqual(['data.json']);
  });
  it('файла нет — вернётся значение по умолчанию', async () => {
    const { readJson } = await store();
    expect(readJson('data.json', null)).toBeNull();
    expect(readJson('data.json', { x: 1 })).toEqual({ x: 1 });
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: повреждённый файл молча читается как «файла нет»', async () => {
    const { readJson } = await store();
    fs.writeFileSync(path.join(dir, 'data.json'), '{"points": 120, "rewa');
    expect(readJson('data.json', null)).toBeNull();
  });
  it('резервная копия при запуске создаётся; без файла — ничего не делает и не падает', async () => {
    const { backupOnStart, writeJson } = await store();
    expect(() => backupOnStart('data.json')).not.toThrow();
    expect(fs.existsSync(path.join(dir, 'backups'))).toBe(false);
    writeJson('data.json', { points: 5 });
    backupOnStart('data.json');
    const files = fs.readdirSync(path.join(dir, 'backups'));
    expect(files).toHaveLength(1);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'backups', files[0]), 'utf8'))).toEqual({ points: 5 });
  });
  it('хранятся только 7 последних копий, самые старые удаляются', async () => {
    const { backupOnStart, writeJson } = await store();
    vi.useFakeTimers({ toFake: ['Date'] });
    writeJson('data.json', { n: 0 });
    for (let day = 1; day <= 10; day++) {
      vi.setSystemTime(new Date(`2026-03-${String(day).padStart(2, '0')}T10:00:00Z`));
      writeJson('data.json', { n: day });
      backupOnStart('data.json');
    }
    const files = fs.readdirSync(path.join(dir, 'backups')).sort();
    expect(files).toHaveLength(7);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'backups', files[0]), 'utf8')).n).toBe(4);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'backups', files[6]), 'utf8')).n).toBe(10);
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: испорченный файл тоже попадает в копии и вытесняет хорошие', async () => {
    const { backupOnStart, writeJson } = await store();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'));
    writeJson('data.json', { points: 500 });
    backupOnStart('data.json'); // хорошая копия
    for (let day = 2; day <= 9; day++) {
      vi.setSystemTime(new Date(`2026-03-0${day}T10:00:00Z`));
      fs.writeFileSync(path.join(dir, 'data.json'), '{ испорчено');
      backupOnStart('data.json');
    }
    const good = fs.readdirSync(path.join(dir, 'backups')).filter((f) => {
      try { JSON.parse(fs.readFileSync(path.join(dir, 'backups', f), 'utf8')); return true; } catch { return false; }
    });
    expect(good).toHaveLength(0); // ни одной рабочей копии не осталось
  });
});
