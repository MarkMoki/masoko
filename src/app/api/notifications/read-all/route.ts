import { getSession } from "@/lib/auth";
import { markAllAsRead } from "@/lib/db/config-promos";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllAsRead(session.sub);
  return Response.json({ success: true });
}