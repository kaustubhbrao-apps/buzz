'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ScoreBand from '@/components/buzz/ScoreBand';
import type { JobPost, PersonProfile, CompanyProfile } from '@/types/database';

interface ApplyModalProps {
  job: JobPost;
  applicantProfile: PersonProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ job, applicantProfile, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const company = job.company as CompanyProfile | undefined;

  const handleApply = async () => {
    setLoading(true);
    setError('');

    const res = await fetch(`/api/jobs/${job.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note || undefined }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to apply');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Applying to ${job.title} at ${company?.name}`} size="md">
      {success ? (
        <div className="text-center py-4">
          <p className="text-3xl mb-2">🎉</p>
          <h3 className="font-semibold mb-1">Application sent!</h3>
          <p className="text-sm text-buzz-muted">
            They&apos;ll review your Work Wall and respond within 7 days.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-buzz-muted">
            Your Work Wall will be shared. No CV. No cover letter.
          </p>

          {/* Applicant preview */}
          <div className="flex items-center gap-3 p-3 bg-buzz-bg rounded-card">
            <Avatar src={applicantProfile.avatar_url} name={applicantProfile.full_name} />
            <div>
              <p className="font-medium text-sm">{applicantProfile.full_name}</p>
              <ScoreBand band={applicantProfile.score_band} />
            </div>
          </div>

          {/* Company trust */}
          {company && (
            <p className="text-sm text-buzz-muted">
              ⭐ {company.name} has a {company.credibility_score.toFixed(1)} rating and{' '}
              {company.response_rate}% response rate.
            </p>
          )}

          {/* Note */}
          <div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              className="input min-h-[80px] resize-none"
              placeholder="Anything you want them to know..."
              maxLength={200}
            />
            <p className="text-xs text-buzz-muted text-right">{note.length}/200</p>
          </div>

          {applicantProfile.buzz_score < 200 && (
            <p className="text-sm text-buzz-warning">
              ⚠️ Your score is below 200. Build your Work Wall first.
            </p>
          )}

          {error && <p className="text-sm text-buzz-error">{error}</p>}

          <Button onClick={handleApply} loading={loading} fullWidth>
            Send application →
          </Button>
        </div>
      )}
    </Modal>
  );
}
