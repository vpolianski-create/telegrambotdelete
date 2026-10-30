export type TopicStatus = 'new' | 'started' | 'failed' | 'done';

export const STATUS_LABEL: Record<TopicStatus, string> = {
  new: 'Не начата', started: 'Начата', failed: 'Не пройдена', done: 'Пройдена',
};
export const STATUS_ICON: Record<TopicStatus, string> = { new: '○', started: '◐', failed: '↻', done: '✓' };

/**
 * Статус темы.
 * done — тема пройдена (проверка знаний на 80% и выше хотя бы раз);
 * failed — тему проходили до конца, но нужного результата пока нет;
 * started — тему открывали, но до конца не дошли;
 * new — тему ещё не открывали.
 */
export function topicStatus(r: { done: boolean; attempts: number } | undefined, opened: boolean): TopicStatus {
  if (r?.done) return 'done';
  if (r && r.attempts > 0) return 'failed';
  return opened ? 'started' : 'new';
}

export function statusCounts(statuses: TopicStatus[]): Record<TopicStatus, number> {
  const c: Record<TopicStatus, number> = { new: 0, started: 0, failed: 0, done: 0 };
  statuses.forEach((s) => { c[s]++; });
  return c;
}
