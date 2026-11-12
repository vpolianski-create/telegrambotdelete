import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { subjects } from '../src/content/loader';

const topics = subjects.flatMap((s) => s.sections.flatMap((sec) => sec.topics));
const withImages = topics.filter((t) => (t.images ?? []).length > 0);

describe('картины в уроках', () => {
  it('картины есть, и у каждой существует файл', () => {
    expect(withImages.length).toBeGreaterThan(10);
    for (const t of withImages) for (const im of t.images!) {
      expect(fs.existsSync(path.join('content/images', im.file)), `${t.id}: ${im.file}`).toBe(true);
    }
  });
  // название в тексте может стоять в другом падеже («Мадонне в кресле»), поэтому сравниваем основу первого слова
  it('картина стоит у карточки, где о ней говорится (название или автор есть в тексте)', () => {
    for (const t of withImages) for (const im of t.images!) {
      const card = t.cards[im.card];
      expect(card, `${t.id}: карточка ${im.card}`).toBeDefined();
      const surname = im.author.split(' ').pop()!.slice(0, 5);
      const first = im.title.split(' ')[0];
      const stem = first.length > 5 ? first.slice(0, -2) : first;
      expect(card.includes(stem) || card.includes(surname), `${t.id}: ${im.title}`).toBe(true);
    }
  });
  it('задание «узнай картину»: верный ответ среди четырёх разных вариантов, файл существует', () => {
    let n = 0;
    for (const t of topics) for (const e of t.practice) {
      if ('generator' in e || !e.image) continue;
      n++;
      expect(e.options).toHaveLength(4);
      expect(new Set(e.options).size).toBe(4);
      expect(e.options).toContain(e.answer);
      expect(fs.existsSync(path.join('content/images', e.image))).toBe(true);
      expect(t.images!.some((im) => im.file === e.image && im.title === e.answer)).toBe(true);
    }
    expect(n).toBe(withImages.reduce((a, t) => a + t.images!.length, 0));
  });
  it('для каждой картины записан источник и лицензия', () => {
    const credits = fs.readFileSync('content/images/CREDITS.md', 'utf8');
    for (const t of withImages) for (const im of t.images!) expect(credits, im.file).toContain(path.basename(im.file));
  });
});
