// Запас вопросов и переписанные объяснения по «Кругозору»: собирается из файлов content-src/pool/krugozor-*.mjs.
import * as a from './pool/krugozor-a.mjs';
import * as b from './pool/krugozor-b.mjs';
import * as c from './pool/krugozor-c.mjs';
import * as d from './pool/krugozor-d.mjs';

const parts = [a, b, c, d];
export const krugozorPool = Object.assign({}, ...parts.map((p) => p.pool));
export const krugozorExplain = Object.assign({}, ...parts.map((p) => p.explain));
/** Номера заданий, убранных из уроков: ответа на них в тексте урока нет. */
export const krugozorDrop = parts.flatMap((p) => p.drop ?? []);
