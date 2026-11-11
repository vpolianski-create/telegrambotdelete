// Помощники для написания уроков. Исходники лежат в content-src/*.mjs,
// команда `npm run build-content` собирает из них content/subjects/*.json.

import { findRef, refAt, splitCard } from './refs.mjs';

const arr = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

/** Ссылка на генератор заданий: g('math.round.nearest', 'basic', 3) */
export const g = (generator, difficulty = 'basic', n = 1) => Array.from({ length: n }, () => ({ generator, difficulty }));

/** Выбор одного ответа. answer обязан быть среди options. */
export const S = (question, answer, options, explanation, hints) => ({ type: 'single', question, answer, options, explanation: arr(explanation), hints: arr(hints) });
/** Верно / неверно. */
export const TF = (question, answer, explanation, hints) => ({ type: 'truefalse', question, answer, explanation: arr(explanation), hints: arr(hints) });
/** Ввод слова или числа. */
export const I = (question, answer, explanation, hints) => ({ type: 'input', question, answer, explanation: arr(explanation), hints: arr(hints) });
/**
 * Расставь по порядку. items — в ПРАВИЛЬНОМ порядке; показываются перемешанными (всегда одинаково).
 */
export const O = (question, items, explanation, hints) => {
  const options = items.map((x, i) => [x, (i * 7 + 3) % items.length]).sort((a, b) => a[1] - b[1]).map(([x]) => x);
  if (options.join('|') === items.join('|')) options.reverse();
  return { type: 'order', kind: 'list', question, answer: items, options, explanation: arr(explanation), hints: arr(hints) };
};
/**
 * Привязать задание к правилу урока: phrase — фраза, которая дословно стоит в карточке темы.
 * Сборка остановится, если такой фразы в уроке нет.
 */
export const R = (phrase, task) => ({ ...task, at: phrase });
/** Пометить статическое задание как «повышенной сложности». */
export const adv = (task) => ({ ...task, adv: true });

/** Тема: номер (по нему строится id, например math-t07), название, содержимое. */
export const T = (n, title, spec = {}) => ({ n, title, spec });

const pad = (n) => String(n).padStart(2, '0');

/**
 * Задание «узнай картину»: название картины по её изображению.
 * Неверные варианты — названия других картин этого же предмета (других авторов), выбор детерминированный.
 */
function pictureTask(img, pool, k) {
  const others = pool.filter((x) => x.title !== img.title && x.author !== img.author);
  const start = pool.indexOf(img) * 7 + k;
  const wrong = [];
  for (let i = 0; wrong.length < 3 && i < others.length; i++) {
    const t = others[(start + i * 5) % others.length].title;
    if (!wrong.includes(t)) wrong.push(t);
  }
  return {
    type: 'single', image: img.file, question: 'Как называется эта картина?', answer: img.title,
    options: [img.title, ...wrong], explanation: [`${img.author}. «${img.title}».`], hints: [],
  };
}

export function buildSubject(meta, sections) {
  const seen = new Set();
  const pictures = meta.images ?? [];
  const dropped = new Set(meta.drop ?? []);
  const out = {
    id: meta.id, title: meta.title, language: meta.language, color: meta.color, icon: meta.icon,
    sections: sections.map(([title, topics], si) => ({
      id: `${meta.id}-s${si + 1}`,
      title,
      topics: topics.map(({ n, title: tt, spec }) => {
        const id = `${meta.id}-t${pad(n)}`;
        if (seen.has(id)) throw new Error(`Повторяется номер темы ${id}`);
        seen.add(id);
        let k = 0;
        const next = () => ++k;
        // длинные карточки делим на короткие: одна мысль — одна карточка
        const cards = (spec.cards ?? []).flatMap((c) => splitCard(c));
        const fix = (task, difficulty, prefix) => {
          if ('generator' in task) return task;
          const { adv: isAdv, at, ...rest } = task;
          // место в уроке, где есть ответ: для подсказки и разбора ошибки
          const ref = at ? refAt(at, cards) : findRef(rest, cards);
          if (at && !ref) throw new Error(`${id}: в карточках нет фразы «${at}» (вопрос «${rest.question}»)`);
          const taskId = `${id}-${prefix}${next()}`;
          const better = meta.explain?.[taskId]; // переписанное объяснение к старому заданию
          return {
            id: taskId, subject: meta.id, topicId: id,
            difficulty: difficulty === 'basic' && isAdv ? 'advanced' : difficulty,
            ...rest, ...(better ? { explanation: [better] } : {}), ...(ref ? { ref } : {}),
          };
        };
        const topic = { id, title: tt, status: spec.cards ? 'ready' : 'planned' };
        if (spec.review ?? meta.review) topic.needsReview = true;
        topic.cards = cards;
        if (spec.example) topic.example = { title: spec.example[0], steps: spec.example[1].map(([text, why]) => ({ text, why })) };
        // сначала всем заданиям выдаются номера, потом убираются помеченные в drop — так номера остальных не сдвигаются
        const kept = (list) => list.filter((t) => !('id' in t) || !dropped.has(t.id) || !dropped.delete(t.id));
        topic.selfCheck = kept((spec.check ?? []).map((t) => fix(t, 'basic', 'sc')));
        topic.practice = kept((spec.practice ?? []).map((t) => fix(t, 'basic', 'p')));
        topic.bonus = kept([...(spec.bonus ?? []), ...(meta.extra?.[n] ?? [])].map((t) => fix(t, 'bonus', 'x')));
        // картины: показываются у своей карточки и приходят заданием «узнай картину»
        const mine = pictures.filter((x) => x.n === n);
        if (mine.length) {
          topic.images = mine.map((img) => {
            const card = cards.findIndex((c) => c.includes(img.match));
            if (card < 0) throw new Error(`${id}: в карточках нет слов «${img.match}» для картины ${img.file}`);
            return { card, file: img.file, title: img.title, author: img.author };
          });
          mine.forEach((img, k) => {
            const card = topic.images[k].card;
            topic.practice.push({ id: `${id}-i${k + 1}`, subject: meta.id, topicId: id, difficulty: 'basic', ...pictureTask(img, pictures, k), ref: { card } });
          });
        }
        // запас вопросов темы: идёт последним, чтобы номера старых заданий не менялись
        const extraPool = (meta.pool?.[n] ?? []).map((t) => fix(t, 'basic', 'q'));
        if (extraPool.length) topic.pool = extraPool;
        if (spec.card) topic.card = { emoji: spec.card[0], title: spec.card[1], fact: spec.card[2] };
        return topic;
      }),
    })),
  };
  if (dropped.size) throw new Error(`${meta.id}: в drop указаны несуществующие задания: ${[...dropped].join(', ')}`);
  return out;
}
