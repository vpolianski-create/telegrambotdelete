// Запас вопросов и переписанные объяснения по «Человеку и миру»: собирается из файлов content-src/pool/world-*.mjs.
import * as a from './pool/world-a.mjs';
import * as b from './pool/world-b.mjs';
import * as c from './pool/world-c.mjs';
import * as d from './pool/world-d.mjs';
import * as e from './pool/world-e.mjs';
import * as f from './pool/world-f.mjs';
import * as g from './pool/world-g.mjs';
import * as dropped from './pool/world-drop.mjs';

const parts = [a, b, c, d, e, f, g, dropped];
export const worldPool = Object.assign({}, ...parts.map((p) => p.pool));
export const worldExplain = Object.assign({}, ...parts.map((p) => p.explain));
/** Номера заданий, убранных из уроков: ответа на них в тексте урока нет. */
export const worldDrop = parts.flatMap((p) => p.drop ?? []);
