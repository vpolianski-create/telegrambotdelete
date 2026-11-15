import { useEffect, useState } from 'react';
import { interceptBack, isAndroid, openDownload, printPage, saveTextFile } from '../platform';
import { useAutoUpdate } from '../update/auto';
import { autoUpdateActions } from '../update';
import { SyncPanel } from './SyncPanel';
import { AppBar } from '../components/AppBar';
import { PinPad } from '../components/PinPad';
import { syncService } from '../sync';
import { Icon, type IconName } from '../components/Icon';
import type { ThemeSetting } from '../engine/theme';
import { allTopics, subjects } from '../content/loader';
import { addDays } from '../engine/leitner';
import { praiseIdeas, weekReport } from '../engine/report';
import { statusCounts, topicStatus } from '../engine/status';
import { hasEnglishVoice, voiceHint } from '../audio/speech';
import { Logo } from '../components/Logo';
import { snapshot, todayStr, useApp } from '../store/useApp';

type Tab = 'stats' | 'report' | 'rewards' | 'settings' | 'sync' | 'backup';
const TABS: [Tab, string][] = [['stats', 'Статистика'], ['report', 'Отчёт за неделю'], ['rewards', 'Награды'], ['settings', 'Настройки'], ['sync', 'Синхронизация'], ['backup', 'Копия']];
/** Телефон: разделы списком, как в «Настройках» Android — значок и пояснение. */
const TAB_INFO: Record<Tab, { icon: IconName; hint: string }> = {
  stats: { icon: 'clock', hint: 'Время занятий, ответы, темы' },
  report: { icon: 'calendar', hint: 'Что сделано за неделю' },
  rewards: { icon: 'gift', hint: 'Порог баллов и выдача наград' },
  settings: { icon: 'edit', hint: 'Цель, лимит, тема, шрифт, PIN' },
  sync: { icon: 'retry', hint: 'Общий прогресс компьютера и телефона' },
  backup: { icon: 'book', hint: 'Сохранить или загрузить файл' },
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl3 bg-card p-5 shadow">
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
                <span className="text-sm">{Math.round(sec / 60)}</span>
                <div className="w-full rounded-t bg-brand" style={{ height: 4 + (sec / max) * 90 }} />
                <span className="text-sm text-mute">{d.slice(8)}.{d.slice(5, 7)}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Правильные ответы по предметам">
        {subjects.filter((s) => subjectStats[s.id]).map((s) => {
          const st = subjectStats[s.id];
          return <p key={s.id}>{s.title}: {Math.round((st.correct / st.tasks) * 100)}% ({st.correct} из {st.tasks})</p>;
        })}
        {Object.keys(subjectStats).length === 0 && <p className="text-mute">Пока нет данных.</p>}
      </Card>
      <Card title="Статус тем">
        {subjects.filter((x) => x.sections.some((sec) => sec.topics.some((t) => t.status === 'ready'))).map((sub) => {
          const ready = sub.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready');
          const c = statusCounts(ready.map((t) => topicStatus(topicResults[t.id], opened.includes(t.id))));
          return <p key={sub.id}>{sub.title}: пройдено {c.done}, начато {c.started}, не пройдено {c.failed}, не начато {c.new}</p>;
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
  const praise = praiseIdeas(r, { title });
  // темы, которые не даются: пройдены 3+ раза без успеха
  const stubborn = allTopics.filter((x) => (topicResults[x.topic.id]?.attempts ?? 0) >= 3 && !topicResults[x.topic.id]?.done);
  const tips: string[] = [];
  if (r.activeDays === 0) tips.push('На этой неделе занятий не было. Можно начать с одной короткой темы.');
  else if (r.activeDays < 4) tips.push('Лучше заниматься понемногу, но чаще: 15–20 минут 4–5 дней в неделю.');
  else tips.push('Отличный ритм занятий — отметьте это ребёнку.');
  if (r.tasks >= 10 && r.percent < 60) tips.push('Много ошибок: стоит вместе разобрать трудные темы и запустить «Работу над ошибками».');
  if (r.weakTopics.length) tips.push(`Чаще всего ошибки в теме «${title(r.weakTopics[0][0])}» — вернитесь к ней.`);
  if (r.guesses >= 10) tips.push('Много ответов наугад: возможно, ребёнок устаёт или спешит к награде. Помогают короткие занятия и похвала за старание, а не за скорость.');
  if (r.abandoned >= 3) tips.push('Несколько уроков брошено на середине. Стоит спросить, что было трудно, — и начать с более лёгкой темы.');
  if (notDone.length) tips.push(`Темы, которые ещё не пройдены: ${notDone.slice(0, 3).map((x) => x.topic.title).join('; ')}.`);
  const text = [
    `Отчёт Умного Бусела: ${dm(r.from)} — ${dm(r.to)}`,
    `Занятия: ${r.minutes} мин., дней с занятиями: ${r.activeDays} из 7`,
    `Заданий: ${r.tasks}, верно с первого раза: ${r.percent}%`,
    `Пройдено тем: ${r.topicsPassed.length ? r.topicsPassed.map(title).join('; ') : '—'}`,
    `За что похвалить: ${praise.join(' ')}`,
    ...tips.map((t) => `• ${t}`),
  ].join('\n');
  const [copied, setCopied] = useState(false);
  const max = Math.max(60, ...r.days.map((d) => d.sec));

  return (
    <>
      <div className="no-print flex flex-wrap items-center gap-2">
        <button onClick={() => setShift(shift + 1)} className="rounded-xl2 bg-card px-4 shadow"><Icon name="back" /> Раньше</button>
        <button disabled={shift === 0} onClick={() => setShift(shift - 1)} className="rounded-xl2 bg-card px-4 shadow disabled:opacity-40">Позже <Icon name="next" /></button>
        <button onClick={() => void printPage()} className="rounded-xl2 bg-brand px-5 text-onbrand"><Icon name="print" /> Распечатать</button>
        <button onClick={() => { void navigator.clipboard?.writeText(text).then(() => setCopied(true)); }} className="rounded-xl2 bg-soft px-5">{copied ? <><Icon name="check" /> Скопировано</> : 'Скопировать текст'}</button>
      </div>
      <div className="print-area flex flex-col gap-4 rounded-xl3 bg-card p-5 shadow">
        <h2 className="text-xl font-extrabold">Отчёт за неделю: {dm(r.from)} — {dm(r.to)}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[['clock', `${r.minutes} мин.`, diff === 0 ? 'как неделей раньше' : `${diff > 0 ? '+' : ''}${diff} мин. к прошлой неделе`], ['calendar', `${r.activeDays} из 7`, 'дней с занятиями'], ['edit', `${r.tasks}`, 'заданий'], ['target', `${r.percent}%`, 'верно с первого раза']].map(([i, v, l]) => (
            <div key={l} className="rounded-xl2 bg-soft p-3 text-center"><p className="text-mute"><Icon name={i as IconName} size={24} /></p><p className="text-xl font-extrabold">{v}</p><p className="text-sm text-mute">{l}</p></div>
          ))}
        </div>
        <div className="flex h-24 items-end gap-2">
          {r.days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-brand" style={{ height: 4 + (d.sec / max) * 70 }} />
              <span className="text-sm text-mute">{dm(d.date)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl2 border border-sun bg-sun/15 p-4">
          <p className="mb-1 font-extrabold">За что похвалить на этой неделе</p>
          <p className="mb-2 text-sm text-mute">Готовые фразы о настоящих успехах. Похвала родителя действует сильнее любой похвалы приложения — скажите своими словами.</p>
          <ul className="list-disc space-y-1 pl-6">{praise.map((t) => <li key={t}>«{t}»</li>)}</ul>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {([
            ['Исправлено ошибок', r.fixed, 'в конце урока и в «Работе над ошибками»'],
            ['Нашёл сам', r.secondTry, 'верно со второй попытки'],
            ['Выбрал посложнее', r.harder, 'вопросов по своему желанию'],
            ['Ответы наугад', r.guesses, 'быстрее, чем можно прочитать'],
            ['Брошено уроков', r.abandoned, 'вышел с середины'],
          ] as const).map(([l, v, h]) => (
            <div key={l} className="rounded-xl2 bg-soft p-3 text-center"><p className="text-xl font-extrabold">{v}</p><p className="text-sm font-bold">{l}</p><p className="text-sm text-mute">{h}</p></div>
          ))}
        </div>
        <p><b>Пройдено тем:</b> {r.topicsPassed.length ? r.topicsPassed.map(title).join('; ') : '—'}</p>
        {stubborn.length > 0 && <p><b>Темы, которые пока не даются (3 попытки и больше):</b> {stubborn.slice(0, 5).map((x) => x.topic.title).join('; ')} — стоит разобрать вместе.</p>}
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
            <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl2 bg-soft px-4 py-2 max-sm:flex-col max-sm:items-stretch max-sm:py-3">
              <span>{r.points} баллов — {r.text} · {r.status === 'given' ? 'Выдана' : 'Ожидает'}</span>
              {r.status === 'pending' && <button onClick={() => giveReward(r.id)} className="rounded-xl2 bg-ok px-4 text-onok">Выдана</button>}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Что будет наградой">
        <p className="mb-2 text-sm text-mute">По умолчанию — «1 час игры на компьютере». Для конкретного числа баллов можно задать свою награду (например, 300 — кино).</p>
        <ul className="mb-2">{Object.entries(settings.rewardTexts).map(([pt, tx]) => <li key={pt}>{pt} баллов — {tx}</li>)}</ul>
        <div className="phone-stack flex flex-wrap gap-2">
          <input placeholder="Баллы (300)" value={p} onChange={(e) => setP(e.target.value.replace(/\D/g, ''))} aria-label="Баллы" className="w-32 rounded-xl2 border p-2" />
          <input placeholder="Награда" value={t} onChange={(e) => setT(e.target.value)} aria-label="Награда" className="flex-1 rounded-xl2 border p-2" />
          <button disabled={!p || !t} onClick={() => { updateSettings({ rewardTexts: { ...settings.rewardTexts, [p]: t } }); setP(''); setT(''); }}
            className="rounded-xl2 bg-brand px-4 text-onbrand disabled:opacity-40">Добавить</button>
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
      <span>{label} <span className="text-sm text-mute max-sm:block">({hint})</span></span>
      <input type="number" inputMode="numeric" min={0} value={s[k]} onChange={(e) => updateSettings({ [k]: Math.max(0, Number(e.target.value) || 0) })} className="w-24 rounded-xl2 border p-2" />
    </label>
  );
  return (
    <>
      <Card title="Занятия">
        <div className="flex flex-col gap-3">
          {num('dailyGoal', 'Дневная цель, заданий', '0 — выключено')}
          {num('dailyLimitMin', 'Дневной лимит, минут', '0 — без лимита')}
          {num('breakEveryMin', 'Напоминание о перерыве, минут', '0 — выключено')}
          <label className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-1">Имя ребёнка
            <input value={s.name} onChange={(e) => updateSettings({ name: e.target.value })} className="w-40 rounded-xl2 border p-2 max-sm:w-full" />
          </label>
        </div>
      </Card>
      <Card title="Вид">
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-1">Тема
            <select value={s.theme} onChange={(e) => updateSettings({ theme: e.target.value as ThemeSetting })} className="rounded-xl2 border p-2 max-sm:min-h-touch">
              <option value="system">{isAndroid() ? 'Как в системе' : 'Как в Windows'}</option><option value="light">Светлая</option><option value="dark">Тёмная</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-1">Размер шрифта
            <select value={s.fontScale} onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })} className="rounded-xl2 border p-2 max-sm:min-h-touch">
              <option value={1}>Обычный</option><option value={1.15}>Крупный</option><option value={1.3}>Очень крупный</option>
            </select>
          </label>
          <label className="flex items-center justify-between">Звук
            <input type="checkbox" checked={s.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} className="h-6 w-6" />
          </label>
          {isAndroid() && (
            <label className="flex items-center justify-between">Вибрация (правильный ответ, награды)
              <input type="checkbox" checked={s.vibration} onChange={(e) => updateSettings({ vibration: e.target.checked })} className="h-6 w-6" />
            </label>
          )}
          {!hasEnglishVoice() && <p className="text-sm text-mute">{voiceHint()}</p>}
        </div>
      </Card>
      <Card title="Смена PIN">
        <div className="phone-stack flex gap-2">
          <input value={pin} inputMode="numeric" onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Новый PIN" placeholder="4–6 цифр" className="rounded-xl2 border p-2 max-sm:min-h-touch" />
          <button disabled={pin.length < 4} onClick={() => { updateSettings({ pin, pinChanged: true }); setPin(''); }} className="rounded-xl2 bg-brand px-4 text-onbrand disabled:opacity-40">Сохранить</button>
        </div>
      </Card>
    </>
  );
}

function Backup() {
  const store = useApp();
  const [msg, setMsg] = useState('');
  const exportData = () => {
    void saveTextFile(`umny-busel-${todayStr()}.json`, JSON.stringify(snapshot(), null, 2)).catch(() => setMsg('Не получилось сохранить файл'));
  };
  const importData = async (f: File | undefined) => {
    if (!f) return;
    if (await syncService.enabled()) { setMsg('Сначала отключите синхронизацию (раздел «Синхронизация»), потом загрузите копию.'); return; }
    try {
      const raw = JSON.parse(await f.text());
      if (typeof raw.points !== 'number') throw new Error('bad');
      store.importData(raw);
      setMsg('Прогресс загружен');
    } catch { setMsg('Не получилось прочитать файл'); }
  };
  return (
    <Card title="Резервная копия прогресса">
      <p className="mb-3 text-sm text-mute">Копия также создаётся автоматически при каждом запуске приложения.</p>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={exportData} className="rounded-xl2 bg-brand px-5 text-onbrand">Сохранить в файл</button>
        <label className="cursor-pointer rounded-xl2 bg-soft px-5 py-3">Загрузить из файла
          <input type="file" accept=".json" className="hidden" onChange={(e) => void importData(e.target.files?.[0])} />
        </label>
        {msg && <span className="font-bold">{msg}</span>}
      </div>
    </Card>
  );
}

/**
 * «Обновления»: всё происходит само; родителю — состояние и, на Android, один раз «Разрешить».
 * Показывается вверху родительского режима, только когда есть что сказать.
 */
function AutoUpdateCard() {
  const u = useAutoUpdate();
  if (u.kind === 'none') return null;
  const box = (tone: string, children: React.ReactNode) => (
    <section className={`rounded-xl3 border border-line p-4 ${tone}`} aria-live="polite">{children}</section>
  );
  const btn = 'min-h-touch rounded-xl2 px-5 font-bold';
  if (u.kind === 'android' && u.canInstall === false) {
    return box('bg-warn/15', <>
      <p className="mb-1 text-lg font-bold">Включите автообновление (один раз)</p>
      <p className="mb-3 text-sm text-mute">Нажмите «Разрешить», включите переключатель «Разрешить установку из этого источника» и вернитесь назад. После этого новые версии будут ставиться сами, когда приложение свёрнуто.</p>
      <button className={`${btn} bg-brand text-onbrand`} onClick={() => void autoUpdateActions.openPermission()}>Разрешить</button>
    </>);
  }
  if (u.state === 'ready') {
    return box('bg-ok/15', <>
      <p className="mb-1 text-lg font-bold">Новая версия {u.version} готова к установке</p>
      <p className="mb-3 text-sm text-mute">
        {u.kind === 'windows'
          ? 'Она установится сама, когда программу закроют. Можно и сейчас — программа перезапустится. Прогресс сохранится.'
          : u.needsConfirm
            ? 'Телефон просит подтвердить: нажмите «Обновить сейчас», затем «Обновить». Прогресс сохранится.'
            : 'Она установится сама, когда приложение свернут. Можно и сейчас — приложение закроется, откройте его снова. Прогресс сохранится.'}
      </p>
      <button className={`${btn} bg-brand text-onbrand`} onClick={() => void autoUpdateActions.installNow()}>{u.kind === 'windows' ? 'Перезапустить и обновить' : 'Обновить сейчас'}</button>
    </>);
  }
  if (u.state === 'downloading') {
    return box('bg-soft', <p className="font-bold">Скачивается новая версия {u.version}{u.percent ? ` — ${u.percent}%` : ''}…</p>);
  }
  if (u.state === 'error' && u.kind === 'android' && u.url) {
    return box('bg-soft', <>
      <p className="mb-2">Новую версию {u.version} не удалось скачать автоматически (попробуем ещё раз позже).</p>
      <button className={`${btn} bg-soft`} onClick={() => openDownload(u.url!)}>Скачать вручную</button>
    </>);
  }
  return null;
}

/** Версия программы и «Проверить обновления» (обновления ставятся сами). */
function VersionLine() {
  const u = useAutoUpdate();
  if (u.kind === 'none') return <p className="text-sm text-mute">Версия {__APP_VERSION__}</p>;
  return (
    <p className="flex flex-wrap items-center gap-3 text-sm text-mute">
      Версия {__APP_VERSION__} · обновления ставятся автоматически{u.state === 'latest' ? ' · установлена последняя версия' : ''}
      {u.kind === 'android' && <button className="underline" onClick={() => void autoUpdateActions.checkNow()}>Проверить сейчас</button>}
    </p>
  );
}

export function Parent({ onBack }: { onBack?: () => void }) {
  const { settings, updateSettings } = useApp();
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState<Tab>('stats');
  /** Телефон: открыт ли раздел (иначе — список разделов). */
  const [section, setSection] = useState(false);
  const [newPin, setNewPin] = useState('');
  const phone = typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 639px)').matches;
  useEffect(() => (section ? interceptBack(() => { setSection(false); return true; }) : undefined), [section]);
  const tryPin = () => { const good = pin === settings.pin; setOk(good); setWrong(!good); if (!good) setPin(''); };

  if (!ok) {
    return (
      <main className="mx-auto mt-10 flex max-w-sm flex-col items-stretch gap-4 rounded-panel bg-card p-8 shadow max-sm:mt-0 max-sm:bg-transparent max-sm:shadow-none">
        <AppBar title="Родителям" onBack={onBack} />
        <span className="max-sm:hidden"><Logo height={64} /></span>
        <h1 className="text-2xl font-extrabold max-sm:text-center">Родительский режим</h1>
        <p className="text-mute max-sm:text-center">Введите PIN, чтобы открыть статистику, награды и настройки.</p>
        {phone ? (
          <PinPad value={pin} onChange={(v) => { setPin(v); setWrong(false); }} onSubmit={tryPin} error={wrong ? 'PIN не подошёл' : undefined} />
        ) : (
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); tryPin(); }}>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="PIN" autoFocus
              className="rounded-xl2 border p-3 text-center text-2xl tracking-widest" />
            {wrong && <p className="text-center text-mute">PIN не подошёл</p>}
            <button type="submit" className="rounded-xl2 bg-brand font-bold text-onbrand">Войти</button>
          </form>
        )}
      </main>
    );
  }

  const tabLabel = TABS.find(([id]) => id === tab)?.[1] ?? '';
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6 max-sm:gap-4">
      {section
        ? <AppBar title={tabLabel} onBack={() => setSection(false)} />
        : <AppBar title="Родителям" onBack={onBack} />}
      <h1 className="text-4xl font-extrabold max-sm:hidden">Родительский режим</h1>
      <div className={section ? 'max-sm:hidden' : ''}><AutoUpdateCard /></div>
      {!settings.pinChanged && (
        <div className={`rounded-xl3 border border-line bg-warn/15 p-4 ${section ? 'max-sm:hidden' : ''}`}>
          <p className="mb-2 font-bold">Смените PIN по умолчанию (0000)</p>
          <div className="phone-stack flex gap-2">
            <input value={newPin} inputMode="numeric" onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Новый PIN" placeholder="4–6 цифр" className="rounded-xl2 border p-2 max-sm:min-h-touch" />
            <button disabled={newPin.length < 4} className="rounded-xl2 bg-brand px-4 text-onbrand disabled:opacity-40"
              onClick={() => updateSettings({ pin: newPin, pinChanged: true })}>Сохранить</button>
          </div>
        </div>
      )}
      {/* телефон: список разделов */}
      {!section && (
        <ul className="flex flex-col overflow-hidden rounded-xl3 bg-card shadow sm:hidden" aria-label="Разделы родительского режима">
          {TABS.map(([id, label], k) => (
            <li key={id} className={k ? 'border-t border-line' : ''}>
              <button type="button" onClick={() => { setTab(id); setSection(true); }}
                className="flex min-h-[72px] w-full items-center gap-4 px-4 py-3 text-left active:bg-hover">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-brandink"><Icon name={TAB_INFO[id].icon} size={20} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">{label}</span>
                  <span className="block text-sm text-mute">{TAB_INFO[id].hint}</span>
                </span>
                <Icon name="chevronRight" className="text-mute" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <nav className="flex flex-wrap gap-2 max-sm:hidden" aria-label="Разделы родительского режима">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-xl2 px-5 font-bold ${tab === id ? 'bg-brand text-onbrand' : 'bg-card shadow'}`}>{label}</button>
        ))}
      </nav>
      <div className={`flex flex-col gap-5 max-sm:gap-4 ${section ? '' : 'max-sm:hidden'}`}>
        {tab === 'stats' && <Stats />}
        {tab === 'report' && <Report />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'sync' && <SyncPanel />}
        {tab === 'backup' && <Backup />}
      </div>
      <div className={section ? 'max-sm:hidden' : ''}><VersionLine /></div>
    </main>
  );
}
