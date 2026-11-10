// Запас вопросов и переписанные объяснения по истории: собирается из файлов content-src/pool/history-*.mjs.
import * as a from './pool/history-a.mjs';
import * as b from './pool/history-b.mjs';
import * as c from './pool/history-c.mjs';

const parts = [a, b, c];
export const historyPool = Object.assign({}, ...parts.map((p) => p.pool));
export const historyExplain = Object.assign({}, ...parts.map((p) => p.explain));
