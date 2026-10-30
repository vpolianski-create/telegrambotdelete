import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ans, freshStore, installFakeDisk } from './helpers/fakeApp';

let store: Awaited<ReturnType<typeof freshStore>>;
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-03-10T12:00:00'));
  installFakeDisk();
  store = await freshStore();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const st = () => store.useApp.getState();
/** Баллы за выполненные «задания дня» (по 15) — они начисляются сами, их отделяем от бонусов темы. */
const questPoints = () => (st().daily[store.todayStr()]?.quests?.length ?? 0) * 15;

describe('баллы и награды в хранилище', () => {
  it('99 баллов — награды нет', () => {
    store.useApp.setState({ points: 98 });
    st().recordAnswer(ans({ points: 1 }));
    expect(st().points).toBe(99);
    expect(st().rewards).toHaveLength(0);
  });
  it('ровно 100 — одна награда «1 час игры на компьютере», статус «ждёт»', () => {
    store.useApp.setState({ points: 90 });
    st().recordAnswer(ans({ points: 10 }));
    expect(st().points).toBe(100);
    expect(st().rewards).toHaveLength(1);
    expect(st().rewards[0]).toMatchObject({ points: 100, status: 'pending', text: '1 час игры на компьютере' });
  });
  it('101 — всё ещё одна награда, а не две', () => {
    store.useApp.setState({ points: 91 });
    st().recordAnswer(ans({ points: 10 }));
    expect(st().points).toBe(101);
    expect(st().rewards).toHaveLength(1);
  });
  it('200 — две награды; следующий ответ их не дублирует', () => {
    store.useApp.setState({ points: 190 });
    st().recordAnswer(ans({ points: 10 }));
    expect(st().rewards.map((r) => r.points)).toEqual([100, 200]);
    st().recordAnswer(ans({ points: 10, question: 'другой вопрос' }));
    expect(st().rewards).toHaveLength(2);
  });
  it('один большой скачок баллов даёт все пропущенные награды', () => {
    store.useApp.setState({ points: 95 });
    st().recordAnswer(ans({ points: 210 }));
    expect(st().rewards.map((r) => r.points)).toEqual([100, 200, 300]);
  });
  it('выдача награды родителем не создаёт новых и не возвращает старую', () => {
    store.useApp.setState({ points: 99 });
    st().recordAnswer(ans({ points: 1 }));
    st().giveReward('r1');
    expect(st().rewards[0].status).toBe('given');
    st().recordAnswer(ans({ points: 5, question: 'q2' }));
    expect(st().rewards).toHaveLength(1);
    expect(st().rewards[0].status).toBe('given');
  });
  it('неверный ответ не отнимает баллы', () => {
    store.useApp.setState({ points: 50 });
    st().recordAnswer(ans({ correct: false, points: 0 }));
    expect(st().points).toBe(50);
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: один и тот же правильный ответ повторно даёт баллы снова', () => {
    st().recordAnswer(ans({ points: 10 }));
    st().recordAnswer(ans({ points: 10 }));
    expect(st().points).toBe(20);
  });
  it('счётчики дня и предмета растут, ошибка попадает в «Работу над ошибками» без дублей', () => {
    st().recordAnswer(ans({ correct: false, points: 0, question: 'Трудный' }));
    st().recordAnswer(ans({ correct: false, points: 0, question: 'Трудный' }));
    st().recordAnswer(ans({ correct: true, points: 10, question: 'Лёгкий' }));
    expect(st().subjectStats.math).toEqual({ tasks: 3, correct: 1 });
    expect(st().mistakes).toHaveLength(1);
    const d = st().daily[store.todayStr()];
    expect(d.tasks).toBe(3);
    expect(d.correct).toBe(1);
  });
});

describe('порог награды в родительском режиме', () => {
  it('порог 50 при 120 баллах: прошлые баллы наград не дают, награда будет за следующие 50', () => {
    store.useApp.setState({ points: 120 });
    st().updateSettings({ rewardThreshold: 50 });
    expect(st().rewards).toHaveLength(0);
    st().recordAnswer(ans({ points: 50 }));
    expect(st().rewards.map((r) => r.points)).toEqual([170]);
  });
  it('порог снижен — новый порог действует только вперёд: задним числом награды не создаются', () => {
    store.useApp.setState({ points: 350 });
    st().recordAnswer(ans({ points: 0 })); // 3 награды по порогу 100
    expect(st().rewards).toHaveLength(3);
    st().updateSettings({ rewardThreshold: 50 });
    expect(st().rewards).toHaveLength(3);
    st().recordAnswer(ans({ points: 49, question: 'a' }));
    expect(st().rewards).toHaveLength(3); // 399 баллов: до следующей награды ещё 1
    st().recordAnswer(ans({ points: 1, question: 'b' }));
    expect(st().points).toBe(400);
    expect(st().rewards).toHaveLength(4);
    expect(st().rewards[3].points).toBe(400);
    st().recordAnswer(ans({ points: 50, question: 'c' }));
    expect(st().rewards.map((r) => r.points)).toEqual([100, 200, 300, 400, 450]);
  });
  it('порог снижен: награды в процессе набора не «сгорают» и не дублируются при повторном изменении', () => {
    store.useApp.setState({ points: 120 });
    st().recordAnswer(ans({ points: 0 }));
    st().updateSettings({ rewardThreshold: 50 });
    st().updateSettings({ rewardThreshold: 50 });
    st().updateSettings({ rewardThreshold: 25 });
    expect(st().rewards).toHaveLength(1);
    st().recordAnswer(ans({ points: 25, question: 'x' }));
    expect(st().rewards).toHaveLength(2);
  });
  it('порог повышен — уже выданные награды остаются, новые не создаются', () => {
    store.useApp.setState({ points: 300 });
    st().recordAnswer(ans({ points: 0 }));
    expect(st().rewards).toHaveLength(3);
    st().updateSettings({ rewardThreshold: 200 });
    expect(st().rewards).toHaveLength(3);
    st().recordAnswer(ans({ points: 10, question: 'q' }));
    expect(st().rewards).toHaveLength(3);
  });
  it('свой текст награды подставляется в новые награды', () => {
    st().updateSettings({ rewardTexts: { '100': 'Поход в кино' } });
    store.useApp.setState({ points: 95 });
    st().recordAnswer(ans({ points: 5 }));
    expect(st().rewards[0].text).toBe('Поход в кино');
  });
});

describe('итог темы: бонусы и звёзды', () => {
  const topic = 'math-t01';
  it('ниже 80% — без бонуса, тема не пройдена', () => {
    const r = st().finishTopic(topic, 79);
    expect(r.bonus).toBe(0);
    expect(st().topicResults[topic]).toMatchObject({ done: false, passBonusGiven: false, attempts: 1, stars: 0 });
  });
  it('ровно 80% — бонус 50 и одна звезда', () => {
    const r = st().finishTopic(topic, 80);
    expect(r).toMatchObject({ bonus: 50, newStars: 1 });
    expect(st().points - questPoints()).toBe(50);
    expect(st().topicResults[topic]).toMatchObject({ done: true, stars: 1 });
  });
  it('бонус за прохождение даётся один раз, повтор темы бонус не дублирует', () => {
    st().finishTopic(topic, 85);
    const again = st().finishTopic(topic, 85);
    expect(again.bonus).toBe(0);
    expect(st().points - questPoints()).toBe(50);
    expect(st().topicResults[topic].attempts).toBe(2);
  });
  it('90% — две звезды (+15), 100% — три (+25 за третью); лучший результат не уменьшается', () => {
    expect(st().finishTopic(topic, 90)).toMatchObject({ bonus: 50 + 15, newStars: 2 });
    expect(st().finishTopic(topic, 100)).toMatchObject({ bonus: 25, newStars: 1 });
    expect(st().finishTopic(topic, 60).bonus).toBe(0);
    expect(st().topicResults[topic]).toMatchObject({ bestPercent: 100, stars: 3, done: true });
  });
  it('сразу 100% — 50 + 15 + 25', () => {
    expect(st().finishTopic(topic, 100).bonus).toBe(90);
  });
  it('карточка знаний открывается один раз за пройденную тему', () => {
    const a = st().finishTopic(topic, 100);
    const b = st().finishTopic(topic, 100);
    expect(a.card).toBe(topic);
    expect(b.card).toBeUndefined();
    expect(st().albumCards.filter((x) => x === topic)).toHaveLength(1);
  });
});

describe('цель дня и сундуки', () => {
  it('бонус за дневную цель (10 заданий) +20 даётся один раз за день', () => {
    for (let i = 0; i < 12; i++) st().recordAnswer(ans({ points: 0, question: `q${i}` }));
    // 20 за цель дня + 15 за каждое выполненное задание дня (их несколько) — проверяем именно цель дня
    expect(st().daily[store.todayStr()].goalDone).toBe(true);
    const goalBonusCount = (st().points - 15 * (st().daily[store.todayStr()].quests?.length ?? 0)) / 20;
    expect(goalBonusCount).toBe(1);
  });
  it('цель дня = 0 отключает бонус', () => {
    st().updateSettings({ dailyGoal: 0 });
    for (let i = 0; i < 12; i++) st().recordAnswer(ans({ points: 0, question: `q${i}` }));
    expect(st().daily[store.todayStr()].goalDone).toBe(false);
  });
  it('сундук темы: только для пройденной темы и только один раз', () => {
    expect(st().openChest('math-t02')).toBeUndefined();
    st().finishTopic('math-t02', 90);
    const first = st().openChest('math-t02');
    expect(first).toBeDefined();
    expect(st().openChest('math-t02')).toBeUndefined();
    expect(st().topicResults['math-t02'].chestOpened).toBe(true);
  });
});
