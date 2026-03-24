'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const SKILLS = ['React', 'Node.js', 'TypeScript', 'Python', 'UI Design', 'Figma', 'Next.js', 'Flutter', 'Go', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'Machine Learning', 'Content Writing', 'Video Editing', 'Marketing', 'SEO'];
const OPEN_TO = [
  { key: 'full_time', label: 'Full-time roles' },
  { key: 'freelance', label: 'Freelance work' },
  { key: 'collab', label: 'Collaborations' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'not_looking', label: 'Not looking' },
];

export default function PersonStep2() {
  const router = useRouter();
  const [headline, setHeadline] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (s: string) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : p.length < 10 ? [...p, s] : p);
  const toggleOpen = (s: string) => setOpenTo(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleContinue = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/profiles/person', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: headline || null,
          open_to: openTo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/onboarding/person/step3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Tell us what you do</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Step 2 of 3</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="card-static p-6 space-y-5">
        <div>
          <label className="label mb-1.5 block">Headline</label>
          <div className="relative">
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value.slice(0, 120))} className="input pr-14" placeholder="Full stack dev from Pune" maxLength={120} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#0F0F0F]/30">{headline.length}/120</span>
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Skills (max 10)</label>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <button key={s} onClick={() => toggle(s)}
                className={`chip transition-all ${selected.includes(s) ? 'bg-[#FFD60A] text-[#0F0F0F]' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}>
                {s}{selected.includes(s) && ' ×'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Open to</label>
          <div className="space-y-2">
            {OPEN_TO.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={openTo.includes(key)} onChange={() => toggleOpen(key)} className="w-4 h-4 rounded accent-[#FFD60A]" />
                <span className="text-[13px] text-[#0F0F0F]">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-[#0F0F0F]/30 mt-1.5">Change anytime in settings</p>
        </div>
      </div>

      <button onClick={handleContinue} disabled={saving}
        className="btn-primary w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Continue →'}
      </button>
      <Link href="/onboarding/person/step1" className="btn-ghost w-full mt-2 text-center block text-[13px]">← Back</Link>
    </div>
  );
}
