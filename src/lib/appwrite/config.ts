export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
  "https://tor.cloud.appwrite.io/v1";

export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ?? "masoko";

export const APPWRITE_BUCKET_ID =
  process.env.APPWRITE_BUCKET_ID ?? "masoko-uploads";

export const COLLECTIONS = {
  users: "users",
  stores: "stores",
  categories: "categories",
  products: "products",
  carts: "carts",
  cartItems: "cart_items",
  masterOrders: "master_orders",
  sellerOrders: "seller_orders",
  sellerOrderItems: "seller_order_items",
  paymentMethods: "payment_methods",
  payments: "payments",
  notifications: "notifications",
  siteConfig: "site_config",
  sellerPricingConfig: "seller_pricing_config",
  sellerPlans: "seller_plans",
  marketplacePromos: "marketplace_promos",
  wishlists: "wishlists",
  wishlistItems: "wishlist_items",
  reviews: "reviews",
  analytics: "analytics",
} as const;
