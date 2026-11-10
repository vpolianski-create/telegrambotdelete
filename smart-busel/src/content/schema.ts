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
  /** Картинка к заданию: путь внутри content/images. */
  image: z.string().optional(),
  /** Для type «order»: что собираем — список событий, предложение из слов или слово из букв. */
  kind: z.enum(['list', 'words', 'letters']).optional(),
  /** Место в уроке, где есть ответ: номер карточки и дословное предложение из неё. */
  ref: z.object({ card: z.number().int().min(0), quote: z.string().optional() }).optional(),
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

/** Карточка знаний: открывается в «Альбоме», когда тема пройдена. */
export const KnowledgeCardSchema = z.object({ emoji: z.string(), title: z.string(), fact: z.string() });

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  needsReview: z.boolean().optional(),
  status: z.enum(['planned', 'ready']).default('planned'),
  /** Карточки объяснения; **жирный** выделяет ключевые слова. */
  cards: z.array(z.string()).default([]),
  example: ExampleSchema.optional(),
  /** Картины к уроку: показываются у карточки с номером card. */
  images: z.array(z.object({ card: z.number().int().min(0), file: z.string(), title: z.string(), author: z.string() })).optional(),
  selfCheck: z.array(TaskSchema).default([]),
  practice: z.array(EntrySchema).default([]),
  bonus: z.array(EntrySchema).default([]),
  /** Запас дополнительных вопросов: при повторном прохождении часть практики берётся отсюда. */
  pool: z.array(TaskSchema).default([]),
  card: KnowledgeCardSchema.optional(),
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
export type KnowledgeCard = z.infer<typeof KnowledgeCardSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Word = z.infer<typeof WordSchema>;
export type WordSet = z.infer<typeof WordSetSchema>;
export const isGeneratorRef = (e: Entry): e is GeneratorRef => 'generator' in e;
