import { Metadata } from "next";
import { NotificationCenter } from "@/components/notifications/notification-center";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications",
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}