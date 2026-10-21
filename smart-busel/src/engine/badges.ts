import { LEARNED_BOX, type WordState } from './leitner';
import { levelFor } from './level';
import { currentStreak } from './streak';

export interface BadgeDef { id: string; icon: string; title: string; desc: string }

export const BADGES: BadgeDef[] = [
  { id: 'first-topic', icon: '🌱', title: 'Первая тема', desc: 'Пройди первую тему на 80% и выше' },
  { id: 'topics-5', icon: '🌳', title: 'Знаток', desc: 'Пройди 5 тем' },
  { id: 'streak-3', icon: '🕯️', title: '3 дня подряд', desc: 'Занимайся 3 дня подряд' },
  { id: 'streak-7', icon: '🔥', title: '7 дней подряд', desc: 'Занимайся 7 дней подряд' },
  { id: 'streak-30', icon: '☄️', title: '30 дней подряд', desc: 'Занимайся 30 дней подряд' },
  { id: 'combo', icon: '⚡', title: 'Комбо!', desc: '5 правильных ответов подряд' },
  { id: 'no-hints', icon: '🧠', title: 'Без подсказок', desc: 'Пройди тему на 80% без единой подсказки' },
  { id: 'perfect', icon: '💎', title: 'Без единой ошибки', desc: 'Пройди тему на 100%' },
  { id: 'words-20', icon: '📒', title: '20 слов', desc: 'Выучи 20 английских слов' },
  { id: 'words-100', icon: '📚', title: '100 слов', desc: 'Выучи 100 английских слов' },
  { id: 'stars-10', icon: '⭐', title: '10 звёзд', desc: 'Собери 10 звёзд за темы' },
  { id: 'stars-30', icon: '🌟', title: '30 звёзд', desc: 'Собери 30 звёзд за темы' },
  { id: 'cards-10', icon: '🗂️', title: 'Коллекционер', desc: 'Собери 10 карточек знаний' },
  { id: 'cards-30', icon: '🏛️', title: 'Хранитель альбома', desc: 'Собери 30 карточек знаний' },
  { id: 'fixer', icon: '🛠️', title: 'Мастер исправлений', desc: 'Исправь 10 ошибок в «Работе над ошибками»' },
  { id: 'level-5', icon: '🦅', title: 'Уровень 5', desc: 'Дойди до 5 уровня' },
  { id: 'points-500', icon: '🏆', title: '500 баллов', desc: 'Набери 500 баллов' },
];

export interface BadgeState {
  topicResults: Record<string, { done: boolean; stars?: number }>;
  albumCards?: string[];
  leitner: Record<string, WordState>;
  points: number;
  daily: Record<string, { tasks: number }>;
  fixedMistakes?: number;
}

/** Значки, которые вычисляются из состояния (остальные выдаются в момент события). */
export function computedBadges(s: BadgeState, today: string): string[] {
  const out: string[] = [];
  const done = Object.values(s.topicResults).filter((r) => r.done).length;
  if (done >= 1) out.push('first-topic');
  if (done >= 5) out.push('topics-5');
  const learned = Object.values(s.leitner).filter((w) => w.box >= LEARNED_BOX).length;
  if (learned >= 20) out.push('words-20');
  if (learned >= 100) out.push('words-100');
  if (levelFor(s.points).level >= 5) out.push('level-5');
  if (s.points >= 500) out.push('points-500');
  const days = currentStreak((d) => (s.daily[d]?.tasks ?? 0) > 0, today).days;
  if (days >= 3) out.push('streak-3');
  if (days >= 7) out.push('streak-7');
  if (days >= 30) out.push('streak-30');
  const stars = Object.values(s.topicResults).reduce((a, r) => a + (r.stars ?? 0), 0);
  if (stars >= 10) out.push('stars-10');
  if (stars >= 30) out.push('stars-30');
  if ((s.fixedMistakes ?? 0) >= 10) out.push('fixer');
  const cards = s.albumCards?.length ?? 0;
  if (cards >= 10) out.push('cards-10');
  if (cards >= 30) out.push('cards-30');
  return out;
}
