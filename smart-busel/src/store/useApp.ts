import { create } from 'zustand';
import { DEFAULT_REWARD_TEXT, DEFAULT_THRESHOLD, newRewards, type Reward } from '../engine/rewards';

export interface Settings {
  name: string;
  pin: string;
  pinChanged: boolean;
  rewardThreshold: number;
  rewardTexts: Record<string, string>; // "100" -> "1 час игры на компьютере"
  dailyGoal: number;
  theme: 'light' | 'dark';
  fontScale: number;
  sound: boolean;
}

export interface Data {
  points: number;
  rewards: Reward[];
  celebrated: string[]; // id наград, для которых ребёнок уже видел праздничный экран
  settings: Settings;
}

const initial: Data = {
  points: 0,
  rewards: [],
  celebrated: [],
  settings: {
    name: 'Женя', pin: '0000', pinChanged: false,
    rewardThreshold: DEFAULT_THRESHOLD, rewardTexts: {},
    dailyGoal: 10, theme: 'light', fontScale: 1, sound: true,
  },
};

declare global {
  interface Window {
    busel?: { load(): Promise<Data | null>; save(d: Data): Promise<void> };
  }
}

const LS_KEY = 'smart-busel-data';

async function load(): Promise<Data> {
  try {
    const raw = window.busel ? await window.busel.load() : JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
    if (raw) return { ...initial, ...raw, settings: { ...initial.settings, ...raw.settings } };
  } catch { /* повреждённый файл — начинаем с чистого, копия лежит в backups */ }
  return initial;
}

function persist(d: Data) {
  if (window.busel) void window.busel.save(d);
  else localStorage.setItem(LS_KEY, JSON.stringify(d));
}

interface Store extends Data {
  ready: boolean;
  init(): Promise<void>;
  addPoints(n: number): void;
  markCelebrated(id: string): void;
  giveReward(id: string): void;
  updateSettings(p: Partial<Settings>): void;
}

const dataOf = (s: Store): Data => ({
  points: s.points, rewards: s.rewards, celebrated: s.celebrated, settings: s.settings,
});

export const useApp = create<Store>((set, get) => {
  const commit = (p: Partial<Data>) => {
    set(p);
    persist(dataOf(get()));
  };
  return {
    ...initial,
    ready: false,
    async init() {
      const d = await load();
      set({ ...d, ready: true });
      // на случай изменения порога: дозаписываем недостающие награды
      get().addPoints(0);
    },
    addPoints(n) {
      const s = get();
      const points = s.points + n;
      const textFor = (p: number) => s.settings.rewardTexts[String(p)] ?? DEFAULT_REWARD_TEXT;
      const created = newRewards(points, s.settings.rewardThreshold, s.rewards, textFor);
      commit({ points, rewards: [...s.rewards, ...created] });
    },
    markCelebrated(id) {
      commit({ celebrated: [...get().celebrated, id] });
    },
    giveReward(id) {
      commit({ rewards: get().rewards.map((r) => (r.id === id ? { ...r, status: 'given' } : r)) });
    },
    updateSettings(p) {
      commit({ settings: { ...get().settings, ...p } });
    },
  };
});
