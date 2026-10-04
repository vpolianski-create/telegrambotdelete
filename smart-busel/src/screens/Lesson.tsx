import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { Rich } from '../components/Rich';
import { TaskView, type TaskResult } from '../components/TaskView';
import { findTopic } from '../content/loader';
import { isGeneratorRef, type Entry, type GeneratorRef, type Task } from '../content/schema';
import { comboBonus, TOPIC_PASS_PERCENT } from '../engine/points';
import { generate } from '../generators';
import { useApp } from '../store/useApp';

interface Item { task: Task; counted: boolean; entry?: GeneratorRef; similar?: boolean }
/** Не больше стольких «похожих» заданий за урок, чтобы он не растягивался бесконечно. */
const MAX_SIMILAR = 3;
type Phase = 'cards' | 'example' | 'selfcheck' | 'practice' | 'bonusAsk' | 'bonus' | 'result';

const Btn = ({ children, onClick, ghost }: { children: React.ReactNode; onClick(): void; ghost?: boolean }) => (
  <button onClick={onClick}
    className={`rounded-xl2 px-8 text-lg font-extrabold active:scale-95 ${ghost ? 'bg-black/5' : 'bg-brand text-white'}`}>
    {children}
  </button>
);

export function Lesson({ subjectId, topicId, onExit, onRetry }: { subjectId: string; topicId: string; onExit(): void; onRetry(): void }) {
  const found = findTopic(subjectId, topicId);
  const { recordAnswer, finishTopic, settings } = useApp();
  const topic = found!.topic;
  const ctx = { subject: subjectId, topicId };

  const build = (entries: Entry[], counted: boolean): Item[] =>
    entries.map((e) => (isGeneratorRef(e) ? { task: generate(e, ctx), counted, entry: e } : { task: e, counted }));

  const [phase, setPhase] = useState<Phase>(topic.cards.length ? 'cards' : 'practice');
  const [card, setCard] = useState(0);
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<Item[]>(() => build(topic.practice, true));
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ counted: 0, correct: 0, gained: 0, wrong: [] as string[] });
  const [topicBonus, setTopicBonus] = useState(0);
  const finished = useRef(false);

  const selfItems = useMemo(() => build(topic.selfCheck, false), []);
  const percent = stats.counted ? Math.round((stats.correct / stats.counted) * 100) : 0;

  useEffect(() => {
    if (phase !== 'result' || finished.current) return;
    finished.current = true;
    setTopicBonus(finishTopic(topic.id, percent));
    if (percent >= TOPIC_PASS_PERCENT && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [phase]);

  const afterList = (next: Phase) => { setI(0); setPhase(next); };
  const afterIntro: Phase = topic.selfCheck.length ? 'selfcheck' : 'practice';

  const answered = (r: TaskResult) => {
    const item = items[i];
    const newStreak = r.correct ? streak + 1 : 0;
    const combo = r.correct ? comboBonus(newStreak) : 0;
    const gained = recordAnswer({
      subject: subjectId, topicId, question: item.task.question, correct: r.correct, points: r.points + combo,
    });
    setStreak(newStreak);
    setStats((s) => ({
      counted: s.counted + (item.counted ? 1 : 0),
      correct: s.correct + (item.counted && r.correct ? 1 : 0),
      gained: s.gained + gained,
      wrong: r.correct ? s.wrong : [...s.wrong, item.task.question],
    }));
    let list = items;
    if (!r.correct && item.entry && items.filter((x) => x.similar).length < MAX_SIMILAR) {
      // похожее задание для закрепления; в процент не входит
      list = [...items.slice(0, i + 1), { task: generate(item.entry, ctx), counted: false, entry: item.entry, similar: true }, ...items.slice(i + 1)];
      setItems(list);
    }
    if (i + 1 < list.length) setI(i + 1);
    else if (phase === 'practice') {
      if (topic.bonus.length) afterList('bonusAsk'); else afterList('result');
    } else afterList('result');
  };

  const shell = (title: string, body: React.ReactNode) => (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="rounded-xl2 bg-card px-5 shadow">✕ Выйти</button>
        <h1 className="flex-1 text-lg font-extrabold text-mute">{topic.title} · {title}</h1>
      </div>
      {body}
    </main>
  );

  if (phase === 'cards') {
    const last = card === topic.cards.length - 1;
    return shell(`Объяснение ${card + 1}/${topic.cards.length}`,
      <motion.div key={card} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6 rounded-xl3 bg-card p-8 shadow">
        <div className="flex items-start gap-5">
          <Mascot size={90} />
          <p className="text-2xl leading-relaxed"><Rich text={topic.cards[card]} /></p>
        </div>
        <div className="flex justify-between">
          <Btn ghost onClick={() => card > 0 && setCard(card - 1)}>← Назад</Btn>
          <Btn onClick={() => (last ? (topic.example ? setPhase('example') : afterList(afterIntro)) : setCard(card + 1))}>
            {last ? 'Дальше →' : 'Понятно →'}
          </Btn>
        </div>
      </motion.div>);
  }

  if (phase === 'example' && topic.example) {
    const ex = topic.example;
    const all = step >= ex.steps.length;
    return shell('Разберём пример',
      <div className="flex flex-col gap-4 rounded-xl3 bg-card p-8 shadow">
        <h2 className="text-2xl font-extrabold">{ex.title}</h2>
        {ex.steps.slice(0, step).map((s, k) => (
          <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl2 bg-bg p-4">
            <p className="text-xl font-bold">Шаг {k + 1}. {s.text}</p>
            <p className="mt-1 text-mute">Почему так: {s.why}</p>
          </motion.div>
        ))}
        <div className="self-end">
          <Btn onClick={() => (all ? afterList(afterIntro) : setStep(step + 1))}>{all ? 'Проверь себя →' : 'Следующий шаг'}</Btn>
        </div>
      </div>);
  }

  if (phase === 'selfcheck') {
    const it = selfItems[i];
    return shell(`Проверь себя ${i + 1}/${selfItems.length}`,
      <TaskView key={it.task.id} task={it.task} scored={false}
        onNext={() => (i + 1 < selfItems.length ? setI(i + 1) : afterList('practice'))} />);
  }

  if (phase === 'practice' || phase === 'bonus') {
    const it = items[i];
    const total = items.filter((x) => x.counted).length;
    const label = phase === 'practice' ? `Практика ${Math.min(i + 1, total)}/${total}` : 'Бонус';
    return shell(label,
      <TaskView key={it.task.id} task={it.task} extraBonus={comboBonus(streak + 1)} onNext={answered} />);
  }

  if (phase === 'bonusAsk') {
    return shell('Бонус',
      <div className="flex flex-col items-center gap-5 rounded-xl3 bg-card p-8 text-center shadow">
        <Mascot size={110} cheer />
        <h2 className="text-2xl font-extrabold">Хочешь бонусные задания?</h2>
        <p className="text-mute">Они посложнее, зато дают по 30 баллов. Можно пропустить.</p>
        <div className="flex gap-3">
          <Btn ghost onClick={() => afterList('result')}>Пропустить</Btn>
          <Btn onClick={() => { setItems(build(topic.bonus, false)); afterList('bonus'); }}>Давай! 🏆</Btn>
        </div>
      </div>);
  }

  const passed = percent >= TOPIC_PASS_PERCENT;
  return shell('Итог',
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-xl3 bg-card p-8 text-center shadow">
      <Mascot size={130} cheer={passed} />
      <h2 className="text-3xl font-extrabold">
        {passed ? `${settings.name}, тема пройдена! 🎉` : 'Ты не сдался — это главное!'}
      </h2>
      <p className="text-xl">Правильно с первого раза: <b>{percent}%</b></p>
      <p className="text-xl">Заработано баллов: <b>{stats.gained + topicBonus}</b>{topicBonus > 0 && ` (в том числе +${topicBonus} за тему)`}</p>
      {!passed && <p className="text-mute">Попробуй ещё раз — с каждым разом получается лучше.</p>}
      {stats.wrong.length > 0 && (
        <div className="w-full rounded-xl2 bg-bg p-4 text-left">
          <p className="mb-1 font-extrabold">Стоит повторить:</p>
          <ul className="list-disc pl-6">{[...new Set(stats.wrong)].slice(0, 5).map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      )}
      <div className="flex gap-3">
        <Btn ghost onClick={onExit}>К темам</Btn>
        <Btn onClick={() => onRetry()}>Ещё раз</Btn>
      </div>
    </motion.div>);
}
