import { subjects } from '../content/loader';
import { useApp } from '../store/useApp';

export function SubjectScreen({ id, onBack, onTopic, onVocab }: { id: string; onBack(): void; onTopic(topicId: string): void; onVocab(): void }) {
  const { topicResults } = useApp();
  const s = subjects.find((x) => x.id === id);
  if (!s) return null;
  return (
    <main className="mx-auto max-w-4xl p-6">
      <button onClick={onBack} className="mb-4 rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="mb-6 text-3xl font-extrabold" style={{ color: s.color }}>{s.icon} {s.title}</h1>
      {id === 'english' && (
        <button onClick={onVocab} className="mb-6 flex min-h-[80px] w-full items-center gap-4 rounded-xl3 p-5 text-left text-xl font-extrabold text-white shadow"
          style={{ background: s.color }}>
          <span className="text-4xl">📒</span> Английские слова: карточки, слушание, письмо
        </button>
      )}
      {s.sections.map((sec) => (
        <section key={sec.id} className="mb-6">
          <h2 className="mb-2 text-xl font-extrabold">{sec.title}</h2>
          <ul className="flex flex-col gap-2">
            {sec.topics.map((t) => {
              const r = topicResults[t.id];
              const ready = t.status === 'ready';
              return (
                <li key={t.id}>
                  <button disabled={!ready} onClick={() => onTopic(t.id)}
                    className={`flex min-h-touch w-full items-center justify-between rounded-xl2 bg-card px-5 text-left shadow ${ready ? 'hover:scale-[1.01] active:scale-95' : 'opacity-60'}`}>
                    <span>{t.title}</span>
                    <span className="text-sm font-bold text-mute">
                      {!ready ? 'Скоро' : r?.done ? `✓ ${r.bestPercent}%` : r ? 'В процессе' : 'Начать'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
