'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ScoreBand from '@/components/buzz/ScoreBand';
import { useToast } from '@/components/ui/Toast';
import type { PersonProfile } from '@/types/database';

interface ConnectModalProps {
  recipient: PersonProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConnectModal({ recipient, isOpen, onClose, onSuccess }: ConnectModalProps) {
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError("Add a note. Tell them why you're connecting.");
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: recipient.user_id, note }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to send request');
      setLoading(false);
      return;
    }

    toast('Connection request sent!', 'success');
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Connect with ${recipient.full_name}`} size="sm">
      <p className="text-sm text-buzz-muted mb-4">
        Tell them why. Blank requests don&apos;t work on Buzz.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <Avatar src={recipient.avatar_url} name={recipient.full_name} />
        <div>
          <p className="font-medium text-sm">{recipient.full_name}</p>
          <ScoreBand band={recipient.score_band} />
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 200))}
        className="input min-h-[80px] resize-none mb-1"
        placeholder="I saw your React project and would love to collaborate..."
        maxLength={200}
      />
      <p className="text-xs text-buzz-muted text-right mb-3">{note.length}/200</p>

      <p className="text-xs text-buzz-muted mb-4">
        Your Buzz Score and top Work Wall post are shared automatically.
      </p>

      {error && <p className="text-sm text-buzz-error mb-3">{error}</p>}

      <Button onClick={handleSubmit} loading={loading} fullWidth>
        Send request
      </Button>
    </Modal>
  );
}
