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
  it('испорченный файл в копии не попадает: рабочие копии не вытесняются', async () => {
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
    const files = fs.readdirSync(path.join(dir, 'backups'));
    expect(files).toHaveLength(1);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'backups', files[0]), 'utf8'))).toEqual({ points: 500 });
  });
});

describe('загрузка прогресса с восстановлением (loadData)', () => {
  it('исправный файл читается как есть', async () => {
    const { loadData, writeJson } = await store();
    writeJson('data.json', { points: 70 });
    expect(loadData('data.json')).toEqual({ points: 70 });
  });
  it('файла нет — null, ничего не создаётся', async () => {
    const { loadData } = await store();
    expect(loadData('data.json')).toBeNull();
    expect(fs.readdirSync(dir)).toEqual([]);
  });
  it('повреждённый файл: прогресс берётся из последней рабочей копии, сам файл сохраняется рядом', async () => {
    const { loadData, backupOnStart, writeJson } = await store();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'));
    writeJson('data.json', { points: 100 });
    backupOnStart('data.json');
    vi.setSystemTime(new Date('2026-03-02T10:00:00Z'));
    writeJson('data.json', { points: 250 });
    backupOnStart('data.json');
    fs.writeFileSync(path.join(dir, 'data.json'), '{"points": 3');
    expect(loadData('data.json')).toEqual({ points: 250 });
    const corrupt = fs.readdirSync(dir).filter((f) => f.startsWith('data.json.corrupt-'));
    expect(corrupt).toHaveLength(1);
    expect(fs.readFileSync(path.join(dir, corrupt[0]), 'utf8')).toBe('{"points": 3');
  });
  it('после восстановления data.json снова исправный (не затирается пустыми данными)', async () => {
    const { loadData, backupOnStart, writeJson, readJson } = await store();
    writeJson('data.json', { points: 40 });
    backupOnStart('data.json');
    fs.writeFileSync(path.join(dir, 'data.json'), 'мусор');
    loadData('data.json');
    expect(readJson('data.json', null)).toEqual({ points: 40 });
  });
  it('повреждён файл и рабочих копий нет — null, но испорченный файл не удаляется', async () => {
    const { loadData } = await store();
    fs.writeFileSync(path.join(dir, 'data.json'), '{ x');
    expect(loadData('data.json')).toBeNull();
    expect(fs.readdirSync(dir).some((f) => f.startsWith('data.json.corrupt-'))).toBe(true);
  });
  it('в копиях есть испорченные: берётся самая свежая из рабочих', async () => {
    const { loadData } = await store();
    const b = path.join(dir, 'backups');
    fs.mkdirSync(b);
    fs.writeFileSync(path.join(b, '2026-03-01T10-00-00-000Z-data.json'), '{"points": 1}');
    fs.writeFileSync(path.join(b, '2026-03-02T10-00-00-000Z-data.json'), '{"points": 2}');
    fs.writeFileSync(path.join(b, '2026-03-03T10-00-00-000Z-data.json'), '{ битая');
    fs.writeFileSync(path.join(dir, 'data.json'), '');
    expect(loadData('data.json')).toEqual({ points: 2 });
  });
});
