import { subjects } from '../content/loader';

export function SubjectScreen({ id, onBack }: { id: string; onBack(): void }) {
  const s = subjects.find((x) => x.id === id);
  if (!s) return null;
  return (
    <main className="mx-auto max-w-4xl p-6">
      <button onClick={onBack} className="mb-4 rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="mb-6 text-3xl font-extrabold" style={{ color: s.color }}>{s.icon} {s.title}</h1>
      {s.sections.map((sec) => (
        <section key={sec.id} className="mb-6">
          <h2 className="mb-2 text-xl font-extrabold">{sec.title}</h2>
          <ul className="flex flex-col gap-2">
            {sec.topics.map((t) => (
              <li key={t.id} className="flex min-h-touch items-center justify-between rounded-xl2 bg-card px-5 shadow">
                <span>{t.title}</span>
                <span className="text-sm text-mute">{t.status === 'ready' ? 'Открыть' : 'Скоро'}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
