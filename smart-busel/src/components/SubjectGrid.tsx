import { learnSubjects } from '../content/loader';
import { useApp } from '../store/useApp';

/** Сетка предметов с прогрессом. Общая для главного экрана и экрана «Предметы». */
export function SubjectGrid({ onSubject }: { onSubject(id: string): void }) {
  const topicResults = useApp((s) => s.topicResults);
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {learnSubjects.map((s) => {
        const ready = s.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready');
        const passed = ready.filter((t) => topicResults[t.id]?.done).length;
        return (
          <button key={s.id} onClick={() => onSubject(s.id)}
            className="flex min-h-[120px] flex-col justify-between gap-3 rounded-xl3 p-5 text-left text-white shadow transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: s.color }}>
            <span className="flex items-center gap-4">
              <span className="text-5xl" aria-hidden>{s.icon}</span>
              <span className="text-xl font-extrabold">{s.title}</span>
            </span>
            <span className="block">
              <span className="block h-2 overflow-hidden rounded-full bg-white/30"><span className="block h-full rounded-full bg-white" style={{ width: `${ready.length ? (passed / ready.length) * 100 : 0}%` }} /></span>
              <span className="mt-1 block text-sm font-bold text-white/90">Пройдено тем: {passed} из {ready.length}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
