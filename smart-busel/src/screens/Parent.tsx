import { useState } from 'react';
import { allTopics, subjects } from '../content/loader';
import { addDays } from '../engine/leitner';
import { weekReport } from '../engine/report';
import { statusCounts, topicStatus } from '../engine/status';
import { hasEnglishVoice } from '../audio/speech';
import { Logo } from '../components/Logo';
import { snapshot, todayStr, useApp } from '../store/useApp';

type Tab = 'stats' | 'report' | 'rewards' | 'settings' | 'backup';
const TABS: [Tab, string][] = [['stats', 'Статистика'], ['report', 'Отчёт за неделю'], ['rewards', 'Награды'], ['settings', 'Настройки'], ['backup', 'Копия']];

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl2 bg-card p-4 shadow">
    <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
    {children}
  </section>
);

function Stats() {
  const { daily, topicResults, subjectStats, mistakes, opened } = useApp();
  const days = Array.from({ length: 7 }, (_, k) => addDays(todayStr(), k - 6));
  const max = Math.max(60, ...days.map((d) => daily[d]?.sec ?? 0));
  const known = new Set(allTopics.map((x) => x.topic.id));
  const topicTitle = (id: string) => allTopics.find((x) => x.topic.id === id)?.topic.title ?? id;
  const shown = mistakes.filter((m) => known.has(m.topicId));
  const byTopic = shown.reduce<Record<string, number>>((a, m) => ({ ...a, [m.topicId]: (a[m.topicId] ?? 0) + 1 }), {});
  const done = Object.entries(topicResults).filter(([id, r]) => r.done && known.has(id));
  const progress = Object.entries(topicResults).filter(([id, r]) => !r.done && known.has(id));

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
      <Card title="Статус тем">
        {subjects.filter((x) => x.sections.some((sec) => sec.topics.some((t) => t.status === 'ready'))).map((sub) => {
          const ready = sub.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready');
          const c = statusCounts(ready.map((t) => topicStatus(topicResults[t.id], opened.includes(t.id))));
          return <p key={sub.id}>{sub.icon} {sub.title}: пройдено {c.done}, начато {c.started}, не пройдено {c.failed}, не начато {c.new}</p>;
        })}
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
        {shown.slice(0, 5).map((m, k) => <p key={k} className="text-sm text-mute">{m.date} · {m.question}</p>)}
      </Card>
    </>
  );
}

function Report() {
  const { daily, mistakes, topicResults } = useApp();
  const [shift, setShift] = useState(0); // на сколько недель назад
  const to = addDays(todayStr(), -7 * shift);
  const r = weekReport({ daily, mistakes }, to);
  const title = (id: string) => allTopics.find((x) => x.topic.id === id)?.topic.title ?? id;
  const dm = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}`;
  const notDone = allTopics.filter((x) => x.topic.status === 'ready' && topicResults[x.topic.id] && !topicResults[x.topic.id].done);
  const diff = r.minutes - r.prevMinutes;
  const tips: string[] = [];
  if (r.activeDays === 0) tips.push('На этой неделе занятий не было. Можно начать с одной короткой темы.');
  else if (r.activeDays < 4) tips.push('Лучше заниматься понемногу, но чаще: 15–20 минут 4–5 дней в неделю.');
  else tips.push('Отличный ритм занятий — отметьте это ребёнку.');
  if (r.tasks >= 10 && r.percent < 60) tips.push('Много ошибок: стоит вместе разобрать трудные темы и запустить «Работу над ошибками».');
  if (r.weakTopics.length) tips.push(`Чаще всего ошибки в теме «${title(r.weakTopics[0][0])}» — вернитесь к ней.`);
  if (notDone.length) tips.push(`Темы, которые ещё не пройдены: ${notDone.slice(0, 3).map((x) => x.topic.title).join('; ')}.`);
  const text = [
    `Отчёт Умного Бусела: ${dm(r.from)} — ${dm(r.to)}`,
    `Занятия: ${r.minutes} мин., дней с занятиями: ${r.activeDays} из 7`,
    `Заданий: ${r.tasks}, верно с первого раза: ${r.percent}%`,
    `Пройдено тем: ${r.topicsPassed.length ? r.topicsPassed.map(title).join('; ') : '—'}`,
    ...tips.map((t) => `• ${t}`),
  ].join('\n');
  const [copied, setCopied] = useState(false);
  const max = Math.max(60, ...r.days.map((d) => d.sec));

  return (
    <>
      <div className="no-print flex flex-wrap items-center gap-2">
        <button onClick={() => setShift(shift + 1)} className="rounded-xl2 bg-card px-4 shadow">← Раньше</button>
        <button disabled={shift === 0} onClick={() => setShift(shift - 1)} className="rounded-xl2 bg-card px-4 shadow disabled:opacity-40">Позже →</button>
        <button onClick={() => window.print()} className="rounded-xl2 bg-brand px-5 text-white">🖨️ Распечатать</button>
        <button onClick={() => { void navigator.clipboard?.writeText(text).then(() => setCopied(true)); }} className="rounded-xl2 bg-soft px-5">{copied ? 'Скопировано ✓' : 'Скопировать текст'}</button>
      </div>
      <div className="print-area flex flex-col gap-4 rounded-xl2 bg-card p-4 shadow">
        <h2 className="text-xl font-extrabold">Отчёт за неделю: {dm(r.from)} — {dm(r.to)}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[['⏱️', `${r.minutes} мин.`, diff === 0 ? 'как неделей раньше' : `${diff > 0 ? '+' : ''}${diff} мин. к прошлой неделе`], ['📅', `${r.activeDays} из 7`, 'дней с занятиями'], ['✍️', `${r.tasks}`, 'заданий'], ['🎯', `${r.percent}%`, 'верно с первого раза']].map(([i, v, l]) => (
            <div key={l} className="rounded-xl2 bg-soft p-3 text-center"><p className="text-2xl">{i}</p><p className="text-xl font-extrabold">{v}</p><p className="text-sm text-mute">{l}</p></div>
          ))}
        </div>
        <div className="flex h-24 items-end gap-2">
          {r.days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-brand" style={{ height: 4 + (d.sec / max) * 70 }} />
              <span className="text-xs text-mute">{dm(d.date)}</span>
            </div>
          ))}
        </div>
        <p><b>Пройдено тем:</b> {r.topicsPassed.length ? r.topicsPassed.map(title).join('; ') : '—'}</p>
        <p><b>Чаще всего ошибки:</b> {r.weakTopics.length ? r.weakTopics.map(([id, n]) => `${title(id)} (${n})`).join('; ') : 'ошибок почти не было'}</p>
        <div>
          <p className="font-extrabold">Что можно сделать:</p>
          <ul className="list-disc pl-6">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
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
            <li key={r.id} className="flex items-center justify-between rounded-xl2 bg-soft px-4 py-2">
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
    const data = snapshot();
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
        <label className="cursor-pointer rounded-xl2 bg-soft px-5 py-3">Загрузить из файла
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
        <Logo height={120} />
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
      {tab === 'report' && <Report />}
      {tab === 'rewards' && <Rewards />}
      {tab === 'settings' && <SettingsTab />}
      {tab === 'backup' && <Backup />}
    </main>
  );
}
