import { listNotifications, createNotification, markAllAsRead } from "@/lib/db/config-promos";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    const session = await requireAuth();
    const notifications = await listNotifications(session.sub, 50);
    return json({ notifications });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { title, message, userId } = await request.json();

    await createNotification({
      userId: userId || session.sub,
      title,
      message,
    });

    return json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuth();
    await markAllAsRead(session.sub);
    return json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}