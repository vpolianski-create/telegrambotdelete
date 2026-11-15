import { Icon, type IconName } from './Icon';

/**
 * Верхняя панель экрана на телефоне — как в Android-приложениях (Material 3):
 * слева «←» (или ✕ в уроке), заголовок в одну строку, справа — значки действий, снизу — полоска прогресса.
 * На компьютере (шире 640 px) не показывается: там остаются прежние кнопки «Назад».
 */
export function AppBar({ title, subtitle, onBack, close, actions, progress }: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** ✕ вместо стрелки (выйти из урока) */
  close?: boolean;
  actions?: { icon: IconName; label: string; onClick: () => void }[];
  /** 0…1 — полоска прогресса урока */
  progress?: number;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-1 flex min-h-[64px] items-center gap-1 bg-bg px-1 sm:hidden">
      {onBack && (
        <button type="button" onClick={onBack} aria-label={close ? 'Выйти' : 'Назад'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink active:bg-hover">
          <Icon name={close ? 'close' : 'back'} size={24} />
        </button>
      )}
      <div className={`min-w-0 flex-1 ${onBack ? 'pl-1' : 'pl-3'}`}>
        <h1 className="truncate text-[1.25rem] font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-sm text-mute">{subtitle}</p>}
      </div>
      {actions?.map((a) => (
        <button key={a.label} type="button" onClick={a.onClick} aria-label={a.label} title={a.label}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink active:bg-hover">
          <Icon name={a.icon} size={24} />
        </button>
      ))}
      {progress !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-soft" role="progressbar" aria-label="Прогресс урока"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="h-full rounded-r-full bg-brand transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </header>
  );
}

/** Нижняя панель с главной кнопкой на телефоне: прилипает к низу экрана, над полоской жестов. */
export const phoneBottomBar = 'max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-5 max-sm:-mb-5 max-sm:mt-1 max-sm:border-t max-sm:border-line max-sm:bg-card max-sm:px-4 max-sm:pt-3 max-sm:pb-[calc(var(--sab)+0.75rem)] max-sm:rounded-b-xl3';
