import { buildSubject } from './lib.mjs';
import { world2A } from './parts/world2-a.mjs';
import { world2B } from './parts/world2-b.mjs';
import { world2C } from './parts/world2-c.mjs';
import { world2D } from './parts/world2-d.mjs';
import { world2E } from './parts/world2-e.mjs';
import { world2F } from './parts/world2-f.mjs';
import { world2G } from './parts/world2-g.mjs';
import { world2H } from './parts/world2-h.mjs';

// Порядок, номера параграфов и названия — по учебнику «Человек и мир», 5 класс (Лопух, Сарычева, Шкель, 2022). Тексты — оригинальные.
export const subject = buildSubject(
  { id: 'world', title: 'Человек и мир', language: 'ru', color: '#15803d', icon: '🌍' },
  [...world2A, ...world2B, ...world2C, ...world2D, ...world2E, ...world2F, ...world2G, ...world2H],
);
