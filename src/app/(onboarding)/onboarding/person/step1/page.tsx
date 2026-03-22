'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { slugify } from '@/lib/utils';

export default function PersonStep1() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setAvatarPreview(URL.createObjectURL(file));
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
    } catch {
      setError('Photo upload failed. Try again.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !city.trim()) {
      setError('Name and city are required.');
      return;
    }
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { error: userErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      account_type: 'person',
    });

    if (userErr) { setError(userErr.message); setLoading(false); return; }

    const handle = slugify(fullName) + '-' + Math.random().toString(36).slice(2, 6);
    const { error: profileErr } = await supabase.from('person_profiles').upsert({
      user_id: user.id,
      handle,
      full_name: fullName.trim(),
      city: city.trim(),
      avatar_url: avatarUrl || null,
    }, { onConflict: 'user_id' });

    if (profileErr) { setError(profileErr.message); setLoading(false); return; }

    router.push('/onboarding/person/step2');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-1">Let&apos;s set up your profile</h1>
      <p className="text-buzz-muted text-sm mb-6">Step 1 of 3</p>

      <div className="mb-4">
        <label className="label mb-1 block">Full name *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input"
          placeholder="Your full name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="label mb-1 block">City *</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input"
          placeholder="Bangalore, Mumbai, etc."
          required
        />
      </div>

      <div className="mb-6">
        <label className="label mb-1 block">Profile photo</label>
        <label className="cursor-pointer flex items-center gap-3">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-buzz-border flex items-center justify-center text-buzz-muted text-sm">
              📷
            </div>
          )}
          <span className="text-sm text-buzz-muted">
            {uploading ? 'Uploading...' : 'Click to upload'}
          </span>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
      </div>

      {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </form>
  );
}
