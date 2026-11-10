import { allTopics } from './loader';
import { isGeneratorRef, type GeneratorRef, type Subject, type Task, type Topic } from './schema';
import { shuffle, type Rng } from '../engine/rng';
import { WARMUP_PER_TOPIC } from '../engine/warmup';
import { generate } from '../generators';

export interface WarmupItem { subject: Subject; topic: Topic; task: Task; entry?: GeneratorRef }

/** Вопросы разминки: по несколько случайных заданий из практики каждой темы. */
export function warmupItems(topicIds: string[], rng: Rng, perTopic = WARMUP_PER_TOPIC): WarmupItem[] {
  const out: WarmupItem[] = [];
  for (const id of topicIds) {
    const found = allTopics.find((x) => x.topic.id === id);
    if (!found) continue;
    const { subject, topic } = found;
    for (const e of shuffle(rng, topic.practice).slice(0, perTopic)) {
      out.push(isGeneratorRef(e)
        ? { subject, topic, entry: e, task: generate(e, { subject: subject.id, topicId: topic.id }) }
        : { subject, topic, task: e });
    }
  }
  return out;
}
