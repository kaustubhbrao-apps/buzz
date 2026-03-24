'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, Link2, PenLine, Upload, Loader2 } from 'lucide-react';

export default function PersonStep3() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [type, setType] = useState<'image' | 'video' | 'link' | 'write'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [link, setLink] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f)); }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError('');

    try {
      let attachment_url: string | null = null;
      let attachment_type: string | null = null;

      // Upload file if present
      if (file && (type === 'image' || type === 'video')) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachment_url = uploadData.url;
          attachment_type = uploadData.type;
        }
      } else if (type === 'link' && link) {
        attachment_url = link;
        attachment_type = 'link';
      }

      const post_type = attachment_url ? 'work' : 'update';

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type,
          content: content.trim(),
          attachment_url,
          attachment_type,
          skills_tagged: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create post');
      }

      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Post your first work</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Your Work Wall starts here. Step 3 of 3.</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="card-static p-6 space-y-4">
        <div className="flex gap-2">
          {[
            { key: 'image' as const, icon: ImageIcon, label: 'Image' },
            { key: 'video' as const, icon: Video, label: 'Video' },
            { key: 'link' as const, icon: Link2, label: 'Link' },
            { key: 'write' as const, icon: PenLine, label: 'Write' },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setType(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-[11px] font-semibold transition-all ${
                type === key ? 'bg-[#FFD60A] text-[#0F0F0F]' : 'bg-[#F5F5F5] text-[#0F0F0F]/40 hover:bg-[#EBEBEB]'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {(type === 'image' || type === 'video') && (
          <label className="block rounded-2xl border-2 border-dashed border-[#E5E5E5] p-8 text-center cursor-pointer hover:border-[#FFD60A] transition-all">
            {preview ? (
              <img src={preview} alt="" className="mx-auto max-h-40 rounded-xl" />
            ) : (
              <div className="text-[#0F0F0F]/30">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-[12px]">Click or drag to upload</p>
              </div>
            )}
            <input type="file" accept={type === 'image' ? 'image/*' : 'video/*'} onChange={handleFile} className="hidden" />
          </label>
        )}

        {type === 'link' && (
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="input" placeholder="https://your-project.com" />
        )}

        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[100px] resize-none"
          placeholder="What did you build? What problem did it solve?" />
      </div>

      <button onClick={handlePost} disabled={!content.trim() || posting}
        className="btn-primary w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
        {posting && <Loader2 className="w-4 h-4 animate-spin" />}
        {posting ? 'Posting...' : 'Post it & go to my feed →'}
      </button>
      <button onClick={() => router.push('/feed')} className="btn-ghost w-full mt-2 text-[13px]">
        Skip for now
      </button>
    </div>
  );
}
