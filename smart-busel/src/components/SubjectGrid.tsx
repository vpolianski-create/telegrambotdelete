import { learnSubjects } from '../content/loader';
import { subjectTone } from '../content/subjectArt';
import { useApp } from '../store/useApp';
import { SubjectArt } from './SubjectArt';

/** Сетка предметов с прогрессом. Общая для главного экрана и экрана «Предметы». */
export function SubjectGrid({ onSubject }: { onSubject(id: string): void }) {
  const topicResults = useApp((s) => s.topicResults);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {learnSubjects.map((s) => {
        const ready = s.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready');
        const passed = ready.filter((t) => topicResults[t.id]?.done).length;
        const tone = subjectTone(s.id, s.color);
        return (
          <button key={s.id} onClick={() => onSubject(s.id)}
            className="relative flex min-h-[120px] items-center gap-4 overflow-hidden rounded-xl3 p-5 pl-6 text-left shadow hover:brightness-[1.03] active:scale-[0.99]"
            style={{ background: `linear-gradient(${tone.tint}, ${tone.tint}), var(--card)` }}>
            <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: tone.mark }} />
            <SubjectArt subject={s} size={72} />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-xl font-bold leading-tight">{s.title}</span>
              <span className="block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ background: tone.mark, width: `${ready.length ? (passed / ready.length) * 100 : 0}%` }} /></span>
              <span className="text-sm text-mute">Пройдено тем: {passed} из {ready.length}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
