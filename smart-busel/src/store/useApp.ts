import { create } from 'zustand';
import { computedBadges } from '../engine/badges';
import { openChest, type ChestResult } from '../engine/chest';
import { afterAnswer, type WordState } from '../engine/leitner';
import { levelFor } from '../engine/level';
import { DAILY_GOAL_BONUS, TOPIC_PASS_BONUS, TOPIC_PASS_PERCENT } from '../engine/points';
import { DEFAULT_REWARD_TEXT, DEFAULT_THRESHOLD, newRewards, type Reward } from '../engine/rewards';

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

export interface TopicResult { bestPercent: number; attempts: number; done: boolean; passBonusGiven: boolean; chestOpened?: boolean }
export interface DayLog { sec: number; tasks: number; correct: number; goalDone: boolean; unlocked: boolean }
export interface Mistake { subject: string; topicId: string; question: string; date: string }

export interface Data {
  points: number;
  rewards: Reward[];
  celebrated: string[]; // награды, для которых ребёнок уже видел праздничный экран
  topicResults: Record<string, TopicResult>;
  daily: Record<string, DayLog>;
  subjectStats: Record<string, { tasks: number; correct: number }>;
  mistakes: Mistake[];
  leitner: Record<string, WordState>;
  badges: string[];
  stickers: string[];
  chestAccessories: string[];
  records: { matchBest?: number };
  levelSeen: number;
  lastTopic: { subjectId: string; topicId: string } | null;
  settings: Settings;
}

const initial: Data = {
  points: 0, rewards: [], celebrated: [], topicResults: {}, daily: {}, subjectStats: {},
  mistakes: [], leitner: {}, badges: [], stickers: [], chestAccessories: [], records: {}, levelSeen: 1, lastTopic: null,
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
const emptyDay = (): DayLog => ({ sec: 0, tasks: 0, correct: 0, goalDone: false, unlocked: false });

export function merge(raw: Partial<Data> | null): Data {
  return { ...initial, ...(raw ?? {}), settings: { ...initial.settings, ...(raw?.settings ?? {}) } };
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
}

interface Store extends Data {
  ready: boolean;
  toasts: string[]; // новые значки, ещё не показанные ребёнку (не сохраняются)
  init(): Promise<void>;
  /** Возвращает начисленные баллы (вместе с бонусом за дневную цель). */
  recordAnswer(a: AnswerInfo): number;
  /** Баллы за тему и значок; возвращает начисленные баллы. */
  finishTopic(topicId: string, percent: number, opts?: { noHints?: boolean }): number;
  /** Сундук-сюрприз после темы; возвращает, что выпало. */
  openChest(topicId: string): ChestResult | undefined;
  setRecord(key: 'matchBest', value: number): void;
  markLevelSeen(): void;
  setLastTopic(subjectId: string, topicId: string): void;
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
  points: s.points, rewards: s.rewards, celebrated: s.celebrated, topicResults: s.topicResults,
  daily: s.daily, subjectStats: s.subjectStats, mistakes: s.mistakes, leitner: s.leitner,
  badges: s.badges, stickers: s.stickers, chestAccessories: s.chestAccessories, records: s.records,
  levelSeen: s.levelSeen, lastTopic: s.lastTopic, settings: s.settings,
});

/** Баллы → дозапись наград; награды создаются ровно при пересечении порога. */
function withPoints(s: Data, n: number): Pick<Data, 'points' | 'rewards'> {
  const points = s.points + n;
  const textFor = (p: number) => s.settings.rewardTexts[String(p)] ?? DEFAULT_REWARD_TEXT;
  return { points, rewards: [...s.rewards, ...newRewards(points, s.settings.rewardThreshold, s.rewards, textFor)] };
}

export const useApp = create<Store>((set, get) => {
  const commit = (p: Partial<Data>, extraBadges: string[] = []) => {
    set(p);
    const s = get();
    const fresh = [...new Set([...extraBadges, ...computedBadges(s, todayStr())])].filter((id) => !s.badges.includes(id));
    if (fresh.length) set({ badges: [...s.badges, ...fresh], toasts: [...s.toasts, ...fresh] });
    persist(dataOf(get()));
  };
  const day = (s: Data, date = todayStr()): DayLog => s.daily[date] ?? emptyDay();

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
        : [{ subject: a.subject, topicId: a.topicId, question: a.question, date }, ...s.mistakes].slice(0, 100);
      commit({
        ...withPoints(s, a.points + bonus),
        daily: { ...s.daily, [date]: { ...d, tasks, correct: d.correct + (a.correct ? 1 : 0), goalDone } },
        subjectStats: { ...s.subjectStats, [a.subject]: { tasks: st.tasks + 1, correct: st.correct + (a.correct ? 1 : 0) } },
        mistakes,
      }, a.combo ? ['combo'] : []);
      return a.points + bonus;
    },

    finishTopic(topicId, percent, opts) {
      const s = get();
      const prev = s.topicResults[topicId] ?? { bestPercent: 0, attempts: 0, done: false, passBonusGiven: false };
      const passed = percent >= TOPIC_PASS_PERCENT;
      const bonus = passed && !prev.passBonusGiven ? TOPIC_PASS_BONUS : 0;
      const extra = [...(percent === 100 ? ['perfect'] : []), ...(passed && opts?.noHints ? ['no-hints'] : [])];
      commit({
        ...withPoints(s, bonus),
        topicResults: {
          ...s.topicResults,
          [topicId]: {
            bestPercent: Math.max(prev.bestPercent, percent), attempts: prev.attempts + 1,
            done: prev.done || passed, passBonusGiven: prev.passBonusGiven || passed,
          },
        },
      }, extra);
      return bonus;
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
    setRecord(key, value) {
      const cur = get().records[key];
      if (cur === undefined || value < cur) commit({ records: { ...get().records, [key]: value } });
    },
    markLevelSeen() { commit({ levelSeen: levelFor(get().points).level }); },
    setLastTopic(subjectId, topicId) { commit({ lastTopic: { subjectId, topicId } }); },
    popToast() { set({ toasts: get().toasts.slice(1) }); },

    answerWord(wordId, correct) {
      const s = get();
      commit({ leitner: { ...s.leitner, [wordId]: afterAnswer(s.leitner[wordId], correct, todayStr()) } });
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
      commit({ settings: { ...get().settings, ...p } });
      commit(withPoints(get(), 0));
    },
    importData(raw) {
      commit(merge(raw as Partial<Data>));
    },
  };
});

/** Все сохраняемые данные (для экспорта резервной копии). */
export const snapshot = (): Data => dataOf(useApp.getState());
