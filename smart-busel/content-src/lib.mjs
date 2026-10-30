// Помощники для написания уроков. Исходники лежат в content-src/*.mjs,
// команда `npm run build-content` собирает из них content/subjects/*.json.

const arr = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

/** Ссылка на генератор заданий: g('math.round.nearest', 'basic', 3) */
export const g = (generator, difficulty = 'basic', n = 1) => Array.from({ length: n }, () => ({ generator, difficulty }));

/** Выбор одного ответа. answer обязан быть среди options. */
export const S = (question, answer, options, explanation, hints) => ({ type: 'single', question, answer, options, explanation: arr(explanation), hints: arr(hints) });
/** Верно / неверно. */
export const TF = (question, answer, explanation, hints) => ({ type: 'truefalse', question, answer, explanation: arr(explanation), hints: arr(hints) });
/** Ввод слова или числа. */
export const I = (question, answer, explanation, hints) => ({ type: 'input', question, answer, explanation: arr(explanation), hints: arr(hints) });
/** Пометить статическое задание как «повышенной сложности». */
export const adv = (task) => ({ ...task, adv: true });

/** Тема: номер (по нему строится id, например math-t07), название, содержимое. */
export const T = (n, title, spec = {}) => ({ n, title, spec });

const pad = (n) => String(n).padStart(2, '0');
const DEFAULT_HINT = 'Вернись к карточкам урока: ответ там.';

export function buildSubject(meta, sections) {
  const seen = new Set();
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
        const fix = (task, difficulty, prefix) => {
          if ('generator' in task) return task;
          const { adv: isAdv, ...rest } = task;
          return {
            id: `${id}-${prefix}${next()}`, subject: meta.id, topicId: id,
            difficulty: difficulty === 'basic' && isAdv ? 'advanced' : difficulty,
            ...rest, hints: rest.hints.length ? rest.hints : [DEFAULT_HINT],
          };
        };
        const topic = { id, title: tt, status: spec.cards ? 'ready' : 'planned' };
        if (spec.review ?? meta.review) topic.needsReview = true;
        topic.cards = spec.cards ?? [];
        if (spec.example) topic.example = { title: spec.example[0], steps: spec.example[1].map(([text, why]) => ({ text, why })) };
        topic.selfCheck = (spec.check ?? []).map((t) => fix(t, 'basic', 'sc'));
        topic.practice = (spec.practice ?? []).map((t) => fix(t, 'basic', 'p'));
        topic.bonus = (spec.bonus ?? []).map((t) => fix(t, 'bonus', 'x'));
        if (spec.card) topic.card = { emoji: spec.card[0], title: spec.card[1], fact: spec.card[2] };
        return topic;
      }),
    })),
  };
  return out;
}
