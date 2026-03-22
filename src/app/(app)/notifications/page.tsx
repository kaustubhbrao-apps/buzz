'use client';

import { useEffect, useState } from 'react';
import NotificationItem from '@/components/notification/NotificationItem';
import Button from '@/components/ui/Button';
import type { Notification } from '@/types/database';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => { setNotifications(data.notifications ?? []); setLoading(false); });
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [notif.id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-buzz-muted text-sm">Only the stuff that matters.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-buzz-muted py-8">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-buzz-muted py-8">
          Nothing here yet. Post your work to get noticed.
        </p>
      ) : (
        <div className="card overflow-hidden">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
          ))}
        </div>
      )}
    </div>
  );
}
