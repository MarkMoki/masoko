import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Role } from "@/lib/types";
import { listMasterOrders, enrichMasterOrder } from "@/lib/db/orders";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let orders: any[] = [];

  if (session.role === Role.CUSTOMER) {
    const result = await listMasterOrders({ customerId: session.sub, limit: 50 });
    orders = await Promise.all(
      result.documents.map(async (order) => {
        const enriched = await enrichMasterOrder(order);
        return enriched;
      })
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition hover:border-primary">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.sellerOrders?.length ?? 0} seller(s) ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
                    <p className="mt-1 font-bold">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}