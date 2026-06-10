# maSoKo — Multi-vendor Marketplace

Lightweight multi-vendor marketplace: one cart across sellers, checkout creates a **Master Order** split into **Seller Orders**, and customers pay each seller separately with manual payment verification.

## Stack

- **Web & mobile shell:** Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Mobile:** Capacitor (Android & iOS from the same codebase)
- **Data:** Appwrite (NoSQL database)
- **Maps:** Leaflet.js + OpenStreetMap
- **Auth:** JWT in HttpOnly cookies
- **Storage:** Appwrite Storage

## Quick start

```bash
cd masoko
cp .env.example .env   # if .env missing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Role     | Email                   | Password     |
|----------|-------------------------|--------------|
| Admin    | admin@masoko.local      | password123  |
| Seller A | sellerA@masoko.local    | password123  |
| Seller B | sellerB@masoko.local    | password123  |
| Customer | customer@masoko.local   | password123  |

## MVP flows

1. **Admin** → `/admin` → create sellers
2. **Seller** → `/merchant/store` → create store → `/merchant/map` → pin location → `/merchant/products` → add products → `/merchant/payments` → add M-Pesa till
3. **Customer** → `/` → add items from multiple sellers → `/cart` → checkout → `/orders/[id]` → submit payment codes per seller
4. **Seller** → `/merchant` → approve/reject payments → master order status updates automatically

## API overview

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/register` | No | Customer register |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/cart/count` | Customer | Cart item count |
| GET/POST | `/api/cart` | Customer | Get/Add cart items |
| PATCH | `/api/cart/[itemId]` | Customer | Update cart item quantity |
| DELETE | `/api/cart/[itemId]` | Customer | Remove cart item |
| POST | `/api/checkout` | Customer | Create master + seller orders |
| POST | `/api/payments` | Customer | Submit payment code |
| POST | `/api/payments/[id]/verify` | Seller/Admin | Approve/reject payment |
| PATCH | `/api/seller-orders/[id]/status` | Seller/Admin | Update seller order status |
| GET/POST | `/api/products` | Public/SELLER,ADMIN | List / create products |
| GET/PATCH | `/api/products/[id]/edit` | Any | Product detail / edit |
| GET/POST | `/api/categories` | Public | Categories for filtering |
| GET/POST | `/api/wishlist` | Any | Wishlist management |
| GET/POST | `/api/reviews` | Public/Any | Product reviews |
| GET | `/api/analytics/stats` | Admin | Admin analytics dashboard |
| GET/POST | `/api/stores` | Public/SELLER | List stores / create store |
| PATCH | `/api/stores/[id]` | Seller/Admin | Update store |
| GET | `/api/payment-methods` | Seller | List payment methods |
| POST | `/api/payment-methods` | Seller | Add payment method |
| GET | `/api/orders` | Customer/Seller/Admin | List orders |
| GET | `/api/orders/[id]` | Customer/Seller/Admin | Get order by ID |
| GET | `/api/marketplace/promos` | Public | Get marketplace promos |
| GET/POST | `/api/admin/sellers` | Admin | Admin manages sellers |
| PATCH | `/api/admin/bulk` | Admin | Bulk operations (delete, toggle, update) |
| GET/POST | `/api/admin/promos` | Admin | Marketplace promos |
| PATCH/DELETE | `/api/admin/promos/[id]` | Admin | Update/delete promo |
| GET/PATCH | `/api/admin/settings` | Admin | Site configuration |
| GET/PATCH | `/api/admin/pricing` | Admin | Seller pricing configuration |
| GET/POST | `/api/notifications` | Any | Notifications |
| DELETE | `/api/notifications/[id]` | Any | Delete notification |
| POST | `/api/notifications/read-all` | Any | Mark all as read |
| POST | `/api/upload` | Seller/Admin | File upload |
| GET | `/api/download-apk` | Public | APK download (optional) |

## User Roles & Permissions

### ADMIN

**System Requirements:** Full access to all features

**Access Control:**
- Middleware: `session.role === Role.ADMIN` for `/admin/*` routes
- API: `requireAuth(Role.ADMIN)` on all admin endpoints

**Functionalities:**
| Feature | Status | Implementation |
|---------|--------|----------------|
| Create sellers | ✓ Implemented | `POST /api/admin/sellers` |
| View all sellers | ✓ Implemented | `GET /api/admin/sellers` |
| Delete sellers | ✓ Implemented | `PATCH /api/admin/bulk` (entity: sellers, action: delete) |
| Manage products | ✓ Implemented | Full CRUD via API routes and `/admin/products` |
| Manage orders | ✓ Implemented | View all, bulk status updates via `/admin/orders` |
| Manage promos | ✓ Implemented | Full CRUD via `/api/admin/promos` and `/admin/promos` |
| Toggle promo visibility | ✓ Implemented | `PATCH /api/admin/promos/[id]` |
| Site settings | ✓ Implemented | `GET/PATCH /api/admin/settings` |
| Seller pricing config | ✓ Implemented | `GET/PATCH /api/admin/pricing` |
| Analytics dashboard | ✓ Implemented | `GET /api/analytics/stats` with `/admin/analytics` |
| View all orders | ✓ Implemented | `GET /api/orders` |
| Approve/reject payments | ✓ Implemented | `POST /api/payments/[id]/verify` |
| File upload | ✓ Implemented | `POST /api/upload` |

### SELLER

**System Requirements:** Must have store created before accessing products/payments/map

**Access Control:**
- Middleware: `session.role === Role.SELLER || session.role === Role.ADMIN` for `/merchant/*` routes
- API: `requireAuth(Role.SELLER)` or `requireAuth(Role.SELLER, Role.ADMIN)`

**Functionalities:**
| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Create store | ✓ Implemented | `POST /api/stores` | Required first step |
| Edit store | ✓ Implemented | `PATCH /api/stores/[id]` | Name, description, address |
| Set store location | ✓ Implemented | `PATCH /api/stores/[id]` | Via `/merchant/map` with GPS support |
| GPS location | ✓ Implemented | `GET /lib/geolocation.ts` | Browser native + Capacitor support |
| Add products | ✓ Implemented | `POST /api/products` | Auto-assigns store if exists |
| Edit own products | ✓ Implemented | `PATCH /api/products/[id]` | Via `/merchant/products` |
| Delete own products | ✓ Implemented | `DELETE /api/products/[id]` | Via `/merchant/products` |
| View own orders | ✓ Implemented | `GET /api/orders` | Filtered by sellerId |
| Approve/reject payments | ✓ Implemented | `POST /api/payments/[id]/verify` | Only own seller orders |
| Add payment method | ✓ Implemented | `POST /api/payment-methods` | M-Pesa Till, etc. |
| List payment methods | ✓ Implemented | `GET /api/payment-methods` | View own methods |
| Update order status | ✓ Implemented | `PATCH /api/seller-orders/[id]/status` | Status transitions enforced |

### CUSTOMER

**System Requirements:** None (public registration)

**Access Control:**
- Middleware: `session.role === Role.CUSTOMER` for `/cart`, `/checkout`, `/orders`
- API: `requireAuth(Role.CUSTOMER)`

**Functionalities:**
| Feature | Status | Implementation |
|---------|--------|----------------|
| Register | ✓ Implemented | `POST /api/auth/register` |
| Login | ✓ Implemented | `POST /api/auth/login` |
| Browse products | ✓ Implemented | `GET /api/products` |
| View product detail | ✓ Implemented | `GET /api/products/[id]` |
| Add to cart | ✓ Implemented | `POST /api/cart` |
| View cart | ✓ Implemented | `GET /api/cart` |
| Checkout | ✓ Implemented | `POST /api/checkout` |
| View orders | ✓ Implemented | `GET /api/orders` |
| Submit payment | ✓ Implemented | `POST /api/payments` |
| View notifications | ✓ Implemented | `GET /api/notifications` |
| Wishlist | ✓ Implemented | `GET/POST/DELETE /api/wishlist` |
| Write reviews | ✓ Implemented | `POST /api/reviews` |

## UI/UX Features

### Search & Filtering
- Debounced search with instant results
- Category filters via sidebar
- Price range sliders
- Sorting options (relevance, price, newest, popular)

### Loading States
- Skeleton loaders for product cards and lists
- Spinner buttons with loading states
- Progress indicators throughout

### Empty States
- Illustrated empty states for products, cart, orders, wishlist
- Clear CTAs to browse marketplace

### Visual Feedback
- Hover animations on product cards
- Button loading spinners
- Interactive map markers with store info popups

### Notifications
- In-app notification center (`/notifications`)
- Toast notifications with focus management
- Per-user notifications for orders and payments

### Performance
- Image lazy loading with blur placeholders
- PWA support with service worker (`/sw.js`)
- Install prompt for mobile users

### Accessibility
- Keyboard navigation improvements
- Screen reader labels and ARIA attributes
- Focus management for interactive elements

### Mobile Enhancements
- Bottom navigation bar on mobile
- Pull-to-refresh support
- App install prompt banner

### Social Features
- Product ratings and reviews
- Wishlist/favorites functionality
- Share product links

### Onboarding
- First-time user tour with tooltips
- Welcome modals for new sellers

### Visitor Analytics (Admin)
- Visitor counter middleware
- Daily/weekly/monthly statistics
- Top pages tracking
- Admin dashboard with charts (`/admin/analytics`)

## Mobile (Capacitor)

Native projects live in `android/` and `ios/`. The WebView loads your Next.js server (API routes stay on the server).

```bash
npm run dev   # terminal 1

# terminal 2 — use your machine LAN IP on a real device
CAPACITOR_SERVER_URL=http://192.168.1.x:3000 npm run cap:sync:dev
npm run cap:android   # or cap:ios (macOS + Xcode)
```

Set `NEXT_PUBLIC_APP_URL` to the same URL so API calls from the app reach your server.

GPS on **Merchant → Map** uses browser geolocation on web and `@capacitor/geolocation` on device. Android location permissions are in `AndroidManifest.xml`.

## Project structure

```
src/
  app/           # Pages + API routes
    api/         # REST API endpoints
      admin/     # Admin-only endpoints
      auth/      # Authentication endpoints
      analytics/ # Analytics endpoints
    admin/       # Admin dashboard pages
      analytics/ # Analytics dashboard
      orders/    # Order management
      products/  # Product management
      promos/    # Promo management
      pricing/   # Seller pricing settings
    merchant/    # Seller dashboard pages
      store/     # Store creation/management
      map/       # Store location mapping
      products/  # Product management
      payments/  # Payment method management
      orders/    # Order viewing
    products/    # Product detail pages
    cart/        # Shopping cart
    wishlist/    # Wishlist page
    notifications/# Notifications page
    orders/      # Order pages
    map/         # Public map page
  components/    # UI components
    ui/          # Reusable UI primitives
    products/    # Product cards, search
    map/         # Map components
    layout/      # Navbar, footer, mobile nav
    admin/       # Admin-specific components
    merchant/    # Seller-specific components
    orders/      # Payment form components
    cart/        # Cart item components
  lib/
    db/          # Appwrite helpers
      helpers.ts       # DB CRUD operations
      users-stores.ts  # User/store DB operations
      products.ts      # Product DB operations
      carts.ts         # Cart DB operations
      orders.ts        # Order/Payment DB operations
      config-promos.ts # Config/Promo DB operations
    types.ts     # Type definitions
    auth.ts      # Authentication (JWT)
    api-route.ts # API route utilities
    order-status.ts # Master order status logic
    seller-order-status.ts # Seller order status transitions
    geolocation.ts # GPS location utilities
    marketplace.ts # Public marketplace data
    utils.ts     # Utility functions
    api.ts       # API client
  hooks/
    use-wishlist.ts # Wishlist hook
    use-session.ts # Session hook
    use-pwa.ts # PWA hook
    use-toast.ts # Toast notifications
public/
  sw.js          # Service worker for PWA
  icon-192.png   # PWA icons
  icon-512.png
```

## Order Status Flow

### Master Order Status
```
PENDING_PAYMENT → PARTIALLY_PAID → FULLY_PAID → PROCESSING → COMPLETED
     ↓
  CANCELLED
```

### Seller Order Status
```
PENDING_PAYMENT → PAYMENT_SUBMITTED → PAID → PROCESSING → READY → DELIVERED
     ↓              ↓
  CANCELLED    ← (rejected payment)
```

## Known Issues & Workarounds

1. **Promo type APK mentioned but no APK-specific handling** - Feature exists in enum but no APK promo logic.

## License

Private / project use.