import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { Rich } from '../components/Rich';
import { TaskView, type TaskResult } from '../components/TaskView';
import { Visual } from '../components/Visual';
import { findTopic, imageUrl } from '../content/loader';
import { isGeneratorRef, type Entry, type Task } from '../content/schema';
import { ACCESSORIES, type ChestResult } from '../engine/chest';
import { starsFor } from '../engine/level';
import { introSteps, queueAfterAnswer, samplePractice, type LessonItem } from '../engine/lesson';
import { comboBonus, TOPIC_PASS_PERCENT } from '../engine/points';
import { withVariety } from '../engine/variety';
import { generate } from '../generators';
import { useApp } from '../store/useApp';

type Item = LessonItem;
type Phase = 'cards' | 'example' | 'selfcheck' | 'practice' | 'bonusAsk' | 'bonus' | 'result';

const Btn = ({ children, onClick, ghost }: { children: React.ReactNode; onClick(): void; ghost?: boolean }) => (
  <button onClick={onClick}
    className={`rounded-xl2 px-8 text-lg font-extrabold active:scale-95 ${ghost ? 'bg-soft' : 'bg-brand text-onbrand'}`}>
    {children}
  </button>
);

export function Lesson({ subjectId, topicId, onExit, onRetry }: { subjectId: string; topicId: string; onExit(): void; onRetry(): void }) {
  const found = findTopic(subjectId, topicId);
  const { recordAnswer, finishTopic, openChest, settings, topicResults, setLastTopic } = useApp();
  useEffect(() => { setLastTopic(subjectId, topicId); }, [subjectId, topicId]);
  const topic = found!.topic;
  const ctx = { subject: subjectId, topicId };

  const build = (entries: Entry[], counted: boolean, variety = false): Item[] => {
    // тема уже пройдена: часть вопросов приходит в другом виде («собери слово», «соедини пары»)
    const statics = entries.filter((e): e is Task => !isGeneratorRef(e));
    const varied = variety ? withVariety(statics, Math.random) : statics;
    const keep = new Map(varied.map((t) => [t.id, t]));
    const out: Item[] = [];
    for (const e of entries) {
      if (isGeneratorRef(e)) out.push({ task: generate(e, ctx), counted, entry: e });
      else if (keep.has(e.id)) out.push({ task: keep.get(e.id)!, counted });
    }
    return out;
  };

  const [phase, setPhase] = useState<Phase>(topic.cards.length ? 'cards' : 'practice');
  const [card, setCard] = useState(0);
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<Item[]>(() => {
    // не первая попытка: часть вопросов берём из запаса темы, чтобы урок не повторялся слово в слово
    const again = (topicResults[topic.id]?.attempts ?? 0) > 0;
    return build(again ? samplePractice(topic.practice, topic.pool, Math.random) : topic.practice, true, topicResults[topic.id]?.done === true);
  });
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ counted: 0, correct: 0, gained: 0, wrong: [] as string[] });
  const [outcome, setOutcome] = useState<{ bonus: number; newStars: number; card?: string }>({ bonus: 0, newStars: 0 });
  const topicBonus = outcome.bonus;
  const [hintsUsed, setHintsUsed] = useState(0);
  const [chest, setChest] = useState<ChestResult>();
  const finished = useRef(false);

  const intro = useMemo(() => introSteps(topic.cards, topic.selfCheck), []);
  const selfItems = useMemo(() => build(intro.rest, false), []);
  const [fixed, setFixed] = useState(0);
  const percent = stats.counted ? Math.round((stats.correct / stats.counted) * 100) : 0;

  useEffect(() => {
    if (phase !== 'result' || finished.current) return;
    finished.current = true;
    setOutcome(finishTopic(topic.id, percent, { noHints: hintsUsed === 0 }));
    if (percent >= TOPIC_PASS_PERCENT && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [phase]);

  const afterList = (next: Phase) => { setI(0); setPhase(next); };
  const afterIntro: Phase = intro.rest.length ? 'selfcheck' : 'practice';

  const answered = (r: TaskResult) => {
    const item = items[i];
    const newStreak = r.correct ? streak + 1 : 0;
    const combo = r.correct ? comboBonus(newStreak) : 0;
    const gained = recordAnswer({
      subject: subjectId, topicId, question: item.task.question, correct: r.correct, points: r.points + combo, combo: combo > 0,
      taskId: item.task.id, entry: item.entry,
    });
    setHintsUsed((h) => h + r.hints);
    setStreak(newStreak);
    setStats((s) => ({
      counted: s.counted + (item.counted ? 1 : 0),
      correct: s.correct + (item.counted && r.correct ? 1 : 0),
      gained: s.gained + gained,
      wrong: r.correct || item.retry ? s.wrong : [...s.wrong, item.task.question],
    }));
    if (item.retry && r.correct) setFixed((f) => f + 1);
    // после ошибки: похожее задание или этот же вопрос ещё раз в конце урока; в процент не входит
    const list = queueAfterAnswer(items, i, r.correct, (e) => generate(e, ctx));
    if (list !== items) setItems(list);
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
    const cur = intro.steps[card];
    const last = card === intro.steps.length - 1;
    const forward = () => (last ? (topic.example ? setPhase('example') : afterList(afterIntro)) : setCard(card + 1));
    if (cur.kind === 'check') {
      return shell('Проверь себя',
        <TaskView key={cur.task.id} task={cur.task} scored={false} cards={topic.cards} onNext={forward} />);
    }
    const shown = intro.steps.slice(0, card + 1).filter((x) => x.kind === 'card').length;
    return shell(`Объяснение ${shown}/${topic.cards.length}`,
      <motion.div key={card} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6 rounded-xl3 bg-card p-8 shadow">
        <div className="flex items-start gap-5">
          <Mascot size={90} />
          <p className="text-2xl leading-relaxed"><Rich text={topic.cards[cur.index]} /></p>
        </div>
        {(topic.images ?? []).filter((im) => im.card === cur.index && imageUrl(im.file)).map((im) => (
          <figure key={im.file} className="flex flex-col items-center gap-2">
            <img src={imageUrl(im.file)} alt={`${im.author}. «${im.title}»`} draggable={false}
              className="max-h-[420px] w-auto max-w-full rounded-xl2 shadow" />
            <figcaption className="text-center font-bold text-mute">{im.author}. «{im.title}»</figcaption>
          </figure>
        ))}
        {(topic.visuals ?? []).filter((x) => x.card === cur.index).map((x, i) => <Visual key={i} v={x.visual} />)}
        <div className="flex justify-between">
          <Btn ghost onClick={() => card > 0 && setCard(card - 1)}>← Назад</Btn>
          <Btn onClick={forward}>{last ? 'Дальше →' : 'Понятно →'}</Btn>
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
      <TaskView key={it.task.id} task={it.task} scored={false} cards={topic.cards}
        onNext={() => (i + 1 < selfItems.length ? setI(i + 1) : afterList('practice'))} />);
  }

  if (phase === 'practice' || phase === 'bonus') {
    const it = items[i];
    const total = items.filter((x) => x.counted).length;
    const label = it.retry ? 'Исправляем ошибки' : phase === 'practice' ? `Практика ${Math.min(i + 1, total)}/${total}` : 'Бонус';
    return shell(label,
      <TaskView key={`${i}-${it.task.id}`} task={it.task} extraBonus={comboBonus(streak + 1)} cards={topic.cards}
        repeat={topicResults[topic.id]?.done === true || it.retry === true} note={it.retry ? '🔁 Вернёмся к этому вопросу' : undefined} onNext={answered} />);
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
      <div className="flex gap-2 text-5xl" aria-label={`Звёзд: ${starsFor(percent)} из 3`}>
        {[1, 2, 3].map((k) => (
          <motion.span key={k} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + k * 0.25, type: 'spring' }}
            style={{ filter: starsFor(percent) >= k ? 'none' : 'grayscale(1) opacity(.35)' }}>⭐</motion.span>
        ))}
      </div>
      <p className="text-xl">Правильно с первого раза: <b>{percent}%</b></p>
      {outcome.newStars > 0 && starsFor(percent) >= 2 && <p className="font-bold text-okink">Новая звезда за результат! Бонус к баллам уже начислен.</p>}
      {passed && starsFor(percent) < 3 && <p className="text-sm text-mute">Чтобы получить следующую звезду, пройди тему ещё раз на {starsFor(percent) === 1 ? 90 : 100}%.</p>}
      {outcome.card && topic.card && (
        <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: 0.9 }}
          className="w-full max-w-md rounded-xl3 border border-sun bg-sun/15 p-4 text-left">
          <p className="text-sm font-extrabold uppercase tracking-wide text-accentink">Новая карточка знаний</p>
          <p className="text-2xl font-extrabold">{topic.card.emoji} {topic.card.title}</p>
          <p className="mt-1">{topic.card.fact}</p>
        </motion.div>
      )}
      <p className="text-xl">Заработано баллов: <b>{stats.gained + topicBonus}</b>{topicBonus > 0 && ` (в том числе +${topicBonus} за тему)`}</p>
      {fixed > 0 && <p className="font-bold text-okink">Исправлено ошибок в конце урока: {fixed} 💪</p>}
      {!passed && <p className="text-mute">Попробуй ещё раз — с каждым разом получается лучше.</p>}
      {stats.wrong.length > 0 && (
        <div className="w-full rounded-xl2 bg-bg p-4 text-left">
          <p className="mb-1 font-extrabold">Стоит повторить:</p>
          <ul className="list-disc pl-6">{[...new Set(stats.wrong)].slice(0, 5).map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      )}
      {passed && !chest && topicResults[topic.id]?.done && !topicResults[topic.id]?.chestOpened && (
        <motion.button whileTap={{ scale: 0.9 }} animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}
          onClick={() => setChest(openChest(topic.id))}
          className="rounded-xl3 bg-accent px-8 py-4 text-2xl font-extrabold text-onaccent shadow">🎁 Открыть сундук-сюрприз!</motion.button>
      )}
      {chest && (
        <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl3 bg-ok/15 px-6 py-3 text-2xl font-extrabold">
          {chest.kind === 'sticker' && `В сундуке стикер ${chest.id}!`}
          {chest.kind === 'accessory' && `В сундуке украшение Бусела: ${ACCESSORIES.find((a) => a.id === chest.id)?.emoji} ${ACCESSORIES.find((a) => a.id === chest.id)?.name}!`}
          {chest.kind === 'points' && `В сундуке +${chest.amount} баллов!`}
        </motion.p>
      )}
      <div className="flex gap-3">
        <Btn ghost onClick={onExit}>К темам</Btn>
        <Btn onClick={() => onRetry()}>Ещё раз</Btn>
      </div>
    </motion.div>);
}
