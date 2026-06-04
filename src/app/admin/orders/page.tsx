"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type MasterOrder = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  sellerOrders: { id: string; subtotal: number; status: string; seller: { name: string } }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MasterOrder[]>([]);

  useEffect(() => {
    apiFetch<{ orders: MasterOrder[] }>("/api/orders").then((d) =>
      setOrders(d.orders)
    );
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">All orders</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
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
                  <div className="text-right">
                    <Badge variant="secondary">
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="mt-1 font-bold">
                      {formatCurrency(order.totalAmount)}
                    </p>
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
    </div>
  );
}
