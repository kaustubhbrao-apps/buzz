'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify, INDUSTRIES, COMPANY_SIZE_LABELS } from '@/lib/utils';
import type { CompanySize } from '@/types/database';

export default function CompanyStep1() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<CompanySize | ''>('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setHandle(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Company name is required.'); return; }
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      account_type: 'company',
    });

    const { error: profileErr } = await supabase.from('company_profiles').upsert({
      user_id: user.id,
      handle: handle || slugify(name) + '-' + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      industry: industry || null,
      size: (size as CompanySize) || null,
      website: website || null,
    }, { onConflict: 'user_id' });

    if (profileErr) { setError(profileErr.message); setLoading(false); return; }

    router.push('/onboarding/company/step2');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-1">Set up your company page</h1>
      <p className="text-buzz-muted text-sm mb-6">Step 1 of 3</p>

      <div className="mb-4">
        <label className="label mb-1 block">Company name *</label>
        <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} className="input" required />
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">Handle</label>
        <div className="flex items-center">
          <span className="text-buzz-muted text-sm mr-1">buzz.app/</span>
          <input type="text" value={handle} onChange={(e) => setHandle(slugify(e.target.value))} className="input" />
        </div>
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">Industry</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
          <option value="">Select industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="label mb-2 block">Company size</label>
        <div className="space-y-2">
          {(Object.entries(COMPANY_SIZE_LABELS) as [CompanySize, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="size"
                checked={size === key}
                onChange={() => setSize(key)}
                className="text-buzz-yellow focus:ring-buzz-yellow"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="label mb-1 block">Website</label>
        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input" placeholder="https://yourcompany.com" />
      </div>

      {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </form>
  );
}
