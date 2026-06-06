export enum Role {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
}

export enum MasterOrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  FULLY_PAID = "FULLY_PAID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum SellerOrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum PricingModel {
  SUBSCRIPTION = "SUBSCRIPTION",
  PAY_AS_YOU_GO = "PAY_AS_YOU_GO",
}

export enum PromoType {
  BANNER = "BANNER",
  OFFER = "OFFER",
  MOST_SOLD = "MOST_SOLD",
  APK = "APK",
}

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  store?: Store | null;
};

export type Store = {
  id: string;
  sellerId: string;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<User, "id" | "name">;
  _count?: { products: number };
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sellerId: string;
  storeId?: string | null;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<User, "id" | "name">;
  store?: Pick<Store, "id" | "name"> | null;
  category?: Category | null;
};

export type Cart = {
  id: string;
  customerId: string;
  updatedAt: string;
  items?: CartItem[];
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
};

export type MasterOrder = {
  id: string;
  customerId: string;
  totalAmount: number;
  status: MasterOrderStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Pick<User, "id" | "name" | "email">;
  sellerOrders?: SellerOrder[];
};

export type SellerOrder = {
  id: string;
  masterOrderId: string;
  sellerId: string;
  subtotal: number;
  status: SellerOrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: SellerOrderItem[];
  payments?: Payment[];
  seller?: User & { paymentMethods?: PaymentMethod[]; store?: Store | null };
  masterOrder?: MasterOrder;
};

export type SellerOrderItem = {
  id: string;
  sellerOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
};

export type PaymentMethod = {
  id: string;
  sellerId: string;
  type: string;
  accountName?: string | null;
  accountNumber?: string | null;
  instructions?: string | null;
  isDefault: boolean;
};

export type Payment = {
  id: string;
  sellerOrderId: string;
  transactionCode: string;
  amount: number;
  status: PaymentStatus;
  verifiedAt?: string | null;
  createdAt: string;
  sellerOrder?: SellerOrder;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type SiteConfig = {
  id: string;
  marketplacePromoEnabled: boolean;
  updatedAt: string;
};

export type SellerPricingConfig = {
  id: string;
  defaultModel: PricingModel;
  subscriptionMonthly: number;
  payAsYouGoFlatFee: number;
  payAsYouGoPercent: number;
  description?: string | null;
  updatedAt: string;
};

export type SellerPlan = {
  id: string;
  sellerId: string;
  model: PricingModel;
  monthlyFee?: number | null;
  perOrderFee?: number | null;
  feePercent?: number | null;
  notes?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<User, "id" | "name" | "email"> & { store?: Store | null };
};

export type MarketplacePromo = {
  id: string;
  type: PromoType;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  productId?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: Pick<User, "id" | "name">;
};

export type Wishlist = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
};

export type Analytics = {
  id: string;
  date: string;
  page: string;
  visits: number;
  uniqueVisitors: number;
  visitorIps?: string[];
  createdAt: string;
};
