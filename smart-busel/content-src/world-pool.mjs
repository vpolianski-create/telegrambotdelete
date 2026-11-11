// Запас вопросов и переписанные объяснения по «Человеку и миру»: собирается из файлов content-src/pool/world-*.mjs.
import * as a from './pool/world-a.mjs';
import * as b from './pool/world-b.mjs';
import * as c from './pool/world-c.mjs';

const parts = [a, b, c];
export const worldPool = Object.assign({}, ...parts.map((p) => p.pool));
export const worldExplain = Object.assign({}, ...parts.map((p) => p.explain));
