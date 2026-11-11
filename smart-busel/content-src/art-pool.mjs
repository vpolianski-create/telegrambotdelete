// Запас вопросов и переписанные объяснения по «Искусству»: собирается из файлов content-src/pool/art-*.mjs.
import * as a from './pool/art-a.mjs';
import * as b from './pool/art-b.mjs';
import * as c from './pool/art-c.mjs';
import * as d from './pool/art-d.mjs';
import * as e from './pool/art-e.mjs';
import * as f from './pool/art-f.mjs';
import * as dropped from './pool/art-drop.mjs';

const parts = [a, b, c, d, e, f, dropped];
export const artPool = Object.assign({}, ...parts.map((p) => p.pool));
export const artExplain = Object.assign({}, ...parts.map((p) => p.explain));
/** Номера заданий, убранных из уроков: ответа на них в тексте урока нет. */
export const artDrop = parts.flatMap((p) => p.drop ?? []);
