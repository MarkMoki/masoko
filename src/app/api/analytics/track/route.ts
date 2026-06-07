import { createDocument, listDocuments, updateDocument, Query } from "@/lib/db/helpers";
import { COLLECTIONS } from "@/lib/appwrite/config";

type Analytics = {
  id: string;
  date: string;
  page: string;
  visits: number;
  uniqueVisitors: number;
  visitorIps?: string[];
};

export async function POST(request: Request) {
  try {
    const { page, date, ip } = await request.json();

    if (!page || !date || !ip) {
      return Response.json({ success: true });
    }

    const existing = await listDocuments<Analytics>(COLLECTIONS.analytics, [
      Query.equal("date", date),
      Query.equal("page", page),
      Query.limit(1),
    ]).catch(() => ({ documents: [] }));

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      const currentIps = doc.visitorIps || [];
      const uniqueIps = [...new Set([...currentIps, ip])];

      await updateDocument(COLLECTIONS.analytics, doc.id, {
        visits: (doc.visits || 0) + 1,
        uniqueVisitors: uniqueIps.length,
        visitorIps: uniqueIps,
      }).catch(() => {});
    } else {
      await createDocument(COLLECTIONS.analytics, {
        date,
        page,
        visits: 1,
        uniqueVisitors: 1,
        visitorIps: [ip],
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: true });
  }
}