import type { Skill } from '@/types/database';

interface SkillsSectionProps {
  skills: Skill[];
  personId: string;
  postsBySkill?: Record<string, number>;
  isOwner?: boolean;
}

export default function SkillsSection({ skills, postsBySkill = {}, isOwner }: SkillsSectionProps) {
  if (skills.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-3">Skills</h3>
        {isOwner ? (
          <a href="/settings" className="text-sm text-buzz-muted hover:underline">+ Add skills</a>
        ) : (
          <p className="text-sm text-buzz-muted">No skills added yet.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const proofCount = postsBySkill[skill.name] ?? 0;
          return (
            <div key={skill.id} className="chip bg-gray-100 text-buzz-text flex items-center gap-1.5">
              <span>{skill.name}</span>
              <span className="flex gap-0.5" title={`${proofCount} proof posts`}>
                {Array.from({ length: Math.min(proofCount, 5) }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-buzz-yellow" />
                ))}
                {proofCount === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-buzz-border" />
                )}
              </span>
            </div>
          );
        })}
      </div>
      {isOwner && (
        <a href="/settings" className="text-xs text-buzz-muted hover:underline mt-2 block">
          + Add skills
        </a>
      )}
    </div>
  );
}
