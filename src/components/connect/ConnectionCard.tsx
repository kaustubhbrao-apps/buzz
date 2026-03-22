'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ScoreBand from '@/components/buzz/ScoreBand';
import type { Connection, PersonProfile } from '@/types/database';

interface ConnectionCardProps {
  connection: Connection;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConnectionCard({ connection, onAccept, onDecline }: ConnectionCardProps) {
  const requester = connection.requester as PersonProfile | undefined;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={requester?.avatar_url} name={requester?.full_name ?? 'User'} />
        <div>
          <p className="font-medium text-sm">{requester?.full_name}</p>
          <p className="text-xs text-buzz-muted">@{requester?.handle}</p>
          {requester?.score_band && <ScoreBand band={requester.score_band} />}
        </div>
      </div>

      <blockquote className="text-sm text-buzz-text italic border-l-2 border-buzz-yellow pl-3 mb-3">
        &ldquo;{connection.note}&rdquo;
      </blockquote>

      <div className="flex gap-2">
        <Button size="sm" onClick={onAccept}>Accept</Button>
        <Button variant="ghost" size="sm" onClick={onDecline}>Decline</Button>
      </div>
    </div>
  );
}
