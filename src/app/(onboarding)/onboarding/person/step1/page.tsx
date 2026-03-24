'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';

export default function PersonStep1() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPhoto(URL.createObjectURL(f));
    }
  };

  const handleContinue = async () => {
    if (!name || !city) return;
    setSaving(true);
    setError('');

    try {
      let avatar_url: string | undefined;

      // Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatar_url = uploadData.url;
        }
      }

      // Save profile
      const updates: Record<string, string> = { full_name: name, city };
      if (avatar_url) updates.avatar_url = avatar_url;

      const res = await fetch('/api/profiles/person', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      router.push('/onboarding/person/step2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Let&apos;s set up your profile</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Step 1 of 3</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="card-static p-6 space-y-5">
        <div className="flex justify-center">
          <label className="cursor-pointer">
            {photo ? (
              <img src={photo} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-all">
                <Camera className="w-6 h-6 text-[#0F0F0F]/30" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        <div>
          <label className="label mb-1.5 block">Full name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your full name" />
        </div>

        <div>
          <label className="label mb-1.5 block">City *</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Bangalore, Mumbai, etc." />
        </div>
      </div>

      <button onClick={handleContinue} disabled={!name || !city || saving}
        className="btn-primary w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  );
}
