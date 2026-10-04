import type { GeneratorRef, Task } from '../content/schema';
import type { Rng } from '../engine/rng';
import { mathGenerators } from './math';

export const generators = { ...mathGenerators };

export function generate(ref: GeneratorRef, ctx: { subject: string; topicId: string }, rng: Rng = Math.random): Task {
  const gen = generators[ref.generator as keyof typeof generators];
  if (!gen) throw new Error(`Неизвестный генератор: ${ref.generator}`);
  return {
    ...gen(rng, ref.difficulty),
    id: `${ref.generator}:${Math.floor(rng() * 1e9).toString(36)}`,
    subject: ctx.subject,
    topicId: ctx.topicId,
    difficulty: ref.difficulty,
  };
}
