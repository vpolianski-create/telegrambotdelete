import fs from 'node:fs';
import path from 'node:path';
import { isGeneratorRef, SubjectSchema, WordSetSchema, type Task } from '../src/content/schema';
import { checkAnswer } from '../src/engine/answers';
import { generate, generators } from '../src/generators';

const dir = path.resolve('content/subjects');
const errors: string[] = [];
const ids = new Set<string>();
const review: string[] = [];
const dup = (id: string, where: string) => {
  if (ids.has(id)) errors.push(`${where}: повторяющийся id «${id}»`);
  ids.add(id);
};

function checkTask(task: Task, where: string) {
  const a = task.answer;
  if (a === '' || (Array.isArray(a) && a.length === 0)) errors.push(`${where}: пустой ответ`);
  if (task.type === 'single' || task.type === 'multi') {
    const opts = task.options ?? [];
    const answers = Array.isArray(a) ? a : [String(a)];
    if (!answers.every((x) => opts.includes(x))) errors.push(`${where}: правильного ответа нет среди вариантов`);
    if (new Set(opts).size !== opts.length) errors.push(`${where}: повторяющиеся варианты`);
  } else if (!checkAnswer(task, Array.isArray(a) ? a : (a as string | boolean))) {
    errors.push(`${where}: ответ не проходит собственную проверку`);
  }
  if (!task.explanation.length) errors.push(`${where}: нет пояснения`);
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const parsed = SubjectSchema.safeParse(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  if (!parsed.success) {
    errors.push(`${f}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    continue;
  }
  const s = parsed.data;
  dup(s.id, f);
  for (const sec of s.sections) {
    dup(sec.id, f);
    for (const t of sec.topics) {
      dup(t.id, f);
      if (t.needsReview) review.push(`${s.title} → ${t.title}`);
      if (t.status === 'ready' && (!t.practice.length || !t.cards.length)) errors.push(`${t.id}: готовая тема без объяснения или практики`);
      for (const e of [...t.selfCheck, ...t.practice, ...t.bonus]) {
        if (isGeneratorRef(e)) {
          if (!generators[e.generator as keyof typeof generators]) errors.push(`${t.id}: неизвестный генератор ${e.generator}`);
          else for (let k = 0; k < 100; k++) {
            const task = generate(e, { subject: s.id, topicId: t.id });
            checkTask(task, `${t.id}/${e.generator}`);
          }
          continue;
        }
        dup(e.id, f);
        checkTask(e, e.id);
      }
    }
  }
}

const vdir = path.resolve('content/vocab');
for (const f of fs.existsSync(vdir) ? fs.readdirSync(vdir).filter((x) => x.endsWith('.json')) : []) {
  const parsed = WordSetSchema.safeParse(JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8')));
  if (!parsed.success) { errors.push(`${f}: ${parsed.error.issues.map((i) => i.message).join('; ')}`); continue; }
  for (const w of parsed.data.words) dup(w.id, f);
  if (parsed.data.needsReview) review.push(`Английские слова → ${parsed.data.title} (транскрипция и переводы)`);
}

fs.writeFileSync(
  path.resolve('CONTENT_REVIEW.md'),
  `# Что нужно сверить с учебниками\n\nФайл создаётся автоматически командой \`npm run validate-content\`.\n\n${review.map((r) => `- ${r}`).join('\n')}\n`,
);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${ids.size} id, тем на проверку: ${review.length}`);
