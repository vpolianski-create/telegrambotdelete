import { SubjectSchema, WordSetSchema, type Subject, type WordSet } from './schema';

// Добавление предмета = добавление JSON-файла в /content/subjects, код менять не нужно.
const files = import.meta.glob('../../content/subjects/*.json', { eager: true, import: 'default' });
const vocab = import.meta.glob('../../content/vocab/*.json', { eager: true, import: 'default' });

export const subjects: Subject[] = Object.values(files)
  .map((f) => SubjectSchema.parse(f))
  .sort((a, b) => a.title.localeCompare(b.title, 'ru'));

export const wordSets: WordSet[] = Object.values(vocab).map((f) => WordSetSchema.parse(f));

export function findTopic(subjectId: string, topicId: string) {
  const subject = subjects.find((s) => s.id === subjectId);
  for (const sec of subject?.sections ?? []) {
    const topic = sec.topics.find((t) => t.id === topicId);
    if (topic) return { subject: subject!, topic };
  }
  return undefined;
}
