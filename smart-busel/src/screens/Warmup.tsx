import { useMemo, useRef, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { TaskView, type TaskResult } from '../components/TaskView';
import { warmupItems } from '../content/warmup';
import { dueTopics, WARMUP_TOPICS } from '../engine/warmup';
import { todayStr, useApp } from '../store/useApp';

/** Разминка дня: несколько вопросов из давно пройденных тем. Ошибки не штрафуются — тема просто вернётся раньше. */
export function Warmup({ onBack }: { onBack(): void }) {
  const { topicResults, recordAnswer, finishWarmup, settings } = useApp();
  const list = useMemo(() => warmupItems(dueTopics(topicResults, todayStr(), WARMUP_TOPICS), Math.random), []);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [bonus, setBonus] = useState(0);
  const byTopic = useRef<Record<string, boolean>>({});

  const shell = (body: React.ReactNode) => (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-xl2 bg-card px-5 shadow">✕ Выйти</button>
        <h1 className="flex-1 text-lg font-extrabold text-mute">🧠 Разминка дня{i < list.length ? ` · ${i + 1}/${list.length}` : ''}</h1>
      </div>
      {body}
    </main>
  );

  if (list.length === 0 || i >= list.length) {
    return shell(
      <div className="flex flex-col items-center gap-4 rounded-xl3 bg-card p-8 text-center shadow">
        <Mascot size={120} cheer />
        <h2 className="text-3xl font-extrabold">{list.length === 0 ? 'Сегодня повторять нечего!' : `${settings.name}, разминка готова!`}</h2>
        {list.length === 0 && <p className="text-mute">Пройденные темы вернутся сюда через несколько дней — так знания запоминаются надолго.</p>}
        {list.length > 0 && <p className="text-xl">Вспомнил верно: <b>{right}</b> из {list.length}</p>}
        {bonus > 0 && <p className="font-bold text-okink">+{bonus} баллов за разминку</p>}
        {list.length > 0 && right < list.length && <p className="text-mute">Темы, где была ошибка, придут ещё раз через три дня.</p>}
        <button onClick={onBack} className="rounded-xl2 bg-brand px-8 text-lg font-extrabold text-white">Готово</button>
      </div>);
  }

  const it = list[i];
  const answered = (r: TaskResult) => {
    recordAnswer({ subject: it.subject.id, topicId: it.topic.id, question: it.task.question, correct: r.correct, points: r.points, taskId: it.task.id, entry: it.entry });
    byTopic.current[it.topic.id] = (byTopic.current[it.topic.id] ?? true) && r.correct;
    if (r.correct) setRight((x) => x + 1);
    if (i + 1 >= list.length) setBonus(finishWarmup(byTopic.current));
    setI(i + 1);
  };
  return shell(
    <>
      <p className="text-center text-sm font-bold text-mute">{it.subject.icon} {it.subject.title} · {it.topic.title}</p>
      <TaskView key={`${i}-${it.task.id}`} task={it.task} repeat cards={it.topic.cards} onNext={answered} />
    </>);
}
