import { create } from 'zustand';
import { afterAnswer, type WordState } from '../engine/leitner';
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
}

export interface TopicResult { bestPercent: number; attempts: number; done: boolean; passBonusGiven: boolean }
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
  settings: Settings;
}

const initial: Data = {
  points: 0, rewards: [], celebrated: [], topicResults: {}, daily: {}, subjectStats: {},
  mistakes: [], leitner: {}, badges: [],
  settings: {
    name: 'Женя', pin: '0000', pinChanged: false,
    rewardThreshold: DEFAULT_THRESHOLD, rewardTexts: {},
    dailyGoal: 10, dailyLimitMin: 0, breakEveryMin: 30,
    theme: 'light', fontScale: 1, sound: true,
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
}

interface Store extends Data {
  ready: boolean;
  init(): Promise<void>;
  /** Возвращает начисленные баллы (вместе с бонусом за дневную цель). */
  recordAnswer(a: AnswerInfo): number;
  /** Баллы за тему и значок; возвращает начисленные баллы. */
  finishTopic(topicId: string, percent: number): number;
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
  badges: s.badges, settings: s.settings,
});

/** Баллы → дозапись наград; награды создаются ровно при пересечении порога. */
function withPoints(s: Data, n: number): Pick<Data, 'points' | 'rewards'> {
  const points = s.points + n;
  const textFor = (p: number) => s.settings.rewardTexts[String(p)] ?? DEFAULT_REWARD_TEXT;
  return { points, rewards: [...s.rewards, ...newRewards(points, s.settings.rewardThreshold, s.rewards, textFor)] };
}

export const useApp = create<Store>((set, get) => {
  const commit = (p: Partial<Data>) => {
    set(p);
    persist(dataOf(get()));
  };
  const day = (s: Data, date = todayStr()): DayLog => s.daily[date] ?? emptyDay();

  return {
    ...initial,
    ready: false,
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
      });
      return a.points + bonus;
    },

    finishTopic(topicId, percent) {
      const s = get();
      const prev = s.topicResults[topicId] ?? { bestPercent: 0, attempts: 0, done: false, passBonusGiven: false };
      const passed = percent >= TOPIC_PASS_PERCENT;
      const bonus = passed && !prev.passBonusGiven ? TOPIC_PASS_BONUS : 0;
      const badges = passed && !s.badges.includes('first-topic') ? [...s.badges, 'first-topic'] : s.badges;
      commit({
        ...withPoints(s, bonus),
        topicResults: {
          ...s.topicResults,
          [topicId]: {
            bestPercent: Math.max(prev.bestPercent, percent), attempts: prev.attempts + 1,
            done: prev.done || passed, passBonusGiven: prev.passBonusGiven || passed,
          },
        },
        badges,
      });
      return bonus;
    },

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
