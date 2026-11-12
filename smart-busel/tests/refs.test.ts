import { describe, expect, it } from 'vitest';
// @ts-expect-error — помощник сборки уроков написан на обычном JS
import { findRef, refAt, sameWord, sentences, splitCard } from '../content-src/refs.mjs';

describe('деление текста урока на предложения', () => {
  it('режет по точке перед заглавной буквой', () => {
    expect(sentences('Нил течёт на север. Он разливается летом.')).toEqual(['Нил течёт на север.', 'Он разливается летом.']);
  });
  it('не режет после сокращений «до н. э.», «г.», «тыс.»', () => {
    expect(sentences('В 525 г. до н. э. Египет завоевали персы. Потом пришли греки.')).toEqual(['В 525 г. до н. э. Египет завоевали персы.', 'Потом пришли греки.']);
  });
  it('не рвёт выделение **жирным**', () => {
    expect(sentences('Столица — **Мемфис. Белые стены** у Нила. Конец.')).toEqual(['Столица — **Мемфис. Белые стены** у Нила.', 'Конец.']);
  });
});

describe('деление длинной карточки', () => {
  const s = (n: number, w: string) => `${Array.from({ length: n }, () => w).join(' ')}.`;
  it('короткую карточку не трогает', () => {
    expect(splitCard('Одно короткое предложение.')).toEqual(['Одно короткое предложение.']);
  });
  it('длинную делит по предложениям, текст не теряется и не меняется', () => {
    const card = [s(25, 'Альфа'), s(25, 'Бета'), s(25, 'Гамма')].join(' ');
    const parts = splitCard(card);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.join(' ')).toBe(card);
    parts.forEach((p: string) => expect(p.split(/\s+/).length).toBeLessThanOrEqual(50));
  });
  it('короткий хвост не остаётся отдельной карточкой', () => {
    const parts = splitCard([s(40, 'Альфа'), s(4, 'Бета')].join(' '));
    expect(parts).toHaveLength(1);
  });
});

describe('одно слово в разных формах', () => {
  it('падежи совпадают, разные слова — нет', () => {
    expect(sameWord('фараон', 'фараона')).toBe(true);
    expect(sameWord('красную', 'красная')).toBe(true);
    expect(sameWord('древнегреческий', 'древнейшей')).toBe(false);
    expect(sameWord('282', '2820')).toBe(false);
  });
});

describe('поиск места в уроке для задания', () => {
  const cards = [
    'Царь Нижнего Египта носил красную корону. Царь Верхнего Египта носил белую корону.',
    'Высший чиновник при фараоне — **чати**. В сборнике **282 статьи**.',
  ];
  it('находит предложение с ответом и номер карточки', () => {
    const r = findRef({ type: 'single', question: 'Как называется высший чиновник при фараоне?', answer: 'чати' }, cards);
    expect(r).toEqual({ card: 1, quote: 'Высший чиновник при фараоне — **чати**.' });
  });
  it('из двух похожих предложений выбирает то, где есть ответ', () => {
    const r = findRef({ type: 'single', question: 'Какую корону носил царь Верхнего Египта?', answer: 'белую' }, cards);
    expect(r?.quote).toBe('Царь Верхнего Египта носил белую корону.');
  });
  it('числовой ответ ищет точно', () => {
    expect(findRef({ type: 'single', question: 'Сколько статей в сборнике?', answer: '282' }, cards)?.quote).toBe('В сборнике **282 статьи**.');
  });
  it('цитата всегда дословно из карточки', () => {
    const r = findRef({ type: 'truefalse', question: 'Царь Нижнего Египта носил красную корону.', answer: true }, cards);
    expect(cards[r.card]).toContain(r.quote);
  });
  it('если в уроке про это ничего нет — места нет', () => {
    expect(findRef({ type: 'single', question: 'Сколько лун у Марса?', answer: 'две' }, cards)).toBeUndefined();
  });
  it('без карточек не падает', () => {
    expect(findRef({ type: 'single', question: 'Вопрос?', answer: 'ответ' }, [])).toBeUndefined();
  });
});

describe('явная ссылка на правило урока (для грамматики)', () => {
  const cards = [
    'Глагол **to be** имеет три формы: am, is, are.',
    '**I am**, **he / she / it is**, we / you / they are. Например: I am a pupil. She is my sister.',
  ];
  it('находит карточку и предложение, где стоит указанная фраза', () => {
    expect(refAt('he / she / it is', cards)).toEqual({ card: 1, quote: '**I am**, **he / she / it is**, we / you / they are.' });
  });
  it('не зависит от регистра, выделения жирным и вида апострофа', () => {
    expect(refAt('ТРИ ФОРМЫ', cards)?.card).toBe(0);
    expect(refAt("She isn't tired", ['Отрицание: She isn’t tired.'])).toEqual({ card: 0, quote: 'Отрицание: She isn’t tired.' });
  });
  it('если фразы в уроке нет — возвращает undefined, чтобы сборка остановилась', () => {
    expect(refAt('was / were', cards)).toBeUndefined();
  });
});
