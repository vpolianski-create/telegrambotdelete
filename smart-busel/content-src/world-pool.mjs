// Запас вопросов и переписанные объяснения по «Человеку и миру»: собирается из файлов content-src/pool/world-*.mjs.
import * as a from './pool/world-a.mjs';
import * as b from './pool/world-b.mjs';
import * as c from './pool/world-c.mjs';
import * as d from './pool/world-d.mjs';
import * as e from './pool/world-e.mjs';
import * as f from './pool/world-f.mjs';

const parts = [a, b, c, d, e, f];
export const worldPool = Object.assign({}, ...parts.map((p) => p.pool));
export const worldExplain = Object.assign({}, ...parts.map((p) => p.explain));
