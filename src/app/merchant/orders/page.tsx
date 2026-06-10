import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { SellerOrderActions } from "@/components/merchant/seller-order-actions";
import { listSellerOrders, enrichSellerOrder } from "@/lib/db/orders";
import { Button } from "@/components/ui/button";

export default async function MerchantOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ordersResult = await listSellerOrders({ sellerId: user.id, limit: 100 });
  const orders = await Promise.all(
    ordersResult.documents.map(async (o) => {
      const enriched = await enrichSellerOrder(o, { includeItems: true, includeMaster: true });
      return enriched;
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button asChild variant="outline">
          <Link href="/merchant">Dashboard</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <Badge variant="secondary">
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.masterOrder?.customer?.name} ·{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="mb-3 space-y-1 text-sm">
                  {(order.items ?? []).map((item) => (
                    <li key={item.id}>
                      {item.product?.name ?? "Product"} × {item.quantity} —{" "}
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold">
                  Subtotal: {formatCurrency(order.subtotal)}
                </p>
                {(order.payments ?? [])[0] && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Payment: {(order.payments ?? [])[0].transactionCode} (
                    {(order.payments ?? [])[0].status})
                  </p>
                )}
                <SellerOrderActions
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}