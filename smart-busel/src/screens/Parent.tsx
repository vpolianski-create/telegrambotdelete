import { useState } from 'react';
import { subjects } from '../content/loader';
import { addDays } from '../engine/leitner';
import { hasEnglishVoice } from '../audio/speech';
import { todayStr, useApp, type Data } from '../store/useApp';

type Tab = 'stats' | 'rewards' | 'settings' | 'backup';
const TABS: [Tab, string][] = [['stats', 'Статистика'], ['rewards', 'Награды'], ['settings', 'Настройки'], ['backup', 'Копия']];

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl2 bg-card p-4 shadow">
    <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
    {children}
  </section>
);

function Stats() {
  const { daily, topicResults, subjectStats, mistakes } = useApp();
  const days = Array.from({ length: 7 }, (_, k) => addDays(todayStr(), k - 6));
  const max = Math.max(60, ...days.map((d) => daily[d]?.sec ?? 0));
  const topicTitle = (id: string) => subjects.flatMap((s) => s.sections.flatMap((x) => x.topics)).find((t) => t.id === id)?.title ?? id;
  const byTopic = mistakes.reduce<Record<string, number>>((a, m) => ({ ...a, [m.topicId]: (a[m.topicId] ?? 0) + 1 }), {});
  const done = Object.entries(topicResults).filter(([, r]) => r.done);
  const progress = Object.entries(topicResults).filter(([, r]) => !r.done);

  return (
    <>
      <Card title="Время занятий (минуты)">
        <div className="flex h-32 items-end gap-2">
          {days.map((d) => {
            const sec = daily[d]?.sec ?? 0;
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs">{Math.round(sec / 60)}</span>
                <div className="w-full rounded-t-lg bg-brand" style={{ height: 4 + (sec / max) * 90 }} />
                <span className="text-xs text-mute">{d.slice(8)}.{d.slice(5, 7)}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Правильные ответы по предметам">
        {subjects.filter((s) => subjectStats[s.id]).map((s) => {
          const st = subjectStats[s.id];
          return <p key={s.id}>{s.icon} {s.title}: {Math.round((st.correct / st.tasks) * 100)}% ({st.correct} из {st.tasks})</p>;
        })}
        {Object.keys(subjectStats).length === 0 && <p className="text-mute">Пока нет данных.</p>}
      </Card>
      <Card title="Темы">
        <p>Пройдено: {done.length ? done.map(([id, r]) => `${topicTitle(id)} (${r.bestPercent}%)`).join('; ') : '—'}</p>
        <p>В процессе: {progress.length ? progress.map(([id, r]) => `${topicTitle(id)} (${r.bestPercent}%)`).join('; ') : '—'}</p>
      </Card>
      <Card title="Частые ошибки">
        {Object.keys(byTopic).length === 0 ? <p className="text-mute">Пока ошибок нет.</p> : (
          <ul className="list-disc pl-6">
            {Object.entries(byTopic).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => <li key={id}>{topicTitle(id)}: {n}</li>)}
          </ul>
        )}
        {mistakes.slice(0, 5).map((m, k) => <p key={k} className="text-sm text-mute">{m.date} · {m.question}</p>)}
      </Card>
    </>
  );
}

function Rewards() {
  const { settings, rewards, points, updateSettings, giveReward } = useApp();
  const [p, setP] = useState('');
  const [t, setT] = useState('');
  return (
    <>
      <Card title={`Награды (всего баллов: ${points})`}>
        <label className="mb-3 block">Порог, баллов:{' '}
          <input type="number" min={10} step={10} value={settings.rewardThreshold}
            onChange={(e) => updateSettings({ rewardThreshold: Math.max(10, Number(e.target.value) || 100) })}
            className="w-24 rounded-xl2 border p-2" />
        </label>
        {rewards.length === 0 && <p className="text-mute">Наград пока нет.</p>}
        <ul className="flex flex-col gap-2">
          {[...rewards].reverse().map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl2 bg-black/5 px-4 py-2">
              <span>{r.points} баллов — {r.text} · {r.status === 'given' ? 'Выдана ✓' : 'Ожидает'}</span>
              {r.status === 'pending' && <button onClick={() => giveReward(r.id)} className="rounded-xl2 bg-ok px-4 text-white">Выдана</button>}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Что будет наградой">
        <p className="mb-2 text-sm text-mute">По умолчанию — «1 час игры на компьютере». Для конкретного числа баллов можно задать свою награду (например, 300 — кино).</p>
        <ul className="mb-2">{Object.entries(settings.rewardTexts).map(([pt, tx]) => <li key={pt}>{pt} баллов — {tx}</li>)}</ul>
        <div className="flex flex-wrap gap-2">
          <input placeholder="Баллы (300)" value={p} onChange={(e) => setP(e.target.value.replace(/\D/g, ''))} aria-label="Баллы" className="w-32 rounded-xl2 border p-2" />
          <input placeholder="Награда" value={t} onChange={(e) => setT(e.target.value)} aria-label="Награда" className="flex-1 rounded-xl2 border p-2" />
          <button disabled={!p || !t} onClick={() => { updateSettings({ rewardTexts: { ...settings.rewardTexts, [p]: t } }); setP(''); setT(''); }}
            className="rounded-xl2 bg-brand px-4 text-white disabled:opacity-40">Добавить</button>
        </div>
      </Card>
    </>
  );
}

function SettingsTab() {
  const { settings: s, updateSettings } = useApp();
  const [pin, setPin] = useState('');
  const num = (k: 'dailyGoal' | 'dailyLimitMin' | 'breakEveryMin', label: string, hint: string) => (
    <label className="flex items-center justify-between gap-3">
      <span>{label} <span className="text-sm text-mute">({hint})</span></span>
      <input type="number" min={0} value={s[k]} onChange={(e) => updateSettings({ [k]: Math.max(0, Number(e.target.value) || 0) })} className="w-24 rounded-xl2 border p-2" />
    </label>
  );
  return (
    <>
      <Card title="Занятия">
        <div className="flex flex-col gap-3">
          {num('dailyGoal', 'Дневная цель, заданий', '0 — выключено')}
          {num('dailyLimitMin', 'Дневной лимит, минут', '0 — без лимита')}
          {num('breakEveryMin', 'Напоминание о перерыве, минут', '0 — выключено')}
          <label className="flex items-center justify-between">Имя ребёнка
            <input value={s.name} onChange={(e) => updateSettings({ name: e.target.value })} className="w-40 rounded-xl2 border p-2" />
          </label>
        </div>
      </Card>
      <Card title="Вид">
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between">Тёмная тема
            <input type="checkbox" checked={s.theme === 'dark'} onChange={(e) => updateSettings({ theme: e.target.checked ? 'dark' : 'light' })} className="h-6 w-6" />
          </label>
          <label className="flex items-center justify-between">Размер шрифта
            <select value={s.fontScale} onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })} className="rounded-xl2 border p-2">
              <option value={1}>Обычный</option><option value={1.15}>Крупный</option><option value={1.3}>Очень крупный</option>
            </select>
          </label>
          <label className="flex items-center justify-between">Звук
            <input type="checkbox" checked={s.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} className="h-6 w-6" />
          </label>
          {!hasEnglishVoice() && <p className="text-sm text-mute">Английский голос не найден: Параметры Windows → Время и язык → Язык и регион → добавить English (United States).</p>}
        </div>
      </Card>
      <Card title="Смена PIN">
        <div className="flex gap-2">
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Новый PIN" placeholder="4–6 цифр" className="rounded-xl2 border p-2" />
          <button disabled={pin.length < 4} onClick={() => { updateSettings({ pin, pinChanged: true }); setPin(''); }} className="rounded-xl2 bg-brand px-4 text-white disabled:opacity-40">Сохранить</button>
        </div>
      </Card>
    </>
  );
}

function Backup() {
  const store = useApp();
  const [msg, setMsg] = useState('');
  const exportData = () => {
    const { points, rewards, celebrated, topicResults, daily, subjectStats, mistakes, leitner, badges, settings } = store;
    const data: Data = { points, rewards, celebrated, topicResults, daily, subjectStats, mistakes, leitner, badges, settings };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `umny-busel-${todayStr()}.json`;
    a.click();
  };
  const importData = async (f: File | undefined) => {
    if (!f) return;
    try {
      const raw = JSON.parse(await f.text());
      if (typeof raw.points !== 'number') throw new Error('bad');
      store.importData(raw);
      setMsg('Прогресс загружен ✓');
    } catch { setMsg('Не получилось прочитать файл'); }
  };
  return (
    <Card title="Резервная копия прогресса">
      <p className="mb-3 text-sm text-mute">Копия также создаётся автоматически при каждом запуске приложения.</p>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={exportData} className="rounded-xl2 bg-brand px-5 text-white">Сохранить в файл</button>
        <label className="cursor-pointer rounded-xl2 bg-black/5 px-5 py-3">Загрузить из файла
          <input type="file" accept=".json" className="hidden" onChange={(e) => void importData(e.target.files?.[0])} />
        </label>
        {msg && <span className="font-bold">{msg}</span>}
      </div>
    </Card>
  );
}

export function Parent({ onBack }: { onBack(): void }) {
  const { settings, updateSettings } = useApp();
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState<Tab>('stats');
  const [newPin, setNewPin] = useState('');

  if (!ok) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
        <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
        <h1 className="text-2xl font-extrabold">Родительский режим</h1>
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); const good = pin === settings.pin; setOk(good); setWrong(!good); }}>
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="PIN" autoFocus
            className="rounded-xl2 border p-3 text-center text-2xl tracking-widest" />
          {wrong && <p className="text-center text-mute">PIN не подошёл</p>}
          <button type="submit" className="rounded-xl2 bg-brand text-white">Войти</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="text-2xl font-extrabold">Родительский режим</h1>
      {!settings.pinChanged && (
        <div className="rounded-xl2 bg-accent/20 p-4">
          <p className="mb-2 font-bold">Смените PIN по умолчанию (0000)</p>
          <input value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Новый PIN" className="mr-2 rounded-xl2 border p-2" />
          <button disabled={newPin.length < 4} className="rounded-xl2 bg-brand px-4 text-white disabled:opacity-40"
            onClick={() => updateSettings({ pin: newPin, pinChanged: true })}>Сохранить</button>
        </div>
      )}
      <nav className="flex gap-2">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-xl2 px-5 font-bold ${tab === id ? 'bg-brand text-white' : 'bg-card shadow'}`}>{label}</button>
        ))}
      </nav>
      {tab === 'stats' && <Stats />}
      {tab === 'rewards' && <Rewards />}
      {tab === 'settings' && <SettingsTab />}
      {tab === 'backup' && <Backup />}
    </main>
  );
}
