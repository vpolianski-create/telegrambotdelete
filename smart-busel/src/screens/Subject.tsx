import { motion } from 'framer-motion';
import { StatusChip } from '../components/StatusChip';
import { subjects } from '../content/loader';
import { planFor } from '../engine/plan';
import { statusCounts, topicStatus, STATUS_LABEL, type TopicStatus } from '../engine/status';
import { todayStr, useApp } from '../store/useApp';

/** «Остров» предмета: темы идут по порядку программы, но можно открыть любую готовую. */
export function SubjectScreen({ id, onBack, onTopic, onVocab }: { id: string; onBack(): void; onTopic(topicId: string): void; onVocab(): void }) {
  const { topicResults, opened, plan, togglePlan } = useApp();
  const s = subjects.find((x) => x.id === id);
  if (!s) return null;
  const today = planFor(plan, todayStr());
  const all = s.sections.flatMap((x) => x.topics);
  const ready = all.filter((t) => t.status === 'ready');
  const statusOf = (tid: string) => topicStatus(topicResults[tid], opened.includes(tid));
  const recommended = ready.find((t) => statusOf(t.id) !== 'done')?.id;
  const counts = statusCounts(ready.map((t) => statusOf(t.id)));
  let index = 0;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <button onClick={onBack} className="mb-4 rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="mb-2 text-3xl font-extrabold" style={{ color: s.color }}>{s.icon} {s.title}</h1>
      <p className="mb-1 text-mute">
        {(['done', 'started', 'failed', 'new'] as TopicStatus[]).map((k) => `${STATUS_LABEL[k]}: ${counts[k]}`).join(' · ')}
      </p>
      <p className="mb-6 text-sm text-mute">Темы идут по порядку программы, но сегодня можно открыть любую. Кнопка «В план» добавит тему в список на сегодня.</p>
      {id === 'english' && (
        <button onClick={onVocab} className="mb-6 flex min-h-[80px] w-full items-center gap-4 rounded-xl3 p-5 text-left text-xl font-extrabold text-white shadow"
          style={{ background: s.color }}>
          <span className="text-4xl">📒</span> Английские слова: карточки, слушание, письмо
        </button>
      )}
      {s.sections.map((sec) => (
        <section key={sec.id} className="mb-8">
          <h2 className="mb-3 text-xl font-extrabold">{sec.title}</h2>
          <ol className="relative flex flex-col gap-3 border-l-4 border-dashed pl-0" style={{ borderColor: s.color + '55', marginLeft: 28 }}>
            {sec.topics.map((t) => {
              const r = topicResults[t.id];
              const isReady = t.status === 'ready';
              const st = statusOf(t.id);
              const current = t.id === recommended;
              const planned = today.includes(t.id);
              const n = ++index;
              return (
                <li key={t.id} className="relative flex items-center gap-2 pl-8">
                  <span className="absolute -left-[22px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg font-extrabold text-white"
                    style={{ background: st === 'done' ? 'var(--ok)' : st === 'failed' ? '#b45309' : isReady ? s.color : '#64748b' }}>
                    {st === 'done' ? '✓' : n}
                  </span>
                  <motion.button disabled={!isReady} onClick={() => onTopic(t.id)}
                    animate={current ? { scale: [1, 1.02, 1] } : undefined} transition={{ repeat: Infinity, duration: 2 }}
                    className={`flex min-h-touch flex-1 flex-wrap items-center justify-between gap-2 rounded-xl2 bg-card px-5 py-2 text-left shadow ${isReady ? 'hover:scale-[1.01] active:scale-95' : 'opacity-60'} ${current ? 'ring-2' : ''}`}
                    style={current ? { ['--tw-ring-color' as string]: s.color } : undefined}>
                    <span>{t.title}</span>
                    <span className="flex items-center gap-2">
                      {!isReady ? <span className="text-sm font-bold text-mute">Скоро</span> : (
                        <>
                          {st === 'done' && <span aria-label={`Звёзд: ${r?.stars ?? 1} из 3`}>{'⭐'.repeat(r?.stars ?? 1)}{'☆'.repeat(3 - (r?.stars ?? 1))}</span>}
                          {r && r.bestPercent > 0 && <span className="text-sm font-bold text-mute">{r.bestPercent}%</span>}
                          {current && st !== 'done' && <span className="text-sm font-extrabold" style={{ color: s.color }}>▶ Дальше</span>}
                          <StatusChip status={st} />
                        </>
                      )}
                    </span>
                  </motion.button>
                  {isReady && (
                    <button onClick={() => togglePlan(t.id)} aria-pressed={planned}
                      className={`min-h-touch whitespace-nowrap rounded-xl2 px-3 text-sm font-extrabold ${planned ? 'bg-brand text-white' : 'bg-soft'}`}>
                      {planned ? '✓ В плане' : '+ В план'}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </main>
  );
}
