// Запас вопросов и переписанные объяснения по «Искусству»: собирается из файлов content-src/pool/art-*.mjs.
import * as a from './pool/art-a.mjs';

const parts = [a];
export const artPool = Object.assign({}, ...parts.map((p) => p.pool));
export const artExplain = Object.assign({}, ...parts.map((p) => p.explain));
