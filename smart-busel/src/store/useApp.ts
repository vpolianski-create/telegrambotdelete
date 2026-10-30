import { create } from 'zustand';
import { allTopics, learnSubjects } from '../content/loader';
import { BADGES, computedBadges } from '../engine/badges';
import { openChest, type ChestResult } from '../engine/chest';
import { afterAnswer, type WordState } from '../engine/leitner';
import { levelFor, STAR_BONUS, starsFor } from '../engine/level';
import { questProgress, questsFor, QUEST_POINTS } from '../engine/quests';
import { DAILY_GOAL_BONUS, TOPIC_PASS_BONUS, TOPIC_PASS_PERCENT } from '../engine/points';
import type { GeneratorRef } from '../content/schema';
import { earnedCertificates } from '../engine/certificates';
import { togglePlan as togglePlanFn, type Plan } from '../engine/plan';
import { DEFAULT_REWARD_TEXT, DEFAULT_THRESHOLD, newRewards, type Reward, type RewardBase } from '../engine/rewards';

export interface Settings {
  name: string;
  pin: string;
  pinChanged: boolean;
  rewardThreshold: number;
  rewardTexts: Record<string, string>; // "100" -> "1 час игры на компьютере"
  dailyGoal: number; // заданий в день
  dailyLimitMin: number; // 0 = без лимита
  breakEveryMin: number;
  theme: 'light' | 'dark';
  fontScale: number;
  sound: boolean;
  accessory: string; // надетый аксессуар Бусела
}

export interface TopicResult { bestPercent: number; attempts: number; done: boolean; passBonusGiven: boolean; chestOpened?: boolean; stars?: number }
export interface DayLog {
  sec: number; tasks: number; correct: number; goalDone: boolean; unlocked: boolean;
  bySubject?: Record<string, number>; words?: number; topics?: number; quests?: string[]; questChest?: boolean; topicIds?: string[];
}
export interface Toast { icon: string; title: string; text: string }
export interface Mistake { subject: string; topicId: string; question: string; date: string; taskId?: string; entry?: GeneratorRef }

export interface Data {
  points: number;
  rewards: Reward[];
  rewardBase?: RewardBase; // с какого момента считается текущий порог награды (меняется вместе с порогом)
  celebrated: string[]; // награды, для которых ребёнок уже видел праздничный экран
  topicResults: Record<string, TopicResult>;
  daily: Record<string, DayLog>;
  subjectStats: Record<string, { tasks: number; correct: number }>;
  mistakes: Mistake[];
  leitner: Record<string, WordState>;
  badges: string[];
  albumCards: string[]; // темы, чьи карточки знаний уже открыты
  stickers: string[];
  chestAccessories: string[];
  records: { matchBest?: number };
  opened: string[]; // темы, которые ребёнок открывал
  plan: Plan; // темы, выбранные на сегодня
  certificates: Record<string, string>; // id грамоты → дата выдачи
  fixedMistakes: number;
  levelSeen: number;
  contentRev?: number; // версия набора уроков: при переписывании предметов сбрасываем отметки о прохождении тем
  lastTopic: { subjectId: string; topicId: string } | null;
  settings: Settings;
}

const initial: Data = {
  points: 0, rewards: [], celebrated: [], topicResults: {}, daily: {}, subjectStats: {},
  mistakes: [], leitner: {}, badges: [], albumCards: [], stickers: [], chestAccessories: [], records: {}, opened: [], plan: { date: '', topics: [] }, certificates: {}, fixedMistakes: 0, levelSeen: 1, lastTopic: null,
  settings: {
    name: 'Женя', pin: '0000', pinChanged: false,
    rewardThreshold: DEFAULT_THRESHOLD, rewardTexts: {},
    dailyGoal: 10, dailyLimitMin: 0, breakEveryMin: 30,
    theme: 'light', fontScale: 1, sound: true, accessory: '',
  },
};

declare global {
  interface Window {
    busel?: { load(): Promise<Data | null>; save(d: Data): Promise<void> };
  }
}

const LS_KEY = 'smart-busel-data';
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const emptyDay = (): DayLog => ({ sec: 0, tasks: 0, correct: 0, goalDone: false, unlocked: false, bySubject: {}, words: 0, topics: 0, quests: [], questChest: false });

/** Предметы, темы которых переписаны по учебникам: старые отметки «пройдено» относились бы к другим темам. */
export const REWRITTEN_SUBJECTS = ['history', 'world', 'art'];
export const CONTENT_REV = 2;

/** Убирает прогресс по темам переписанных предметов. Баллы, награды, серия и слова остаются. */
export function resetRewrittenTopics(d: Data): Data {
  const isOld = (id: string) => REWRITTEN_SUBJECTS.some((p) => id.startsWith(`${p}-`));
  const certOld = (id: string) => REWRITTEN_SUBJECTS.some((p) => id.startsWith(`t:${p}-`) || id.startsWith(`s:${p}-`) || id === `j:${p}`);
  return {
    ...d,
    topicResults: Object.fromEntries(Object.entries(d.topicResults).filter(([id]) => !isOld(id))),
    opened: d.opened.filter((id) => !isOld(id)),
    plan: { ...d.plan, topics: d.plan.topics.filter((id) => !isOld(id)) },
    albumCards: d.albumCards.filter((id) => !isOld(id)),
    mistakes: d.mistakes.filter((m) => !isOld(m.topicId)),
    certificates: Object.fromEntries(Object.entries(d.certificates).filter(([id]) => !certOld(id))),
    lastTopic: d.lastTopic && isOld(d.lastTopic.topicId) ? null : d.lastTopic,
  };
}

export function merge(raw: Partial<Data> | null): Data {
  const d: Data = { ...initial, ...(raw ?? {}), settings: { ...initial.settings, ...(raw?.settings ?? {}) } };
  if (raw && (raw.contentRev ?? 0) < CONTENT_REV) return { ...resetRewrittenTopics(d), contentRev: CONTENT_REV };
  return { ...d, contentRev: CONTENT_REV };
}

async function load(): Promise<Data> {
  try {
    const raw = window.busel ? await window.busel.load() : JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
    return merge(raw);
  } catch { return initial; /* повреждённый файл — копия лежит в папке backups */ }
}

function persist(d: Data) {
  if (window.busel) void window.busel.save(d);
  else localStorage.setItem(LS_KEY, JSON.stringify(d));
}

export interface AnswerInfo {
  subject: string; topicId: string; question: string;
  correct: boolean; points: number; // points уже с учётом подсказок и комбо
  combo?: boolean;
  taskId?: string; entry?: GeneratorRef;
}

interface Store extends Data {
  ready: boolean;
  toasts: Toast[]; // всплывающие сообщения (значки, задания дня, карточки); не сохраняются
  init(): Promise<void>;
  /** Возвращает начисленные баллы (вместе с бонусом за дневную цель). */
  recordAnswer(a: AnswerInfo): number;
  /** Баллы за тему и звёзды; возвращает начисленные баллы и число новых звёзд. */
  finishTopic(topicId: string, percent: number, opts?: { noHints?: boolean }): { bonus: number; newStars: number; card?: string };
  /** Сундук дня после всех трёх заданий дня. */
  openDayChest(): ChestResult | undefined;
  /** Сундук-сюрприз после темы; возвращает, что выпало. */
  openChest(topicId: string): ChestResult | undefined;
  setRecord(key: 'matchBest', value: number): void;
  markLevelSeen(): void;
  setLastTopic(subjectId: string, topicId: string): void;
  /** Добавить тему в план на сегодня или убрать из него. */
  togglePlan(topicId: string): void;
  /** Ошибка исправлена в «Работе над ошибками». */
  resolveMistake(topicId: string, question: string): void;
  popToast(): void;
  answerWord(wordId: string, correct: boolean): void;
  tick(sec: number): void;
  unlockToday(): void;
  markCelebrated(id: string): void;
  giveReward(id: string): void;
  updateSettings(p: Partial<Settings>): void;
  importData(raw: unknown): void;
}

const dataOf = (s: Data): Data => ({
  points: s.points, rewards: s.rewards, rewardBase: s.rewardBase, celebrated: s.celebrated, topicResults: s.topicResults,
  daily: s.daily, subjectStats: s.subjectStats, mistakes: s.mistakes, leitner: s.leitner,
  badges: s.badges, albumCards: s.albumCards, stickers: s.stickers, chestAccessories: s.chestAccessories, records: s.records,
  opened: s.opened, plan: s.plan, certificates: s.certificates, fixedMistakes: s.fixedMistakes,
  levelSeen: s.levelSeen, contentRev: s.contentRev, lastTopic: s.lastTopic, settings: s.settings,
});

/** Баллы → дозапись наград; награды создаются ровно при пересечении порога. */
function withPoints(s: Data, n: number): Pick<Data, 'points' | 'rewards'> {
  const points = s.points + n;
  const textFor = (p: number) => s.settings.rewardTexts[String(p)] ?? DEFAULT_REWARD_TEXT;
  return { points, rewards: [...s.rewards, ...newRewards(points, s.settings.rewardThreshold, s.rewards, textFor, new Date(), s.rewardBase)] };
}

export const useApp = create<Store>((set, get) => {
  const day = (s: Data, date = todayStr()): DayLog => ({ ...emptyDay(), ...s.daily[date] });
  const commit = (p: Partial<Data>, extraBadges: string[] = []) => {
    set(p);
    const s = get();
    const toasts: Toast[] = [];
    // задания дня
    const date = todayStr();
    const d = day(s, date);
    const quests = questsFor(date, learnSubjects);
    const done = quests.filter((q) => !d.quests!.includes(q.id) && questProgress(q, d) >= q.target);
    if (done.length) {
      set({ ...withPoints(s, done.length * QUEST_POINTS), daily: { ...s.daily, [date]: { ...d, quests: [...d.quests!, ...done.map((q) => q.id)] } } });
      done.forEach((q) => toasts.push({ icon: '✅', title: 'Задание дня выполнено!', text: `${q.text} · +${QUEST_POINTS} баллов` }));
    }
    // значки
    const s2 = get();
    const fresh = [...new Set([...extraBadges, ...computedBadges(s2, todayStr())])].filter((id) => !s2.badges.includes(id));
    if (fresh.length) {
      set({ badges: [...s2.badges, ...fresh] });
      fresh.forEach((id) => { const b = BADGES.find((x) => x.id === id); if (b) toasts.push({ icon: b.icon, title: 'Новый значок!', text: b.title }); });
    }
    // грамоты
    const s3 = get();
    const certs = earnedCertificates(s3, learnSubjects, date).filter((c) => !s3.certificates[c.id]);
    if (certs.length) {
      set({ certificates: { ...s3.certificates, ...Object.fromEntries(certs.map((c) => [c.id, date])) } });
      certs.forEach((c) => toasts.push({ icon: '📜', title: 'Новая грамота!', text: c.title }));
    }
    if (toasts.length) set({ toasts: [...get().toasts, ...toasts] });
    persist(dataOf(get()));
  };

  return {
    ...initial,
    ready: false,
    toasts: [],
    async init() {
      set({ ...(await load()), ready: true });
      commit(withPoints(get(), 0)); // дозаписать награды, если порог изменили
    },

    recordAnswer(a) {
      const s = get();
      const date = todayStr();
      const d = day(s);
      const tasks = d.tasks + 1;
      let bonus = 0;
      let goalDone = d.goalDone;
      if (!goalDone && s.settings.dailyGoal > 0 && tasks >= s.settings.dailyGoal) {
        goalDone = true;
        bonus = DAILY_GOAL_BONUS;
      }
      const st = s.subjectStats[a.subject] ?? { tasks: 0, correct: 0 };
      const mistakes = a.correct ? s.mistakes
        : [{ subject: a.subject, topicId: a.topicId, question: a.question, date, taskId: a.taskId, entry: a.entry },
          ...s.mistakes.filter((m) => !(m.topicId === a.topicId && m.question === a.question))].slice(0, 100);
      commit({
        ...withPoints(s, a.points + bonus),
        daily: { ...s.daily, [date]: { ...d, tasks, correct: d.correct + (a.correct ? 1 : 0), goalDone, bySubject: { ...d.bySubject, [a.subject]: (d.bySubject?.[a.subject] ?? 0) + 1 } } },
        subjectStats: { ...s.subjectStats, [a.subject]: { tasks: st.tasks + 1, correct: st.correct + (a.correct ? 1 : 0) } },
        mistakes,
      }, a.combo ? ['combo'] : []);
      return a.points + bonus;
    },

    finishTopic(topicId, percent, opts) {
      const s = get();
      const prev = s.topicResults[topicId] ?? { bestPercent: 0, attempts: 0, done: false, passBonusGiven: false, stars: 0 };
      const passed = percent >= TOPIC_PASS_PERCENT;
      const oldStars = prev.stars ?? 0;
      const stars = Math.max(oldStars, starsFor(percent));
      let bonus = passed && !prev.passBonusGiven ? TOPIC_PASS_BONUS : 0;
      for (let k = oldStars + 1; k <= stars; k++) bonus += k >= 2 ? STAR_BONUS[k] : 0;
      const extra = [...(percent === 100 ? ['perfect'] : []), ...(passed && opts?.noHints ? ['no-hints'] : [])];
      const date = todayStr();
      const d = day(s, date);
      const found = allTopics.find((x) => x.topic.id === topicId)?.topic;
      const newCard = passed && found?.card && !s.albumCards.includes(topicId) ? topicId : undefined;
      commit({
        ...withPoints(s, bonus),
        topicResults: {
          ...s.topicResults,
          [topicId]: {
            ...prev, bestPercent: Math.max(prev.bestPercent, percent), attempts: prev.attempts + 1,
            done: prev.done || passed, passBonusGiven: prev.passBonusGiven || passed, stars,
          },
        },
        albumCards: newCard ? [...s.albumCards, newCard] : s.albumCards,
        daily: passed ? { ...s.daily, [date]: { ...d, topics: (d.topics ?? 0) + 1, topicIds: [...(d.topicIds ?? []), topicId] } } : s.daily,
      }, extra);
      if (newCard && found?.card) set({ toasts: [...get().toasts, { icon: found.card.emoji, title: 'Новая карточка знаний!', text: found.card.title }] });
      return { bonus, newStars: stars - oldStars, card: newCard };
    },

    openChest(topicId) {
      const s = get();
      const r = s.topicResults[topicId];
      if (!r || !r.done || r.chestOpened) return undefined;
      const res = openChest(Math.random, s.stickers, s.chestAccessories);
      const base: Partial<Data> = { topicResults: { ...s.topicResults, [topicId]: { ...r, chestOpened: true } } };
      if (res.kind === 'sticker') base.stickers = [...s.stickers, res.id];
      if (res.kind === 'accessory') base.chestAccessories = [...s.chestAccessories, res.id];
      if (res.kind === 'points') Object.assign(base, withPoints(s, res.amount));
      commit(base);
      return res;
    },
    openDayChest() {
      const s = get();
      const date = todayStr();
      const d = day(s, date);
      const quests = questsFor(date, learnSubjects);
      if (d.questChest || !quests.every((q) => d.quests!.includes(q.id))) return undefined;
      const res = openChest(Math.random, s.stickers, s.chestAccessories);
      const base: Partial<Data> = { daily: { ...s.daily, [date]: { ...d, questChest: true } } };
      if (res.kind === 'sticker') base.stickers = [...s.stickers, res.id];
      if (res.kind === 'accessory') base.chestAccessories = [...s.chestAccessories, res.id];
      if (res.kind === 'points') Object.assign(base, withPoints(s, res.amount));
      commit(base);
      return res;
    },
    setRecord(key, value) {
      const cur = get().records[key];
      if (cur === undefined || value < cur) commit({ records: { ...get().records, [key]: value } });
    },
    markLevelSeen() { commit({ levelSeen: levelFor(get().points).level }); },
    setLastTopic(subjectId, topicId) {
      const opened = get().opened;
      commit({ lastTopic: { subjectId, topicId }, opened: opened.includes(topicId) ? opened : [...opened, topicId] });
    },
    togglePlan(topicId) { commit({ plan: togglePlanFn(get().plan, todayStr(), topicId) }); },
    resolveMistake(topicId, question) {
      const s = get();
      commit({ mistakes: s.mistakes.filter((m) => !(m.topicId === topicId && m.question === question)), fixedMistakes: s.fixedMistakes + 1 });
    },
    popToast() { set({ toasts: get().toasts.slice(1) }); },

    answerWord(wordId, correct) {
      const s = get();
      const date = todayStr();
      const d = day(s, date);
      commit({
        leitner: { ...s.leitner, [wordId]: afterAnswer(s.leitner[wordId], correct, date) },
        daily: { ...s.daily, [date]: { ...d, words: (d.words ?? 0) + 1 } },
      });
    },

    tick(sec) {
      const s = get();
      const date = todayStr();
      commit({ daily: { ...s.daily, [date]: { ...day(s, date), sec: day(s, date).sec + sec } } });
    },
    unlockToday() {
      const s = get();
      const date = todayStr();
      commit({ daily: { ...s.daily, [date]: { ...day(s, date), unlocked: true } } });
    },
    markCelebrated(id) { commit({ celebrated: [...get().celebrated, id] }); },
    giveReward(id) {
      commit({ rewards: get().rewards.map((r) => (r.id === id ? { ...r, status: 'given' as const } : r)) });
    },
    updateSettings(p) {
      const cur = get();
      // новый порог действует только вперёд: отсчёт начинается с текущих баллов
      const thresholdChanged = p.rewardThreshold !== undefined && p.rewardThreshold !== cur.settings.rewardThreshold;
      commit({
        settings: { ...cur.settings, ...p },
        ...(thresholdChanged ? { rewardBase: { points: cur.points, count: cur.rewards.length } } : {}),
      });
      commit(withPoints(get(), 0));
    },
    importData(raw) {
      commit(merge(raw as Partial<Data>));
    },
  };
});

/** Все сохраняемые данные (для экспорта резервной копии). */
export const snapshot = (): Data => dataOf(useApp.getState());
