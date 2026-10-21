import { buildSubject } from './lib.mjs';
import { historyA } from './parts/history-a.mjs';
import { historyB } from './parts/history-b.mjs';
import { historyC } from './parts/history-c.mjs';

export const subject = buildSubject({ id: 'history', title: 'История Древнего мира', language: 'ru', color: '#9a5314', icon: '🏺', review: true }, [...historyA, ...historyB, ...historyC]);
