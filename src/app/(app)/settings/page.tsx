'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { OPEN_TO_LABELS } from '@/lib/utils';
import type { OpenToType, PersonProfile } from '@/types/database';

export default function SettingsPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [headline, setHeadline] = useState('');
  const [city, setCity] = useState('');
  const [openTo, setOpenTo] = useState<OpenToType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('person_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setHeadline(data.headline ?? '');
        setCity(data.city ?? '');
        setOpenTo(data.open_to ?? []);
      }
    })();
  }, [supabase]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await fetch('/api/profiles/person', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline, city, open_to: openTo }),
    });
    toast('Profile updated!', 'success');
    setSaving(false);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const url = await uploadToCloudinary(file);
    await fetch('/api/profiles/person', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: url }),
    });
    setProfile({ ...profile, avatar_url: url });
    toast('Photo updated!', 'success');
  };

  const toggleOpenTo = (type: OpenToType) => {
    setOpenTo((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  if (!profile) return <p className="text-center text-buzz-muted py-8">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="card p-6">
        <h2 className="font-semibold mb-4">Profile</h2>

        <div className="mb-4">
          <label className="label mb-1 block">Photo</label>
          <label className="cursor-pointer inline-block">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-buzz-border flex items-center justify-center text-buzz-muted">📷</div>
            )}
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
        </div>

        <div className="mb-4">
          <label className="label mb-1 block">Headline</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value.slice(0, 120))}
            className="input"
            maxLength={120}
          />
          <p className="text-xs text-buzz-muted text-right">{headline.length}/120</p>
        </div>

        <div className="mb-4">
          <label className="label mb-1 block">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="input" />
        </div>

        <Button onClick={saveProfile} loading={saving} size="sm">Save changes</Button>
      </section>

      {/* Open To */}
      <section className="card p-6">
        <h2 className="font-semibold mb-2">Open To</h2>
        <p className="text-xs text-buzz-muted mb-3">Controls who can message you</p>
        <div className="space-y-2">
          {(Object.entries(OPEN_TO_LABELS) as [OpenToType, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={openTo.includes(key)} onChange={() => toggleOpenTo(key)} className="rounded" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        <Button onClick={saveProfile} loading={saving} size="sm" className="mt-3">Save</Button>
      </section>

      {/* Account */}
      <section className="card p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div>
          <label className="label mb-1 block">Email</label>
          <input value={profile.user_id} disabled className="input bg-gray-50 text-buzz-muted" />
        </div>
      </section>
    </div>
  );
}
