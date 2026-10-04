import { LEARNED_BOX, type WordState } from './leitner';
import { levelFor } from './level';
import { currentStreak } from './streak';

export interface BadgeDef { id: string; icon: string; title: string; desc: string }

export const BADGES: BadgeDef[] = [
  { id: 'first-topic', icon: '🌱', title: 'Первая тема', desc: 'Пройди первую тему на 80% и выше' },
  { id: 'topics-5', icon: '🌳', title: 'Знаток', desc: 'Пройди 5 тем' },
  { id: 'streak-7', icon: '🔥', title: '7 дней подряд', desc: 'Занимайся 7 дней подряд' },
  { id: 'combo', icon: '⚡', title: 'Комбо!', desc: '5 правильных ответов подряд' },
  { id: 'no-hints', icon: '🧠', title: 'Без подсказок', desc: 'Пройди тему на 80% без единой подсказки' },
  { id: 'perfect', icon: '💎', title: 'Без единой ошибки', desc: 'Пройди тему на 100%' },
  { id: 'words-20', icon: '📒', title: '20 слов', desc: 'Выучи 20 английских слов' },
  { id: 'words-100', icon: '📚', title: '100 слов', desc: 'Выучи 100 английских слов' },
  { id: 'level-5', icon: '🦅', title: 'Уровень 5', desc: 'Дойди до 5 уровня' },
  { id: 'points-500', icon: '🏆', title: '500 баллов', desc: 'Набери 500 баллов' },
];

export interface BadgeState {
  topicResults: Record<string, { done: boolean }>;
  leitner: Record<string, WordState>;
  points: number;
  daily: Record<string, { tasks: number }>;
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
  if (currentStreak((d) => (s.daily[d]?.tasks ?? 0) > 0, today).days >= 7) out.push('streak-7');
  return out;
}
