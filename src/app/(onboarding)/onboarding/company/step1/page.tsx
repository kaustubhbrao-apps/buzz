'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { INDUSTRIES, COMPANY_SIZE_LABELS, slugify } from '@/lib/utils';
import type { CompanySize } from '@/types/database';

export default function CompanyStep1() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<CompanySize | ''>('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!name) return;
    setSaving(true);
    setError('');

    try {
      const updates: Record<string, string> = { name };
      if (handle) updates.handle = handle;
      if (industry) updates.industry = industry;
      if (size) updates.size = size;
      if (website) updates.website = website;

      const res = await fetch('/api/profiles/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save company profile');
      }

      router.push('/onboarding/company/step2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Set up your company page</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Step 1 of 3</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="card-static p-6 space-y-5">
        <div>
          <label className="label mb-1.5 block">Company name *</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setHandle(slugify(e.target.value)); }} className="input" />
        </div>
        <div>
          <label className="label mb-1.5 block">Handle</label>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-[#0F0F0F]/30">buzz.app/</span>
            <input type="text" value={handle} onChange={(e) => setHandle(slugify(e.target.value))} className="input" />
          </div>
        </div>
        <div>
          <label className="label mb-1.5 block">Industry</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
            <option value="">Select</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="label mb-2 block">Company size</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(COMPANY_SIZE_LABELS) as [CompanySize, string][]).map(([k, v]) => (
              <button key={k} onClick={() => setSize(k)}
                className={`py-2.5 rounded-xl text-[12px] font-semibold transition-all ${size === k ? 'bg-[#FFD60A] text-[#0F0F0F]' : 'bg-[#F5F5F5] text-[#0F0F0F]/50 hover:bg-[#EBEBEB]'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label mb-1.5 block">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input" placeholder="https://yourcompany.com" />
        </div>
      </div>

      <button onClick={handleContinue} disabled={!name || saving}
        className="btn-primary w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  );
}
