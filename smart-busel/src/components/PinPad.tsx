import { Icon } from './Icon';
import { PIN_MAX, pinPress } from '../engine/pinpad';

/** PIN на телефоне: точки и крупные кнопки-цифры, как на экране блокировки Android. */
export function PinPad({ value, onChange, onSubmit, error }: { value: string; onChange(v: string): void; onSubmit(): void; error?: string }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'];
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3" aria-label={`Введено цифр: ${value.length}`} role="status">
        {Array.from({ length: Math.max(4, Math.min(PIN_MAX, value.length + (value.length < PIN_MAX ? 1 : 0))) }, (_, k) => (
          <span key={k} className={`h-4 w-4 rounded-full border-2 ${k < value.length ? 'border-brand bg-brand' : 'border-line'}`} />
        ))}
      </div>
      {error && <p className="text-center font-semibold text-accentink">{error}</p>}
      <div className="grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button key={k} type="button"
            aria-label={k === 'back' ? 'Стереть' : k === 'ok' ? 'Войти' : k}
            disabled={k === 'ok' && value.length < 4}
            onClick={() => (k === 'ok' ? onSubmit() : onChange(pinPress(value, k)))}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium disabled:opacity-40 ${k === 'ok' ? 'bg-brand text-onbrand' : k === 'back' ? 'text-mute' : 'bg-soft'}`}>
            {k === 'back' ? <Icon name="back" size={24} /> : k === 'ok' ? <Icon name="check" size={24} /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}
