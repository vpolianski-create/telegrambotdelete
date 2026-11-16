import { useEffect, useRef } from 'react';
import { filmUrl, type Film } from '../content/films';
import { interceptBack, setFilmOrientation } from '../platform';
import { Icon } from './Icon';

/**
 * Мультурок во весь экран: страница ролика из папки программы (без интернета).
 * На Android на время ролика экран горизонтальный; «Назад» и кнопка «Закрыть» возвращают к уроку.
 * beat — часть ролика, с которой начать (например, разбор НОД после ошибки в задании на НОД).
 */
export function FilmPlayer({ film, beat, onClose }: { film: Film; beat?: string; onClose(): void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    void setFilmOrientation(true);
    const back = interceptBack(() => { close.current(); return true; });
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    window.addEventListener('keydown', esc);
    return () => { back(); window.removeEventListener('keydown', esc); void setFilmOrientation(false); };
  }, []);

  return (
    <div data-theme="dark" role="dialog" aria-modal="true" aria-label="Мультурок"
      className="fixed inset-0 z-[70] bg-bg"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      {/* клавиши ролика (пробел — пауза) работают сразу: фокус в окне ролика */}
      <iframe ref={frame} src={filmUrl(film, beat)} title="Мультурок" allow="autoplay; fullscreen"
        onLoad={() => frame.current?.focus()} className="h-full w-full border-0" />
      <button onClick={onClose}
        className="absolute flex min-h-touch items-center gap-1 rounded-xl2 border border-line bg-card px-4 font-extrabold text-ink shadow"
        style={{ top: 'max(12px, env(safe-area-inset-top))', right: 'max(12px, env(safe-area-inset-right))' }}>
        <Icon name="close" /> Закрыть
      </button>
    </div>
  );
}
