import { useState } from 'react';
import { Icon } from './Icon';

interface Props {
  left: string[];
  right: string[]; // уже перемешаны
  disabled: boolean;
  /** Верный ответ для каждой строки — показывается после проверки. */
  answer?: string[];
  onSubmit(given: string[]): void;
}

/** Соедини пары: выбери строку слева (или иди по порядку) и нажми подходящий ответ. */
export function MatchInput({ left, right, disabled, answer, onSubmit }: Props) {
  const [pairs, setPairs] = useState<(number | undefined)[]>(() => left.map(() => undefined));
  const firstFree = (p: (number | undefined)[]) => p.findIndex((x) => x === undefined);
  const [active, setActive] = useState(0);
  const used = new Set(pairs.filter((x) => x !== undefined));
  const complete = pairs.every((x) => x !== undefined);

  const choose = (r: number) => {
    if (active < 0) return;
    const next = pairs.map((x) => (x === r ? undefined : x));
    next[active] = r;
    setPairs(next);
    setActive(firstFree(next));
  };
  const pickLeft = (l: number) => {
    const next = [...pairs];
    next[l] = undefined;
    setPairs(next);
    setActive(l);
  };

  return (
    <div className="flex flex-col gap-3">
      {!disabled && <p className="text-sm font-bold text-mute">Для выделенной строки выбери ответ внизу. Чтобы изменить пару, нажми на строку.</p>}
      <div className="flex flex-col gap-2">
        {left.map((q, l) => {
          const r = pairs[l];
          const ok = answer && r !== undefined && right[r] === answer[l];
          return (
            <button key={l} type="button" disabled={disabled} onClick={() => pickLeft(l)}
              className={`flex min-h-touch flex-wrap items-center gap-3 rounded-xl2 border-2 px-4 py-2 text-left ${
                answer ? (ok ? 'border-ok bg-ok/15' : 'border-accent bg-accent/10') : l === active ? 'border-brand bg-brand/10' : 'border-line bg-bg'}`}>
              <span className="flex-1 font-bold">{q}</span>
              <span className={`rounded-xl2 px-3 py-1 font-extrabold ${r === undefined ? 'bg-soft text-mute' : 'bg-card shadow'}`}>
                {r === undefined ? '?' : right[r]}{answer && <> <Icon name={ok ? 'check' : 'close'} label={ok ? 'верно' : 'неверно'} /></>}
              </span>
              {answer && !ok && <span className="w-full text-sm font-bold text-okink">Верно: {answer[l]}</span>}
            </button>
          );
        })}
      </div>
      {!disabled && (
        <>
          <div className="flex flex-wrap gap-2">
            {right.map((a, r) => (
              <button key={r} type="button" data-chip={a} disabled={used.has(r)} onClick={() => choose(r)}
                className="min-h-touch rounded-xl2 border-2 border-line bg-bg px-4 text-lg font-bold hover:border-brand active:scale-95 disabled:opacity-30">
                {a}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => onSubmit(pairs.map((r) => right[r!]))} disabled={!complete}
            className="self-end rounded-xl2 bg-brand px-6 text-lg font-extrabold text-onbrand disabled:opacity-40">Проверить</button>
        </>
      )}
    </div>
  );
}
