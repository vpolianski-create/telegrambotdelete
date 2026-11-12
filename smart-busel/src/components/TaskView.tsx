import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { imageUrl } from '../content/loader';
import { Visual } from './Visual';
import type { Task } from '../content/schema';
import { checkAnswer } from '../engine/answers';
import { almost, effort, praise } from '../engine/feedback';
import { hintsFor } from '../engine/lesson';
import { taskPoints } from '../engine/points';
import { shuffle } from '../engine/rng';
import { play } from '../audio/sfx';
import { speak } from '../audio/speech';
import { Mascot } from './Mascot';
import { MatchInput } from './MatchInput';
import { OrderInput } from './OrderInput';
import { Rich } from './Rich';

export interface TaskResult { correct: boolean; hints: number; points: number }

interface Props {
  task: Task;
  scored?: boolean; // false для «Проверь себя»
  speakWord?: string; // автоматически произнести слово
  extraBonus?: number; // бонус за комбо, показывается после верного ответа
  repeat?: boolean; // тема уже пройдена: баллы за повтор вдвое меньше
  cards?: string[]; // карточки урока: нужная показывается как подсказка
  note?: string; // пометка над заданием, например «Вернёмся к этому вопросу»
  onNext(r: TaskResult): void;
}

export function TaskView({ task, scored = true, speakWord, extraBonus = 0, repeat = false, cards = [], note, onNext }: Props) {
  // у «порядка» варианты уже перемешаны; у «пар» перемешиваем правую колонку
  const options = useMemo(() => (task.options && task.type !== 'order' && task.type !== 'match' ? shuffle(Math.random, task.options) : task.options ?? []), [task.id]);
  const rightSide = useMemo(() => (task.type === 'match' ? shuffle(Math.random, task.answer as string[]) : []), [task.id]);
  const [given, setGiven] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [picked, setPicked] = useState<string | boolean>();
  const hintList = useMemo(() => hintsFor(task, cards), [task.id]);
  const [hints, setHints] = useState(0);
  const [phrase] = useState(() => ({ ok: praise(), no: almost(), eff: effort() }));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (speakWord) speak(speakWord);
    inputRef.current?.focus();
  }, [task.id]);

  useEffect(() => {
    if (status === 'right') play(extraBonus > 0 ? 'combo' : 'correct');
    if (status === 'wrong') play('soft');
  }, [status]);

  const points = scored ? taskPoints(task.difficulty, hints, repeat) : 0;

  const submit = (given: string | boolean | string[]) => {
    if (status !== 'idle') return;
    if (Array.isArray(given)) setGiven(given); else setPicked(given);
    setStatus(checkAnswer(task, given) ? 'right' : 'wrong');
  };

  const done = status !== 'idle';

  // клавиши 1–4 выбирают вариант ответа
  useEffect(() => {
    if (done || (task.type !== 'single' && task.type !== 'truefalse')) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const k = Number(e.key) - 1;
      if (task.type === 'single' && k >= 0 && k < options.length) submit(options[k]);
      if (task.type === 'truefalse' && (k === 0 || k === 1)) submit(k === 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task.id, done]);

  /** Оформление варианта после ответа: верный — зелёный с ✓, выбранный неверный — с ✗. */
  const mark = (value: string | boolean) => {
    if (!done) return { cls: 'border-line bg-bg hover:border-brand', sign: '' };
    if (checkAnswer(task, value)) return { cls: 'border-ok bg-ok/15', sign: '✓' };
    if (picked === value) return { cls: 'border-accent bg-accent/10', sign: '✗' };
    return { cls: 'border-line bg-bg opacity-60', sign: '' };
  };
  const Key = ({ n }: { n: number }) => (
    <span aria-hidden className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-soft text-sm font-bold text-mute">{n}</span>
  );
  const label = { basic: '', advanced: '⭐ Повышенная', bonus: '🏆 Бонус' }[task.difficulty];

  return (
    <div data-task={task.type} {...(import.meta.env.DEV ? { 'data-answer': Array.isArray(task.answer) ? JSON.stringify(task.answer) : String(task.answer) } : {})}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl3 bg-card p-6 shadow">
      {(label || note) && <span className="text-sm font-extrabold text-accentink">{[note, label].filter(Boolean).join(' · ')}</span>}
      <div className="flex items-start gap-3">
        <h2 className="flex-1 text-2xl font-extrabold leading-snug">{task.question}</h2>
        {speakWord && (
          <button onClick={() => speak(speakWord)} aria-label="Послушать" className="rounded-xl2 bg-brand px-4 text-2xl text-white">🔊</button>
        )}
      </div>

      {task.image && imageUrl(task.image) && (
        <img src={imageUrl(task.image)} alt="Картина к заданию" draggable={false}
          className="mx-auto max-h-[300px] w-auto max-w-full rounded-xl2 shadow" />
      )}

      {task.visual && (!task.visualAfter || done) && <Visual v={task.visual} />}

      {(task.type === 'single') && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o, k) => (
            <button key={o} data-option={o} disabled={done} onClick={() => submit(o)}
              className={`flex min-h-touch items-center rounded-xl2 border-2 px-4 py-3 text-left text-lg font-bold transition-transform active:scale-95 ${mark(o).cls}`}>
              <Key n={k + 1} /><span className="flex-1">{o}</span>
              {mark(o).sign && <span aria-hidden className="ml-2 text-xl">{mark(o).sign}</span>}
            </button>
          ))}
        </div>
      )}

      {task.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v, k) => (
            <button key={String(v)} data-option={String(v)} disabled={done} onClick={() => submit(v)}
              className={`flex min-h-touch items-center rounded-xl2 border-2 px-4 py-3 text-left text-lg font-bold active:scale-95 ${mark(v).cls}`}>
              <Key n={k + 1} /><span className="flex-1">{v ? 'Верно' : 'Неверно'}</span>
              {mark(v).sign && <span aria-hidden className="ml-2 text-xl">{mark(v).sign}</span>}
            </button>
          ))}
        </div>
      )}

      {(task.type === 'input' || task.type === 'fill') && (
        <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) submit(text); }}>
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} disabled={done}
            aria-label="Ответ" autoComplete="off" spellCheck={false}
            className="min-h-touch flex-1 rounded-xl2 border-2 border-line bg-bg px-4 text-xl font-bold focus:border-brand focus:outline-none" />
          <button type="submit" disabled={done || !text.trim()} className="rounded-xl2 bg-brand px-6 text-lg font-extrabold text-white disabled:opacity-40">
            Проверить
          </button>
        </form>
      )}

      {task.type === 'order' && (
        <OrderInput options={options} kind={task.kind ?? 'list'} disabled={done} onSubmit={submit}
          correct={done ? given.map((x, i) => checkAnswer({ type: 'input', answer: (task.answer as string[])[i] }, x)) : undefined} />
      )}
      {task.type === 'match' && (
        <MatchInput left={options} right={rightSide} disabled={done} answer={done ? (task.answer as string[]) : undefined} onSubmit={submit} />
      )}

      {!done && hintList.length > 0 && (
        <div className="flex flex-col gap-2">
          {hintList.slice(0, hints).map((h, i) => (
            h.kind === 'card'
              ? <div key={i} className="rounded-xl2 bg-accent/15 px-4 py-3"><p className="mb-1 text-sm font-extrabold text-accentink">📖 Из урока</p><p><Rich text={h.text} /></p></div>
              : <p key={i} className="rounded-xl2 bg-accent/15 px-4 py-2">💡 {h.text}</p>
          ))}
          {hints < hintList.length && (
            <button onClick={() => setHints(hints + 1)} className="self-start rounded-xl2 bg-soft px-4 font-bold">
              {hintList[hints].kind === 'card' ? '📖 Заглянуть в урок' : '💡 Подсказка'}{hints > 0 && ' (баллов станет вдвое меньше)'}
            </button>
          )}
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3" role="status">
          <div className="flex items-center gap-3">
            <Mascot size={64} mood={status === 'right' ? 'cheer' : 'support'} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: status === 'right' ? 'var(--ok-ink)' : 'var(--accent-ink)' }}>
                {status === 'right' ? phrase.ok : phrase.no}
              </p>
              {status === 'right' && scored && (
                <p className="font-bold text-mute">+{points} баллов{extraBonus > 0 && ` · Комбо! +${extraBonus}`}</p>
              )}
              {status === 'wrong' && <p className="text-mute">{phrase.eff}</p>}
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
                <div className="rounded-xl2 bg-bg px-4 py-3"><p className="mb-1 text-sm font-extrabold text-mute">📖 В уроке об этом</p><p><Rich text={task.ref.quote} /></p></div>
              )}
              {task.explanation.length > 1
                ? <ol className="list-decimal space-y-1 pl-6">{task.explanation.map((e, i) => <li key={i}>{e}</li>)}</ol>
                : <p>{task.explanation[0]}</p>}
            </>
          )}
          <button autoFocus onClick={() => onNext({ correct: status === 'right', hints, points: status === 'right' ? points : 0 })}
            className="self-end rounded-xl2 bg-brand px-8 text-lg font-extrabold text-white active:scale-95">
            Дальше →
          </button>
        </motion.div>
      )}
    </div>
  );
}
