import type { GeneratorRef, Task } from './schema';
import { isGeneratorRef } from './schema';
import { findTopic } from './loader';
import { generate } from '../generators';

export interface MistakeRef { subject: string; topicId: string; question: string; taskId?: string; entry?: GeneratorRef }

/** Задание для «Работы над ошибками»: тот же вопрос или (для генераторов) новое похожее. */
export function rebuildTask(m: MistakeRef): Task | undefined {
  const found = findTopic(m.subject, m.topicId);
  if (!found) return undefined;
  if (m.entry) return generate(m.entry, { subject: m.subject, topicId: m.topicId });
  const t = found.topic;
  for (const e of [...t.selfCheck, ...t.practice, ...t.bonus]) {
    if (isGeneratorRef(e)) continue;
    if ((m.taskId && e.id === m.taskId) || e.question === m.question) return e;
  }
  return undefined;
}

/** До `limit` разных ошибок (новые первыми), которые можно повторить. */
export function reviewList(mistakes: MistakeRef[], limit: number): { m: MistakeRef; task: Task }[] {
  const seen = new Set<string>();
  const out: { m: MistakeRef; task: Task }[] = [];
  for (const m of mistakes) {
    const key = `${m.topicId}|${m.question}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const task = rebuildTask(m);
    if (task) out.push({ m, task });
    if (out.length >= limit) break;
  }
  return out;
}
