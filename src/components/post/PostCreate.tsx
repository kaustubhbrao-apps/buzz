'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { uploadToCloudinary, getAttachmentType } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/client';
import type { PersonProfile, CompanyProfile, Skill } from '@/types/database';

interface PostCreateProps {
  onClose: () => void;
  onSuccess: () => void;
  authorProfile: PersonProfile | CompanyProfile;
}

export default function PostCreate({ onClose, onSuccess, authorProfile }: PostCreateProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [tab, setTab] = useState('work');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [taggedSkills, setTaggedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setSkills(data);
    });
  }, [supabase]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith('image/')) setFilePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (tab === 'job') {
      window.location.href = '/jobs/post';
      return;
    }

    if (tab === 'work' && !file) {
      setError('Add a work sample to reach Buzz Feed. Or post as an Update instead.');
      return;
    }

    setLoading(true);
    setError('');

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
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_type: tab === 'work' ? 'work' : 'update',
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        skills_tagged: taggedSkills,
      }),
    });

    if (!res.ok) {
      setError('Failed to create post');
      setLoading(false);
      return;
    }

    toast('Post published!', 'success');
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Create post" size="md">
      <Tabs
        tabs={[
          { id: 'work', label: 'Work Post' },
          { id: 'update', label: 'Update' },
          { id: 'job', label: 'Job' },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      <div className="mt-4 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-[120px] resize-none"
          placeholder={
            tab === 'work'
              ? 'What did you build? What problem did it solve?'
              : "What's on your mind?"
          }
        />

        {tab === 'work' && (
          <>
            <label className="block border-2 border-dashed border-buzz-border rounded-card p-6 text-center cursor-pointer hover:border-buzz-yellow transition-colors">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="mx-auto max-h-40 rounded-lg" />
              ) : file ? (
                <p className="text-sm text-buzz-text">{file.name}</p>
              ) : (
                <p className="text-sm text-buzz-muted">Drop or click to upload image, video, or file</p>
              )}
              <input type="file" onChange={handleFile} className="hidden" />
            </label>

            <div>
              <p className="label mb-1">Tag skills</p>
              <p className="text-xs text-buzz-muted mb-2">Required for Buzz Feed reach.</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 20).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setTaggedSkills((prev) =>
                        prev.includes(s.name) ? prev.filter((x) => x !== s.name) : [...prev, s.name]
                      )
                    }
                    className={`chip border ${
                      taggedSkills.includes(s.name)
                        ? 'border-buzz-yellow bg-buzz-yellow/10'
                        : 'border-buzz-border'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-buzz-error text-sm">{error}</p>}

        <Button onClick={handleSubmit} loading={loading} fullWidth>
          {tab === 'job' ? 'Go to job posting →' : 'Publish'}
        </Button>
      </div>
    </Modal>
  );
}
