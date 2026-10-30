import type { Task } from '../content/schema';

const norm = (s: unknown) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е') // е/ё не различаем
    .replace(/[’ʼ`´]/g, "'") // варианты апострофа в белорусском
    .replace(/\s+/g, ' ');
// ў/у и і/и намеренно НЕ сводим: в белорусском это разные буквы.

const asNumber = (s: string): number | null => {
  const t = s.replace(/\s/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};

export type Given = string | string[] | boolean;

export function checkAnswer(task: Pick<Task, 'type' | 'answer'>, given: Given): boolean {
  const { answer } = task;
  if (task.type === 'truefalse') return given === answer;
  if (task.type === 'multi') {
    const a = new Set((answer as string[]).map(norm));
    const g = new Set((given as string[]).map(norm));
    return a.size === g.size && [...a].every((x) => g.has(x));
  }
  const g = norm(given as string);
  const a = norm(answer as string | number);
  if (task.type === 'single') return g === a;
  const gn = asNumber(g);
  const an = asNumber(a);
  if (gn !== null && an !== null) return gn === an;
  return g === a;
}
