'use client';

import { useState, useEffect } from 'react';
import Avatar from '@/components/ui/Avatar';
import { Camera, Loader2 } from 'lucide-react';
import type { PersonProfile } from '@/types/database';

const OPEN_TO = [
  { key: 'full_time', label: 'Full-time roles' },
  { key: 'freelance', label: 'Freelance work' },
  { key: 'collab', label: 'Collaborations' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'not_looking', label: 'Not looking' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [headline, setHeadline] = useState('');
  const [city, setCity] = useState('');
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/profiles/person').then(r => r.ok ? r.json() : null),
      fetch('/api/auth').then(r => r.ok ? r.json() : null),
    ]).then(([profileData, authData]) => {
      if (profileData?.profile) {
        const p = profileData.profile as PersonProfile;
        setProfile(p);
        setHeadline(p.headline ?? '');
        setCity(p.city ?? '');
        setOpenTo(p.open_to ?? []);
        setAvatarUrl(p.avatar_url);
      }
      if (authData?.user?.email) {
        setEmail(authData.user.email);
      }
      setLoading(false);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        setAvatarUrl(url);
        // Save immediately
        await fetch('/api/profiles/person', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: url }),
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const save = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profiles/person', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = (k: string) => setOpenTo(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-5">Settings</h1>

      {saved && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-[#0F0F0F] text-white text-[12px] font-semibold animate-fade-up">
          ✓ Changes saved
        </div>
      )}

      <div className="space-y-4">
        <div className="card-static p-5">
          <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-4">Profile</h2>

          <div className="flex justify-center mb-5">
            <label className="cursor-pointer relative group">
              <Avatar src={avatarUrl} name={profile?.full_name ?? 'You'} size="xl" />
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label mb-1.5 block">Headline</label>
              <div className="relative">
                <input value={headline} onChange={e => setHeadline(e.target.value.slice(0, 120))} className="input pr-14" maxLength={120} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#0F0F0F]/30">{headline.length}/120</span>
              </div>
            </div>
            <div>
              <label className="label mb-1.5 block">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="input" />
            </div>
          </div>

          <button onClick={() => save({ headline, city })} disabled={saving} className="btn-primary text-[12px] mt-4 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        <div className="card-static p-5">
          <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-1">Open to</h2>
          <p className="text-[11px] text-[#0F0F0F]/40 mb-4">Controls who can message you and what jobs you see</p>
          <div className="space-y-2.5">
            {OPEN_TO.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={openTo.includes(key)} onChange={() => toggle(key)} className="w-4 h-4 rounded accent-[#FFD60A]" />
                <span className="text-[13px] text-[#0F0F0F]">{label}</span>
              </label>
            ))}
          </div>
          <button onClick={() => save({ open_to: openTo })} disabled={saving} className="btn-primary text-[12px] mt-4 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="card-static p-5">
          <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-4">Account</h2>
          <div>
            <label className="label mb-1.5 block">Email</label>
            <input value={email} disabled className="input bg-[#F5F5F5] text-[#0F0F0F]/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
