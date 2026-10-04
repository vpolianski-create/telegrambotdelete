import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().min(1),
  subject: z.string(),
  topicId: z.string(),
  difficulty: z.enum(['basic', 'advanced', 'bonus']),
  type: z.enum(['single', 'multi', 'input', 'match', 'order', 'fill', 'truefalse', 'fraction']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  explanation: z.array(z.string()).min(1),
  hints: z.array(z.string()),
  needsReview: z.boolean().optional(),
});

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  needsReview: z.boolean().optional(),
  /** Пока контент не написан, тема отображается как «скоро». */
  status: z.enum(['planned', 'ready']).default('planned'),
  tasks: z.array(TaskSchema).default([]),
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

export type Task = z.infer<typeof TaskSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
