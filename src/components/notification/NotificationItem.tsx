'use client';

import Avatar from '@/components/ui/Avatar';
import { timeAgo, cn } from '@/lib/utils';
import type { Notification, PersonProfile, CompanyProfile } from '@/types/database';

function getMessage(notification: Notification): string {
  const actor = notification.actor as PersonProfile | CompanyProfile | undefined;
  const actorName = actor ? ('full_name' in actor ? actor.full_name : actor.name) : 'Someone';
  switch (notification.type) {
    case 'hire_reaction': return `💼 ${actorName} gave your post a Hire reaction`;
    case 'endorsement': return `✍️ ${actorName} endorsed your work`;
    case 'score_band_change': return `⚡ You just hit a new band! 🎉`;
    case 'job_response': return `📩 ${actorName} responded to your application`;
    default: return 'New notification';
  }
}

export default function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const actor = notification.actor as PersonProfile | CompanyProfile | undefined;
  const actorName = actor ? ('full_name' in actor ? actor.full_name : actor.name) : 'Buzz';
  const actorAvatar = actor ? ('avatar_url' in actor ? actor.avatar_url : actor.logo_url) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 text-left hover:bg-[#F5F5F5] transition-all duration-150 border-b border-[#F0F0F0]',
        !notification.read && 'bg-[#FFD60A]/[0.04]'
      )}
    >
      <Avatar src={actorAvatar} name={actorName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#0F0F0F]">{getMessage(notification)}</p>
        <p className="text-[11px] text-[#0F0F0F]/40 mt-1">{timeAgo(notification.created_at)}</p>
      </div>
      {!notification.read && <span className="w-2 h-2 rounded-full bg-[#FFD60A] mt-2 flex-shrink-0" />}
    </button>
  );
}
