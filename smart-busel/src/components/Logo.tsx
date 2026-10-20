import logoUrl from '../assets/logo-small.png';

/** Логотип «Умный Бусел». Всегда на светлой подложке: слоган написан тёмно-синим. */
export function Logo({ height = 150 }: { height?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-xl2 bg-white p-2 shadow" style={{ height }}>
      <img src={logoUrl} alt="Умный Бусел" draggable={false} style={{ height: '100%', width: 'auto' }} />
    </span>
  );
}
