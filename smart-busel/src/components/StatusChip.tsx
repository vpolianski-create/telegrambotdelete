import { STATUS_LABEL, type TopicStatus } from '../engine/status';
import { Icon, type IconName } from './Icon';

const STYLE: Record<TopicStatus, string> = {
  new: 'bg-soft text-mute',
  started: 'bg-brand/15 text-brandink',
  failed: 'bg-sun/30 text-accentink',
  done: 'bg-ok/15 text-okink',
};

const ICON: Record<TopicStatus, IconName> = { new: 'statusNew', started: 'statusStarted', failed: 'retry', done: 'check' };

export function StatusChip({ status }: { status: TopicStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-extrabold ${STYLE[status]}`}>
      <Icon name={ICON[status]} /> {STATUS_LABEL[status]}
    </span>
  );
}
