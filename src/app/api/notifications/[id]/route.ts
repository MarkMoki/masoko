import { getSession } from "@/lib/auth";
import { deleteDocument } from "@/lib/db/helpers";
import { COLLECTIONS } from "@/lib/appwrite/config";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteDocument(COLLECTIONS.notifications, id);

  return Response.json({ success: true });
}