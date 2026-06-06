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
  const { page, date, ip } = await request.json();

  const existing = await listDocuments<Analytics>(COLLECTIONS.analytics, [
    Query.equal("date", date),
    Query.equal("page", page),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    const doc = existing.documents[0];
    const currentIps = doc.visitorIps || [];
    const uniqueIps = [...new Set([...currentIps, ip])];

    await updateDocument(COLLECTIONS.analytics, doc.id, {
      visits: (doc.visits || 0) + 1,
      uniqueVisitors: uniqueIps.length,
      visitorIps: uniqueIps,
    });
  } else {
    await createDocument(COLLECTIONS.analytics, {
      date,
      page,
      visits: 1,
      uniqueVisitors: 1,
      visitorIps: [ip],
      createdAt: new Date().toISOString(),
    });
  }

  return Response.json({ success: true });
}