export interface Quest {
  id: string;
  kind: 'tasks' | 'subject' | 'words' | 'topic';
  icon: string;
  text: string;
  target: number;
  subject?: string;
}

export interface QuestDay {
  tasks: number;
  bySubject?: Record<string, number>;
  words?: number;
  topics?: number;
}

export const QUEST_POINTS = 15;

const hash = (s: string) => {
  let h = 5381;
  for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
};

/** Три задания дня. Набор зависит от даты, поэтому каждый день разный, но стабильный в течение дня. */
export function questsFor(date: string, subjects: { id: string; title: string; icon: string }[]): Quest[] {
  const h = hash(date);
  const out: Quest[] = [{ id: `${date}:q1`, kind: 'tasks', icon: '🎯', text: 'Реши 8 заданий', target: 8 }];
  const pool = subjects.filter((s) => s.id !== 'krugozor');
  if (pool.length) {
    const s = pool[h % pool.length];
    out.push({ id: `${date}:q2`, kind: 'subject', subject: s.id, icon: s.icon, text: `Позанимайся: ${s.title}, 5 заданий`, target: 5 });
  }
  const third: Omit<Quest, 'id'>[] = [
    { kind: 'words', icon: '📒', text: 'Повтори 6 английских слов', target: 6 },
    { kind: 'topic', icon: '🏁', text: 'Пройди тему на 80% и выше', target: 1 },
  ];
  const krug = subjects.find((s) => s.id === 'krugozor');
  if (krug) third.push({ kind: 'subject', subject: 'krugozor', icon: krug.icon, text: 'Узнай новое в «Кругозоре»: 4 задания', target: 4 });
  out.push({ id: `${date}:q3`, ...third[(h >>> 3) % third.length] });
  return out;
}

export function questProgress(q: Quest, d: QuestDay): number {
  const v = q.kind === 'tasks' ? d.tasks : q.kind === 'words' ? d.words ?? 0 : q.kind === 'topic' ? d.topics ?? 0 : d.bySubject?.[q.subject!] ?? 0;
  return Math.min(q.target, v);
}
