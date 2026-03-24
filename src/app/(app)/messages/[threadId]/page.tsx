'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, PersonProfile } from '@/types/database';

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<PersonProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages?thread_id=${threadId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setMessages(data.messages ?? []);
          setOtherParticipant(data.other_participant ?? null);
          setCurrentUserId(data.current_user_id ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [threadId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      thread_id: threadId,
      sender_id: currentUserId ?? '',
      content,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(p => [...p, tempMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(p => p.map(m => m.id === tempMsg.id ? data.message : m));
      }
    } catch {
      // Remove temp message on failure
      setMessages(p => p.filter(m => m.id !== tempMsg.id));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (!otherParticipant) {
    return <p className="text-[#0F0F0F]/40 text-center py-16">Thread not found.</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-[#F0F0F0]">
        <Link href="/messages" className="text-[#0F0F0F]/30 hover:text-[#0F0F0F] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar src={otherParticipant.avatar_url} name={otherParticipant.full_name} size="sm" />
        <div>
          <p className="font-semibold text-[13px] text-[#0F0F0F]">{otherParticipant.full_name}</p>
          <ScoreBand band={otherParticipant.score_band} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-[13px] text-[#0F0F0F]/30 text-center py-8">No messages yet. Say hi!</p>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5', isMe ? 'bg-[#0F0F0F] text-white' : 'bg-[#F5F5F5] text-[#0F0F0F]')}>
                <p className="text-[13px]">{m.content}</p>
                <p className={cn('text-[10px] mt-1', isMe ? 'text-white/40' : 'text-[#0F0F0F]/30')}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          className="input flex-1 py-2.5" placeholder="Type a message..." />
        <button onClick={send} disabled={!text.trim() || sending} className="btn-primary p-2.5 rounded-xl disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
