import { buildSubject } from './lib.mjs';
import { krugA } from './parts/krug-a.mjs';
import { krugB } from './parts/krug-b.mjs';
import { krugC } from './parts/krug-c.mjs';
import { krugD } from './parts/krug-d.mjs';

export const subject = buildSubject(
  { id: 'krugozor', title: 'Кругозор', language: 'ru', color: '#6d28d9', icon: '🔭', review: true },
  [...krugA, ...krugB, ...krugC, ...krugD],
);
