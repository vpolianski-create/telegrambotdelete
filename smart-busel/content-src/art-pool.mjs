// Запас вопросов и переписанные объяснения по «Искусству»: собирается из файлов content-src/pool/art-*.mjs.
import * as a from './pool/art-a.mjs';
import * as b from './pool/art-b.mjs';
import * as c from './pool/art-c.mjs';

const parts = [a, b, c];
export const artPool = Object.assign({}, ...parts.map((p) => p.pool));
export const artExplain = Object.assign({}, ...parts.map((p) => p.explain));
