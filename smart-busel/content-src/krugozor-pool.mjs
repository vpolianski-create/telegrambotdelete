// Запас вопросов и переписанные объяснения по «Кругозору»: собирается из файлов content-src/pool/krugozor-*.mjs.
import * as a from './pool/krugozor-a.mjs';
import * as b from './pool/krugozor-b.mjs';

const parts = [a, b];
export const krugozorPool = Object.assign({}, ...parts.map((p) => p.pool));
export const krugozorExplain = Object.assign({}, ...parts.map((p) => p.explain));
/** Номера заданий, убранных из уроков: ответа на них в тексте урока нет. */
export const krugozorDrop = parts.flatMap((p) => p.drop ?? []);
