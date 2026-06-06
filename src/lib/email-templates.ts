import { createDocument, COLLECTIONS } from "@/lib/db/helpers";

type OrderConfirmationEmailProps = {
  customerName: string;
  orderId: string;
  orderTotal: number;
  items: { name: string; quantity: number; price: number }[];
  baseUrl: string;
};

export function renderOrderConfirmationEmail({
  customerName,
  orderId,
  orderTotal,
  items,
  baseUrl,
}: OrderConfirmationEmailProps): string {
  const itemsList = items
    .map(
      (item) =>
        `<li style="margin: 8px 0;">${item.quantity}x ${item.name} - KES ${(item.price * item.quantity).toLocaleString()}</li>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - maSoKo</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <header style="background: #14532d; color: white; padding: 20px; text-align: center;">
    <h1>maSoKo Marketplace</h1>
  </header>
  
  <main style="padding: 20px;">
    <h2>Order Confirmation</h2>
    <p>Hello ${customerName},</p>
    <p>Your order has been placed successfully!</p>
    
    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3>Order #${orderId.slice(0, 8)}</h3>
      <ul style="list-style: none; padding: 0;">
        ${itemsList}
      </ul>
      <p style="font-weight: bold; font-size: 18px;">Total: KES ${orderTotal.toLocaleString()}</p>
    </div>
    
    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>Each seller will contact you separately for payment</li>
      <li>Track your order status in the app</li>
      <li>You'll receive updates on order progress</li>
    </ul>
    
    <a href="${baseUrl}/orders/${orderId}" style="display: inline-block; background: #14532d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Order Details</a>
  </main>
  
  <footer style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>Thank you for shopping with maSoKo!</p>
  </footer>
</body>
</html>
`;
}

type OrderStatusEmailProps = {
  customerName: string;
  orderId: string;
  status: string;
  message: string;
  baseUrl: string;
};

export function renderOrderStatusEmail({
  customerName,
  orderId,
  status,
  message,
  baseUrl,
}: OrderStatusEmailProps): string {
  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: "#f59e0b",
    PROCESSING: "#3b82f6",
    READY: "#8b5cf6",
    DELIVERED: "#10b981",
    CANCELLED: "#ef4444",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Update - maSoKo</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <header style="background: #14532d; color: white; padding: 20px; text-align: center;">
    <h1>maSoKo Marketplace</h1>
  </header>
  
  <main style="padding: 20px;">
    <h2>Order Update</h2>
    <p>Hello ${customerName},</p>
    <p>Your order status has been updated:</p>
    
    <div style="background: ${statusColors[status] || "#f0fdf4"}; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <strong>${status.replace(/_/g, " ")}</strong>
    </div>
    
    <p>${message}</p>
    
    <a href="${baseUrl}/orders/${orderId}" style="display: inline-block; background: #14532d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order</a>
  </main>
</body>
</html>
`;
}

export async function sendOrderConfirmationEmail(email: string, html: string) {
  // In production, integrate with your email provider (SendGrid, Mailgun, etc.)
  console.log(`Sending order confirmation to ${email}`);
}