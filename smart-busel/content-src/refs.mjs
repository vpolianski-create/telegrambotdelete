// Связь «задание → место в уроке»: для каждого статического задания ищем предложение
// из карточек объяснения, в котором есть ответ. Его показываем в подсказке и в разборе ошибки.
// Ничего не сочиняется: цитата всегда дословно из карточек темы.

const ABBR = /(?:^|[\s(«])(?:[а-яёa-z]|тыс|млн|млрд|др|пр|см|рис|гг|вв|ок|св|им|напр|e\.g|i\.e|etc)\.$/i;

/** Делит текст на предложения; после сокращений («до н. э.», «г.», «тыс.») не режет. */
export function sentences(text) {
  const out = [];
  let cur = '';
  const parts = text.split(/(?<=[.!?…])(\s+)(?=[«"(*]*[A-ZА-ЯЁ0-9])/);
  for (let i = 0; i < parts.length; i += 2) {
    cur += parts[i];
    const boldOpen = (cur.match(/\*\*/g) ?? []).length % 2 === 1; // не рвём **выделение**
    if (i + 1 < parts.length && (ABBR.test(cur) || boldOpen)) { cur += parts[i + 1]; continue; }
    out.push(cur.trim());
    cur = '';
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

const words = (s) => s.split(/\s+/).filter(Boolean).length;

/** Длинную карточку делит на несколько по границам предложений (не длиннее limit слов). */
export function splitCard(card, limit = 42) {
  if (words(card) <= limit) return [card];
  const out = [];
  let cur = '';
  for (const s of sentences(card)) {
    if (cur && words(cur) + words(s) > limit) { out.push(cur); cur = s; } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  // короткий «хвост» приклеиваем к предыдущей карточке
  if (out.length > 1 && words(out[out.length - 1]) < 10) { const tail = out.pop(); out[out.length - 1] += ` ${tail}`; }
  return out;
}

const STOP = new Set('это как что кто где когда какой какая какое какие каком какую чем для или его она они оно был была было были быть есть который которая которые которых очень также тоже если чтобы после перед между через при над под без про the and are was were what which who how does did has have with from that this'.split(' '));
const plain = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/\*\*/g, '');
/** Значимые слова текста (без служебных); числа целиком. */
export function keywords(s) {
  const out = new Set();
  for (const w of plain(s).match(/[a-zа-я]+|\d+/g) ?? []) {
    if (/^\d+$/.test(w) || (w.length >= 3 && !STOP.has(w))) out.add(w);
  }
  return out;
}

/** Одно и то же слово в разных формах: общий корень не короче 4 букв и почти во всю длину короткого слова. */
export function sameWord(a, b) {
  if (a === b) return true;
  if (/\d/.test(a) || /\d/.test(b)) return false;
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n >= Math.max(4, Math.min(a.length, b.length) - 2);
}

const hits = (need, have) => { let n = 0; need.forEach((x) => { for (const y of have) if (sameWord(x, y)) { n++; break; } }); return n; };

/**
 * Для задания возвращает { card, quote? }: номер карточки, где есть ответ, и дословное предложение из неё.
 * quote нет, если точного предложения не нашлось (тогда показываем только карточку). undefined — места нет.
 */
export function findRef(task, cards) {
  if (!cards.length) return undefined;
  const tf = task.type === 'truefalse';
  const ans = tf ? new Set() : keywords(Array.isArray(task.answer) ? task.answer.join(' ') : task.answer);
  const q = keywords(task.question);
  let best; let loose;
  cards.forEach((card, ci) => {
    const all = keywords(card);
    const overlap = hits(ans, all) * 2 + hits(q, all);
    if (overlap >= 2 && (!loose || overlap > loose.score)) loose = { card: ci, score: overlap };
    for (const s of sentences(card)) {
      const st = keywords(s);
      const a = hits(ans, st); const k = hits(q, st);
      const score = (ans.size ? (a / ans.size) * 3 : 0) + (q.size ? (k / q.size) * 2 : 0);
      const ok = tf ? k >= Math.max(2, Math.ceil(q.size * 0.5)) : ans.size > 0 && a >= Math.ceil(ans.size * 0.6) && (k >= 1 || ans.size >= 2);
      if (ok && (!best || score > best.score)) best = { card: ci, quote: s, score };
    }
  });
  if (best) return { card: best.card, quote: best.quote };
  return loose && { card: loose.card };
}
