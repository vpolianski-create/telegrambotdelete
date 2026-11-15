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

/*
 * Грамота — редкая и большая награда за очень хорошую работу (решение родителя, v1.8.0):
 * — раздел, пройденный отлично: каждая тема минимум на 2 звезды (90 % и выше);
 * — предмет, пройденный целиком;
 * — серия 30 и 100 дней подряд.
 * За одну тему, даже на 100 %, грамоты нет — за неё звёзды и значки.
 * Грамоты, полученные по прежним правилам (тема на 100 %, раздел, серия 7 и 14 дней), остаются — см. ownedCertificates.
 */
export const STREAK_CERTS = [30, 100] as const;
/** Сколько звёзд нужно за каждую тему раздела, чтобы получить грамоту за раздел. */
export const SECTION_MIN_STARS = 2;

const topicCert = (sub: Subject, t: { id: string; title: string }): Cert =>
  ({ id: `t:${t.id}`, kind: 'topic', icon: '⭐', title: `Отличное знание темы «${t.title}»`, text: `Предмет: ${sub.title}. Тема пройдена на 100% — три звезды!` });
const sectionCert = (sub: Subject, sec: { id: string; title: string }): Cert =>
  ({ id: `s:${sec.id}`, kind: 'section', icon: '📗', title: `Раздел «${sec.title}» пройден`, text: `Предмет: ${sub.title}. Все темы раздела пройдены отлично.` });
const subjectCert = (sub: Subject): Cert =>
  ({ id: `j:${sub.id}`, kind: 'subject', icon: '🎓', title: `Предмет «${sub.title}» пройден`, text: 'Все темы предмета пройдены. Это настоящее достижение!' });
const streakCert = (n: number): Cert =>
  ({ id: `k:${n}`, kind: 'streak', icon: '🔥', title: `${n} дней занятий подряд`, text: 'За настойчивость и регулярные занятия!' });

/** Грамоты, заслуженные по текущим правилам (даты выдачи хранит приложение). */
export function earnedCertificates(s: CertState, subjects: Subject[], today: string): Cert[] {
  const out: Cert[] = [];
  const done = (id: string) => s.topicResults[id]?.done === true;
  const strong = (id: string) => done(id) && (s.topicResults[id]?.stars ?? 0) >= SECTION_MIN_STARS;
  for (const sub of subjects) {
    const ready = sub.sections.flatMap((x) => x.topics).filter((t) => t.status === 'ready');
    for (const sec of sub.sections) {
      const topics = sec.topics.filter((t) => t.status === 'ready');
      if (topics.length && topics.every((t) => strong(t.id))) out.push(sectionCert(sub, sec));
    }
    if (ready.length && ready.every((t) => done(t.id))) out.push(subjectCert(sub));
  }
  const days = currentStreak((d) => (s.daily[d]?.tasks ?? 0) > 0, today).days;
  for (const n of STREAK_CERTS) if (days >= n) out.push(streakCert(n));
  return out;
}

/**
 * Все полученные грамоты — по сохранённым номерам, в том числе выданные по прежним правилам.
 * Грамота за тему или раздел, которых больше нет в программе, не показывается.
 */
export function ownedCertificates(certificates: Record<string, string>, subjects: Subject[]): Cert[] {
  const out: Cert[] = [];
  for (const id of Object.keys(certificates)) {
    const key = id.slice(2);
    let c: Cert | undefined;
    if (id.startsWith('k:') && Number(key) > 0) c = streakCert(Number(key));
    for (const sub of subjects) {
      if (c) break;
      if (id === `j:${sub.id}`) c = subjectCert(sub);
      for (const sec of sub.sections) {
        if (id === `s:${sec.id}`) c = sectionCert(sub, sec);
        const t = sec.topics.find((x) => id === `t:${x.id}`);
        if (t) c = topicCert(sub, t);
      }
    }
    if (c) out.push(c);
  }
  return out;
}
