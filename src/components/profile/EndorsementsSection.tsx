import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import type { Endorsement, PersonProfile } from '@/types/database';

interface EndorsementsSectionProps {
  endorsements: Endorsement[];
  isOwner: boolean;
}

export default function EndorsementsSection({ endorsements, isOwner }: EndorsementsSectionProps) {
  if (endorsements.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-3">What people say</h3>
        <p className="text-sm text-buzz-muted">
          {isOwner
            ? 'No endorsements yet. They'll come as you build your Work Wall.'
            : 'No endorsements yet.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">What people say</h3>
      <div className="space-y-3">
        {endorsements.map((endorsement) => {
          const author = endorsement.author as PersonProfile | undefined;
          return (
            <div key={endorsement.id} className="card p-4">
              <p className="text-sm italic text-buzz-text mb-3">
                &ldquo;{endorsement.content}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <Avatar
                  src={author?.avatar_url}
                  name={author?.full_name ?? 'User'}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">{author?.full_name}</p>
                  {author?.headline && (
                    <p className="text-xs text-buzz-muted">{author.headline}</p>
                  )}
                </div>
                {endorsement.project_post_id && (
                  <Badge variant="default" size="sm" className="ml-auto">
                    on project
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
