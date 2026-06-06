"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type AnalyticsStats = {
  daily: { total: number; unique: number };
  weekly: { total: number; unique: number };
  monthly: { total: number; unique: number };
  topPages: { page: string; visits: number; uniqueVisitors: number }[];
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AnalyticsStats>("/api/analytics/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4 md:p-8 text-center">Loading analytics...</p>;

  return (
    <div className="space-y-4 md:space-y-6 pb-16 md:pb-0">
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.daily.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.daily.unique ?? 0} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.weekly.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.weekly.unique ?? 0} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthly.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.monthly.unique ?? 0} unique visitors
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Top Pages Today</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topPages && stats.topPages.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {stats.topPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm md:text-base">{page.page}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {page.uniqueVisitors} unique visitors
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base">{page.visits} visits</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}