'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Post a job</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Tell candidates exactly what work to show.</p>

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

        <button onClick={() => router.push('/jobs')} className="btn-primary w-full py-3">Post job</button>
      </div>
    </div>
  );
}
