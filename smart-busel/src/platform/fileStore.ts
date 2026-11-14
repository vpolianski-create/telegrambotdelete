/**
 * Файл прогресса на Android (та же логика, что electron/store.ts на Windows):
 * - запись через временный файл (если программа закроется посреди записи, старый файл цел);
 * - при запуске — резервная копия, хранятся последние 7;
 * - повреждённый файл откладывается в сторону, данные берутся из самой свежей рабочей копии.
 * Файловая система подставляется снаружи (Capacitor Filesystem в приложении, память — в тестах).
 */
export interface MiniFs {
  read(path: string): Promise<string | null>;
  write(path: string, text: string): Promise<void>;
  rename(from: string, to: string): Promise<void>;
  remove(path: string): Promise<void>;
  list(dir: string): Promise<string[]>;
}

const valid = (text: string | null): text is string => {
  if (text === null) return false;
  try { JSON.parse(text); return true; } catch { return false; }
};
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

export function createFileStore(fs: MiniFs, name = 'data.json', keep = 7) {
  const tmp = `${name}.tmp`;
  let queue: Promise<void> = Promise.resolve();
  let pending: unknown;
  let hasPending = false;

  async function write(data: unknown) {
    await fs.write(tmp, JSON.stringify(data));
    try {
      await fs.rename(tmp, name);
    } catch {
      // на некоторых системах переименование поверх существующего файла запрещено
      await fs.remove(name).catch(() => undefined);
      await fs.rename(tmp, name);
    }
  }

  return {
    /** Резервная копия при запуске; хранятся последние `keep`. Повреждённый файл в копию не берём. */
    async backupOnStart(): Promise<void> {
      const text = await fs.read(name);
      if (!valid(text)) return;
      await fs.write(`backups/${stamp()}-${name}`, text);
      const old = (await fs.list('backups')).filter((f) => f.endsWith(name)).sort().slice(0, -keep);
      for (const f of old) await fs.remove(`backups/${f}`);
    },

    async load(): Promise<unknown> {
      const text = await fs.read(name);
      if (valid(text)) return JSON.parse(text);
      // запись прервалась: файл исчез или испорчен, но временный цел
      const t = await fs.read(tmp);
      if (valid(t)) { await write(JSON.parse(t)); return JSON.parse(t); }
      if (text === null) return null;
      await fs.write(`${name}.corrupt-${stamp()}`, text);
      const copies = (await fs.list('backups')).filter((f) => f.endsWith(name)).sort().reverse();
      for (const f of copies) {
        const c = await fs.read(`backups/${f}`);
        if (!valid(c)) continue;
        await write(JSON.parse(c));
        return JSON.parse(c);
      }
      return null;
    },

    /** Записи идут строго по очереди; если пока шла запись пришло несколько новых — пишется только последняя. */
    save(data: unknown): Promise<void> {
      pending = data;
      if (hasPending) return queue;
      hasPending = true;
      queue = queue.then(async () => {
        hasPending = false;
        await write(pending);
      }).catch(() => undefined);
      return queue;
    },
  };
}
