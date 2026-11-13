import markUrl from '../assets/brand/app-mark.png';

/** Знак «Умного Бусела» с названием. Цвет текста берётся у родителя (на грамоте — тёмный на белом). */
export function Logo({ height = 64 }: { height?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-3">
      <img src={markUrl} alt="" draggable={false} className="rounded-xl3" style={{ height, width: height }} />
      <span className="font-display text-2xl font-bold leading-tight">Умный Бусел</span>
    </span>
  );
}
