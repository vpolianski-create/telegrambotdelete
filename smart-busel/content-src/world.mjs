import { buildSubject } from './lib.mjs';
import { worldA } from './parts/world-a.mjs';
import { worldB } from './parts/world-b.mjs';
import { worldC } from './parts/world-c.mjs';

export const subject = buildSubject({ id: 'world', title: 'Человек и мир', language: 'ru', color: '#15803d', icon: '🌍' }, [...worldA, ...worldB, ...worldC]);
