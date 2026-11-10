// Запас вопросов и переписанные объяснения по истории: собирается из файлов content-src/pool/history-*.mjs.
import * as a from './pool/history-a.mjs';
import * as b from './pool/history-b.mjs';
import * as c from './pool/history-c.mjs';
import * as d from './pool/history-d.mjs';
import * as e from './pool/history-e.mjs';
import * as f from './pool/history-f.mjs';
import * as g from './pool/history-g.mjs';
import * as h from './pool/history-h.mjs';
import * as i from './pool/history-i.mjs';
import * as j from './pool/history-j.mjs';
import * as k from './pool/history-k.mjs';

const parts = [a, b, c, d, e, f, g, h, i, j, k];
export const historyPool = Object.assign({}, ...parts.map((p) => p.pool));
export const historyExplain = Object.assign({}, ...parts.map((p) => p.explain));
