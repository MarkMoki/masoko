"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Notification[]>("/api/notifications")
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllAsRead() {
    await apiFetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications(notifications.filter((n) => n.id !== id));
  }

  if (loading) return <p className="p-4 md:p-8 text-center text-sm md:text-base">Loading notifications...</p>;

  return (
    <div className="mx-auto max-w-2xl px-3.5 md:px-4 lg:px-6 py-5 md:py-8 pb-24 md:pb-8">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-10 mobile-btn-sm w-full sm:w-auto">
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="mx-auto h-12 w-12 md:h-14 md:w-14 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm md:text-base text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2.5 md:space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "rounded-xl shadow-sm transition-all",
                notification.read ? "" : "border-l-4 border-l-primary bg-primary/[0.02]"
              )}
            >
              <CardContent className="p-3.5 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base">{notification.title}</h3>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-[11px] md:text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}