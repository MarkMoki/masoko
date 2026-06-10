"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MasterOrderStatus } from "@/lib/types";

type MasterOrder = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  sellerOrders: {
    id: string;
    subtotal: number;
    status: string;
    seller: { name: string };
  }[];
};

const statusOptions = [
  { value: MasterOrderStatus.PENDING_PAYMENT, label: "Pending Payment" },
  { value: MasterOrderStatus.PARTIALLY_PAID, label: "Partially Paid" },
  { value: MasterOrderStatus.FULLY_PAID, label: "Fully Paid" },
  { value: MasterOrderStatus.PROCESSING, label: "Processing" },
  { value: MasterOrderStatus.COMPLETED, label: "Completed" },
  { value: MasterOrderStatus.CANCELLED, label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MasterOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const { toast } = useToast();

  const load = useCallback(() => {
    return apiFetch<{ orders: MasterOrder[] }>("/api/orders").then((d) =>
      setOrders(d.orders)
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function bulkUpdateStatus() {
    if (!bulkStatus || selectedIds.size === 0) return;
    const res = await apiFetch<{ success: number; failed: number }>(
      "/api/admin/bulk",
      {
        method: "PATCH",
        body: JSON.stringify({
          entity: "orders",
          action: "update_status",
          ids: Array.from(selectedIds),
          status: bulkStatus,
        }),
      }
    );
    setSelectedIds(new Set());
    setBulkStatus("");
    load();
    toast({
      title: `${res.success} orders updated`,
      variant: "success",
    });
  }

  function toggleSelection(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">All Orders ({orders.length})</h2>
      </div>

      <BulkActionsBar<MasterOrder>
        items={orders}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        entity="orders"
        onActionComplete={load}
      />

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      className="h-4 w-4 mt-1 rounded border-primary"
                    />
                    <div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name} · {order.customer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="mt-1 font-bold">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
                  {order.sellerOrders.map((so) => (
                    <li key={so.id} className="flex justify-between">
                      <span>{so.seller.name}</span>
                      <span>
                        {formatCurrency(so.subtotal)} ·{" "}
                        <span className="text-muted-foreground">
                          {so.status.replace(/_/g, " ")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-30 mt-4 flex items-center justify-between gap-3 rounded-xl border bg-background/95 backdrop-blur-md p-3 shadow-lg">
          <span className="text-sm font-medium">{selectedIds.size} orders selected</span>
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="h-10 rounded-xl border bg-background px-3 text-sm"
            >
              <option value="">Change status to...</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={bulkUpdateStatus}
              disabled={!bulkStatus}
              className="h-10"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
