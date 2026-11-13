import markUrl from '../assets/brand/app-mark.png';
import { Icon, type IconName } from './Icon';

export type NavId = 'home' | 'subjects' | 'plan' | 'review' | 'collection' | 'parent';

interface Item { id: NavId; icon: IconName; title: string }
const MAIN: Item[] = [
  { id: 'home', icon: 'home', title: 'Главная' },
  { id: 'subjects', icon: 'subjects', title: 'Предметы' },
  { id: 'plan', icon: 'plan', title: 'Мой план' },
  { id: 'review', icon: 'review', title: 'Работа над ошибками' },
  { id: 'collection', icon: 'collection', title: 'Коллекция' },
];
const PARENT: Item = { id: 'parent', icon: 'lock', title: 'Родителям' };

/**
 * Боковое меню. В окне уже 1100 px сворачивается до значков: название пункта
 * показывается подсказкой при наведении и при переходе клавишей Tab.
 */
export function Sidebar({ active, reviewCount, onNavigate }: { active: NavId; reviewCount: number; onNavigate(id: NavId): void }) {
  const link = (it: Item) => {
    const on = active === it.id;
    const count = it.id === 'review' && reviewCount > 0 ? reviewCount : 0;
    const label = count ? `${it.title}: ${count}` : it.title;
    return (
      <li key={it.id}>
        <button type="button" onClick={() => onNavigate(it.id)} aria-current={on ? 'page' : undefined} aria-label={label}
          className={`group relative flex w-full items-center gap-3 rounded-xl2 px-3 text-left font-bold max-[1099px]:justify-center max-[1099px]:px-0 ${on ? 'bg-hover text-ink' : 'text-mute hover:bg-hover hover:text-ink'}`}>
          {on && <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-brand" />}
          <span className="relative flex">
            <Icon name={it.icon} size={24} className={on ? 'text-brandink' : ''} />
            {count > 0 && <span aria-hidden className="absolute -right-1.5 -top-1.5 hidden h-4 min-w-4 items-center justify-center rounded-full bg-sun px-1 text-[0.65rem] leading-none text-navy max-[1099px]:flex">{count}</span>}
          </span>
          <span className="flex-1 max-[1099px]:hidden">{it.title}</span>
          {count > 0 && <span aria-hidden className="rounded-full bg-sun px-2 py-0.5 text-sm text-navy max-[1099px]:hidden">{count}</span>}
          {/* подсказка в свёрнутом меню */}
          <span aria-hidden className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl2 border border-line bg-card px-3 py-2 text-sm text-ink shadow-xl max-[1099px]:group-hover:block max-[1099px]:group-focus-visible:block">{label}</span>
        </button>
      </li>
    );
  };
  return (
    <nav aria-label="Главное меню" className="no-print flex h-full w-[17rem] shrink-0 flex-col gap-4 border-r border-line bg-side p-3 max-[1099px]:w-[4.5rem]">
      <div className="flex items-center gap-3 px-1 py-2 max-[1099px]:justify-center max-[1099px]:px-0">
        <img src={markUrl} alt="" width={40} height={40} draggable={false} className="h-10 w-10 shrink-0 rounded-xl2" />
        <span className="font-display text-lg font-bold leading-tight max-[1099px]:hidden">Умный Бусел</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1">{MAIN.map(link)}</ul>
      <ul className="flex flex-col gap-1 border-t border-line pt-3">{link(PARENT)}</ul>
    </nav>
  );
}
