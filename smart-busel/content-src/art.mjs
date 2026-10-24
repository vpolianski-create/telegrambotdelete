import { buildSubject } from './lib.mjs';
import { artA } from './parts/art-a.mjs';
import { artB } from './parts/art-b.mjs';
import { artC } from './parts/art-c.mjs';
import { artD } from './parts/art-d.mjs';
import { artE } from './parts/art-e.mjs';
import { artF } from './parts/art-f.mjs';
import { artG } from './parts/art-g.mjs';
import { artH } from './parts/art-h.mjs';
import { artI } from './parts/art-i.mjs';

// Порядок и названия тем — по учебнику «Искусство», 5 класс (Колбышева и др., 2022). Тексты — оригинальные.
export const subject = buildSubject(
  { id: 'art', title: 'Искусство', language: 'ru', color: '#be185d', icon: '🎨' },
  [...artA, ...artB, ...artC, ...artD, ...artE, ...artF, ...artG, ...artH, ...artI],
);
