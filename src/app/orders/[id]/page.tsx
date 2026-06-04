import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { OrderPaymentForm } from "@/components/orders/order-payment-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  // const order = await prisma.masterOrder.findUnique({
  //   where: { id },
  //   include: {
  //     sellerOrders: {
  //       include: {
  //         items: { include: { product: true } },
  //         seller: {
  //           include: {
  //             paymentMethods: { where: { isDefault: true }, take: 1 },
  //             store: true,
  //           },
  //         },
  //         payments: { orderBy: { createdAt: "desc" } },
  //       },
  //     },
  //   },
  // });
  const order: any = null; // Prisma removed

  if (!order) notFound();
  if (session?.sub !== order.customerId && session?.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <Badge>{order.status.replace(/_/g, " ")}</Badge>
      </div>
      <p className="mb-8 text-lg font-semibold">
        Total: {formatCurrency(order.totalAmount)}
      </p>

      <div className="space-y-6">
        {order.sellerOrders.map((so: any) => {
          const method = so.seller.paymentMethods[0];
          const latestPayment = so.payments[0];
          return (
            <Card key={so.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {so.seller.store?.name ?? so.seller.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(so.subtotal)} · {so.status.replace(/_/g, " ")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm">
                  {so.items.map((item: any) => (
                    <li key={item.id}>
                      {item.product.name} × {item.quantity} —{" "}
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </li>
                  ))}
                </ul>

                {method && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium">{method.type}</p>
                    {method.accountNumber && (
                      <p>Account: {method.accountNumber}</p>
                    )}
                    {method.accountName && <p>Name: {method.accountName}</p>}
                    {method.instructions && <p>{method.instructions}</p>}
                  </div>
                )}

                {latestPayment && (
                  <p className="text-sm">
                    Payment: {latestPayment.transactionCode} —{" "}
                    <Badge variant="secondary">{latestPayment.status}</Badge>
                  </p>
                )}

                {session?.sub === order.customerId &&
                  !["PAID", "PROCESSING", "READY", "DELIVERED"].includes(so.status) && (
                    <OrderPaymentForm
                      sellerOrderId={so.id}
                      amount={so.subtotal}
                    />
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
