import { useState } from 'react';
import { Icon } from '../components/Icon';
import { AppBar } from '../components/AppBar';
import { FilmPlayer } from '../components/FilmPlayer';
import { StatusChip } from '../components/StatusChip';
import { SubjectArt } from '../components/SubjectArt';
import { filmFor } from '../content/films';
import { subjectTone } from '../content/subjectArt';
import { subjects } from '../content/loader';
import { planFor } from '../engine/plan';
import { statusCounts, topicStatus, STATUS_LABEL, type TopicStatus } from '../engine/status';
import { todayStr, useApp } from '../store/useApp';

/** «Остров» предмета: темы идут по порядку программы, но можно открыть любую готовую. */
export function SubjectScreen({ id, onBack, onTopic, onVocab }: { id: string; onBack(): void; onTopic(topicId: string): void; onVocab(): void }) {
  const { topicResults, opened, plan, togglePlan } = useApp();
  const s = subjects.find((x) => x.id === id);
  if (!s) return null;
  const tone = subjectTone(s.id, s.color);
  const today = planFor(plan, todayStr());
  const all = s.sections.flatMap((x) => x.topics);
  const ready = all.filter((t) => t.status === 'ready');
  const statusOf = (tid: string) => topicStatus(topicResults[tid], opened.includes(tid));
  const recommended = ready.find((t) => statusOf(t.id) !== 'done')?.id;
  const counts = statusCounts(ready.map((t) => statusOf(t.id)));
  const total = ready.length;
  let index = 0;
  // длинный предмет: открыт раздел со следующей темой, остальные свёрнуты
  const currentSection = s.sections.find((sec) => sec.topics.some((t) => t.id === recommended))?.id ?? s.sections[0]?.id;
  const [openSections, setOpenSections] = useState<string[]>(() => (s.sections.length <= 2 ? s.sections.map((x) => x.id) : currentSection ? [currentSection] : []));
  const toggleSection = (sid: string) => setOpenSections((o) => (o.includes(sid) ? o.filter((x) => x !== sid) : [...o, sid]));
  const [watching, setWatching] = useState<string>(); // тема, чей мультурок открыт
  const watchFilm = watching ? filmFor(watching) : undefined;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <AppBar title={s.title} onBack={onBack} />
      <button onClick={onBack} className="mb-4 rounded-xl2 bg-card px-5 shadow max-sm:hidden"><Icon name="back" /> Все предметы</button>
      <header className="relative mb-4 flex items-center gap-5 overflow-hidden rounded-panel p-5 pl-6 shadow max-sm:gap-3 max-sm:p-4 max-sm:pl-5" style={{ background: `linear-gradient(${tone.tint}, ${tone.tint}), var(--card)` }}>
        <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: tone.mark }} />
        <span className="max-sm:hidden"><SubjectArt subject={s} size={96} /></span>
        <span className="sm:hidden"><SubjectArt subject={s} size={64} /></span>
        <div className="min-w-0 flex-1">
          <h1 className="mb-1 text-4xl font-extrabold [overflow-wrap:anywhere] max-sm:hidden">{s.title}</h1>
          <p className="text-mute max-sm:hidden">
            {(['done', 'started', 'failed', 'new'] as TopicStatus[]).map((k) => `${STATUS_LABEL[k]}: ${counts[k]}`).join(' · ')}
          </p>
          {/* телефон: коротко — сколько тем пройдено, и полоска */}
          <div className="sm:hidden">
            <p className="text-lg font-semibold">Пройдено {counts.done} из {total} тем</p>
            {counts.started + counts.failed > 0 && <p className="text-sm text-mute">Начато: {counts.started + counts.failed}</p>}
            <span className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full" style={{ background: tone.mark, width: `${total ? (counts.done / total) * 100 : 0}%` }} />
            </span>
          </div>
        </div>
      </header>
      <p className="mb-6 text-sm text-mute max-sm:mb-4">Темы идут по порядку программы, но сегодня можно открыть любую. <span className="max-sm:hidden">Кнопка «В план»</span><span className="sm:hidden">Кнопка ＋ на теме</span> добавит её в список на сегодня.</p>
      {id === 'english' && (
        <button onClick={onVocab} className="mb-6 flex min-h-[80px] w-full items-center gap-4 rounded-xl3 border border-line p-5 text-left text-xl font-extrabold shadow hover:brightness-[1.03]"
          style={{ background: `linear-gradient(${tone.tint}, ${tone.tint}), var(--card)` }}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft" style={{ color: tone.mark }}><Icon name="cards" size={24} /></span> Английские слова: карточки, слушание, письмо
        </button>
      )}
      {s.sections.map((sec) => {
        const secReady = sec.topics.filter((t) => t.status === 'ready');
        const secDone = secReady.filter((t) => statusOf(t.id) === 'done').length;
        const isOpen = openSections.includes(sec.id);
        const first = index;
        if (!isOpen) index += sec.topics.length;
        return (
        <section key={sec.id} className="mb-5">
          <button onClick={() => toggleSection(sec.id)} aria-expanded={isOpen}
            className="mb-3 flex min-h-touch w-full flex-wrap items-center gap-3 rounded-xl2 bg-card px-5 py-3 text-left shadow">
            <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} className="text-mute" />
            <span className="min-w-[200px] flex-1 text-xl font-extrabold">{sec.title}</span>
            <span className="text-sm font-bold text-mute">{secDone === secReady.length && secReady.length > 0 && <Icon name="check" className="text-okink" />} {secDone} из {secReady.length}</span>
            <span className="block h-2 w-full overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full" style={{ background: tone.mark, width: `${secReady.length ? (secDone / secReady.length) * 100 : 0}%` }} />
            </span>
          </button>
          {isOpen && first >= 0 && (
          <ol className="relative flex flex-col gap-3 border-l-4 border-dashed pl-0" style={{ borderColor: tone.line, marginLeft: 28 }}>
            {sec.topics.map((t) => {
              const r = topicResults[t.id];
              const isReady = t.status === 'ready';
              const st = statusOf(t.id);
              const current = t.id === recommended;
              const planned = today.includes(t.id);
              const n = ++index;
              const film = isReady ? filmFor(t.id) : undefined;
              return (
                <li key={t.id} className="relative flex items-center gap-2 pl-8 max-sm:pl-7">
                  <span className="absolute -left-[22px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg font-extrabold"
                    style={isReady
                      ? { background: st === 'done' ? 'var(--ok)' : st === 'failed' ? 'var(--warn)' : tone.mark, color: 'var(--on-brand)' }
                      : { background: 'var(--hover)', color: 'var(--mute)' }}>
                    {st === 'done' ? <Icon name="check" label="Пройдена" /> : n}
                  </span>
                  <button disabled={!isReady} onClick={() => onTopic(t.id)}
                    className={`flex min-h-touch min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded-xl2 bg-card px-5 py-2 text-left shadow max-sm:py-3 max-sm:pl-4 ${film ? 'max-sm:pr-28' : 'max-sm:pr-14'} ${isReady ? 'active:scale-[0.99]' : 'opacity-60'}`}
                    style={current ? { borderColor: tone.mark, borderWidth: 2 } : undefined}>
                    <span className="max-sm:w-full max-sm:font-semibold">{t.title}</span>
                    <span className="flex flex-wrap items-center gap-2">
                      {!isReady ? <span className="text-sm font-bold text-mute">Скоро</span> : (
                        <>
                          {st === 'done' && <span role="img" aria-label={`Звёзд: ${r?.stars ?? 1} из 3`} className="flex">{[1, 2, 3].map((k) => <Icon key={k} name={k <= (r?.stars ?? 1) ? 'star' : 'starOff'} className={k <= (r?.stars ?? 1) ? 'text-sun' : 'text-mute opacity-60'} />)}</span>}
                          {r && r.bestPercent > 0 && <span className="text-sm font-bold text-mute">{r.bestPercent}%</span>}
                          {current && st !== 'done' && <span className="text-sm font-extrabold" style={{ color: tone.mark }}><Icon name="play" /> Дальше</span>}
                          <StatusChip status={st} />
                        </>
                      )}
                    </span>
                  </button>
                  {film && (
                    <button onClick={() => setWatching(t.id)} aria-label={`Мультурок, ${film.minutes} мин`}
                      className="min-h-touch whitespace-nowrap rounded-xl2 bg-soft px-3 text-sm font-extrabold max-sm:absolute max-sm:right-[3.5rem] max-sm:top-1/2 max-sm:h-11 max-sm:min-h-0 max-sm:w-11 max-sm:-translate-y-1/2 max-sm:rounded-full max-sm:border-0 max-sm:px-0">
                      <Icon name="play" /> <span className="max-sm:sr-only">Мультурок</span>
                    </button>
                  )}
                  {isReady && (
                    <button onClick={() => togglePlan(t.id)} aria-pressed={planned} aria-label={planned ? 'В плане на сегодня' : 'Добавить в план на сегодня'}
                      className={`min-h-touch whitespace-nowrap rounded-xl2 px-3 text-sm font-extrabold max-sm:absolute max-sm:right-1.5 max-sm:top-1/2 max-sm:h-11 max-sm:min-h-0 max-sm:w-11 max-sm:-translate-y-1/2 max-sm:rounded-full max-sm:border-0 max-sm:px-0 ${planned ? 'bg-brand text-onbrand' : 'bg-soft'}`}>
                      <Icon name={planned ? 'check' : 'add'} /> <span className="max-sm:sr-only">{planned ? 'В плане' : 'В план'}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
          )}
        </section>
        );
      })}
      {watchFilm && <FilmPlayer film={watchFilm} onClose={() => setWatching(undefined)} />}
    </main>
  );
}
