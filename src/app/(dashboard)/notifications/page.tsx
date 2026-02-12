'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import type { PaginatedResponse, ApiResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaginatedResponse<Notification>>('/api/v1/notifications?page=1&limit=50')
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markAsRead(id: string) {
    try {
      await api.put<ApiResponse<unknown>>(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch { /* ignore */ }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start justify-between rounded-lg border p-4 ${
                    notif.is_read ? 'bg-white' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-sm ${notif.is_read ? '' : 'font-semibold'}`}>{notif.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notif.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markAsRead(notif.id)} title="Mark as read">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
