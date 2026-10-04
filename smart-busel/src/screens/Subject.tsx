import { motion } from 'framer-motion';
import { subjects } from '../content/loader';
import { useApp } from '../store/useApp';

/** «Остров» предмета: тропинка из тем. Рекомендуем следующую, но можно выбрать любую готовую. */
export function SubjectScreen({ id, onBack, onTopic, onVocab }: { id: string; onBack(): void; onTopic(topicId: string): void; onVocab(): void }) {
  const { topicResults } = useApp();
  const s = subjects.find((x) => x.id === id);
  if (!s) return null;
  const all = s.sections.flatMap((x) => x.topics);
  const recommended = all.find((t) => t.status === 'ready' && !topicResults[t.id]?.done)?.id;
  let index = 0;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <button onClick={onBack} className="mb-4 rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="mb-6 text-3xl font-extrabold" style={{ color: s.color }}>{s.icon} {s.title}</h1>
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
              const ready = t.status === 'ready';
              const current = t.id === recommended;
              const n = ++index;
              return (
                <li key={t.id} className="relative pl-8">
                  <span className="absolute -left-[22px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg font-extrabold text-white"
                    style={{ background: r?.done ? 'var(--ok)' : ready ? s.color : '#9aa5b4' }}>
                    {r?.done ? '✓' : n}
                  </span>
                  <motion.button disabled={!ready} onClick={() => onTopic(t.id)}
                    animate={current ? { scale: [1, 1.02, 1] } : undefined} transition={{ repeat: Infinity, duration: 2 }}
                    className={`flex min-h-touch w-full items-center justify-between gap-3 rounded-xl2 bg-card px-5 py-2 text-left shadow ${ready ? 'hover:scale-[1.01] active:scale-95' : 'opacity-60'} ${current ? 'ring-2' : ''}`}
                    style={current ? { ['--tw-ring-color' as string]: s.color } : undefined}>
                    <span>{t.title}</span>
                    <span className="whitespace-nowrap text-sm font-bold text-mute">
                      {!ready ? 'Скоро' : r?.done ? `✓ ${r.bestPercent}%` : current ? '▶ Дальше' : r ? 'В процессе' : 'Начать'}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </main>
  );
}
