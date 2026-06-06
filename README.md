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

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Customer register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/cart` | Cart |
| POST | `/api/checkout` | Create master + seller orders |
| POST | `/api/payments` | Submit payment code |
| POST | `/api/payments/[id]/verify` | Seller approves/rejects |
| GET/POST | `/api/products` | List / create products |
| GET/POST | `/api/categories` | Categories for filtering |
| GET/POST | `/api/wishlist` | Wishlist management |
| GET/POST | `/api/reviews` | Product reviews |
| GET | `/api/analytics/stats` | Admin analytics dashboard |
| GET/PATCH | `/api/stores/[id]` | Store detail / update location |
| GET/POST | `/api/admin/sellers` | Admin manages sellers |

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
- Admin notification controls

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
    admin/       # Admin dashboard
    merchant/    # Seller dashboard
    products/    # Product detail pages
    cart/        # Shopping cart
    wishlist/    # Wishlist page
    notifications/# Notifications page
  components/    # UI components
    ui/          # Reusable UI primitives
    products/    # Product cards, search
    map/         # Map components
    layout/      # Navbar, footer, mobile nav
  lib/
    db/          # Appwrite helpers
    types.ts     # Type definitions
    auth.ts      # Authentication
public/
  sw.js          # Service worker for PWA
  icon-192.png   # PWA icons
  icon-512.png
```

## License

Private / project use.