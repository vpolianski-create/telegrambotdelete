/**
 * Слияние прогресса нескольких устройств (Windows, Android).
 *
 * Как это устроено (простыми словами):
 * - Счётчики (баллы, число заданий, время за день, попытки темы…) СКЛАДЫВАЮТСЯ: каждое устройство помнит,
 *   сколько оно заработало само («свой вклад»), и итог = свой вклад + вклады остальных устройств.
 *   Поэтому повторная синхронизация ничего не удваивает, а баллы с двух устройств не теряются.
 * - Отметки «пройдено», значки, карточки, грамоты, наклейки — ОБЪЕДИНЯЮТСЯ (что есть хоть где-то, есть везде).
 * - Лучшие результаты (процент, звёзды, уровень) — берётся БОЛЬШЕЕ, рекорд «Соедини пары» — меньшее время.
 * - Настройки, план на сегодня, последняя тема — побеждает ПОСЛЕДНЕЕ изменение (по времени изменения).
 * - Исправленные ошибки помнятся отдельно («надгробия»), чтобы они не вернулись с другого устройства.
 *
 * Модуль не знает ни про сеть, ни про шифрование — только про данные. Всё покрыто тестами (tests/sync-merge.test.ts).
 */
import type { Data, DayLog, Mistake, Settings, TopicResult } from '../store/useApp';
import type { Reward } from '../engine/rewards';
import type { WordState } from '../engine/leitner';

/** Числовые «счётчики» прогресса: путь → значение. Путь — части через табуляцию. */
export type Counters = Record<string, number>;

/** Служебные сведения синхронизации. Хранятся в data.json вместе с прогрессом (не секретны). */
export interface SyncMeta {
  /** Случайный номер этого устройства (32 шестнадцатеричных знака). */
  deviceId: string;
  /** К какой «семье» (облачной папке) устройство подключалось последним; нужно, чтобы при повторном подключении ничего не удвоить. */
  familyId?: string;
  /** Сумма вкладов ДРУГИХ устройств на момент последней синхронизации. Свой вклад = текущие счётчики − baseline. */
  baseline: Counters;
  /** Когда менялись настройки и прочие «последнее изменение побеждает» поля (мс). */
  stamps: Record<string, number>;
  /** Исправленные ошибки: ключ ошибки (тема + вопрос + дата). */
  removed: string[];
  /** Когда последний раз удалось синхронизироваться (ISO). */
  lastSync?: string;
}

/** Что одно устройство кладёт в облако (до шифрования). */
export interface SyncPayload {
  v: 1;
  deviceId: string;
  /** Версия приложения — для сообщений «обновите программу на другом устройстве». */
  app: string;
  /** Полный прогресс устройства (без служебного поля sync). */
  data: Omit<Data, 'sync'>;
  /** Собственный вклад устройства в счётчики. */
  own: Counters;
  stamps: Record<string, number>;
  removed: string[];
}

const SEP = '\t';
const key = (...parts: string[]) => parts.join(SEP);

/** Настройки, общие для всех устройств. Тема, размер шрифта и звук — у каждого устройства свои. */
export const SHARED_SETTINGS: (keyof Settings)[] = [
  'name', 'pin', 'pinChanged', 'rewardThreshold', 'rewardTexts', 'dailyGoal', 'dailyLimitMin', 'breakEveryMin', 'accessory',
];
/** Поля, где побеждает последнее изменение (кроме настроек). */
const LWW_FIELDS = ['plan', 'lastTopic', 'rewardBase'] as const;
/** Все ключи меток времени: «plan», «lastTopic», «rewardBase», «settings.pin» и т. д. */
export const STAMP_KEYS: string[] = [...LWW_FIELDS, ...SHARED_SETTINGS.map((k) => `settings.${k}`)];

const DAY_COUNTERS = ['sec', 'tasks', 'correct', 'words', 'topics'] as const;
/** Показатели для родителя (v1.8.0): тоже складываются между устройствами; в данных дня появляются, только если не ноль. */
const DAY_EXTRA = ['fixed', 'secondTry', 'guesses', 'abandoned', 'harder'] as const;
const MAX_REMOVED = 400;

/** Все счётчики, которые складываются между устройствами. */
export function counters(d: Pick<Data, 'points' | 'fixedMistakes' | 'subjectStats' | 'daily' | 'topicResults'>): Counters {
  const c: Counters = {};
  const put = (k: string, v: number | undefined) => { if (v) c[k] = v; };
  put('points', d.points);
  put('fixedMistakes', d.fixedMistakes);
  for (const [s, st] of Object.entries(d.subjectStats ?? {})) {
    put(key('subjectStats', s, 'tasks'), st.tasks);
    put(key('subjectStats', s, 'correct'), st.correct);
  }
  for (const [date, day] of Object.entries(d.daily ?? {})) {
    for (const f of DAY_COUNTERS) put(key('daily', date, f), day[f]);
    for (const f of DAY_EXTRA) put(key('daily', date, f), day[f]);
    for (const [s, n] of Object.entries(day.bySubject ?? {})) put(key('daily', date, 'bySubject', s), n);
  }
  for (const [id, r] of Object.entries(d.topicResults ?? {})) put(key('topicResults', id, 'attempts'), r.attempts);
  return c;
}

export function addCounters(...all: Counters[]): Counters {
  const out: Counters = {};
  for (const c of all) for (const [k, v] of Object.entries(c)) out[k] = (out[k] ?? 0) + v;
  return out;
}
export function subCounters(a: Counters, b: Counters): Counters {
  const out: Counters = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const v = (a[k] ?? 0) - (b[k] ?? 0);
    if (v) out[k] = v;
  }
  return out;
}

const emptyDay = (): DayLog => ({ sec: 0, tasks: 0, correct: 0, goalDone: false, unlocked: false });

/**
 * Записывает итоговые счётчики в данные. Счётчики, которых нет в `c`, становятся нулём.
 * Новые дни и предметы создаются; у тем — только если тема уже есть в данных (иначе вернулись бы темы,
 * сброшенные при переписывании предмета).
 */
export function applyCounters<T extends Data>(d: T, c: Counters): T {
  const n = (k: string) => Math.max(0, Math.round(c[k] ?? 0));
  const subjectStats: Data['subjectStats'] = {};
  const daily: Data['daily'] = {};
  const subjectIds = new Set(Object.keys(d.subjectStats));
  const dates = new Set(Object.keys(d.daily));
  const daySubjects: Record<string, Set<string>> = {};
  for (const k of Object.keys(c)) {
    const p = k.split(SEP);
    if (p[0] === 'subjectStats') subjectIds.add(p[1]);
    if (p[0] === 'daily') {
      dates.add(p[1]);
      if (p[2] === 'bySubject') (daySubjects[p[1]] ??= new Set()).add(p[3]);
    }
  }
  for (const s of subjectIds) {
    const tasks = n(key('subjectStats', s, 'tasks'));
    if (tasks || d.subjectStats[s]) subjectStats[s] = { tasks, correct: n(key('subjectStats', s, 'correct')) };
  }
  for (const date of dates) {
    const prev = d.daily[date] ?? emptyDay();
    const subs = new Set([...Object.keys(prev.bySubject ?? {}), ...(daySubjects[date] ?? [])]);
    const bySubject: Record<string, number> = {};
    for (const s of subs) { const v = n(key('daily', date, 'bySubject', s)); if (v) bySubject[s] = v; }
    const day: DayLog = { ...prev, bySubject };
    for (const f of DAY_COUNTERS) day[f] = n(key('daily', date, f));
    for (const f of DAY_EXTRA) { const v = n(key('daily', date, f)); if (v) day[f] = v; else delete day[f]; }
    daily[date] = day;
  }
  const topicResults: Data['topicResults'] = {};
  for (const [id, r] of Object.entries(d.topicResults)) topicResults[id] = { ...r, attempts: n(key('topicResults', id, 'attempts')) };
  return { ...d, points: n('points'), fixedMistakes: n('fixedMistakes'), subjectStats, daily, topicResults };
}

// ——— объединение отдельных полей ———

const union = (a: string[], b: string[]) => [...a, ...b.filter((x) => !a.includes(x))];
const maxStr = (a?: string, b?: string) => (a === undefined ? b : b === undefined ? a : a >= b ? a : b);

function mergeTopic(a: TopicResult | undefined, b: TopicResult): TopicResult {
  if (!a) return { ...b };
  const out: TopicResult = {
    ...a,
    bestPercent: Math.max(a.bestPercent, b.bestPercent),
    done: a.done || b.done,
    passBonusGiven: a.passBonusGiven || b.passBonusGiven,
    stars: Math.max(a.stars ?? 0, b.stars ?? 0),
  };
  if (a.chestOpened || b.chestOpened) out.chestOpened = true;
  // «Разминка дня»: берём более позднее повторение (при равной дате — большую ступень)
  if (b.reviewed !== undefined && (a.reviewed === undefined || b.reviewed > a.reviewed || (b.reviewed === a.reviewed && (b.stage ?? 0) > (a.stage ?? 0)))) {
    out.reviewed = b.reviewed;
    out.stage = b.stage;
  }
  return out;
}

function mergeDay(a: DayLog | undefined, b: DayLog): DayLog {
  if (!a) return { ...b };
  const out: DayLog = { ...a, goalDone: a.goalDone || b.goalDone, unlocked: a.unlocked || b.unlocked };
  if (a.quests || b.quests) out.quests = union(a.quests ?? [], b.quests ?? []);
  if (a.topicIds || b.topicIds) out.topicIds = union(a.topicIds ?? [], b.topicIds ?? []);
  if (a.questChest || b.questChest) out.questChest = true;
  if (a.warmup || b.warmup) out.warmup = true;
  return out;
}

/** Слово в «Словах»: берём состояние с более поздним сроком повторения (при равенстве — старшую коробку). */
function mergeWord(a: WordState | undefined, b: WordState): WordState {
  if (!a) return b;
  if (b.due > a.due || (b.due === a.due && b.box > a.box)) return b;
  return a;
}

function mergeRewards(a: Reward[], b: Reward[]): Reward[] {
  const byId = new Map<string, Reward>();
  for (const r of [...a, ...b]) {
    const cur = byId.get(r.id);
    if (!cur) { byId.set(r.id, { ...r }); continue; }
    const first = cur.date <= r.date ? cur : r; // текст и порог — с того устройства, где награда появилась раньше
    byId.set(r.id, { ...first, status: cur.status === 'given' || r.status === 'given' ? 'given' : 'pending' });
  }
  const num = (id: string) => Number(id.replace(/\D/g, '')) || 0;
  return [...byId.values()].sort((x, y) => num(x.id) - num(y.id));
}

export const mistakeKey = (m: Pick<Mistake, 'topicId' | 'question' | 'date'>) => key(m.topicId, m.question, m.date);

function mergeMistakes(lists: Mistake[][], removed: Set<string>): Mistake[] {
  const byQuestion = new Map<string, Mistake>();
  for (const list of lists) {
    for (const m of list) {
      if (removed.has(mistakeKey(m))) continue;
      const k = key(m.topicId, m.question);
      const cur = byQuestion.get(k);
      if (!cur || m.date > cur.date) byQuestion.set(k, m);
    }
  }
  return [...byQuestion.values()].sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0)).slice(0, 100);
}

function mergeCertificates(a: Record<string, string>, b: Record<string, string>): Record<string, string> {
  const out = { ...a };
  for (const [id, date] of Object.entries(b)) if (!out[id] || date < out[id]) out[id] = date;
  return out;
}

/** Значение поля, где побеждает последнее изменение. Равенство — остаётся своё. */
function lww<T>(mine: T, mineAt: number, theirs: T, theirsAt: number): [T, number] {
  return theirsAt > mineAt ? [theirs, theirsAt] : [mine, mineAt];
}

/**
 * Объединяет «несчётные» поля своего прогресса с прогрессом другого устройства.
 * Счётчики здесь не трогаются — их выставляет applyCounters.
 */
export function mergeState(
  mine: Data, mineStamps: Record<string, number>,
  theirs: Omit<Data, 'sync'>, theirStamps: Record<string, number>,
  removed: Set<string>,
): { data: Data; stamps: Record<string, number> } {
  const stamps = { ...mineStamps };
  const at = (s: Record<string, number>, k: string) => s[k] ?? 0;

  const topicResults = { ...mine.topicResults };
  for (const [id, r] of Object.entries(theirs.topicResults ?? {})) topicResults[id] = mergeTopic(topicResults[id], r);
  const daily = { ...mine.daily };
  for (const [date, day] of Object.entries(theirs.daily ?? {})) daily[date] = mergeDay(daily[date], day);
  const leitner = { ...mine.leitner };
  for (const [id, w] of Object.entries(theirs.leitner ?? {})) leitner[id] = mergeWord(leitner[id], w);
  const subjectStats = { ...mine.subjectStats };
  for (const s of Object.keys(theirs.subjectStats ?? {})) subjectStats[s] ??= { tasks: 0, correct: 0 };

  const settings: Settings = { ...mine.settings };
  for (const k of SHARED_SETTINGS) {
    const sk = `settings.${k}`;
    if (theirs.settings?.[k] === undefined) continue;
    const [v, t] = lww(mine.settings[k], at(mineStamps, sk), theirs.settings[k], at(theirStamps, sk));
    (settings as unknown as Record<string, unknown>)[k] = v;
    if (t) stamps[sk] = t;
  }
  const out: Data = {
    ...mine,
    rewards: mergeRewards(mine.rewards, theirs.rewards ?? []),
    celebrated: union(mine.celebrated, theirs.celebrated ?? []),
    topicResults,
    daily,
    subjectStats,
    mistakes: mergeMistakes([mine.mistakes, theirs.mistakes ?? []], removed),
    leitner,
    badges: union(mine.badges, theirs.badges ?? []),
    albumCards: union(mine.albumCards, theirs.albumCards ?? []),
    stickers: union(mine.stickers, theirs.stickers ?? []),
    chestAccessories: union(mine.chestAccessories, theirs.chestAccessories ?? []),
    records: mergeRecords(mine.records, theirs.records ?? {}),
    opened: union(mine.opened, theirs.opened ?? []),
    certificates: mergeCertificates(mine.certificates, theirs.certificates ?? {}),
    levelSeen: Math.max(mine.levelSeen, theirs.levelSeen ?? 1),
    settings,
  };
  for (const f of LWW_FIELDS) {
    const [v, t] = lww<unknown>(mine[f], at(mineStamps, f), theirs[f], at(theirStamps, f));
    (out as unknown as Record<string, unknown>)[f] = v;
    if (t) stamps[f] = t;
  }
  return { data: out, stamps };
}

function mergeRecords(a: Data['records'], b: Data['records']): Data['records'] {
  const best = [a.matchBest, b.matchBest].filter((x): x is number => typeof x === 'number');
  return best.length ? { ...a, matchBest: Math.min(...best) } : { ...a };
}

/** Убирает из данных служебное поле sync (для облака и для файла резервной копии). */
export function withoutSync(d: Data): Omit<Data, 'sync'> {
  const { sync: _drop, ...rest } = d;
  void _drop;
  return rest;
}

/**
 * Главная функция синхронизации: свой прогресс + полученные от других устройств → общий прогресс.
 * Возвращает новые данные (уже со служебным полем sync) и то, что нужно отправить в облако.
 */
export function syncMerge(local: Data, meta: SyncMeta, remotes: SyncPayload[], app = ''): { data: Data; payload: SyncPayload } {
  const others = remotes.filter((r) => r.deviceId !== meta.deviceId);
  const own = subCounters(counters(local), meta.baseline);
  const othersSum = addCounters(...others.map((r) => r.own));
  const removed = new Set([...meta.removed, ...others.flatMap((r) => r.removed ?? [])]);

  let data: Data = { ...local, mistakes: local.mistakes.filter((m) => !removed.has(mistakeKey(m))) };
  let stamps = { ...meta.stamps };
  for (const r of others) {
    const m = mergeState(data, stamps, r.data, r.stamps ?? {}, removed);
    data = m.data;
    stamps = m.stamps;
  }
  data = applyCounters(data, addCounters(own, othersSum));
  const removedList = [...removed].slice(-MAX_REMOVED);
  const newMeta: SyncMeta = { ...meta, baseline: othersSum, stamps, removed: removedList };
  data = { ...data, sync: newMeta };
  return {
    data,
    payload: { v: 1, deviceId: meta.deviceId, app, data: withoutSync(data), own, stamps, removed: removedList },
  };
}

/**
 * Какие поля «последнее изменение побеждает» изменились между двумя состояниями — им ставится метка времени.
 * Вызывается после каждого изменения прогресса.
 */
export function changedStamps(before: Data, after: Data, now: number, prev: Record<string, number>): Record<string, number> {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  let out = prev;
  const touch = (k: string) => { if (out === prev) out = { ...prev }; out[k] = Math.max(now, (prev[k] ?? 0) + 1); };
  for (const f of LWW_FIELDS) if (!same(before[f], after[f])) touch(f);
  for (const k of SHARED_SETTINGS) if (!same(before.settings[k], after.settings[k])) touch(`settings.${k}`);
  return out;
}

/** Метки «моё — главнее» для первого устройства семьи: его настройки побеждают настройки по умолчанию на других устройствах. */
export function founderStamps(prev: Record<string, number>): Record<string, number> {
  const out = { ...prev };
  for (const k of STAMP_KEYS) out[k] = Math.max(out[k] ?? 0, 1);
  return out;
}

/** Есть ли на устройстве хоть какой-то прогресс (для вопроса «сложить или заменить» при подключении). */
export function hasProgress(d: Data): boolean {
  return d.points > 0 || Object.keys(d.topicResults).length > 0 || Object.keys(d.leitner).length > 0;
}
