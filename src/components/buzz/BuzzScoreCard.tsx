import { BAND_CONFIG } from '@/lib/score';
import type { PersonProfile } from '@/types/database';
import Avatar from '@/components/ui/Avatar';

interface BuzzScoreCardProps {
  profile: PersonProfile;
}

export default function BuzzScoreCard({ profile }: BuzzScoreCardProps) {
  const band = BAND_CONFIG[profile.score_band];
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${profile.handle}`;

  return (
    <div className="bg-buzz-dark text-white rounded-card p-6 relative overflow-hidden">
      <span className="absolute top-2 right-4 text-6xl opacity-10">⚡</span>

      <div className="flex items-center gap-3 mb-4">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
        <div>
          <p className="font-semibold">{profile.full_name}</p>
          <p className="text-white/60 text-sm">@{profile.handle}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl">{band.emoji}</span>
        <span className="text-3xl font-bold">{profile.buzz_score}</span>
        <span className="text-white/70">{band.label}</span>
      </div>

      {profile.streak_count > 0 && (
        <p className="text-sm text-white/70">🔥 {profile.streak_count} day streak</p>
      )}

      <a
        href={profileUrl}
        className="block mt-4 text-sm text-buzz-yellow hover:underline"
      >
        View on Buzz →
      </a>
    </div>
  );
}
