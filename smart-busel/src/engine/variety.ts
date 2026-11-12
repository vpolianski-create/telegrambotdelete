import type { Task, Word } from '../content/schema';
import { shuffle, type Rng } from './rng';

// Разнообразие заданий без новых фактов: из уже проверенных вопросов урока собираются
// задания других видов — «собери слово из букв» и «соедини вопрос и ответ».

/** Вопрос опирается на варианты ответа («какое из…», «выбери…») — без вариантов он не имеет смысла. */
const NEEDS_OPTIONS = /како[ейгм]+ из|какая из|какие из|кто из|что из|выбери|лишн|перечисленн|вариант|утвержден|___/i;
const wordCount = (s: string) => s.trim().split(/\s+/).length;
// задание с картинкой или рисунком оставляем как есть: без них вопрос теряет смысл
const isSingle = (t: Task) => t.type === 'single' && typeof t.answer === 'string' && !NEEDS_OPTIONS.test(t.question) && !t.image && !t.visual;

/** Ответ — одно слово из 4–12 букв: его можно собрать из букв. */
export function canSpell(t: Task): boolean {
  return isSingle(t) && /^[а-яёa-z]{4,12}$/i.test(t.answer as string);
}

/** Короткий вопрос с коротким ответом: годится для «соедини пары». */
export function canMatch(t: Task): boolean {
  return isSingle(t) && wordCount(t.question) <= 9 && wordCount(t.answer as string) <= 4 && (t.answer as string).length <= 32;
}

/** Тот же вопрос, но ответ нужно собрать из перемешанных букв. id и вопрос прежние — для работы над ошибками. */
export function spellTask(t: Task, rng: Rng): Task {
  const letters = (t.answer as string).split('');
  let options = shuffle(rng, letters);
  for (let k = 0; k < 5 && options.join('') === letters.join(''); k++) options = shuffle(rng, letters);
  if (options.join('') === letters.join('')) options = [...letters].reverse();
  return { ...t, type: 'order', kind: 'letters', options, answer: letters };
}

/** Одно задание «соедини вопрос и ответ» из нескольких вопросов темы. */
export function matchTask(tasks: Task[]): Task {
  const first = tasks[0];
  return {
    id: first.id, subject: first.subject, topicId: first.topicId, difficulty: 'basic', type: 'match',
    question: 'Соедини вопрос и ответ',
    options: tasks.map((t) => t.question), answer: tasks.map((t) => t.answer as string),
    explanation: ['Правильные пары показаны выше. Если сомневаешься — загляни в урок.'], hints: [],
  };
}

/**
 * Для повторного прохождения темы: до двух вопросов превращаются в «собери слово»,
 * три-четыре — в одно задание «соедини пары». Остальные задания и их порядок не меняются.
 */
export function withVariety(tasks: Task[], rng: Rng): Task[] {
  const spell = shuffle(rng, tasks.filter(canSpell)).slice(0, 2);
  const pool: Task[] = [];
  for (const t of shuffle(rng, tasks.filter((x) => canMatch(x) && !spell.includes(x)))) {
    const a = (t.answer as string).toLowerCase();
    if (!pool.some((p) => (p.answer as string).toLowerCase() === a)) pool.push(t);
  }
  const inMatch = pool.length >= 3 ? pool.slice(0, 4) : [];
  if (!spell.length && !inMatch.length) return tasks;
  const ordered = tasks.filter((t) => inMatch.includes(t)); // пары — в порядке урока
  const out: Task[] = [];
  let placed = false;
  for (const t of tasks) {
    if (spell.includes(t)) out.push(spellTask(t, rng));
    else if (inMatch.includes(t)) { if (!placed) { out.push(matchTask(ordered)); placed = true; } } else out.push(t);
  }
  return out;
}

/** «Собери предложение» из примера к английскому слову. */
export function sentenceTask(w: Word, rng: Rng): Task | undefined {
  const words = w.example.trim().split(/\s+/);
  if (words.length < 4 || words.length > 10) return undefined;
  let options = shuffle(rng, words);
  for (let k = 0; k < 5 && options.join(' ') === words.join(' '); k++) options = shuffle(rng, words);
  if (options.join(' ') === words.join(' ')) return undefined;
  return {
    id: `sentence:${w.id}`, subject: 'english', topicId: 'vocab', difficulty: 'basic', type: 'order', kind: 'words',
    question: `Собери предложение со словом «${w.en}»`, options, answer: words,
    explanation: [`${w.en} ${w.transcription} — ${w.ru}`], hints: [`Первое слово: ${words[0]}`],
  };
}
