'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary, getAttachmentType } from '@/lib/cloudinary';
import type { Skill } from '@/types/database';

export default function PersonStep3() {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'link' | 'write'>('image');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [taggedSkills, setTaggedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setAllSkills(data);
    });
  }, [supabase]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(f));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('person_profiles')
      .select('id, handle')
      .eq('user_id', user.id)
      .single();

    if (!profile) { setError('Profile not found'); setLoading(false); return; }

    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;

    if (file) {
      try {
        attachmentUrl = await uploadToCloudinary(file);
        attachmentType = getAttachmentType(file);
      } catch {
        setError('Upload failed');
        setLoading(false);
        return;
      }
    } else if (linkUrl) {
      attachmentUrl = linkUrl;
      attachmentType = 'link';
    }

    const { data: post, error: postErr } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        author_type: 'person',
        post_type: 'work',
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType as 'image' | 'video' | 'link' | 'file' | null,
        skills_tagged: taggedSkills,
      })
      .select()
      .single();

    if (postErr) { setError(postErr.message); setLoading(false); return; }

    // Score events
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'work_post', reference_id: post.id }),
    });

    router.push(`/${profile.handle}`);
  };

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: profile } = await supabase
      .from('person_profiles')
      .select('handle')
      .eq('user_id', user.id)
      .single();
    router.push(profile ? `/${profile.handle}` : '/feed');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-1">Post your first work</h1>
      <p className="text-buzz-muted text-sm mb-1">Your Work Wall starts here. Any format — design, code, video, writing.</p>
      <p className="text-buzz-muted text-sm mb-6">Step 3 of 3</p>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'image' as const, label: '📷 Image' },
          { key: 'video' as const, label: '🎥 Video' },
          { key: 'link' as const, label: '🔗 Link' },
          { key: 'write' as const, label: '✍️ Write' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setUploadType(opt.key)}
            className={`chip border ${
              uploadType === opt.key
                ? 'border-buzz-yellow bg-buzz-yellow/10'
                : 'border-buzz-border'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {(uploadType === 'image' || uploadType === 'video') && (
        <div className="mb-4">
          <label className="block border-2 border-dashed border-buzz-border rounded-card p-8 text-center cursor-pointer hover:border-buzz-yellow transition-colors">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
            ) : (
              <p className="text-buzz-muted text-sm">Click or drag to upload</p>
            )}
            <input
              type="file"
              accept={uploadType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {uploadType === 'link' && (
        <div className="mb-4">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="input"
            placeholder="https://your-project.com"
          />
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-[100px] resize-none"
          placeholder="What did you build? What problem did it solve?"
        />
      </div>

      <div className="mb-6">
        <label className="label mb-1 block">Tag skills</label>
        <div className="flex flex-wrap gap-2">
          {allSkills.slice(0, 15).map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() =>
                setTaggedSkills((prev) =>
                  prev.includes(skill.name)
                    ? prev.filter((s) => s !== skill.name)
                    : [...prev, skill.name]
                )
              }
              className={`chip border ${
                taggedSkills.includes(skill.name)
                  ? 'border-buzz-yellow bg-buzz-yellow/10'
                  : 'border-buzz-border'
              }`}
            >
              {skill.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full mb-3">
        {loading ? 'Posting...' : 'Post it & go to my profile →'}
      </button>
      <button type="button" onClick={handleSkip} className="btn-ghost w-full text-sm">
        Skip for now — I&apos;ll post later
      </button>
    </form>
  );
}
