import { z } from 'zod';

export const DifficultySchema = z.enum(['basic', 'advanced', 'bonus']);

/**
 * Рисунок к уроку или заданию: рисуется кодом (SVG), картинок-файлов не нужно.
 * ray — координатный луч; ruler — отрезок на линейке; angles — углы; dots — точки рядами (деление с остатком);
 * lines — прямая, луч и отрезок; timeline — лента времени (год < 0 — до нашей эры, года 0 нет).
 */
export const VisualSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('ray'), from: z.number().optional(), to: z.number(), step: z.number().positive(),
    /** Какие деления подписаны числами. */
    labels: z.array(z.number()).default([]),
    points: z.array(z.object({ at: z.number(), name: z.string().optional() })).default([]),
  }),
  z.object({ kind: z.literal('ruler'), length: z.number().int().positive(), a: z.number().min(0), b: z.number().positive() }),
  z.object({ kind: z.literal('angles'), items: z.array(z.object({ deg: z.number().min(1).max(180), label: z.string().optional() })).min(1).max(4) }),
  z.object({ kind: z.literal('dots'), total: z.number().int().positive(), perRow: z.number().int().positive() }),
  z.object({ kind: z.literal('lines') }),
  z.object({
    kind: z.literal('timeline'),
    events: z.array(z.object({ year: z.number().int().refine((y) => y !== 0, 'года 0 не было'), label: z.string().optional() })).min(1),
  }),
]);

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
  /** Рисунок к заданию. visualAfter — показать только после ответа (иначе рисунок подсказывает). */
  visual: VisualSchema.optional(),
  visualAfter: z.boolean().optional(),
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
  /** Рисунки к уроку: показываются у карточки с номером card. */
  visuals: z.array(z.object({ card: z.number().int().min(0), visual: VisualSchema })).optional(),
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
export type Visual = z.infer<typeof VisualSchema>;
export type GeneratorRef = z.infer<typeof GeneratorRefSchema>;
export type Entry = z.infer<typeof EntrySchema>;
export type KnowledgeCard = z.infer<typeof KnowledgeCardSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Word = z.infer<typeof WordSchema>;
export type WordSet = z.infer<typeof WordSetSchema>;
export const isGeneratorRef = (e: Entry): e is GeneratorRef => 'generator' in e;
