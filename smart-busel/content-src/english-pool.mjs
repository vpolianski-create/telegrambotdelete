// Запас вопросов, ссылки на правила и переписанные объяснения по английскому: собирается из файлов content-src/pool/english-*.mjs.
import * as a from './pool/english-a.mjs';
import * as b from './pool/english-b.mjs';
import * as c from './pool/english-c.mjs';
import * as d from './pool/english-d.mjs';
import * as e from './pool/english-e.mjs';
import * as f from './pool/english-f.mjs';

const parts = [a, b, c, d, e, f];
export const englishPool = Object.assign({}, ...parts.map((p) => p.pool));
export const englishExplain = Object.assign({}, ...parts.map((p) => p.explain));
/** Для старых заданий: фраза-правило из урока, которую показывает подсказка и разбор ошибки. */
export const englishAt = Object.assign({}, ...parts.map((p) => p.at));
/** Номера заданий, убранных из уроков: ответа на них в тексте урока нет. */
export const englishDrop = parts.flatMap((p) => p.drop ?? []);
