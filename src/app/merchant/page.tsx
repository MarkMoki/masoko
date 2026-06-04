import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PaymentVerifyActions } from "@/components/merchant/payment-verify-actions";
import { SellerOrderActions } from "@/components/merchant/seller-order-actions";

export default async function MerchantDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [store, pendingPayments, recentOrders] = await Promise.all([
    Promise.resolve(null as any), // Prisma removed - store
    Promise.resolve([] as any[]), // Prisma removed - pending payments
    Promise.resolve([] as any[]), // Prisma removed - recent orders
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Merchant dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/merchant/store">Store</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/merchant/products">Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/merchant/payments">Payment methods</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/merchant/orders">Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/merchant/map">Map</Link>
          </Button>
        </div>
      </div>

      {!store ? (
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">You need to create a store first.</p>
            <Button asChild>
              <Link href="/merchant/store">Create store</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="mb-6 text-muted-foreground">
          Managing: <strong>{store.name}</strong>
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending payment verifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending payments</p>
            ) : (
              pendingPayments.map((p) => (
                <div key={p.id} className="rounded border p-3 text-sm">
                  <p>
                    Code: <strong>{p.transactionCode}</strong> —{" "}
                    {formatCurrency(p.amount)}
                  </p>
                  <p className="text-muted-foreground">
                    Customer: {p.sellerOrder.masterOrder.customer.name}
                  </p>
                  <PaymentVerifyActions paymentId={p.id} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="rounded border p-3 text-sm">
                <div className="flex justify-between">
                  <span>#{o.id.slice(-6).toUpperCase()}</span>
                  <span>{formatCurrency(o.subtotal)}</span>
                </div>
                <p className="text-muted-foreground">
                  {o.status.replace(/_/g, " ")}
                </p>
                <SellerOrderActions orderId={o.id} currentStatus={o.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
