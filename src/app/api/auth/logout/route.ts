import { clearAuthCookie } from "@/lib/auth";
import { json } from "@/lib/api-route";

export async function POST() {
  await clearAuthCookie();
  return json({ ok: true });
}
