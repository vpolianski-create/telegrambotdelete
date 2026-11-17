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
 * Грамоты, полученные по прежним правилам (тема на 100 %, раздел с темами ниже 2 звёзд, серия 7 и 14 дней),
 * удаляются — решение родителя (v1.10.0): в коллекции и на печати только грамоты по новым правилам. См. keepCertificates.
 */
export const STREAK_CERTS = [30, 100] as const;
/** Сколько звёзд нужно за каждую тему раздела, чтобы получить грамоту за раздел. */
export const SECTION_MIN_STARS = 2;

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

/** Подходит ли сохранённая грамота под нынешние правила (за серию — проверить уже нельзя, только число дней). */
function validNow(id: string, results: CertState['topicResults'], subjects: Subject[]): boolean {
  const done = (t: string) => results[t]?.done === true;
  const strong = (t: string) => done(t) && (results[t]?.stars ?? 0) >= SECTION_MIN_STARS;
  if (id.startsWith('k:')) return (STREAK_CERTS as readonly number[]).includes(Number(id.slice(2)));
  for (const sub of subjects) {
    if (id === `j:${sub.id}`) {
      const ready = sub.sections.flatMap((x) => x.topics).filter((t) => t.status === 'ready');
      return ready.length > 0 && ready.every((t) => done(t.id));
    }
    for (const sec of sub.sections) {
      if (id !== `s:${sec.id}`) continue;
      const topics = sec.topics.filter((t) => t.status === 'ready');
      return topics.length > 0 && topics.every((t) => strong(t.id));
    }
  }
  return false; // за тему (t:) и за то, чего больше нет в программе
}

/** Оставляет из сохранённых грамот (номер → дата выдачи) только заслуженные по нынешним правилам. */
export function keepCertificates(certificates: Record<string, string>, results: CertState['topicResults'], subjects: Subject[]): Record<string, string> {
  return Object.fromEntries(Object.entries(certificates).filter(([id]) => validNow(id, results, subjects)));
}

/** Грамоты для коллекции и печати — только по нынешним правилам, по сохранённым номерам. */
export function ownedCertificates(certificates: Record<string, string>, subjects: Subject[], results: CertState['topicResults']): Cert[] {
  const out: Cert[] = [];
  for (const id of Object.keys(keepCertificates(certificates, results, subjects))) {
    let c: Cert | undefined;
    if (id.startsWith('k:')) c = streakCert(Number(id.slice(2)));
    for (const sub of subjects) {
      if (c) break;
      if (id === `j:${sub.id}`) c = subjectCert(sub);
      const sec = sub.sections.find((x) => id === `s:${x.id}`);
      if (sec) c = sectionCert(sub, sec);
    }
    if (c) out.push(c);
  }
  return out;
}
