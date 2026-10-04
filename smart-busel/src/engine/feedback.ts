import { pick, type Rng } from './rng';

const PRAISE = [
  'Отлично!', 'Супер!', 'Так держать!', 'Верно, молодец!', 'Точно в цель!',
  'Здорово получилось!', 'Бусел гордится тобой!', 'Блестяще!', 'Вот это да!',
];
const ALMOST = ['Почти! Давай разберём', 'Близко! Посмотрим вместе', 'Хорошая попытка! Разберём шаги'];
const EFFORT = ['Ты не сдался — это главное!', 'Каждая попытка делает тебя сильнее!', 'Ошибки помогают учиться!'];

export const praise = (rng: Rng = Math.random) => pick(rng, PRAISE);
export const almost = (rng: Rng = Math.random) => pick(rng, ALMOST);
export const effort = (rng: Rng = Math.random) => pick(rng, EFFORT);
