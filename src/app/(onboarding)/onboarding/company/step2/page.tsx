'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function CompanyStep2() {
  const router = useRouter();
  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [cover, setCover] = useState('');
  const [about, setAbout] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setLogoFile(f);
      setLogo(URL.createObjectURL(f));
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCover(URL.createObjectURL(f));
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    setError('');

    try {
      let logo_url: string | undefined;

      // Upload logo if selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          logo_url = uploadData.url;
        }
      }

      // Build updates with only non-empty fields
      const updates: Record<string, string> = {};
      if (logo_url) updates.logo_url = logo_url;
      if (about) updates.about = about;
      if (city) updates.city = city;
      if (website) updates.website = website;

      // Only PATCH if there is something to update
      if (Object.keys(updates).length > 0) {
        const res = await fetch('/api/profiles/company', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to save company profile');
        }
      }

      router.push('/onboarding/company/step3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Make your page stand out</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Step 2 of 3</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="card-static p-6 space-y-5">
        <div>
          <label className="label mb-1.5 block">Logo</label>
          <label className="cursor-pointer flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center"><Building2 className="w-6 h-6 text-[#0F0F0F]/30" /></div>
            )}
            <span className="text-[12px] text-[#0F0F0F]/40">Click to upload</span>
            <input type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
          </label>
        </div>

        <div>
          <label className="label mb-1.5 block">Cover photo</label>
          <label className="block rounded-2xl border-2 border-dashed border-[#E5E5E5] overflow-hidden cursor-pointer hover:border-[#FFD60A] transition-all">
            {cover ? (
              <img src={cover} alt="" className="w-full h-28 object-cover" />
            ) : (
              <div className="h-28 flex items-center justify-center text-[#0F0F0F]/30">
                <ImageIcon className="w-5 h-5 mr-2" /><span className="text-[12px]">1200 x 400</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />
          </label>
        </div>

        <div>
          <label className="label mb-1.5 block">About</label>
          <div className="relative">
            <textarea value={about} onChange={(e) => setAbout(e.target.value.slice(0, 500))} className="input min-h-[100px] resize-none" placeholder="What you build, who for, and why it matters." maxLength={500} />
            <span className="absolute right-3 bottom-2 text-[11px] text-[#0F0F0F]/30">{about.length}/500</span>
          </div>
        </div>

        <div>
          <label className="label mb-1.5 block">City / Based in</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Bangalore / Remote-first" />
        </div>

        <div>
          <label className="label mb-1.5 block">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input" placeholder="https://yourcompany.com" />
        </div>
      </div>

      <button onClick={handleContinue} disabled={saving}
        className="btn-primary w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Continue →'}
      </button>
      <Link href="/onboarding/company/step1" className="btn-ghost w-full mt-2 text-center block text-[13px]">← Back</Link>
    </div>
  );
}
