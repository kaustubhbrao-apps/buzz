'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRIES } from '@/lib/utils';
import type { Skill, LocationType, ExperienceLevel, ApplyMethod } from '@/types/database';

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<LocationType>('remote');
  const [city, setCity] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [proofRequirement, setProofRequirement] = useState('');
  const [description, setDescription] = useState('');
  const [applyMethod, setApplyMethod] = useState<ApplyMethod>('buzz_dm');
  const [externalUrl, setExternalUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setSkills(data);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError('Title is required'); return; }
    if (!salaryMin || !salaryMax) { setError('Please enter a salary range. Transparency builds trust.'); return; }
    if (!proofRequirement) { setError('Proof requirement is required'); return; }

    setLoading(true);
    setError('');

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        skills_required: selectedSkills,
        location_type: locationType,
        city: locationType !== 'remote' ? city : null,
        salary_min: parseInt(salaryMin),
        salary_max: parseInt(salaryMax),
        proof_requirement: proofRequirement,
        description: description || null,
        apply_method: applyMethod,
        external_url: applyMethod === 'external' ? externalUrl : null,
        deadline: deadline || null,
        experience_level: experienceLevel || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to create job');
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/jobs/${data.job?.id ?? ''}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Post a job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label mb-1 block">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
        </div>

        <div>
          <label className="label mb-1 block">Skills required</label>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setSelectedSkills((prev) =>
                    prev.includes(s.name) ? prev.filter((x) => x !== s.name) : [...prev, s.name]
                  )
                }
                className={`chip border ${selectedSkills.includes(s.name) ? 'border-buzz-yellow bg-buzz-yellow/10' : 'border-buzz-border'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Location *</label>
          <div className="flex gap-4">
            {(['remote', 'hybrid', 'onsite'] as LocationType[]).map((lt) => (
              <label key={lt} className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="location" checked={locationType === lt} onChange={() => setLocationType(lt)} />
                {lt.charAt(0).toUpperCase() + lt.slice(1)}
              </label>
            ))}
          </div>
          {locationType !== 'remote' && (
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input mt-2" placeholder="City" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label mb-1 block">₹ Salary min (annual) *</label>
            <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="input" placeholder="800000" />
          </div>
          <div>
            <label className="label mb-1 block">₹ Salary max (annual) *</label>
            <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="input" placeholder="1500000" />
          </div>
        </div>

        <div>
          <label className="label mb-1 block">Proof requirement *</label>
          <textarea
            value={proofRequirement}
            onChange={(e) => setProofRequirement(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Show us a live product built in React"
          />
          <p className="text-xs text-buzz-muted mt-1">Great proof prompts get 3x more quality applications.</p>
        </div>

        <div>
          <label className="label mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            className="input min-h-[80px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-buzz-muted text-right">{description.length}/500</p>
        </div>

        <div>
          <label className="label mb-2 block">Apply method</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" checked={applyMethod === 'buzz_dm'} onChange={() => setApplyMethod('buzz_dm')} />
              Buzz DM (recommended)
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" checked={applyMethod === 'external'} onChange={() => setApplyMethod('external')} />
              External link
            </label>
          </div>
          {applyMethod === 'external' && (
            <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="input mt-2" placeholder="https://..." />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label mb-1 block">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label mb-1 block">Experience level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)} className="input">
              <option value="">Any</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        {error && <p className="text-buzz-error text-sm">{error}</p>}

        <Button type="submit" loading={loading} fullWidth>Post job</Button>
      </form>
    </div>
  );
}
