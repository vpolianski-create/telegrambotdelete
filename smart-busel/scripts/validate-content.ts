import fs from 'node:fs';
import path from 'node:path';
import { SubjectSchema } from '../src/content/schema';

const dir = path.resolve('content/subjects');
const errors: string[] = [];
const ids = new Set<string>();
const review: string[] = [];
const dup = (id: string, where: string) => {
  if (ids.has(id)) errors.push(`${where}: повторяющийся id «${id}»`);
  ids.add(id);
};

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
      for (const task of t.tasks) {
        dup(task.id, f);
        const a = task.answer;
        if (a === '' || (Array.isArray(a) && a.length === 0)) errors.push(`${task.id}: пустой ответ`);
        if (['single', 'multi'].includes(task.type)) {
          const opts = task.options ?? [];
          const answers = Array.isArray(a) ? a : [String(a)];
          if (!answers.every((x) => opts.includes(x))) errors.push(`${task.id}: правильного ответа нет среди вариантов`);
        }
      }
    }
  }
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
