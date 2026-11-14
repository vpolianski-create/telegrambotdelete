import { describe, expect, it } from 'vitest';
import { createFileStore, type MiniFs } from '../src/platform/fileStore';

/** Файловая система в памяти. strictRename — как на Android: переименование поверх файла запрещено. */
function memFs(strictRename = false) {
  const files = new Map<string, string>();
  const fs: MiniFs = {
    read: async (p) => files.get(p) ?? null,
    write: async (p, t) => { files.set(p, t); },
    rename: async (a, b) => {
      if (!files.has(a)) throw new Error('нет файла');
      if (strictRename && files.has(b)) throw new Error('файл уже есть');
      files.set(b, files.get(a)!); files.delete(a);
    },
    remove: async (p) => { files.delete(p); },
    list: async (dir) => [...files.keys()].filter((k) => k.startsWith(dir + '/')).map((k) => k.slice(dir.length + 1)),
  };
  return { fs, files };
}

describe('файл прогресса на Android', () => {
  it('записал — прочитал (и поверх старого файла тоже)', async () => {
    const { fs } = memFs(true);
    const s = createFileStore(fs);
    expect(await s.load()).toBeNull();
    await s.save({ points: 1 });
    await s.save({ points: 2 });
    expect(await s.load()).toEqual({ points: 2 });
  });

  it('частые записи: на диске оказывается последняя', async () => {
    const { fs } = memFs();
    const s = createFileStore(fs);
    await Promise.all([1, 2, 3, 4, 5].map((n) => s.save({ points: n })));
    expect(await s.load()).toEqual({ points: 5 });
  });

  it('резервные копии при запуске: хранятся последние 7', async () => {
    const { fs, files } = memFs();
    const s = createFileStore(fs);
    await s.save({ points: 1 });
    for (let i = 0; i < 10; i++) {
      files.set(`backups/2026-01-${String(i + 10)}-data.json`, '{"points":0}');
    }
    await s.backupOnStart();
    expect([...files.keys()].filter((k) => k.startsWith('backups/'))).toHaveLength(7);
  });

  it('повреждённый файл: откладывается, данные берутся из свежей копии', async () => {
    const { fs, files } = memFs();
    files.set('backups/2026-01-01-data.json', '{"points":10}');
    files.set('backups/2026-01-02-data.json', '{"points":20}');
    files.set('backups/2026-01-03-data.json', '{испорчено');
    files.set('data.json', '{испорчено');
    const s = createFileStore(fs);
    expect(await s.load()).toEqual({ points: 20 });
    expect([...files.keys()].some((k) => k.startsWith('data.json.corrupt-'))).toBe(true);
    expect(JSON.parse(files.get('data.json')!)).toEqual({ points: 20 });
  });

  it('запись прервалась после удаления старого файла: берётся временный', async () => {
    const { fs, files } = memFs();
    files.set('data.json.tmp', '{"points":42}');
    const s = createFileStore(fs);
    expect(await s.load()).toEqual({ points: 42 });
    expect(files.get('data.json')).toBe('{"points":42}');
  });

  it('испорченный файл в резервную копию не попадает', async () => {
    const { fs, files } = memFs();
    files.set('data.json', '{испорчено');
    await createFileStore(fs).backupOnStart();
    expect([...files.keys()].filter((k) => k.startsWith('backups/'))).toHaveLength(0);
  });
});
