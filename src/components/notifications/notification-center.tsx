"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  if (loading) return <p className="p-4 md:p-8 text-center">Loading notifications...</p>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:py-8 pb-16 md:pb-0">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "" : "border-l-4 border-l-primary"}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-base">{notification.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="default" className="ml-2">
                      New
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
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