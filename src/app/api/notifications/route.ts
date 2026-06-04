import { listNotifications } from "@/lib/db/config-promos";
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