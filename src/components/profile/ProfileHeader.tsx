'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import BuzzScore from '@/components/buzz/BuzzScore';
import OpenToChips from './OpenToChips';
import { MapPin } from 'lucide-react';
import type { PersonProfile } from '@/types/database';

interface ProfileHeaderProps {
  profile: PersonProfile;
  isOwner: boolean;
  isConnected: boolean;
  isFollowing: boolean;
  onConnect?: () => void;
  onFollow?: () => void;
}

export default function ProfileHeader({
  profile,
  isOwner,
  isConnected,
  isFollowing,
  onConnect,
  onFollow,
}: ProfileHeaderProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${profile.handle}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />

      <div className="flex-1">
        <h1 className="text-xl font-bold">{profile.full_name}</h1>
        <p className="text-buzz-muted text-sm">@{profile.handle}</p>

        {profile.headline && <p className="mt-1 text-sm">{profile.headline}</p>}

        {profile.city && (
          <p className="text-buzz-muted text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {profile.city}
          </p>
        )}

        <div className="mt-3">
          <BuzzScore score={profile.buzz_score} band={profile.score_band} streak={profile.streak_count} />
        </div>

        <OpenToChips openTo={profile.open_to} />

        <div className="flex gap-2 mt-4">
          {isOwner ? (
            <>
              <Button variant="secondary" size="sm">Edit profile</Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>Share profile</Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={isConnected ? 'secondary' : 'primary'}
                onClick={onConnect}
                disabled={isConnected}
              >
                {isConnected ? 'Connected' : 'Connect'}
              </Button>
              <Button
                variant={isFollowing ? 'secondary' : 'ghost'}
                size="sm"
                onClick={onFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="ghost" size="sm">Message</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
