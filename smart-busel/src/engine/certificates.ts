import type { Subject } from '../content/schema';
import { currentStreak } from './streak';

export interface Cert {
  id: string;
  kind: 'topic' | 'section' | 'subject' | 'streak';
  icon: string;
  title: string; // «За что» — крупная строка
  text: string; // пояснение
}

export interface CertState {
  topicResults: Record<string, { done: boolean; stars?: number }>;
  daily: Record<string, { tasks: number }>;
}

export const STREAK_CERTS = [7, 14, 30] as const;

/** Грамоты, заслуженные на данный момент (даты выдачи хранит приложение). */
export function earnedCertificates(s: CertState, subjects: Subject[], today: string): Cert[] {
  const out: Cert[] = [];
  const done = (id: string) => s.topicResults[id]?.done === true;
  for (const sub of subjects) {
    const ready = sub.sections.flatMap((x) => x.topics).filter((t) => t.status === 'ready');
    for (const sec of sub.sections) {
      const topics = sec.topics.filter((t) => t.status === 'ready');
      for (const t of topics) {
        if ((s.topicResults[t.id]?.stars ?? 0) >= 3)
          out.push({ id: `t:${t.id}`, kind: 'topic', icon: '⭐', title: `Отличное знание темы «${t.title}»`, text: `Предмет: ${sub.title}. Тема пройдена на 100% — три звезды!` });
      }
      if (topics.length && topics.every((t) => done(t.id)))
        out.push({ id: `s:${sec.id}`, kind: 'section', icon: '📗', title: `Раздел «${sec.title}» пройден`, text: `Предмет: ${sub.title}. Все темы раздела пройдены.` });
    }
    if (ready.length && ready.every((t) => done(t.id)))
      out.push({ id: `j:${sub.id}`, kind: 'subject', icon: '🎓', title: `Предмет «${sub.title}» пройден`, text: 'Все темы предмета пройдены. Это настоящее достижение!' });
  }
  const days = currentStreak((d) => (s.daily[d]?.tasks ?? 0) > 0, today).days;
  for (const n of STREAK_CERTS)
    if (days >= n) out.push({ id: `k:${n}`, kind: 'streak', icon: '🔥', title: `${n} дней занятий подряд`, text: 'За настойчивость и регулярные занятия!' });
  return out;
}
