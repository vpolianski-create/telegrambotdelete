import { useEffect, useMemo, useState } from 'react';
import { TaskView } from '../components/TaskView';
import { wordSets } from '../content/loader';
import type { Task, Word } from '../content/schema';
import { boxCounts, LEARNED_BOX, pickSession } from '../engine/leitner';
import { shuffle } from '../engine/rng';
import { hasEnglishVoice, speak } from '../audio/speech';
import { todayStr, useApp } from '../store/useApp';
import { Mascot } from '../components/Mascot';

type Mode = 'cards' | 'choose' | 'listen' | 'spell';
const MODES: { id: Mode; icon: string; title: string }[] = [
  { id: 'cards', icon: '🃏', title: 'Карточки' },
  { id: 'choose', icon: '🔤', title: 'Выбери перевод' },
  { id: 'listen', icon: '🎧', title: 'Послушай и выбери' },
  { id: 'spell', icon: '✍️', title: 'Напиши слово' },
];
const allWords = wordSets.flatMap((s) => s.words);
const SESSION = 10;

function wordTask(mode: Exclude<Mode, 'cards'>, w: Word, pool: Word[]): Task {
  const others = shuffle(Math.random, pool.filter((x) => x.id !== w.id));
  const explanation = [`${w.en} ${w.transcription} — ${w.ru}`, w.example];
  const base = { id: `${mode}:${w.id}:${Math.random()}`, subject: 'english', topicId: 'vocab', difficulty: 'basic' as const, explanation };
  if (mode === 'choose') {
    return { ...base, type: 'single', question: `Как переводится «${w.en}»?`, options: shuffle(Math.random, [w.ru, ...others.slice(0, 3).map((x) => x.ru)]), answer: w.ru, hints: [`Первая буква перевода: «${w.ru[0]}»`] };
  }
  if (mode === 'listen') {
    return { ...base, type: 'single', question: 'Послушай и выбери слово', options: shuffle(Math.random, [w.en, ...others.slice(0, 3).map((x) => x.en)]), answer: w.en, hints: [`Слово начинается на «${w.en[0]}»`] };
  }
  return { ...base, type: 'input', question: `Напиши по-английски: «${w.ru}»`, answer: w.en, hints: [`Первая буква: «${w.en[0]}»`, `Букв в слове: ${w.en.length}`] };
}

function Training({ mode, setId, onExit }: { mode: Mode; setId: string; onExit(): void }) {
  const { leitner, answerWord, recordAnswer } = useApp();
  const pool = setId === 'all' ? allWords : wordSets.find((s) => s.id === setId)!.words;
  const session = useMemo(() => pickSession(shuffle(Math.random, pool), leitner, todayStr(), SESSION), []);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [right, setRight] = useState(0);
  const current = session[i];
  const task = useMemo(
    () => (current && mode !== 'cards' ? wordTask(mode, current, pool) : null),
    [i],
  );

  if (i >= session.length) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl3 bg-card p-8 text-center shadow">
        <Mascot size={120} cheer />
        <h2 className="text-3xl font-extrabold">Отличная тренировка!</h2>
        <p className="text-xl">Верных ответов: <b>{right}</b> из {session.length}</p>
        <button onClick={onExit} className="rounded-xl2 bg-brand px-8 text-lg font-extrabold text-white">Готово</button>
      </div>
    );
  }
  const w = session[i];

  if (mode === 'cards') {
    const next = (known: boolean) => { answerWord(w.id, known); if (known) setRight(right + 1); setFlip(false); setI(i + 1); };
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-xl3 bg-card p-8 shadow">
        <p className="text-mute">{i + 1} / {session.length}</p>
        <button onClick={() => setFlip(!flip)} aria-label="Перевернуть карточку"
          className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl3 bg-bg p-6 text-center">
          {!flip ? (
            <>
              <span className="text-5xl font-extrabold">{w.en}</span>
              <span className="text-xl text-mute">{w.transcription}</span>
              <span className="text-sm text-mute">нажми, чтобы перевернуть</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-extrabold text-brand">{w.ru}</span>
              <span className="text-lg">{w.example}</span>
            </>
          )}
        </button>
        <button onClick={() => speak(w.en)} className="rounded-xl2 bg-brand px-6 text-lg text-white">🔊 Послушать</button>
        <div className="flex gap-3">
          <button onClick={() => next(false)} className="rounded-xl2 bg-black/5 px-6 font-bold">Ещё повторю</button>
          <button onClick={() => next(true)} className="rounded-xl2 bg-ok px-6 font-bold text-white">Знаю!</button>
        </div>
      </div>
    );
  }

  if (!task) return null;
  return (
    <div>
      <p className="mb-3 text-center text-mute">{i + 1} / {session.length}</p>
      <TaskView key={task.id} task={task} speakWord={mode === 'listen' ? w.en : undefined}
        onNext={(r) => {
          answerWord(w.id, r.correct);
          recordAnswer({ subject: 'english', topicId: 'vocab', question: task.question + ' ' + w.en, correct: r.correct, points: r.points });
          if (r.correct) setRight(right + 1);
          setI(i + 1);
        }} />
    </div>
  );
}

export function Vocabulary({ onBack }: { onBack(): void }) {
  const { leitner } = useApp();
  const [set, setSet] = useState('all');
  const [mode, setMode] = useState<Mode | null>(null);
  const [voice, setVoice] = useState(true);

  useEffect(() => {
    const check = () => setVoice(hasEnglishVoice());
    check();
    window.speechSynthesis?.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', check);
  }, []);

  const counts = boxCounts(allWords, leitner);
  const learned = counts.slice(LEARNED_BOX - 1).reduce((a, b) => a + b, 0);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 p-6">
      <button onClick={mode ? () => setMode(null) : onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
      {mode ? <Training mode={mode} setId={set} onExit={() => setMode(null)} /> : (
        <>
          <h1 className="text-3xl font-extrabold">📒 Английские слова</h1>
          {!voice && (
            <p className="rounded-xl2 bg-accent/20 p-3">
              🔇 Английский голос не найден. Родителям: Параметры Windows → Время и язык → Язык и регион → добавить English (United States) → Речь.
            </p>
          )}
          <section className="rounded-xl3 bg-card p-5 shadow">
            <h2 className="mb-2 text-xl font-extrabold">Мой словарь: выучено {learned} из {allWords.length}</h2>
            <div className="flex items-end gap-3">
              {counts.map((c, k) => (
                <div key={k} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-accent" style={{ height: 8 + c * 6 }} />
                  <span className="text-sm text-mute">Коробка {k + 1}: {c}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="flex flex-wrap gap-2">
            {[{ id: 'all', title: 'Все слова', icon: '📚' }, ...wordSets].map((s) => (
              <button key={s.id} onClick={() => setSet(s.id)}
                className={`rounded-xl2 px-5 font-bold ${set === s.id ? 'bg-brand text-white' : 'bg-card shadow'}`}>
                {s.icon} {s.title}
              </button>
            ))}
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex min-h-[90px] items-center gap-4 rounded-xl3 bg-card p-5 text-left shadow transition-transform hover:scale-[1.02] active:scale-95">
                <span className="text-4xl">{m.icon}</span>
                <span className="text-xl font-extrabold">{m.title}</span>
              </button>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
