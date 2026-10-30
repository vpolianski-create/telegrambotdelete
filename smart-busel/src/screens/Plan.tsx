import { StatusChip } from '../components/StatusChip';
import { allTopics, learnSubjects } from '../content/loader';
import { planFor } from '../engine/plan';
import { topicStatus } from '../engine/status';
import { todayStr, useApp } from '../store/useApp';

/** Выбор тем на сегодня: любые, из любых предметов. «По порядку» подсказывает, какая тема следующая. */
export function Plan({ onBack, onTopic }: { onBack(): void; onTopic(subjectId: string, topicId: string): void }) {
  const { plan, togglePlan, topicResults, opened } = useApp();
  const today = planFor(plan, todayStr());
  const statusOf = (id: string) => topicStatus(topicResults[id], opened.includes(id));
  const bySubject = (id: string) => allTopics.filter((x) => x.subject.id === id);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="text-3xl font-extrabold">🗓️ Что учим сегодня?</h1>
      <p className="text-mute">Отметь темы, которые хочешь пройти сегодня. Они появятся на главном экране. Выбирать можно любые, но по программе лучше идти по порядку — метка «По порядку» подскажет следующую тему.</p>
      {learnSubjects.map((sub) => {
        const ready = bySubject(sub.id).filter((x) => x.topic.status === 'ready');
        const next = ready.find((x) => statusOf(x.topic.id) !== 'done')?.topic.id;
        return (
          <details key={sub.id} open={ready.some((x) => today.includes(x.topic.id))} className="rounded-xl3 bg-card p-4 shadow">
            <summary className="flex min-h-touch cursor-pointer items-center gap-3 text-xl font-extrabold" style={{ color: sub.color }}>
              <span className="text-3xl">{sub.icon}</span> {sub.title}
              <span className="ml-auto text-sm text-mute">{ready.filter((x) => statusOf(x.topic.id) === 'done').length} из {ready.length}</span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {ready.map((x, k) => {
                const on = today.includes(x.topic.id);
                return (
                  <li key={x.topic.id} className="flex items-center gap-2">
                    <button onClick={() => togglePlan(x.topic.id)} aria-pressed={on}
                      className={`flex min-h-touch flex-1 flex-wrap items-center justify-between gap-2 rounded-xl2 px-4 py-2 text-left ${on ? 'bg-brand text-white' : 'bg-bg'}`}>
                      <span><b>{on ? '☑' : '☐'}</b> {k + 1}. {x.topic.title}</span>
                      <span className="flex items-center gap-2">
                        {x.topic.id === next && <span className={`text-sm font-extrabold ${on ? 'text-white' : 'text-brand'}`}>По порядку</span>}
                        <StatusChip status={statusOf(x.topic.id)} />
                      </span>
                    </button>
                    <button onClick={() => onTopic(sub.id, x.topic.id)} aria-label={`Начать: ${x.topic.title}`} className="min-h-touch rounded-xl2 bg-soft px-3 font-extrabold">▶</button>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </main>
  );
}
