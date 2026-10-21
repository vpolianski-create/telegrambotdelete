// Собирает content/subjects/*.json из content-src/*.mjs (формат удобен для написания уроков).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const src = path.resolve('content-src');
const out = path.resolve('content/subjects');
let n = 0;
for (const f of fs.readdirSync(src).filter((x) => x.endsWith('.mjs') && x !== 'lib.mjs')) {
  const mod = await import(pathToFileURL(path.join(src, f)).href);
  if (!mod.subject) continue;
  fs.writeFileSync(path.join(out, `${mod.subject.id}.json`), JSON.stringify(mod.subject, null, 2) + '\n');
  n++;
}
console.log(`Собрано предметов: ${n}`);
