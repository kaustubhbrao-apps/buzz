'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { OPEN_TO_LABELS } from '@/lib/utils';
import type { Skill, OpenToType } from '@/types/database';

export default function PersonStep2() {
  const router = useRouter();
  const supabase = createClient();
  const [headline, setHeadline] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [openTo, setOpenTo] = useState<OpenToType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setAllSkills(data);
    });
  }, [supabase]);

  const filteredSkills = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(s.id)
  );

  const toggleOpenTo = (type: OpenToType) => {
    setOpenTo((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('person_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) { setError('Profile not found'); setLoading(false); return; }

    await supabase
      .from('person_profiles')
      .update({ headline, open_to: openTo })
      .eq('id', profile.id);

    await supabase.from('person_skills').delete().eq('person_id', profile.id);
    if (selectedSkills.length > 0) {
      await supabase.from('person_skills').insert(
        selectedSkills.map((skill_id) => ({ person_id: profile.id, skill_id }))
      );
    }

    router.push('/onboarding/person/step3');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-1">Tell us what you do</h1>
      <p className="text-buzz-muted text-sm mb-6">Step 2 of 3</p>

      <div className="mb-4">
        <label className="label mb-1 block">Headline</label>
        <div className="relative">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value.slice(0, 120))}
            className="input"
            placeholder="Full stack dev from Pune"
            maxLength={120}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-buzz-muted">
            {headline.length}/120
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">Skills (max 10)</label>
        <input
          type="text"
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          className="input mb-2"
          placeholder="Search skills..."
        />
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSkills.map((id) => {
            const skill = allSkills.find((s) => s.id === id);
            return skill ? (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== id))}
                className="chip bg-buzz-yellow/20 text-buzz-dark"
              >
                {skill.name} ×
              </button>
            ) : null;
          })}
        </div>
        {skillSearch && (
          <div className="border border-buzz-border rounded-lg max-h-32 overflow-y-auto">
            {filteredSkills.slice(0, 10).map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => {
                  if (selectedSkills.length < 10) {
                    setSelectedSkills((prev) => [...prev, skill.id]);
                    setSkillSearch('');
                  }
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-buzz-bg"
              >
                {skill.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="label mb-2 block">Open to</label>
        <div className="space-y-2">
          {(Object.entries(OPEN_TO_LABELS) as [OpenToType, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={openTo.includes(key)}
                onChange={() => toggleOpenTo(key)}
                className="rounded border-buzz-border text-buzz-yellow focus:ring-buzz-yellow"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        <p className="text-buzz-muted text-xs mt-1">Change anytime in settings</p>
      </div>

      {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full mb-3">
        {loading ? 'Saving...' : 'Continue →'}
      </button>
      <Link href="/onboarding/person/step1" className="btn-ghost w-full block text-center text-sm">
        ← Back
      </Link>
    </form>
  );
}
