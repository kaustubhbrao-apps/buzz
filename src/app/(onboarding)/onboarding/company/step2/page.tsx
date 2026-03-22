'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function CompanyStep2() {
  const router = useRouter();
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [about, setAbout] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (
    file: File,
    setUrl: (u: string) => void,
    setPreview: (u: string) => void
  ) => {
    setPreview(URL.createObjectURL(file));
    try {
      const url = await uploadToCloudinary(file);
      setUrl(url);
    } catch {
      setError('Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { error: err } = await supabase
      .from('company_profiles')
      .update({
        logo_url: logoUrl || null,
        cover_url: coverUrl || null,
        about: about || null,
        city: city || null,
      })
      .eq('user_id', user.id);

    if (err) { setError(err.message); setLoading(false); return; }

    router.push('/onboarding/company/step3');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-1">Make your page stand out</h1>
      <p className="text-buzz-muted text-sm mb-6">Step 2 of 3</p>

      <div className="mb-4">
        <label className="label mb-1 block">Logo</label>
        <label className="cursor-pointer flex items-center gap-3">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-buzz-border flex items-center justify-center text-buzz-muted">🏢</div>
          )}
          <span className="text-sm text-buzz-muted">Click to upload (square)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], setLogoUrl, setLogoPreview)}
            className="hidden"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">Cover photo</label>
        <label className="cursor-pointer block border-2 border-dashed border-buzz-border rounded-card overflow-hidden hover:border-buzz-yellow transition-colors">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-32 object-cover" />
          ) : (
            <div className="h-32 flex items-center justify-center text-buzz-muted text-sm">
              1200 × 400 — Click to upload
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], setCoverUrl, setCoverPreview)}
            className="hidden"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">About</label>
        <div className="relative">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value.slice(0, 500))}
            className="input min-h-[100px] resize-none"
            placeholder="What you build, who for, and why it matters."
            maxLength={500}
          />
          <span className="absolute right-3 bottom-2 text-xs text-buzz-muted">{about.length}/500</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="label mb-1 block">City / Based in</label>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Bangalore / Remote-first" />
      </div>

      {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full mb-3">
        {loading ? 'Saving...' : 'Continue →'}
      </button>
      <Link href="/onboarding/company/step1" className="btn-ghost w-full block text-center text-sm">← Back</Link>
    </form>
  );
}
