import { useMemo, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { TaskView, type TaskResult } from '../components/TaskView';
import { reviewList } from '../content/review';
import { useApp } from '../store/useApp';

/** Работа над ошибками: спокойно повторяем то, что раньше не получилось. Без штрафов. */
export function Review({ onBack }: { onBack(): void }) {
  const { mistakes, recordAnswer, resolveMistake, settings, topicResults } = useApp();
  const list = useMemo(() => reviewList(mistakes, 8), []);
  const [i, setI] = useState(0);
  const [fixed, setFixed] = useState(0);

  const shell = (body: React.ReactNode) => (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-xl2 bg-card px-5 shadow">✕ Выйти</button>
        <h1 className="flex-1 text-lg font-extrabold text-mute">🔁 Работа над ошибками{i < list.length ? ` · ${i + 1}/${list.length}` : ''}</h1>
      </div>
      {body}
    </main>
  );

  if (list.length === 0 || i >= list.length) {
    return shell(
      <div className="flex flex-col items-center gap-4 rounded-xl3 bg-card p-8 text-center shadow">
        <Mascot size={120} cheer />
        <h2 className="text-3xl font-extrabold">{list.length === 0 ? 'Ошибок для повторения нет!' : `${settings.name}, готово!`}</h2>
        {list.length > 0 && <p className="text-xl">Исправлено: <b>{fixed}</b> из {list.length}</p>}
        {list.length > 0 && fixed < list.length && <p className="text-mute">То, что пока не вышло, останется в списке — вернёмся к этому позже.</p>}
        <button onClick={onBack} className="rounded-xl2 bg-brand px-8 text-lg font-extrabold text-white">Готово</button>
      </div>);
  }

  const { m, task } = list[i];
  const answered = (r: TaskResult) => {
    recordAnswer({ subject: m.subject, topicId: m.topicId, question: m.question, correct: r.correct, points: r.points, taskId: m.taskId, entry: m.entry });
    if (r.correct) { resolveMistake(m.topicId, m.question); setFixed((f) => f + 1); }
    setI(i + 1);
  };
  return shell(<TaskView key={task.id} task={task} repeat={topicResults[m.topicId]?.done === true} onNext={answered} />);
}
