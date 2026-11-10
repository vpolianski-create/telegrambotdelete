import { useState } from 'react';

interface Props {
  options: string[];
  kind: 'list' | 'words' | 'letters';
  disabled: boolean;
  /** Номера верно стоящих позиций — после проверки. */
  correct?: boolean[];
  onSubmit(seq: string[]): void;
}

/** Собери по порядку: нажми на элемент — он встанет в ряд; нажми в ряду — вернётся обратно. */
export function OrderInput({ options, kind, disabled, correct, onSubmit }: Props) {
  const [seq, setSeq] = useState<number[]>([]);
  const rest = options.map((_, i) => i).filter((i) => !seq.includes(i));
  const chip = kind === 'letters' ? 'h-12 w-12 text-2xl uppercase' : kind === 'words' ? 'min-h-touch px-4 text-xl' : 'min-h-touch w-full px-4 py-2 text-left text-lg';
  const wrap = kind === 'list' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2';
  const prompt = kind === 'letters' ? 'Собери слово из букв' : kind === 'words' ? 'Собери предложение из слов' : 'Расставь по порядку';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-mute">{prompt}: нажимай по очереди. Ошибся — нажми на элемент в ряду, и он вернётся.</p>
      <div className={`${wrap} min-h-[56px] rounded-xl2 border-2 border-dashed border-line bg-bg p-3`} aria-label="Твой ответ">
        {seq.map((i, pos) => (
          <button key={i} type="button" disabled={disabled} onClick={() => setSeq(seq.filter((x) => x !== i))}
            className={`flex items-center justify-center rounded-xl2 border-2 font-extrabold ${chip} ${
              correct ? (correct[pos] ? 'border-ok bg-ok/15' : 'border-accent bg-accent/10') : 'border-brand bg-card'}`}>
            {kind === 'list' && <span className="mr-2 text-mute">{pos + 1}.</span>}{options[i]}
          </button>
        ))}
        {seq.length === 0 && <span className="self-center text-mute">…</span>}
      </div>
      {!disabled && rest.length > 0 && (
        <div className={wrap}>
          {rest.map((i) => (
            <button key={i} type="button" data-chip={options[i]} onClick={() => setSeq([...seq, i])}
              className={`flex items-center justify-center rounded-xl2 border-2 border-line bg-bg font-bold hover:border-brand active:scale-95 ${chip}`}>
              {options[i]}
            </button>
          ))}
        </div>
      )}
      {!disabled && (
        <div className="flex justify-between gap-3">
          <button type="button" onClick={() => setSeq([])} disabled={!seq.length} className="rounded-xl2 bg-soft px-4 font-bold disabled:opacity-40">Сбросить</button>
          <button type="button" onClick={() => onSubmit(seq.map((i) => options[i]))} disabled={rest.length > 0}
            className="rounded-xl2 bg-brand px-6 text-lg font-extrabold text-white disabled:opacity-40">Проверить</button>
        </div>
      )}
    </div>
  );
}
