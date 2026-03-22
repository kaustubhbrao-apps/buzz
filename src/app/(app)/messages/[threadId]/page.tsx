'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import Button from '@/components/ui/Button';
import { cn, timeAgo } from '@/lib/utils';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import type { Message, PersonProfile } from '@/types/database';

export default function ThreadPage() {
  const params = useParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<PersonProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/messages?thread_id=${params.threadId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setOtherUser(data.other_participant ?? null);
        setCurrentUserId(data.current_user_id ?? '');
      });
  }, [params.threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: params.threadId, content }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setContent('');
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-buzz-border">
        <Link href="/messages" className="text-buzz-muted hover:text-buzz-text">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otherUser && (
          <>
            <Avatar src={otherUser.avatar_url} name={otherUser.full_name} size="sm" />
            <div>
              <p className="font-medium text-sm">{otherUser.full_name}</p>
              <ScoreBand band={otherUser.score_band} />
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2',
                  isOwn ? 'bg-buzz-dark text-white' : 'bg-gray-100 text-buzz-text'
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={cn('text-[10px] mt-1', isOwn ? 'text-white/50' : 'text-buzz-muted')}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-buzz-border">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="input flex-1"
          placeholder="Type a message..."
        />
        <Button size="sm" onClick={handleSend} loading={sending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
