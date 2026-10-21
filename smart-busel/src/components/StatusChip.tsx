import { STATUS_ICON, STATUS_LABEL, type TopicStatus } from '../engine/status';

const STYLE: Record<TopicStatus, string> = {
  new: 'bg-soft text-mute',
  started: 'bg-brand/15 text-brand',
  failed: 'bg-sun/30 text-accentink',
  done: 'bg-ok/15 text-okink',
};

export function StatusChip({ status }: { status: TopicStatus }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-extrabold ${STYLE[status]}`}>
      {STATUS_ICON[status]} {STATUS_LABEL[status]}
    </span>
  );
}
