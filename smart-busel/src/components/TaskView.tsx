import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../content/schema';
import { checkAnswer } from '../engine/answers';
import { almost, effort, praise } from '../engine/feedback';
import { taskPoints } from '../engine/points';
import { shuffle } from '../engine/rng';
import { play } from '../audio/sfx';
import { speak } from '../audio/speech';
import { Mascot } from './Mascot';

export interface TaskResult { correct: boolean; hints: number; points: number }

interface Props {
  task: Task;
  scored?: boolean; // false для «Проверь себя»
  speakWord?: string; // автоматически произнести слово
  extraBonus?: number; // бонус за комбо, показывается после верного ответа
  onNext(r: TaskResult): void;
}

export function TaskView({ task, scored = true, speakWord, extraBonus = 0, onNext }: Props) {
  const options = useMemo(() => (task.options ? shuffle(Math.random, task.options) : []), [task.id]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle');
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

  const points = scored ? taskPoints(task.difficulty, hints) : 0;

  const submit = (given: string | boolean) => {
    if (status !== 'idle') return;
    setStatus(checkAnswer(task, given) ? 'right' : 'wrong');
  };

  const done = status !== 'idle';
  const label = { basic: '', advanced: '⭐ Повышенная', bonus: '🏆 Бонус' }[task.difficulty];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl3 bg-card p-6 shadow">
      {label && <span className="text-sm font-extrabold text-accentink">{label}</span>}
      <div className="flex items-start gap-3">
        <h2 className="flex-1 text-2xl font-extrabold leading-snug">{task.question}</h2>
        {speakWord && (
          <button onClick={() => speak(speakWord)} aria-label="Послушать" className="rounded-xl2 bg-brand px-4 text-2xl text-white">🔊</button>
        )}
      </div>

      {(task.type === 'single') && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o) => (
            <button key={o} disabled={done} onClick={() => submit(o)}
              className={`min-h-touch rounded-xl2 border-2 px-4 py-3 text-lg font-bold transition-transform active:scale-95 ${
                done && checkAnswer(task, o) ? 'border-ok bg-ok/15' : 'border-line bg-bg hover:border-brand'}`}>
              {o}
            </button>
          ))}
        </div>
      )}

      {task.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} disabled={done} onClick={() => submit(v)}
              className="min-h-touch rounded-xl2 border-2 border-line bg-bg px-4 py-3 text-lg font-bold hover:border-brand active:scale-95">
              {v ? 'Верно' : 'Неверно'}
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

      {!done && task.hints.length > 0 && (
        <div className="flex flex-col gap-2">
          {task.hints.slice(0, hints).map((h, i) => (
            <p key={i} className="rounded-xl2 bg-accent/15 px-4 py-2">💡 {h}</p>
          ))}
          {hints < Math.min(2, task.hints.length) && (
            <button onClick={() => setHints(hints + 1)} className="self-start rounded-xl2 bg-soft px-4 font-bold">
              💡 {hints === 0 ? 'Подсказка' : 'Ещё подсказка (баллов станет вдвое меньше)'}
            </button>
          )}
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3" role="status">
          <div className="flex items-center gap-3">
            <Mascot size={64} cheer={status === 'right'} />
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
              <p className="font-bold">Правильный ответ: {Array.isArray(task.answer) ? task.answer.join(', ') : task.type === 'truefalse' ? (task.answer ? 'Верно' : 'Неверно') : String(task.answer)}</p>
              <ol className="list-decimal space-y-1 pl-6">{task.explanation.map((e, i) => <li key={i}>{e}</li>)}</ol>
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
