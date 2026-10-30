/** План на сегодня: темы, которые ребёнок выбрал сам. Хранится вместе с датой и «сгорает» на следующий день. */
export interface Plan { date: string; topics: string[] }

export const planFor = (plan: Plan | undefined, today: string): string[] => (plan && plan.date === today ? plan.topics : []);

export function togglePlan(plan: Plan | undefined, today: string, topicId: string): Plan {
  const cur = planFor(plan, today);
  return { date: today, topics: cur.includes(topicId) ? cur.filter((x) => x !== topicId) : [...cur, topicId] };
}

/** Темы плана в порядке программы. */
export const inProgramOrder = (ids: string[], order: string[]): string[] =>
  [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b));
