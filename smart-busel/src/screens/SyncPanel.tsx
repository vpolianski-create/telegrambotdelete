import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { formatCode, normalizeCode } from '../sync/crypto';
import { SyncError } from '../sync/firebase';
import type { FamilyCheck } from '../sync/service';
import { syncService } from '../sync';
import { useSyncStatus } from '../sync/service';
import { useApp } from '../store/useApp';
import { platformName } from '../platform';

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl3 bg-card p-5 shadow">
    <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
    {children}
  </section>
);
const btn = 'min-h-touch rounded-xl2 px-5 font-bold disabled:opacity-40';

const errorText = (e: unknown) => (e instanceof SyncError ? e.message : 'Что-то пошло не так. Попробуйте ещё раз.');
const timeText = (iso?: string) => {
  if (!iso) return 'ещё не было';
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? `сегодня в ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

/** Семейный код крупно, с кнопкой «Скопировать». */
function CodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <output aria-label="Семейный код" className="select-all rounded-xl2 border-2 border-brand bg-soft px-4 py-3 font-mono text-xl font-extrabold tracking-wider sm:text-2xl">{code}</output>
      <button className={`${btn} bg-soft`} onClick={() => { void navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => undefined); }}>
        {copied ? 'Скопировано' : 'Скопировать'}
      </button>
    </div>
  );
}

/** Раздел «Синхронизация» родительского режима: подключение устройств к общему прогрессу. */
export function SyncPanel() {
  const status = useSyncStatus();
  const sync = useApp((s) => s.sync);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [created, setCreated] = useState(false);
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [mode, setMode] = useState<'menu' | 'join'>('menu');
  const [input, setInput] = useState('');
  const [check, setCheck] = useState<FamilyCheck | null>(null);
  const [confirm, setConfirm] = useState<'off' | 'delete' | 'change' | null>(null);

  useEffect(() => { void syncService.enabled().then(setEnabled); }, [status.state, sync?.familyId]);

  const run = async (f: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await f(); } catch (e) { setMsg(errorText(e)); } finally {
      setBusy(false);
      setEnabled(await syncService.enabled());
    }
  };

  if (!syncService.configured) {
    return (
      <Card title="Синхронизация между устройствами">
        <p className="mb-2">Синхронизация ещё не настроена: нужен бесплатный проект Google Firebase.</p>
        <p className="text-sm text-mute">Инструкция — в файле README_ДЛЯ_РОДИТЕЛЯ.md, раздел «Синхронизация Windows и Android». Пока прогресс хранится только на этом устройстве (как раньше).</p>
      </Card>
    );
  }
  if (enabled === null) return null;

  // ——— синхронизация включена ———
  if (enabled) {
    const state = status.state;
    return (
      <>
        <Card title="Синхронизация включена">
          <p className="mb-1 flex items-center gap-2 text-lg font-bold" role="status" aria-live="polite">
            {state === 'syncing' && <>Синхронизация…</>}
            {state === 'idle' && <><Icon name="check" /> Всё синхронизировано</>}
            {state === 'offline' && <>Ждём интернет</>}
            {state === 'error' && <>Не получилось</>}
          </p>
          {status.message && <p className="mb-2 text-mute">{status.message}</p>}
          <p className="text-mute">Последняя синхронизация: {timeText(status.lastSync ?? sync?.lastSync)}</p>
          {status.devices > 0 && <p className="text-mute">Устройств в семье: {status.devices}</p>}
          {status.outdated && <p className="mt-2 rounded-xl2 bg-warn/15 p-3">На другом устройстве стоит более новая версия «Умного Бусела». Обновите программу и здесь, чтобы всё работало одинаково.</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={busy || state === 'syncing'} className={`${btn} bg-brand text-onbrand`} onClick={() => void run(() => syncService.syncNow())}>Синхронизировать сейчас</button>
            <button className={`${btn} bg-soft`} onClick={() => void (shownCode ? setShownCode(null) : syncService.code().then(setShownCode))}>
              {shownCode ? 'Скрыть код' : 'Показать семейный код'}
            </button>
          </div>
          {shownCode && (
            <div className="mt-4">
              {created && <p className="mb-2 font-bold">Готово! Ваш семейный код:</p>}
              <CodeBox code={shownCode} />
              <p className="mt-2 text-sm text-mute">
                На другом устройстве откройте «Умный Бусел» → Родительский режим → Синхронизация → «Подключиться по коду» и введите этот код.
                Храните код как пароль: по нему можно получить прогресс. Посмотреть код ещё раз можно здесь же.
              </p>
            </div>
          )}
          {msg && <p className="mt-3 font-bold">{msg}</p>}
        </Card>

        <Card title="Безопасность">
          <p className="mb-3 text-sm text-mute">Прогресс шифруется на устройстве семейным кодом. В облаке Google лежит только шифр: ни имени, ни PIN, ни баллов там прочитать нельзя.</p>
          {confirm === null && (
            <div className="flex flex-wrap gap-3">
              <button className={`${btn} bg-soft`} onClick={() => setConfirm('change')}>Сменить код (устройство потеряно)</button>
              <button className={`${btn} bg-soft`} onClick={() => setConfirm('off')}>Отключить на этом устройстве</button>
              <button className={`${btn} bg-soft`} onClick={() => setConfirm('delete')}>Удалить данные из облака</button>
            </div>
          )}
          {confirm === 'change' && (
            <Confirm busy={busy} onNo={() => setConfirm(null)} yes="Сменить код"
              text="Будет создан новый семейный код, старые данные в облаке удалятся. Потерянное устройство больше ничего не получит. На остальных своих устройствах введите новый код заново (выберите «Заменить»)."
              onYes={() => void run(async () => { const c = await syncService.changeCode(); setShownCode(c); setCreated(true); setConfirm(null); })} />
          )}
          {confirm === 'off' && (
            <Confirm busy={busy} onNo={() => setConfirm(null)} yes="Отключить"
              text="Прогресс на этом устройстве останется, но обмениваться с другими устройствами оно перестанет. Подключить снова можно тем же кодом."
              onYes={() => void run(async () => { await syncService.disconnect(false); setShownCode(null); setConfirm(null); })} />
          )}
          {confirm === 'delete' && (
            <Confirm busy={busy} onNo={() => setConfirm(null)} yes="Удалить из облака"
              text="Все данные семьи будут удалены из облака Google, синхронизация выключится. Прогресс на каждом устройстве останется. Другие устройства тоже перестанут синхронизироваться."
              onYes={() => void run(async () => { await syncService.disconnect(true); setShownCode(null); setConfirm(null); })} />
          )}
        </Card>
      </>
    );
  }

  // ——— синхронизация выключена ———
  const norm = normalizeCode(input);
  const doJoin = (m: 'resume' | 'add' | 'replace') => void run(async () => {
    await syncService.join(input, m);
    setCheck(null); setInput(''); setMode('menu');
    setMsg(useSyncStatus.getState().state === 'idle' ? 'Готово! Устройство подключено, прогресс общий.' : useSyncStatus.getState().message);
  });

  return (
    <Card title="Синхронизация между устройствами">
      <p className="mb-2">Баллы, темы, награды и статистика будут одинаковыми на компьютере и на телефоне или планшете.</p>
      <p className="mb-4 text-sm text-mute">
        Данные шифруются прямо на устройстве семейным кодом и хранятся в облаке Google (Firebase) только в зашифрованном виде.
        Нужен интернет; без него всё работает как обычно и синхронизируется позже.
      </p>

      {mode === 'menu' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button disabled={busy} className={`${btn} bg-brand text-onbrand`} onClick={() => void run(async () => { setShownCode(await syncService.createFamily()); setCreated(true); })}>
            Это первое устройство — создать код
          </button>
          <button disabled={busy} className={`${btn} bg-soft`} onClick={() => { setMode('join'); setMsg(''); }}>Подключиться по коду</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="font-bold" htmlFor="family-code">Семейный код с другого устройства</label>
          <input id="family-code" value={input} autoComplete="off" autoCapitalize="characters" spellCheck={false} inputMode="text"
            onChange={(e) => { setInput(e.target.value); setCheck(null); }}
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" className="rounded-xl2 border p-3 font-mono text-lg tracking-wider" />
          {input && !norm && <p className="text-sm text-mute">Код — 20 букв и цифр (дефисы и пробелы можно не вводить).</p>}
          {!check && (
            <div className="flex flex-wrap gap-3">
              <button disabled={!norm || busy} className={`${btn} bg-brand text-onbrand`} onClick={() => void run(async () => {
                const c = await syncService.checkCode(input);
                setInput(formatCode(norm!));
                if (!c.exists) { setMsg('Семья с таким кодом не найдена. Проверьте код на первом устройстве (Родительский режим → Синхронизация → «Показать семейный код»).'); return; }
                if (c.known) { doJoin('resume'); return; }
                if (!c.localProgress) { doJoin('add'); return; }
                setCheck(c);
              })}>Подключиться</button>
              <button className={`${btn} bg-soft`} onClick={() => { setMode('menu'); setInput(''); setMsg(''); }}>Отмена</button>
            </div>
          )}
          {check && (
            <div className="rounded-xl2 border border-line p-4">
              <p className="mb-3 font-bold">На этом устройстве уже есть прогресс. Что с ним сделать?</p>
              <div className="flex flex-col gap-3">
                <button disabled={busy} className={`${btn} bg-brand py-3 text-left text-onbrand`} onClick={() => doJoin('add')}>
                  Сложить с общим прогрессом
                  <span className="block text-sm font-normal">Если ребёнок занимался здесь отдельно — баллы и темы прибавятся.</span>
                </button>
                <button disabled={busy} className={`${btn} bg-soft py-3 text-left`} onClick={() => doJoin('replace')}>
                  Заменить общим прогрессом
                  <span className="block text-sm font-normal text-mute">Если сюда уже загружали копию с другого устройства или меняли код — чтобы ничего не удвоилось.</span>
                </button>
                <button className={`${btn} bg-soft`} onClick={() => setCheck(null)}>Отмена</button>
              </div>
            </div>
          )}
        </div>
      )}
      {msg && <p className="mt-3 font-bold" role="status">{msg}</p>}
      {platformName() === 'android' && <p className="mt-4 text-sm text-mute">Совет: синхронизация срабатывает при запуске, каждые несколько минут и когда приложение сворачивают.</p>}
    </Card>
  );
}

function Confirm({ text, yes, onYes, onNo, busy }: { text: string; yes: string; onYes: () => void; onNo: () => void; busy: boolean }) {
  return (
    <div className="rounded-xl2 border border-line p-4">
      <p className="mb-3">{text}</p>
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className={`${btn} bg-brand text-onbrand`} onClick={onYes}>{yes}</button>
        <button disabled={busy} className={`${btn} bg-soft`} onClick={onNo}>Отмена</button>
      </div>
    </div>
  );
}
