import { buildSubject } from './lib.mjs';
import { hist2A } from './parts/hist2-a.mjs';
import { hist2B } from './parts/hist2-b.mjs';
import { hist2C } from './parts/hist2-c.mjs';
import { hist2D } from './parts/hist2-d.mjs';
import { hist2E } from './parts/hist2-e.mjs';
import { hist2F } from './parts/hist2-f.mjs';
import { hist2G } from './parts/hist2-g.mjs';
import { hist2H } from './parts/hist2-h.mjs';
import { hist2I } from './parts/hist2-i.mjs';
import { hist2J } from './parts/hist2-j.mjs';
import { hist2K } from './parts/hist2-k.mjs';
import { hist2L } from './parts/hist2-l.mjs';
import { hist2M } from './parts/hist2-m.mjs';
import { hist2N } from './parts/hist2-n.mjs';
import { hist2O } from './parts/hist2-o.mjs';
import { hist2P } from './parts/hist2-p.mjs';
import { hist2Q } from './parts/hist2-q.mjs';
import { hist2R } from './parts/hist2-r.mjs';
import { hist2S } from './parts/hist2-s.mjs';
import { hist2T } from './parts/hist2-t.mjs';
import { hist2U } from './parts/hist2-u.mjs';
import { hist2V } from './parts/hist2-v.mjs';
import { hist2W } from './parts/hist2-w.mjs';
import { hist2X } from './parts/hist2-x.mjs';

const all = [...hist2A, ...hist2B, ...hist2C, ...hist2D, ...hist2E, ...hist2F, ...hist2G, ...hist2H, ...hist2I, ...hist2J, ...hist2K, ...hist2L, ...hist2M, ...hist2N, ...hist2O, ...hist2P, ...hist2Q, ...hist2R, ...hist2S, ...hist2T, ...hist2U, ...hist2V, ...hist2W, ...hist2X].flatMap(([, topics]) => topics);
const group = (title, from, to) => [title, all.filter((t) => t.n >= from && t.n <= to)];

export const subject = buildSubject({ id: 'history', title: 'История Древнего мира', language: 'ru', color: '#9a5314', icon: '🏺', review: false }, [
  group('Часть 1. Введение', 1, 2),
  group('Часть 1. Раздел I. Первобытное общество', 3, 8),
  group('Часть 1. Глава 1. Древний Египет', 9, 14),
  group('Часть 1. Глава 2. Передняя Азия в древности', 15, 23),
  group('Часть 1. Глава 3. Индия и Китай в древности', 24, 27),
  group('Часть 1. Глава 4. Древняя Америка', 28, 29),
  group('Часть 2. Раздел 1. Древняя Греция', 30, 45),
  group('Часть 2. Раздел 2. Древний Рим', 46, 58),
  group('Часть 2. Раздел 3. Древние германцы и славяне', 59, 60),
]);
