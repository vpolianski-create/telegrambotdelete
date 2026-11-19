/*
 * Чек-лист по изменениям (checklist.md): какие пункты сработали для текущего изменения и автоматические проверки по ним.
 * Изменение = разница с origin/main (от общей точки) + незакоммиченные и новые файлы.
 * Запуск из корня репозитория: node .claude/skills/verify/checklist.cjs
 * Код выхода 1 — есть ОШИБКА (автоматический пункт не выполнен); ВНИМАНИЕ — решает агент/человек по SKILL.md.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const sh = (cmd) => { try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const base = sh('git merge-base origin/main HEAD') || sh('git rev-parse origin/main');
const lines = (s) => s.split('\n').filter(Boolean);
const changed = [...new Set([...lines(sh(`git diff --name-only ${base}`)), ...lines(sh('git ls-files --others --exclude-standard'))])];
const deleted = lines(sh(`git diff --name-only --diff-filter=D ${base}`));
const atBase = (file) => sh(`git show ${base}:${file}`);
const read = (file) => { try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch { return ''; } };

// строки таблицы checklist.md: | ID | `признак` | что проверить | авто | откуда |
const rows = read('.claude/skills/verify/checklist.md').split('\n')
  .filter((l) => /^\|\s*[A-Z]\d+\s*\|/.test(l))
  .map((l) => l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim().replace(/\\\|/g, '|')))
  .map(([id, trig, what, auto, src]) => ({ id, re: new RegExp(trig.replace(/^`|`$/g, '')), what, auto: auto === 'да', src }));

const out = []; let fail = false;
const say = (level, id, text) => { out.push(`${level.padEnd(9)} ${id}: ${text}`); if (level === 'ОШИБКА') fail = true; };

console.log(`База сравнения: ${base.slice(0, 7)} (origin/main), изменённых файлов: ${changed.length}`);
const hit = rows.filter((r) => changed.some((f) => r.re.test(f)));
if (!hit.length) console.log('Пункты чек-листа не сработали.');
for (const r of hit) {
  const files = changed.filter((f) => r.re.test(f));
  console.log(`\n[${r.id}] ${r.what}\n      файлы: ${files.slice(0, 6).join(', ')}${files.length > 6 ? ` … (+${files.length - 6})` : ''}`);
  if (!r.auto) continue;
  const testsChanged = changed.some((f) => f.startsWith('smart-busel/tests/'));
  if (r.id === 'V1') {
    const v = JSON.parse(read('smart-busel/package.json')).version;
    const old = (() => { try { return JSON.parse(atBase('smart-busel/package.json')).version; } catch { return v; } })();
    if (v === old) say('ОК', r.id, `версия не менялась (${v})`);
    else {
      if (!read('smart-busel/README_ДЛЯ_РОДИТЕЛЯ.md').includes(`## Что нового в версии ${v}`)) say('ОШИБКА', r.id, `версия ${old} → ${v}, но в README_ДЛЯ_РОДИТЕЛЯ.md нет раздела «Что нового в версии ${v}»`);
      else say('ОК', r.id, `README: раздел «Что нового в версии ${v}» есть`);
      if (!read('smart-busel/CLAUDE.md').includes(`Состояние (v${v})`)) say('ОШИБКА', r.id, `в CLAUDE.md нет «Состояние (v${v})»`);
    }
  }
  if (r.id === 'V2') {
    const deps = (j) => { try { const p = JSON.parse(j); return Object.keys({ ...p.dependencies, ...p.devDependencies }); } catch { return []; } };
    const added = deps(read('smart-busel/package.json')).filter((d) => !deps(atBase('smart-busel/package.json')).includes(d));
    if (added.length) say('ВНИМАНИЕ', r.id, `новые библиотеки: ${added.join(', ')} — нужно согласие родителя`);
    else say('ОК', r.id, 'новых библиотек нет');
  }
  if (r.id === 'T1') say(testsChanged ? 'ОК' : 'ВНИМАНИЕ', r.id, testsChanged ? 'тесты менялись вместе с логикой' : 'логика менялась, а тесты — нет (правило «сначала тест»)');
  if (r.id === 'C1') {
    const src = changed.some((f) => f.startsWith('smart-busel/content-src/'));
    say(src ? 'ОК' : 'ОШИБКА', r.id, src ? 'JSON пересобран из content-src' : 'content/subjects/*.json изменён без правки content-src — похоже на ручную правку');
  }
  if (r.id === 'C2') {
    const json = changed.some((f) => /^smart-busel\/content\/subjects\/.*\.json$/.test(f));
    say(json ? 'ОК' : 'ВНИМАНИЕ', r.id, json ? 'content/subjects пересобран' : 'content-src изменён, а content/subjects — нет: выполнить npm run build-content');
  }
  if (r.id === 'G1') {
    const goneTests = deleted.filter((f) => f.startsWith('smart-busel/tests/'));
    if (goneTests.length) say('ОШИБКА', r.id, `удалены тесты: ${goneTests.join(', ')} — нужно решение человека`);
    for (const f of files.filter((x) => x.startsWith('smart-busel/tests/') && !deleted.includes(x))) {
      const count = (s) => (s.match(/\b(it|test)\(/g) || []).length;
      const was = count(atBase(f)), now = count(read(f));
      if (now < was) say('ВНИМАНИЕ', r.id, `${f}: проверок стало меньше (${was} → ${now}) — убедиться, что это не ослабление`);
    }
    const skill = files.filter((x) => x.startsWith('.claude/skills/verify/'));
    if (skill.length) say('ВНИМАНИЕ', r.id, `изменение правит саму проверку (${skill.length} файл.) — показать человеку, что проверки не ослаблены`);
  }
}
if (out.length) console.log('\n' + out.join('\n'));
process.exit(fail ? 1 : 0);
