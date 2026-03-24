'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import type { LocationType, ExperienceLevel } from '@/types/database';

const SKILLS = ['React', 'Node.js', 'TypeScript', 'Python', 'UI Design', 'Figma', 'Next.js', 'Go', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'Machine Learning', 'Flutter'];

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationType>('remote');
  const [city, setCity] = useState('');
  const [salMin, setSalMin] = useState('');
  const [salMax, setSalMax] = useState('');
  const [proof, setProof] = useState('');
  const [desc, setDesc] = useState('');
  const [exp, setExp] = useState<ExperienceLevel | ''>('');
  const [applyMethod, setApplyMethod] = useState<'buzz_dm' | 'external'>('buzz_dm');
  const [externalUrl, setExternalUrl] = useState('');
  const [deadline, setDeadline] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompany, setIsCompany] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => {
        setIsCompany(data.account_type === 'company');
        setCheckingAuth(false);
      })
      .catch(() => {
        setIsCompany(false);
        setCheckingAuth(false);
      });
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) { setError('Title is required.'); return; }
    if (!salMin || !salMax) { setError('Salary range is required. Transparency builds trust.'); return; }
    if (!proof.trim()) { setError('Proof requirement is required.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          skills_required: skills,
          location_type: loc,
          city: loc !== 'remote' ? city.trim() : null,
          salary_min: parseInt(salMin),
          salary_max: parseInt(salMax),
          proof_requirement: proof.trim(),
          description: desc.trim() || null,
          experience_level: exp || null,
          apply_method: applyMethod,
          external_url: applyMethod === 'external' ? externalUrl.trim() : null,
          deadline: deadline || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to post job.');
        setSubmitting(false);
        return;
      }

      router.push('/jobs');
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (isCompany === false) {
    return (
      <div className="max-w-xl">
        <div className="card-static p-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#0F0F0F]/20 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Company accounts only</h1>
          <p className="text-[13px] text-[#0F0F0F]/50 mb-4">
            Only company accounts can post jobs. Switch to a company account or contact support.
          </p>
          <button onClick={() => router.push('/jobs')} className="btn-secondary text-[12px] py-2">
            Browse jobs instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Post a job</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Tell candidates exactly what work to show.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="card-static p-5 space-y-4">
          <div>
            <label className="label mb-1.5 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Senior Frontend Engineer" />
          </div>

          <div>
            <label className="label mb-2 block">Skills required</label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map(s => (
                <button key={s} onClick={() => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                  className={`chip transition-all ${skills.includes(s) ? 'bg-[#FFD60A] text-[#0F0F0F]' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Location *</label>
            <div className="flex gap-2">
              {(['remote', 'hybrid', 'onsite'] as LocationType[]).map(l => (
                <button key={l} onClick={() => setLoc(l)}
                  className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${loc === l ? 'bg-[#0F0F0F] text-white' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
            {loc !== 'remote' && <input value={city} onChange={e => setCity(e.target.value)} className="input mt-2" placeholder="City" />}
          </div>
        </div>

        <div className="card-static p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Salary min (₹/year) *</label>
              <input type="number" value={salMin} onChange={e => setSalMin(e.target.value)} className="input" placeholder="1500000" />
            </div>
            <div>
              <label className="label mb-1.5 block">Salary max (₹/year) *</label>
              <input type="number" value={salMax} onChange={e => setSalMax(e.target.value)} className="input" placeholder="2500000" />
            </div>
          </div>

          <div>
            <label className="label mb-1.5 block">Proof requirement *</label>
            <textarea value={proof} onChange={e => setProof(e.target.value)} className="input min-h-[80px] resize-none" placeholder="Show us a live product built in React" />
            <p className="text-[11px] text-[#0F0F0F]/30 mt-1">Great proof prompts get 3x more quality applications.</p>
          </div>

          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 500))} className="input min-h-[80px] resize-none" maxLength={500} />
            <p className="text-[11px] text-[#0F0F0F]/30 text-right mt-1">{desc.length}/500</p>
          </div>

          <div>
            <label className="label mb-1.5 block">Experience level</label>
            <select value={exp} onChange={e => setExp(e.target.value as ExperienceLevel)} className="input">
              <option value="">Any</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        <div className="card-static p-5 space-y-4">
          <div>
            <label className="label mb-2 block">Application method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setApplyMethod('buzz_dm')}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${applyMethod === 'buzz_dm' ? 'bg-[#0F0F0F] text-white' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}
              >
                Buzz DM
              </button>
              <button
                onClick={() => setApplyMethod('external')}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${applyMethod === 'external' ? 'bg-[#0F0F0F] text-white' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}
              >
                External Link
              </button>
            </div>
            {applyMethod === 'external' && (
              <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} className="input mt-2" placeholder="https://careers.yourcompany.com/apply" />
            )}
          </div>

          <div>
            <label className="label mb-1.5 block">Application deadline (optional)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Posting...' : 'Post job'}
        </button>
      </div>
    </div>
  );
}
