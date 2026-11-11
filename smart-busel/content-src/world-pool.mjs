// Запас вопросов и переписанные объяснения по «Человеку и миру»: собирается из файлов content-src/pool/world-*.mjs.
import * as a from './pool/world-a.mjs';

const parts = [a];
export const worldPool = Object.assign({}, ...parts.map((p) => p.pool));
export const worldExplain = Object.assign({}, ...parts.map((p) => p.explain));
