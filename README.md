# maSoKo — Multi-vendor Marketplace

Lightweight multi-vendor marketplace: one cart across sellers, checkout creates a **Master Order** split into **Seller Orders**, and customers pay each seller separately with manual payment verification.

## Stack

- **Web & mobile shell:** Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI
- **Mobile:** Capacitor (Android & iOS from the same codebase)
- **Data:** SQLite + Prisma ORM
- **Maps:** Leaflet.js + OpenStreetMap
- **Auth:** JWT in HttpOnly cookies
- **Storage (phase 1):** `/public/uploads` — prepared for Appwrite via `StorageProvider`

## Quick start

```bash
cd masoko
cp .env.example .env   # if .env missing
npm install
npm run db:setup       # prisma db push + seed
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
| GET/PATCH | `/api/stores/[id]` | Store detail / update location |
| GET/POST | `/api/admin/sellers` | Admin manages sellers |

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

## Storage migration (Appwrite)

Implement `AppwriteStorageProvider` in `src/lib/storage/` matching `StorageProvider` in `src/lib/storage/types.ts`, then swap the export in `src/lib/storage/index.ts`.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI, map, product cards
  lib/
    checkout.ts  # Master order split engine
    order-status.ts
    auth.ts
    storage/
prisma/
  schema.prisma
  seed.ts
public/uploads/
```

## License

Private / project use.
