import { z } from 'zod';

export const DifficultySchema = z.enum(['basic', 'advanced', 'bonus']);

export const TaskSchema = z.object({
  id: z.string().min(1),
  subject: z.string(),
  topicId: z.string(),
  difficulty: DifficultySchema,
  type: z.enum(['single', 'multi', 'input', 'match', 'order', 'fill', 'truefalse', 'fraction']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  explanation: z.array(z.string()).min(1),
  hints: z.array(z.string()),
  needsReview: z.boolean().optional(),
});

/** Ссылка на генератор: задание создаётся кодом со случайными числами, ответ вычисляется. */
export const GeneratorRefSchema = z.object({
  generator: z.string(),
  difficulty: DifficultySchema,
});

export const EntrySchema = z.union([TaskSchema, GeneratorRefSchema]);

export const ExampleSchema = z.object({
  title: z.string(),
  steps: z.array(z.object({ text: z.string(), why: z.string() })).min(1),
});

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  needsReview: z.boolean().optional(),
  status: z.enum(['planned', 'ready']).default('planned'),
  /** Карточки объяснения; **жирный** выделяет ключевые слова. */
  cards: z.array(z.string()).default([]),
  example: ExampleSchema.optional(),
  selfCheck: z.array(TaskSchema).default([]),
  practice: z.array(EntrySchema).default([]),
  bonus: z.array(EntrySchema).default([]),
});

export const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  topics: z.array(TopicSchema),
});

export const SubjectSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  language: z.enum(['ru', 'be', 'en']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string(),
  sections: z.array(SectionSchema),
});

export const WordSchema = z.object({
  id: z.string().min(1),
  en: z.string(),
  transcription: z.string(),
  ru: z.string(),
  example: z.string(),
});

export const WordSetSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  icon: z.string(),
  needsReview: z.boolean().optional(),
  words: z.array(WordSchema).min(1),
});

export type Task = z.infer<typeof TaskSchema>;
export type GeneratorRef = z.infer<typeof GeneratorRefSchema>;
export type Entry = z.infer<typeof EntrySchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Word = z.infer<typeof WordSchema>;
export type WordSet = z.infer<typeof WordSetSchema>;
export const isGeneratorRef = (e: Entry): e is GeneratorRef => 'generator' in e;
