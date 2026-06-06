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
    Promise.resolve(null as any),
    Promise.resolve([] as any[]),
    Promise.resolve([] as any[]),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 pb-16 md:pb-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Merchant dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/store">Store</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/products">Products</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/payments">Payment methods</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/orders">Orders</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/map">Map</Link>
          </Button>
        </div>
      </div>

      {!store ? (
        <Card>
          <CardContent className="p-4 md:p-6">
            <p className="mb-4">You need to create a store first.</p>
            <Button asChild>
              <Link href="/merchant/store">Create store</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="mb-4 md:mb-6 text-muted-foreground">
          Managing: <strong>{store.name}</strong>
        </p>
      )}

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Pending payment verifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending payments</p>
            ) : (
              pendingPayments.map((p) => (
                <div key={p.id} className="rounded border p-2 md:p-3 text-sm">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="rounded border p-2 md:p-3 text-sm">
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
