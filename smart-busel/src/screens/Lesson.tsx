import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { motion } from 'framer-motion';
import { ChestButton, ChestPrize } from '../components/Chest';
import { Mascot } from '../components/Mascot';
import { Rich } from '../components/Rich';
import { Spark } from '../components/Spark';
import { TaskView, type TaskResult } from '../components/TaskView';
import { Visual } from '../components/Visual';
import { findTopic, imageUrl } from '../content/loader';
import { isGeneratorRef, type Entry, type Task } from '../content/schema';
import type { ChestResult } from '../engine/chest';
import { starsFor } from '../engine/level';
import { afterWrong, introSteps, queueAfterAnswer, samplePractice, type LessonItem } from '../engine/lesson';
import { comboBonus, TOPIC_PASS_PERCENT } from '../engine/points';
import { nudgeAfter, NUDGE_TEXT, type AnswerSignal, type Nudge } from '../engine/engagement';
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
  const { recordAnswer, finishTopic, openChest, settings, topicResults, setLastTopic, mistakes, markEvent } = useApp();
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
  const [foundSelf, setFoundSelf] = useState(0); // верно со второй попытки
  // для итога и похвалы: как тема шла раньше и в каких вопросах он ошибался прежде
  const [before] = useState(() => topicResults[topic.id]);
  const pastMistakes = useMemo(() => new Set(mistakes.filter((m) => m.topicId === topic.id).map((m) => m.question)), []);
  // состояние ребёнка: ответы урока, предложения Бусела
  const history = useRef<AnswerSignal[]>([]);
  const nudgeSince = useRef<Partial<Record<Nudge, number>>>({});
  const startedAt = useRef(Date.now());
  const [nudge, setNudge] = useState<Nudge>();
  const [slowNext, setSlowNext] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [harderIds, setHarderIds] = useState<string[]>([]);
  const rightIds = useRef<Set<string>>(new Set());
  const restExit = useRef(false);
  const answeredCount = useRef(0);
  const bonusLeft = topic.bonus.filter((e) => !harderIds.includes(isGeneratorRef(e) ? e.generator : e.id));
  // ушёл с середины урока — для родительского отчёта (не после итога и не на отдых по совету Бусела)
  useEffect(() => () => { if (!finished.current && !restExit.current && answeredCount.current > 0) markEvent('abandoned'); }, []);
  const percent = stats.counted ? Math.round((stats.correct / stats.counted) * 100) : 0;

  useEffect(() => {
    if (phase !== 'result' || finished.current) return;
    finished.current = true;
    setOutcome(finishTopic(topic.id, percent, { noHints: hintsUsed === 0 }));
  }, [phase]);

  const afterList = (next: Phase) => { setI(0); setPhase(next); };
  const afterIntro: Phase = intro.rest.length ? 'selfcheck' : 'practice';

  const endOfList = () => {
    if (phase === 'practice' && bonusLeft.length) afterList('bonusAsk'); else afterList('result');
  };

  const answered = (r: TaskResult) => {
    const item = items[i];
    setNudge(undefined); setShowCards(false); setSlowNext(false);
    if (item.finale) { endOfList(); return; } // «финиш на успехе» — без баллов и статистики
    answeredCount.current++;
    // «верно с первого раза» — для процента темы, серии и статистики; со второй попытки баллы всё равно начисляются
    const newStreak = r.firstTry ? streak + 1 : 0;
    const combo = r.firstTry ? comboBonus(newStreak) : 0;
    const gained = recordAnswer({
      subject: subjectId, topicId, question: item.task.question, correct: r.firstTry, points: r.points + combo, combo: combo > 0,
      taskId: item.task.id, entry: item.entry,
      fixed: !!item.retry && r.correct, secondTry: r.correct && !r.firstTry, guess: r.guess,
    });
    setHintsUsed((h) => h + r.hints);
    setStreak(newStreak);
    setStats((s) => ({
      counted: s.counted + (item.counted ? 1 : 0),
      correct: s.correct + (item.counted && r.firstTry ? 1 : 0),
      gained: s.gained + gained,
      wrong: r.firstTry || item.retry ? s.wrong : [...s.wrong, item.task.question],
    }));
    if (item.retry && r.correct) setFixed((f) => f + 1);
    if (r.correct && !r.firstTry) setFoundSelf((f) => f + 1);
    if (r.firstTry && item.counted) rightIds.current.add(item.task.id);

    // что сейчас с ребёнком — и нужно ли слово Бусела
    history.current.push({ correct: r.correct, firstTry: r.firstTry, hints: r.hints, guess: r.guess, ms: r.ms });
    const minutes = (Date.now() - startedAt.current) / 60000;
    const n = nudgeAfter(history.current, minutes, { canHarder: phase === 'practice' && bonusLeft.length > 0 && harderIds.length === 0 }, nudgeSince.current);
    if (n) { nudgeSince.current[n] = history.current.length; setNudge(n); if (n === 'guess') setSlowNext(true); }

    // после ошибки: похожее задание или этот же вопрос ещё раз в конце урока; в процент не входит
    let list = queueAfterAnswer(items, i, r.correct, (e) => generate(e, ctx));
    if (i + 1 >= list.length && phase === 'practice' && !r.correct) {
      // «финиш на успехе»: урок не заканчивается ошибкой — напоследок вопрос, который он уже решил верно
      const easy = [...list].reverse().find((x) => rightIds.current.has(x.task.id) && x.task.type !== 'match');
      if (easy) list = [...list, { task: easy.task, counted: false, finale: true }];
    }
    if (list !== items) setItems(list);
    if (i + 1 < list.length) setI(i + 1);
    else endOfList();
  };

  /** «Хочешь вопрос посложнее?» — да: следующим идёт бонусное задание (в процент не входит). */
  const takeHarder = () => {
    const e = bonusLeft[0];
    if (!e) return;
    const [extra] = build([e], false);
    setHarderIds((h) => [...h, isGeneratorRef(e) ? e.generator : e.id]);
    setItems((list) => [...list.slice(0, i), { ...extra, harder: true }, ...list.slice(i)]);
    markEvent('harder');
    setNudge(undefined);
  };

  /** Слово Бусела между вопросами: угадывает, застрял, устал, слишком легко. */
  const nudgeCard = nudge && (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="status"
      className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-xl3 border border-line bg-card p-4 shadow">
      <div className="flex items-center gap-3">
        <Mascot size={80} mood={nudge === 'tired' ? 'rest' : nudge === 'easy' ? 'cheer' : nudge === 'stuck' ? 'support' : 'think'} />
        <p className="flex-1 text-lg font-bold">{NUDGE_TEXT[nudge]}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {nudge === 'guess' && <button onClick={() => setNudge(undefined)} className="rounded-xl2 bg-soft px-5 font-bold">Хорошо</button>}
        {nudge === 'stuck' && <>
          <button onClick={() => setShowCards((v) => !v)} className="rounded-xl2 bg-soft px-5 font-bold"><Icon name="book" /> {showCards ? 'Скрыть объяснение' : 'Открыть объяснение'}</button>
          <button onClick={() => setNudge(undefined)} className="rounded-xl2 bg-brand px-5 font-bold text-onbrand">Продолжить</button>
        </>}
        {nudge === 'tired' && <>
          <button onClick={() => setNudge(undefined)} className="rounded-xl2 bg-soft px-5 font-bold">Ещё немного</button>
          <button onClick={() => { restExit.current = true; onExit(); }} className="rounded-xl2 bg-brand px-5 font-bold text-onbrand">Отдохнуть</button>
        </>}
        {nudge === 'easy' && <>
          <button onClick={() => setNudge(undefined)} className="rounded-xl2 bg-soft px-5 font-bold">Нет, дальше</button>
          <button onClick={takeHarder} className="rounded-xl2 bg-brand px-5 font-bold text-onbrand">Давай посложнее!</button>
        </>}
      </div>
      {nudge === 'stuck' && showCards && (
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl2 bg-bg p-4">
          {topic.cards.map((c, k) => <p key={k} className="text-lg leading-relaxed"><Rich text={c} /></p>)}
        </div>
      )}
    </motion.div>
  );

  const shell = (title: string, body: React.ReactNode) => (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="rounded-xl2 bg-card px-5 shadow"><Icon name="close" /> Выйти</button>
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
          <Mascot size={132} mood="read" />
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
          <Btn ghost onClick={() => card > 0 && setCard(card - 1)}><Icon name="back" /> Назад</Btn>
          <Btn onClick={forward}>{last ? 'Дальше' : 'Понятно'} <Icon name="next" /></Btn>
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
          <Btn onClick={() => (all ? afterList(afterIntro) : setStep(step + 1))}>{all ? <>Проверь себя <Icon name="next" /></> : 'Следующий шаг'}</Btn>
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
    const label = it.finale ? 'Напоследок' : it.retry ? 'Исправляем ошибки' : it.harder ? 'Вопрос посложнее' : phase === 'practice' ? `Практика ${Math.min(i + 1, total)}/${total}` : 'Бонус';
    const note = it.finale ? 'Напоследок — вопрос, который ты уже решил верно' : it.retry ? 'Вернёмся к этому вопросу' : it.harder ? 'Ты сам выбрал вопрос посложнее' : undefined;
    return shell(label,
      <>
        {nudgeCard}
        <TaskView key={`${i}-${it.task.id}`} task={it.task} extraBonus={comboBonus(streak + 1)} cards={topic.cards} scored={!it.finale}
          repeat={topicResults[topic.id]?.done === true || it.retry === true} note={note}
          retryItem={!!it.retry} pastMistake={pastMistakes.has(it.task.question)} streakBefore={streak}
          nextAfterWrong={it.finale ? 'none' : afterWrong(items, i)} slowStart={slowNext} onNext={answered} />
      </>);
  }

  if (phase === 'bonusAsk') {
    return shell('Бонус',
      <div className="flex flex-col items-center gap-5 rounded-xl3 bg-card p-8 text-center shadow">
        <Mascot size={130} cheer />
        <h2 className="text-2xl font-extrabold">Хочешь бонусные задания?</h2>
        <p className="text-mute">Они посложнее, зато дают по 30 баллов. Можно пропустить.</p>
        <div className="flex gap-3">
          <Btn ghost onClick={() => afterList('result')}>Пропустить</Btn>
          <Btn onClick={() => { setItems(build(bonusLeft, false)); afterList('bonus'); }}>Давай!</Btn>
        </div>
      </div>);
  }

  const passed = percent >= TOPIC_PASS_PERCENT;
  // итог начинается с роста: что получилось лучше, чем раньше, и что он сделал сам
  const growth: string[] = [];
  if (before && before.attempts > 0 && percent > before.bestPercent) growth.push(`В прошлый раз было ${before.bestPercent}%, сейчас ${percent}% — ты растёшь.`);
  if (fixed > 0) growth.push(`Исправил ошибок в конце урока: ${fixed}.`);
  if (foundSelf > 0) growth.push(`Нашёл ответ сам со второй попытки: ${foundSelf}.`);
  if (harderIds.length > 0) growth.push('Сам выбрал вопрос посложнее.');
  const stubborn = !passed && (before?.attempts ?? 0) + 1 >= 3; // тема не идёт третий раз
  return shell('Итог',
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-xl3 bg-card p-8 text-center shadow">
      <Spark fire={passed}><Mascot size={150} mood={passed ? 'cheer' : 'support'} /></Spark>
      <h2 className="text-3xl font-extrabold">
        {passed ? `${settings.name}, тема пройдена!` : 'Сегодня было трудно, а ты дошёл до конца.'}
      </h2>
      {growth.length > 0 && (
        <ul className="flex w-full max-w-md flex-col gap-2 text-left">
          {growth.map((g) => <li key={g} className="flex items-start gap-2 rounded-xl2 bg-ok/15 px-4 py-2 font-bold"><Icon name="check" className="mt-1 text-okink" /> {g}</li>)}
        </ul>
      )}
      <div className="flex gap-2 text-5xl" aria-label={`Звёзд: ${starsFor(percent)} из 3`}>
        {[1, 2, 3].map((k) => (
          <motion.span key={k} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 + k * 0.12, duration: 0.22 }}
            className={starsFor(percent) >= k ? 'text-sun' : 'text-mute opacity-50'}><Icon name={starsFor(percent) >= k ? 'star' : 'starOff'} size={24} style={{ width: '3rem', height: '3rem' }} /></motion.span>
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
      {!passed && !stubborn && <p className="text-mute">В следующий раз начнём с того, где были ошибки — так и запоминается.</p>}
      {stubborn && <p className="max-w-md text-mute">Эта тема пока сопротивляется — так бывает с трудным. Можно пройти другую тему и вернуться позже или разобрать эту вместе с родителями.</p>}
      {stats.wrong.length > 0 && (
        <div className="w-full rounded-xl2 bg-bg p-4 text-left">
          <p className="mb-1 font-extrabold">Стоит повторить:</p>
          <ul className="list-disc pl-6">{[...new Set(stats.wrong)].slice(0, 5).map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      )}
      {passed && !chest && topicResults[topic.id]?.done && !topicResults[topic.id]?.chestOpened && (
        <ChestButton label="Открыть сундук-сюрприз" onOpen={() => setChest(openChest(topic.id))} />
      )}
      {chest && <ChestPrize result={chest} mascot />}
      <div className="flex gap-3">
        <Btn ghost onClick={onExit}>К темам</Btn>
        <Btn onClick={() => onRetry()}>Ещё раз</Btn>
      </div>
    </motion.div>);
}
