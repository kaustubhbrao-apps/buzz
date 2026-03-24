'use client';

import { useState, useEffect } from 'react';
import NotificationItem from '@/components/notification/NotificationItem';
import { Loader2 } from 'lucide-react';
import type { Notification } from '@/types/database';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(data => {
        setNotifications(data.notifications ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F0F0F]">Notifications</h1>
          <p className="text-[13px] text-[#0F0F0F]/50 mt-0.5">Only the stuff that matters.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead}
            className="text-[12px] font-semibold text-[#0F0F0F] underline underline-offset-2">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-static p-8 text-center">
          <p className="text-3xl mb-2">🔔</p>
          <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No notifications</p>
          <p className="text-[12px] text-[#0F0F0F]/40">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={() => markRead(n.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
