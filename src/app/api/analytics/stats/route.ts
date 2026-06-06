import { listAllDocuments, Query } from "@/lib/db/helpers";
import { COLLECTIONS } from "@/lib/appwrite/config";
import { getSession } from "@/lib/auth";

type Analytics = {
  id: string;
  date: string;
  page: string;
  visits: number;
  uniqueVisitors: number;
};

export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [daily, weekly, monthly] = await Promise.all([
    listAllDocuments<Analytics>(COLLECTIONS.analytics, [Query.greaterThanEqual("date", today)]),
    listAllDocuments<Analytics>(COLLECTIONS.analytics, [Query.greaterThanEqual("date", weekAgo)]),
    listAllDocuments<Analytics>(COLLECTIONS.analytics, [Query.greaterThanEqual("date", monthAgo)]),
  ]);

  const totalDaily = daily.reduce((sum, d) => sum + (d.visits || 0), 0);
  const totalWeekly = weekly.reduce((sum, d) => sum + (d.visits || 0), 0);
  const totalMonthly = monthly.reduce((sum, d) => sum + (d.visits || 0), 0);

  const uniqueDaily = daily.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
  const uniqueWeekly = weekly.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
  const uniqueMonthly = monthly.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);

  const topPages = daily
    .sort((a, b) => (b.visits || 0) - (a.visits || 0))
    .slice(0, 10)
    .map((d) => ({ page: d.page, visits: d.visits || 0, uniqueVisitors: d.uniqueVisitors || 0 }));

  return Response.json({
    daily: { total: totalDaily, unique: uniqueDaily },
    weekly: { total: totalWeekly, unique: uniqueWeekly },
    monthly: { total: totalMonthly, unique: uniqueMonthly },
    topPages,
  });
}