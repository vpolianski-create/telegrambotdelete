import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { phoneBottomBar } from './AppBar';
import { motion } from 'framer-motion';
import { imageUrl } from '../content/loader';
import { Visual } from './Visual';
import type { Task } from '../content/schema';
import { checkAnswer } from '../engine/answers';
import { minReadMs, IDLE_MS, SLOWDOWN_MS } from '../engine/engagement';
import { explainTitle, IDLE_TEXT, praiseFor, retryPrompt, wrongNote } from '../engine/feedback';
import { canRetry, hintsFor } from '../engine/lesson';
import { taskPoints } from '../engine/points';
import { shuffle } from '../engine/rng';
import { play } from '../audio/sfx';
import { speak } from '../audio/speech';
import { Mascot } from './Mascot';
import { MatchInput } from './MatchInput';
import { OrderInput } from './OrderInput';
import { Rich } from './Rich';

/**
 * correct — итог (верно с первой или со второй попытки), firstTry — верно с первого раза (идёт в статистику и проценты),
 * ms — сколько думал над первой попыткой, guess — ответил быстрее, чем можно прочитать вопрос.
 */
export interface TaskResult { correct: boolean; firstTry: boolean; hints: number; points: number; ms: number; guess: boolean }

interface Props {
  task: Task;
  scored?: boolean; // false для «Проверь себя»
  speakWord?: string; // автоматически произнести слово
  extraBonus?: number; // бонус за комбо, показывается после верного ответа
  repeat?: boolean; // тема уже пройдена: баллы за повтор вдвое меньше
  cards?: string[]; // карточки урока: нужная показывается как подсказка
  note?: string; // пометка над заданием, например «Вернёмся к этому вопросу»
  retryItem?: boolean; // этот вопрос вернулся после ошибки в этом же уроке
  pastMistake?: boolean; // этот вопрос есть в прошлых ошибках
  streakBefore?: number; // верных подряд до этого вопроса
  nextAfterWrong?: 'similar' | 'end' | 'review' | 'none'; // что будет, если ответ окажется неверным
  slowStart?: boolean; // после ответов наугад: варианты становятся доступны через 1,5 с
  onFilm?(): void; // у темы есть мультурок: после ошибки можно посмотреть объяснение в ролике
  onNext(r: TaskResult): void;
}

type Status = 'idle' | 'retry' | 'right' | 'wrong';
type Given = string | boolean | string[];

export function TaskView({ task, scored = true, speakWord, extraBonus = 0, repeat = false, cards = [], note, retryItem = false, pastMistake = false, streakBefore = 0, nextAfterWrong = 'none', slowStart = false, onFilm, onNext }: Props) {
  // у «порядка» варианты уже перемешаны; у «пар» перемешиваем правую колонку
  const options = useMemo(() => (task.options && task.type !== 'order' && task.type !== 'match' ? shuffle(Math.random, task.options) : task.options ?? []), [task.id]);
  const rightSide = useMemo(() => (task.type === 'match' ? shuffle(Math.random, task.answer as string[]) : []), [task.id]);
  const [given, setGiven] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [picked, setPicked] = useState<string | boolean>();
  const [wrongPicks, setWrongPicks] = useState<(string | boolean)[]>([]);
  const hintList = useMemo(() => hintsFor(task, cards), [task.id]);
  const [hints, setHints] = useState(0); // подсказки, которые взял сам
  const [autoHint, setAutoHint] = useState(false); // бесплатная подсказка после первой ошибки
  const [ready, setReady] = useState(!slowStart);
  const [idle, setIdle] = useState(false);
  const [phrase] = useState(() => ({ retry: retryPrompt(), explain: explainTitle() }));
  const inputRef = useRef<HTMLInputElement>(null);
  const shownAt = useRef(Date.now());
  const first = useRef<{ ms: number; guess: boolean }>({ ms: 0, guess: false });

  useEffect(() => {
    if (speakWord) speak(speakWord);
    inputRef.current?.focus();
  }, [task.id]);

  // после ответов наугад — короткая пауза, чтобы вопрос успели прочитать (на экране это не таймер, а просто неактивные варианты)
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => { setReady(true); shownAt.current = Date.now(); }, SLOWDOWN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === 'right') play(extraBonus > 0 && attempt === 1 ? 'combo' : 'correct');
    if (status === 'wrong' || status === 'retry') play('soft');
    if (status === 'retry') inputRef.current?.select();
  }, [status]);

  const done = status === 'right' || status === 'wrong';

  // долго ничего не делает — мягкое напоминание (сбрасывается при любом действии)
  useEffect(() => {
    if (done) { setIdle(false); return; }
    let t = setTimeout(() => setIdle(true), IDLE_MS);
    const reset = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), IDLE_MS); };
    window.addEventListener('keydown', reset);
    window.addEventListener('pointerdown', reset);
    return () => { clearTimeout(t); window.removeEventListener('keydown', reset); window.removeEventListener('pointerdown', reset); };
  }, [done]);

  const points = scored ? taskPoints(task.difficulty, hints, repeat, attempt === 2) : 0;

  const submit = (value: Given) => {
    if (done || !ready) return;
    if (attempt === 1) {
      const ms = Date.now() - shownAt.current;
      first.current = { ms, guess: ms < minReadMs(task) };
    }
    if (Array.isArray(value)) setGiven(value); else setPicked(value);
    if (checkAnswer(task, value)) { setStatus('right'); return; }
    if (attempt === 1 && canRetry(task)) {
      // первая ошибка: наводящая подсказка (бесплатно) и вторая попытка
      setAttempt(2);
      if (!Array.isArray(value)) setWrongPicks((w) => [...w, value]);
      if (hints < hintList.length) setAutoHint(true);
      setStatus('retry');
      return;
    }
    setStatus('wrong');
  };

  /** «Покажи на карте»: вместо кнопок с вариантами — точки на карте. */
  const mapPick = task.type === 'single' && task.visual?.kind === 'map' && !!task.visual.pick;

  // клавиши 1–4 выбирают вариант ответа
  useEffect(() => {
    if (done || !ready || mapPick || (task.type !== 'single' && task.type !== 'truefalse')) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const k = Number(e.key) - 1;
      if (task.type === 'single' && k >= 0 && k < options.length && !wrongPicks.includes(options[k])) submit(options[k]);
      if (task.type === 'truefalse' && (k === 0 || k === 1)) submit(k === 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task.id, done, ready, wrongPicks, attempt]);

  /** Оформление варианта: до ответа — обычный (уже выбранный неверный — зачёркнут), после — верный зелёный с ✓, неверные с ✗. */
  const mark = (value: string | boolean) => {
    const wasWrong = wrongPicks.includes(value);
    if (!done) return wasWrong ? { cls: 'border-accent bg-accent/10 opacity-70 line-through', sign: 'close' as const, off: true } : { cls: 'border-line bg-bg hover:border-brand', sign: '' as const, off: !ready };
    if (checkAnswer(task, value)) return { cls: 'border-ok bg-ok/15', sign: 'check' as const, off: true };
    if (picked === value || wasWrong) return { cls: 'border-accent bg-accent/10', sign: 'close' as const, off: true };
    return { cls: 'border-line bg-bg opacity-60', sign: '' as const, off: true };
  };
  const Key = ({ n }: { n: number }) => (
    <span aria-hidden className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-soft text-sm font-bold text-mute">{n}</span>
  );
  const label = { basic: '', advanced: 'Повышенная сложность', bonus: 'Бонус' }[task.difficulty];
  const shownHints = Math.min(hintList.length, hints + (autoHint ? 1 : 0));
  const praise = useMemo(() => (status === 'right'
    ? praiseFor({ attempt, hints, difficulty: task.difficulty, streak: attempt === 1 ? streakBefore + 1 : 0, retry: retryItem, pastMistake, ms: first.current.ms })
    : undefined), [status]);

  return (
    <div data-task={task.type} {...(import.meta.env.DEV ? { 'data-answer': Array.isArray(task.answer) ? JSON.stringify(task.answer) : String(task.answer), 'data-status': status } : {})}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl3 bg-card p-6 shadow max-sm:gap-4 max-sm:p-5">
      {(label || note) && (
        <span className="text-sm font-extrabold text-accentink">
          <Icon name={note ? 'review' : task.difficulty === 'bonus' ? 'collection' : 'star'} /> {[note, label].filter(Boolean).join(' · ')}
        </span>
      )}
      <div className="flex items-start gap-3">
        <h2 className="flex-1 text-2xl font-extrabold leading-snug">{task.question}</h2>
        {speakWord && (
          <button onClick={() => speak(speakWord)} aria-label="Послушать" title="Послушать" className="rounded-xl2 bg-brand px-4 text-onbrand"><Icon name="sound" size={24} /></button>
        )}
      </div>
      {!ready && <p className="text-sm font-bold text-mute">Сначала прочитай вопрос…</p>}

      {task.image && imageUrl(task.image) && (
        <img src={imageUrl(task.image)} alt="Картина к заданию" draggable={false}
          className="mx-auto max-h-[300px] w-auto max-w-full rounded-xl2 shadow" />
      )}

      {mapPick
        ? <Visual v={task.visual!} pick={{ done, picked: typeof picked === 'string' ? picked : undefined, answer: String(task.answer), onPick: submit, excluded: wrongPicks.filter((x): x is string => typeof x === 'string') }} />
        : task.visual && (!task.visualAfter || done) && <Visual v={task.visual} />}

      {(task.type === 'single') && !mapPick && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o, k) => (
            <button key={o} data-option={o} disabled={mark(o).off} onClick={() => submit(o)}
              className={`flex min-h-touch items-center rounded-xl2 border-2 px-4 py-3 text-left text-lg font-bold transition-transform active:scale-95 ${mark(o).cls}`}>
              <Key n={k + 1} /><span className="flex-1">{o}</span>
              {mark(o).sign && <Icon name={mark(o).sign || 'check'} size={24} className="ml-2" label={mark(o).sign === 'check' ? 'верно' : 'неверно'} />}
            </button>
          ))}
        </div>
      )}

      {task.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v, k) => (
            <button key={String(v)} data-option={String(v)} disabled={mark(v).off} onClick={() => submit(v)}
              className={`flex min-h-touch items-center rounded-xl2 border-2 px-4 py-3 text-left text-lg font-bold active:scale-95 ${mark(v).cls}`}>
              <Key n={k + 1} /><span className="flex-1">{v ? 'Верно' : 'Неверно'}</span>
              {mark(v).sign && <Icon name={mark(v).sign || 'check'} size={24} className="ml-2" label={mark(v).sign === 'check' ? 'верно' : 'неверно'} />}
            </button>
          ))}
        </div>
      )}

      {(task.type === 'input' || task.type === 'fill') && (
        <form className="phone-stack flex gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) submit(text); }}>
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} disabled={done || !ready}
            aria-label="Ответ" autoComplete="off" spellCheck={false}
            className="min-h-touch min-w-0 flex-1 rounded-xl2 border-2 border-line bg-bg px-4 text-xl font-bold focus:border-brand focus:outline-none" />
          <button type="submit" disabled={done || !ready || !text.trim()} className="shrink-0 rounded-xl2 bg-brand px-6 text-lg font-extrabold text-onbrand disabled:opacity-40">
            Проверить
          </button>
        </form>
      )}

      {/* у «порядка» и «пар» вторая попытка начинается с чистого листа */}
      {task.type === 'order' && (
        <OrderInput key={attempt} options={options} kind={task.kind ?? 'list'} disabled={done || !ready} onSubmit={submit}
          correct={done ? given.map((x, i) => checkAnswer({ type: 'input', answer: (task.answer as string[])[i] }, x)) : undefined} />
      )}
      {task.type === 'match' && (
        <MatchInput key={attempt} left={options} right={rightSide} disabled={done || !ready} answer={done ? (task.answer as string[]) : undefined} onSubmit={submit} />
      )}

      {status === 'retry' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3" role="status">
          <Mascot size={88} mood="think" />
          <p className="text-lg font-extrabold text-accentink">{phrase.retry}</p>
        </motion.div>
      )}

      {!done && hintList.length > 0 && (
        <div className="flex flex-col gap-2">
          {shownHints > 0 && status !== 'retry' && <div className="flex items-center gap-3"><span className="max-sm:hidden"><Mascot size={88} mood="think" /></span><span className="sm:hidden"><Mascot size={48} mood="think" /></span><p className="font-bold text-mute">Бусел подсказывает:</p></div>}
          {hintList.slice(0, shownHints).map((h, i) => (
            h.kind === 'card'
              ? <div key={i} className="rounded-xl2 bg-warn/15 px-4 py-3"><p className="mb-1 text-sm font-extrabold text-accentink"><Icon name="book" /> Из урока</p><p><Rich text={h.text} /></p></div>
              : <p key={i} className="rounded-xl2 bg-warn/15 px-4 py-2"><Icon name="hint" className="text-accentink" /> {h.text}</p>
          ))}
          {shownHints < hintList.length && (
            <button onClick={() => setHints(hints + 1)} className="self-start rounded-xl2 bg-soft px-4 font-bold">
              {hintList[shownHints].kind === 'card' ? <><Icon name="book" /> Заглянуть в урок</> : <><Icon name="hint" /> Подсказка</>}{hints > 0 && ' (баллов станет вдвое меньше)'}
            </button>
          )}
        </div>
      )}

      {idle && !done && (
        <div className="flex items-center gap-3 rounded-xl2 border border-line bg-bg px-4 py-2" role="status">
          <Mascot size={64} mood="think" />
          <p className="text-mute">{IDLE_TEXT}</p>
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3" role="status">
          <div className="flex items-center gap-3">
            <span className="max-sm:hidden"><Mascot size={96} mood={status === 'right' ? 'cheer' : 'support'} /></span>
            <span className="sm:hidden"><Mascot size={56} mood={status === 'right' ? 'cheer' : 'support'} /></span>
            <div>
              <p className="text-xl font-extrabold" style={{ color: status === 'right' ? 'var(--ok-ink)' : 'var(--accent-ink)' }}>
                {status === 'right' ? praise?.text : phrase.explain}
              </p>
              {status === 'right' && scored && (
                <p className="font-bold text-mute">+{points} баллов{attempt === 2 && ' · вторая попытка'}{extraBonus > 0 && attempt === 1 && ` · Комбо! +${extraBonus}`}</p>
              )}
            </div>
          </div>
          {status === 'wrong' && (
            <>
              {task.type !== 'match' && (
                <p className="font-bold">Правильный ответ: {Array.isArray(task.answer)
                  ? task.answer.join(task.kind === 'letters' ? '' : task.kind === 'words' ? ' ' : task.type === 'order' ? ' → ' : ', ')
                  : task.type === 'truefalse' ? (task.answer ? 'Верно' : 'Неверно') : String(task.answer)}</p>
              )}
              {task.ref?.quote && (
                <div className="rounded-xl2 bg-bg px-4 py-3"><p className="mb-1 text-sm font-extrabold text-mute"><Icon name="book" /> В уроке об этом</p><p><Rich text={task.ref.quote} /></p></div>
              )}
              {onFilm && (
                <button onClick={onFilm} className="self-start rounded-xl2 bg-soft px-4 font-bold"><Icon name="play" /> Посмотреть объяснение в мультуроке</button>
              )}
              {task.explanation.length > 1
                ? <ol className="list-decimal space-y-1 pl-6">{task.explanation.map((e, i) => <li key={i}>{e}</li>)}</ol>
                : <p>{task.explanation[0]}</p>}
              <p className="text-mute">{wrongNote(nextAfterWrong)}</p>
            </>
          )}
          <div className={`flex justify-end ${phoneBottomBar}`}>
            <button autoFocus onClick={() => onNext({
              correct: status === 'right', firstTry: status === 'right' && attempt === 1, hints, points: status === 'right' ? points : 0,
              ms: first.current.ms, guess: first.current.guess,
            })}
              className="rounded-xl2 bg-brand px-8 text-lg font-extrabold text-onbrand active:scale-95 max-sm:min-h-[56px] max-sm:flex-1">
              Дальше <Icon name="next" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
