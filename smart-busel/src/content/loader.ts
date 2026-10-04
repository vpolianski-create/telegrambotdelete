import { SubjectSchema, type Subject } from './schema';

// Добавление предмета = добавление JSON-файла в /content/subjects, код менять не нужно.
const files = import.meta.glob('../../content/subjects/*.json', { eager: true, import: 'default' });

export const subjects: Subject[] = Object.values(files)
  .map((f) => SubjectSchema.parse(f))
  .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
