'use client';

import Avatar from '@/components/ui/Avatar';
import { timeAgo, cn } from '@/lib/utils';
import type { Notification, PersonProfile, CompanyProfile } from '@/types/database';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function getMessage(notification: Notification): string {
  const actor = notification.actor as PersonProfile | CompanyProfile | undefined;
  const actorName = actor
    ? 'full_name' in actor ? actor.full_name : actor.name
    : 'Someone';

  switch (notification.type) {
    case 'hire_reaction':
      return `💼 ${actorName} gave your post a Hire reaction`;
    case 'endorsement':
      return `✍️ ${actorName} endorsed your work`;
    case 'score_band_change':
      return `⚡ You just hit a new band! 🎉`;
    case 'job_response':
      return `📩 ${actorName} responded to your application`;
    default:
      return 'New notification';
  }
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const actor = notification.actor as PersonProfile | CompanyProfile | undefined;
  const actorName = actor
    ? 'full_name' in actor ? actor.full_name : actor.name
    : 'Buzz';
  const actorAvatar = actor
    ? 'avatar_url' in actor ? actor.avatar_url : actor.logo_url
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-buzz-border',
        !notification.read && 'bg-buzz-yellow/5'
      )}
    >
      <Avatar src={actorAvatar} name={actorName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{getMessage(notification)}</p>
        <p className="text-xs text-buzz-muted mt-1">{timeAgo(notification.created_at)}</p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-buzz-yellow mt-2 flex-shrink-0" />
      )}
    </button>
  );
}
