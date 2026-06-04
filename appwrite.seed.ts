import "dotenv/config";
import {
  Client,
  Databases,
  Storage,
  Permission,
  Role as AppwriteRole,
} from "node-appwrite";
import { createUser, getUserByEmail, createStore } from "./src/lib/db/users-stores";
import { createProduct } from "./src/lib/db/products";
import {
  createDocument,
  getDocument,
  listAllDocuments,
  Query,
} from "./src/lib/db/helpers";
import { COLLECTIONS } from "./src/lib/appwrite/config";
import { Role, PricingModel, PromoType } from "./src/lib/types";
import bcrypt from "bcryptjs";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://tor.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "masoko";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID ?? "masoko-uploads";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCollectionsExist() {
  console.log("Checking and synchronizing Appwrite database infrastructure...\n");

  const targetCollections = [
    {
      id: COLLECTIONS.users,
      name: "Users",
      attributes: [
        { name: "name", type: "string", size: 255, required: true },
        { name: "email", type: "string", size: 255, required: true },
        { name: "phone", type: "string", size: 50, required: false },
        { name: "passwordHash", type: "string", size: 255, required: true },
        { name: "role", type: "string", size: 50, required: true },
      ],
      indexes: [{ key: "idx_email", type: "key", attributes: ["email"] }],
    },
    {
      id: COLLECTIONS.stores,
      name: "Stores",
      attributes: [
        { name: "sellerId", type: "string", size: 255, required: true },
        { name: "name", type: "string", size: 255, required: true },
        { name: "description", type: "string", size: 1000, required: false },
        { name: "latitude", type: "float", required: true },
        { name: "longitude", type: "float", required: true },
        { name: "address", type: "string", size: 500, required: true },
        { name: "imageUrl", type: "string", size: 500, required: false },
      ],
      indexes: [
        { key: "idx_sellerId", type: "key", attributes: ["sellerId"] },
      ],
    },
    {
      id: COLLECTIONS.categories,
      name: "Categories",
      attributes: [
        { name: "name", type: "string", size: 255, required: true },
      ],
      indexes: [{ key: "idx_name", type: "key", attributes: ["name"] }],
    },
    {
      id: COLLECTIONS.products,
      name: "Products",
      attributes: [
        { name: "sellerId", type: "string", size: 255, required: true },
        { name: "storeId", type: "string", size: 255, required: true },
        { name: "categoryId", type: "string", size: 255, required: true },
        { name: "name", type: "string", size: 255, required: true },
        { name: "description", type: "string", size: 1000, required: false },
        { name: "price", type: "integer", required: true },
        { name: "stock", type: "integer", required: true },
        { name: "imageUrl", type: "string", size: 500, required: false },
        { name: "active", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_name_sellerId", type: "key", attributes: ["name", "sellerId"] },
        { key: "idx_categoryId", type: "key", attributes: ["categoryId"] },
        { key: "idx_storeId", type: "key", attributes: ["storeId"] },
      ],
    },
    {
      id: COLLECTIONS.carts,
      name: "Carts",
      attributes: [
        { name: "customerId", type: "string", size: 255, required: true },
        { name: "updatedAt", type: "string", size: 50, required: true },
      ],
      indexes: [
        { key: "idx_customerId", type: "key", attributes: ["customerId"] },
      ],
    },
    {
      id: COLLECTIONS.cartItems,
      name: "Cart Items",
      attributes: [
        { name: "cartId", type: "string", size: 255, required: true },
        { name: "productId", type: "string", size: 255, required: true },
        { name: "quantity", type: "integer", required: true },
      ],
      indexes: [
        { key: "idx_cartId", type: "key", attributes: ["cartId"] },
        { key: "idx_productId", type: "key", attributes: ["productId"] },
      ],
    },
    {
      id: COLLECTIONS.masterOrders,
      name: "Master Orders",
      attributes: [
        { name: "customerId", type: "string", size: 255, required: true },
        { name: "totalAmount", type: "integer", required: true },
        { name: "status", type: "string", size: 50, required: true },
      ],
      indexes: [
        { key: "idx_customerId", type: "key", attributes: ["customerId"] },
      ],
    },
    {
      id: COLLECTIONS.sellerOrders,
      name: "Seller Orders",
      attributes: [
        { name: "masterOrderId", type: "string", size: 255, required: true },
        { name: "sellerId", type: "string", size: 255, required: true },
        { name: "subtotal", type: "integer", required: true },
        { name: "status", type: "string", size: 50, required: true },
      ],
      indexes: [
        { key: "idx_masterOrderId", type: "key", attributes: ["masterOrderId"] },
        { key: "idx_sellerId", type: "key", attributes: ["sellerId"] },
      ],
    },
    {
      id: COLLECTIONS.sellerOrderItems,
      name: "Seller Order Items",
      attributes: [
        { name: "sellerOrderId", type: "string", size: 255, required: true },
        { name: "productId", type: "string", size: 255, required: true },
        { name: "quantity", type: "integer", required: true },
        { name: "unitPrice", type: "integer", required: true },
      ],
      indexes: [
        { key: "idx_sellerOrderId", type: "key", attributes: ["sellerOrderId"] },
        { key: "idx_productId", type: "key", attributes: ["productId"] },
      ],
    },
    {
      id: COLLECTIONS.paymentMethods,
      name: "Payment Methods",
      attributes: [
        { name: "sellerId", type: "string", size: 255, required: true },
        { name: "type", type: "string", size: 50, required: true },
        { name: "accountName", type: "string", size: 255, required: false },
        { name: "accountNumber", type: "string", size: 100, required: false },
        { name: "instructions", type: "string", size: 1000, required: false },
        { name: "isDefault", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_sellerId", type: "key", attributes: ["sellerId"] },
      ],
    },
    {
      id: COLLECTIONS.payments,
      name: "Payments",
      attributes: [
        { name: "sellerOrderId", type: "string", size: 255, required: true },
        { name: "transactionCode", type: "string", size: 255, required: true },
        { name: "amount", type: "integer", required: true },
        { name: "status", type: "string", size: 50, required: true },
        { name: "verifiedAt", type: "string", size: 50, required: false },
      ],
      indexes: [
        { key: "idx_sellerOrderId", type: "key", attributes: ["sellerOrderId"] },
      ],
    },
    {
      id: COLLECTIONS.notifications,
      name: "Notifications",
      attributes: [
        { name: "userId", type: "string", size: 255, required: true },
        { name: "title", type: "string", size: 255, required: true },
        { name: "message", type: "string", size: 1000, required: true },
        { name: "read", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_userId", type: "key", attributes: ["userId"] },
      ],
    },
    {
      id: COLLECTIONS.siteConfig,
      name: "Site Config",
      attributes: [
        { name: "marketplacePromoEnabled", type: "boolean", required: true },
      ],
      indexes: [],
    },
    {
      id: COLLECTIONS.sellerPricingConfig,
      name: "Seller Pricing Config",
      attributes: [
        { name: "defaultModel", type: "string", size: 50, required: true },
        { name: "subscriptionMonthly", type: "integer", required: false },
        { name: "payAsYouGoFlatFee", type: "integer", required: false },
        { name: "payAsYouGoPercent", type: "integer", required: false },
        { name: "description", type: "string", size: 1000, required: false },
      ],
      indexes: [],
    },
    {
      id: COLLECTIONS.sellerPlans,
      name: "Seller Plans",
      attributes: [
        { name: "sellerId", type: "string", size: 255, required: true },
        { name: "model", type: "string", size: 50, required: true },
        { name: "monthlyFee", type: "integer", required: false },
        { name: "perOrderFee", type: "integer", required: false },
        { name: "feePercent", type: "integer", required: false },
        { name: "notes", type: "string", size: 1000, required: false },
        { name: "active", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_sellerId", type: "key", attributes: ["sellerId"] },
      ],
    },
    {
      id: COLLECTIONS.marketplacePromos,
      name: "Marketplace Promos",
      attributes: [
        { name: "type", type: "string", size: 50, required: true },
        { name: "title", type: "string", size: 255, required: true },
        { name: "subtitle", type: "string", size: 255, required: false },
        { name: "imageUrl", type: "string", size: 500, required: false },
        { name: "linkUrl", type: "string", size: 500, required: false },
        { name: "productId", type: "string", size: 255, required: false },
        { name: "sortOrder", type: "integer", required: true },
        { name: "active", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_type_title", type: "key", attributes: ["type", "title"] },
      ],
    },
  ];

  for (const col of targetCollections) {
    let collectionExists = false;
    try {
      await databases.getCollection(DATABASE_ID, col.id);
      collectionExists = true;
      console.log(`  [OK] Collection "${col.name}" (${col.id}) exists.`);
    } catch (error: any) {
      if (error.code === 404) {
        console.log(`  [CREATE] Collection "${col.name}"...`);
        await databases.createCollection(DATABASE_ID, col.id, col.name, [
          Permission.read(AppwriteRole.any()),
          Permission.write(AppwriteRole.any()),
        ]);
      } else {
        throw error;
      }
    }

    const requiredAttributes = col.attributes.map((a) => a.name);
    let existingAttrs: string[] = [];
    try {
      const attrList = await databases.listAttributes(DATABASE_ID, col.id);
      existingAttrs = attrList.attributes.map((a: any) => a.key);
    } catch {}

    const missingAttrs = requiredAttributes.filter((name) => !existingAttrs.includes(name));
    if (missingAttrs.length > 0) {
      console.log(`  [ATTR] Adding missing attributes to "${col.name}": ${missingAttrs.join(", ")}`);
      for (const attr of col.attributes) {
        if (!existingAttrs.includes(attr.name)) {
          try {
            if (attr.type === "string") {
              const size = (attr as any).size || 255;
              const required = attr.required ?? false;
              await databases.createStringAttribute(DATABASE_ID, col.id, attr.name, size, required);
            } else if (attr.type === "integer") {
              await databases.createIntegerAttribute(DATABASE_ID, col.id, attr.name, attr.required ?? false);
            } else if (attr.type === "boolean") {
              await databases.createBooleanAttribute(DATABASE_ID, col.id, attr.name, attr.required ?? false);
            } else if (attr.type === "float") {
              await databases.createFloatAttribute(DATABASE_ID, col.id, attr.name, attr.required ?? false);
            }
          } catch (e: any) {
            console.warn(`  [WARN] Could not add attribute "${attr.name}":`, e?.message || e);
          }
        }
      }
      await delay(4000);
    }

    if (collectionExists) {
      await delay(2000);
      continue;
    }

    for (const index of col.indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          col.id,
          index.key,
          index.type as any,
          index.attributes
        );
        console.log(`  [INDEX] "${index.key}" created.`);
      } catch (idxError: any) {
        console.warn(`  [WARN] Could not create index "${index.key}":`, idxError?.message || idxError);
      }
    }

    await delay(2000);
    console.log(`  [DONE] Collection "${col.name}" setup finalized.\n`);
  }
}

async function seedAppwrite() {
  try {
    await ensureCollectionsExist();

    console.log("\n=== Seeding Appwrite database ===\n");
    const passwordHash = await bcrypt.hash("password123", 12);

    const now = new Date().toISOString();

    // --- Users ---
    console.log("--- Users ---");
    const users: Record<string, any> = {};
    const userDefs = [
      { key: "admin", name: "Admin User", email: "admin@masoko.local", phone: "+254700000000", role: Role.ADMIN },
      { key: "sellerA", name: "Amina Wanjiku", email: "amina@masoko.local", phone: "+254700000001", role: Role.SELLER },
      { key: "sellerB", name: "Brian Kipchoge", email: "brian@masoko.local", phone: "+254700000002", role: Role.SELLER },
      { key: "sellerC", name: "Chepkemoi Faith", email: "faith@masoko.local", phone: "+254700000003", role: Role.SELLER },
      { key: "customer", name: "Demo Customer", email: "customer@masoko.local", phone: "+254700000004", role: Role.CUSTOMER },
    ];

    for (const def of userDefs) {
      const existing = await getUserByEmail(def.email);
      if (!existing) {
        users[def.key] = await createUser({
          name: def.name,
          email: def.email,
          phone: def.phone,
          passwordHash,
          role: def.role,
        });
        console.log(`  [CREATE] ${def.role} ${def.name} <${def.email}>`);
      } else {
        users[def.key] = existing;
        console.log(`  [SKIP]  ${def.role} ${def.name} already exists`);
      }
    }

    const allUsers = await listAllDocuments<{ id: string; role: string }>(COLLECTIONS.users, []);
    const sellerUsers = allUsers.filter((u) => u.role === Role.SELLER);
    const customerUsers = allUsers.filter((u) => u.role === Role.CUSTOMER);

    const extraSellerNames = [
      { name: "Diana Moraa", email: "diana@masoko.local", role: Role.SELLER },
      { name: "Elias Okoth", email: "elias@masoko.local", role: Role.SELLER },
      { name: "Fatuma Hassan", email: "fatuma@masoko.local", role: Role.SELLER },
      { name: "George Wekesa", email: "george@masoko.local", role: Role.SELLER },
      { name: "Hannah Njeri", email: "hannah@masoko.local", role: Role.SELLER },
    ];
    let extraUserIdx = 0;
    for (const def of extraSellerNames) {
      if (sellerUsers.length >= 9) break;
      const existing = await getUserByEmail(def.email);
      if (!existing) {
        const u = await createUser({
          name: def.name,
          email: def.email,
          phone: `+25470000${1000 + extraUserIdx}`,
          passwordHash,
          role: def.role,
        });
        sellerUsers.push(u);
        console.log(`  [CREATE] ${def.role} ${def.name}`);
      }
      extraUserIdx += 1;
    }

    const extraCustomerNames = [
      { name: "Irene Mwangi", email: "irene@masoko.local", role: Role.CUSTOMER },
      { name: "James Kiptoo", email: "james@masoko.local", role: Role.CUSTOMER },
      { name: "Khadija Omar", email: "khadija@masoko.local", role: Role.CUSTOMER },
      { name: "Lucy Chebet", email: "lucy@masoko.local", role: Role.CUSTOMER },
      { name: "Michael Adhiambo", email: "michael@masoko.local", role: Role.CUSTOMER },
    ];
    extraUserIdx = 0;
    for (const def of extraCustomerNames) {
      if (customerUsers.length >= 9) break;
      const existing = await getUserByEmail(def.email);
      if (!existing) {
        const u = await createUser({
          name: def.name,
          email: def.email,
          phone: `+25470001${1000 + extraUserIdx}`,
          passwordHash,
          role: def.role,
        });
        customerUsers.push(u);
        console.log(`  [CREATE] ${def.role} ${def.name}`);
      }
      extraUserIdx += 1;
    }
    }

    const extraUserNames = [
      { name: "Diana Moraa", email: "diana@masoko.local", role: Role.SELLER },
      { name: "Elias Okoth", email: "elias@masoko.local", role: Role.CUSTOMER },
      { name: "Fatuma Hassan", email: "fatuma@masoko.local", role: Role.SELLER },
      { name: "George Wekesa", email: "george@masoko.local", role: Role.CUSTOMER },
      { name: "Hannah Njeri", email: "hannah@masoko.local", role: Role.SELLER },
    ];
    let extraUserCount = 1;
    for (const def of extraUserNames) {
      if ((await listAllDocuments<{ email: string }>(COLLECTIONS.users, [])).length >= 9) break;
      const existing = await getUserByEmail(def.email);
      if (!existing) {
        const u = await createUser({
          name: def.name,
          email: def.email,
          phone: `+25470000${1000 + extraUserCount}`,
          passwordHash,
          role: def.role,
        });
        users[`extra${extraUserCount}`] = u;
        console.log(`  [CREATE] ${def.role} ${def.name}`);
      } else {
        users[`extra${extraUserCount}`] = existing;
      }
      extraUserCount += 1;
    }

    const allUsers = await listAllDocuments<{ id: string; role: string }>(COLLECTIONS.users, []);
    const sellerUsers = allUsers.filter((u) => u.role === Role.SELLER);
    const customerUsers = allUsers.filter((u) => u.role === Role.CUSTOMER);

    // --- Stores ---
    console.log("\n--- Stores ---");
    const storeDefs = [
      {
        sellerId: sellerUsers[0]?.id ?? users.sellerA.id,
        name: "Nairobi Fresh Mart",
        description: "Fresh produce, organic vegetables, and quality groceries sourced directly from local farmers.",
        latitude: -1.2864,
        longitude: 36.8172,
        address: "CBD, Nairobi, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1607344645869-d13d49736794?w=800&q=80",
      },
      {
        sellerId: sellerUsers[1]?.id ?? users.sellerB.id,
        name: "Westlands Electronics Hub",
        description: "Latest smartphones, laptops, accessories, and audio gear at the best prices in Nairobi.",
        latitude: -1.2674,
        longitude: 36.8120,
        address: "Westlands, Nairobi, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69056955?w=800&q=80",
      },
      {
        sellerId: sellerUsers[2]?.id ?? users.sellerC.id,
        name: "Mombasa Fashion House",
        description: "Trendy African fashion, kits, shoes, and accessories for men and women.",
        latitude: -4.0435,
        longitude: 39.6682,
        address: "Mombasa CBD, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      },
      {
        sellerId: sellerUsers[3]?.id,
        name: "Kisumu Book Nook",
        description: "New and used books, stationery, and educational supplies.",
        latitude: -0.0917,
        longitude: 34.7676,
        address: "Kisumu CBD, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      },
      {
        sellerId: sellerUsers[4]?.id,
        name: "Nakuru Beauty Lounge",
        description: "Skincare, makeup, and wellness products for everyone.",
        latitude: -0.3031,
        longitude: 36.0800,
        address: "Nakuru Town, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
      },
      {
        sellerId: sellerUsers[5]?.id,
        name: "Eldoret Home Essentials",
        description: "Quality home decor, kitchenware, and bedding.",
        latitude: 0.5143,
        longitude: 35.2698,
        address: "Eldoret Town, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      },
      {
        sellerId: sellerUsers[6]?.id,
        name: "Thika Gaming Zone",
        description: "Video games, consoles, controllers, and gaming accessories.",
        latitude: -1.0333,
        longitude: 37.0693,
        address: "Thika, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      },
      {
        sellerId: sellerUsers[7]?.id,
        name: "Malindi Beachwear",
        description: "Swimwear, flip-flops, and beach accessories for summer getaways.",
        latitude: -3.2173,
        longitude: 40.1169,
        address: "Malindi, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
      },
      {
        sellerId: sellerUsers[8]?.id,
        name: "Kitengela Pet Store",
        description: "Pet food, toys, grooming kits, and accessories for dogs and cats.",
        latitude: -1.4167,
        longitude: 36.8667,
        address: "Kitengela, Kenya",
        imageUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80",
      },
    ];

    const allStores: any[] = [];
    for (const def of storeDefs) {
      if ((await listAllDocuments<{ sellerId: string }>(COLLECTIONS.stores, [])).length >= 9) break;
      const store = await createStore({
        sellerId: def.sellerId,
        name: def.name,
        description: def.description,
        latitude: def.latitude,
        longitude: def.longitude,
        address: def.address,
        imageUrl: def.imageUrl,
      });
      allStores.push(store);
      console.log(`  [CREATE] ${def.name}`);
    }

    // --- Categories ---
    console.log("\n--- Categories ---");
    const categoryDefs = [
      { name: "Groceries" },
      { name: "Electronics" },
      { name: "Fashion" },
      { name: "Home & Living" },
      { name: "Beauty & Health" },
      { name: "Books & Education" },
      { name: "Gaming" },
      { name: "Sports & Outdoors" },
      { name: "Pet Supplies" },
    ];

    const categories: Record<string, string> = {};
    for (const def of categoryDefs) {
      if ((await listAllDocuments<{ name: string }>(COLLECTIONS.categories, [])).length >= 9) break;
      const existing = await listAllDocuments<{ name: string }>(COLLECTIONS.categories, [
        Query.equal("name", def.name),
      ]);
      if (existing.length === 0) {
        const category = await createDocument<{ name: string }>(COLLECTIONS.categories, { name: def.name });
        categories[def.name] = category.id;
        console.log(`  [CREATE] ${def.name}`);
      } else {
        categories[def.name] = existing[0].id;
        console.log(`  [SKIP]  ${def.name} already exists`);
      }
    }

    for (const [k, v] of Object.entries(categories)) categories[k] = v;

    // --- Products ---
    console.log("\n--- Products ---");
    const productDefs = [
      // Groceries - Store A
      {
        sellerId: users.sellerA.id,
        storeId: stores.storeA.id,
        categoryId: categories["Groceries"],
        name: "Organic Tomatoes 1kg",
        description: "Fresh organic tomatoes from Kiambu farms. Perfect for salads and cooking.",
        price: 180,
        stock: 80,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1546470427-227c84e7666d?w=600&q=80",
      },
      {
        sellerId: users.sellerA.id,
        storeId: stores.storeA.id,
        categoryId: categories["Groceries"],
        name: "Maize Flour 2kg (Premium)",
        description: " premium maize flour, sifted and packed under hygienic conditions.",
        price: 220,
        stock: 45,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
      },
      {
        sellerId: users.sellerA.id,
        storeId: stores.storeA.id,
        categoryId: categories["Groceries"],
        name: "Fresh Avocados (6 pcs)",
        description: "Hass avocados, ripe and ready to eat. Rich in healthy fats.",
        price: 300,
        stock: 30,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f3d7b1e5?w=600&q=80",
      },
      {
        sellerId: users.sellerA.id,
        storeId: stores.storeA.id,
        categoryId: categories["Groceries"],
        name: "Ugali Flour 1kg",
        description: "Finely milled ugali flour, perfect for that authentic Kenyan taste.",
        price: 90,
        stock: 100,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=600&q=80",
      },
      {
        sellerId: users.sellerA.id,
        storeId: stores.storeA.id,
        categoryId: categories["Groceries"],
        name: "Kale (Sukuma Wiki) Bunch",
        description: "Fresh green kale, washed and ready for cooking.",
        price: 30,
        stock: 60,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1576045054876-2b2af40ac558?w=600&q=80",
      },
      // Electronics - Store B
      {
        sellerId: users.sellerB.id,
        storeId: stores.storeB.id,
        categoryId: categories["Electronics"],
        name: "USB-C Fast Charging Cable 2m",
        description: "Braided nylon USB-C to USB-C cable. Supports 100W PD fast charging.",
        price: 850,
        stock: 50,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
      },
      {
        sellerId: users.sellerB.id,
        storeId: stores.storeB.id,
        categoryId: categories["Electronics"],
        name: "Wireless Bluetooth Earbuds",
        description: "True wireless earbuds with 30h battery, active noise cancellation, and IPX5 water resistance.",
        price: 3500,
        stock: 25,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
      },
      {
        sellerId: users.sellerB.id,
        storeId: stores.storeB.id,
        categoryId: categories["Electronics"],
        name: "Power Bank 20000mAh",
        description: "High-capacity power bank with dual USB output and LED display.",
        price: 2500,
        stock: 20,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80",
      },
      {
        sellerId: users.sellerB.id,
        storeId: stores.storeB.id,
        categoryId: categories["Electronics"],
        name: "Laptop Stand Adjustable",
        description: "Ergonomic aluminum laptop stand compatible with all laptops up to 17\".",
        price: 2200,
        stock: 15,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
      },
      {
        sellerId: users.sellerB.id,
        storeId: stores.storeB.id,
        categoryId: categories["Electronics"],
        name: "Wireless Mouse Silent",
        description: "2.4GHz wireless mouse with silent clicks and ergonomic design.",
        price: 1200,
        stock: 35,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
      },
      // Fashion - Store C
      {
        sellerId: users.sellerC.id,
        storeId: stores.storeC.id,
        categoryId: categories["Fashion"],
        name: "Kanga Fabric - Premium Print",
        description: "High-quality cotton kanga with vibrant traditional prints. 1.8m x 1.1m.",
        price: 1200,
        stock: 40,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1583391733956-6c9b0e1b2b1a?w=600&q=80",
      },
      {
        sellerId: users.sellerC.id,
        storeId: stores.storeC.id,
        categoryId: categories["Fashion"],
        name: "Men's Leather Sandals",
        description: "Handcrafted genuine leather sandals. Comfortable, durable, and stylish.",
        price: 1800,
        stock: 20,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80",
      },
      {
        sellerId: users.sellerC.id,
        storeId: stores.storeC.id,
        categoryId: categories["Fashion"],
        name: "Women's Ankara Dress",
        description: "Beautiful Ankara print dress. Custom-tailored, sizes S - XXL available.",
        price: 3500,
        stock: 12,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
      },
      {
        sellerId: users.sellerC.id,
        storeId: stores.storeC.id,
        categoryId: categories["Fashion"],
        name: "Unisex Canvas Sneakers",
        description: "Lightweight white canvas sneakers. Perfect for everyday wear.",
        price: 2800,
        stock: 18,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
      },
      {
        sellerId: users.sellerC.id,
        storeId: stores.storeC.id,
        categoryId: categories["Fashion"],
        name: "Leather Belt - Handmade",
        description: "Hand-stitched genuine leather belt. Fits waist sizes 28\" - 42\".",
        price: 800,
        stock: 25,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      },
    ];

    for (const productData of productDefs) {
      const existing = await listAllDocuments<{ name: string; sellerId: string }>(COLLECTIONS.products, [
        Query.equal("name", productData.name),
        Query.equal("sellerId", productData.sellerId),
      ]);
      if (existing.length === 0) {
        await createProduct(productData);
        console.log(`  [CREATE] ${productData.name}`);
      } else {
        console.log(`  [SKIP]  ${productData.name} already exists`);
      }
    }

    // --- Site Config ---
    console.log("\n--- Site Config ---");
    let siteConfig: any = null;
    try {
      siteConfig = await getDocument(COLLECTIONS.siteConfig, "default");
    } catch {}
    if (!siteConfig) {
      await createDocument<{ marketplacePromoEnabled: boolean }>(
        COLLECTIONS.siteConfig,
        { marketplacePromoEnabled: true },
        "default"
      );
      console.log("  [CREATE] Site config created");
    } else {
      console.log("  [SKIP]  Site config already exists");
    }

    // --- Seller Pricing Config ---
    console.log("\n--- Seller Pricing Config ---");
    let pricingConfig: any = null;
    try {
      pricingConfig = await getDocument(COLLECTIONS.sellerPricingConfig, "default");
    } catch {}
    if (!pricingConfig) {
      await createDocument(
        COLLECTIONS.sellerPricingConfig,
        {
          defaultModel: PricingModel.SUBSCRIPTION,
          subscriptionMonthly: 2500,
          payAsYouGoFlatFee: 50,
          payAsYouGoPercent: 3,
          description: "Sellers pay a monthly subscription or a small fee per order.",
        },
        "default"
      );
      console.log("  [CREATE] Seller pricing config created");
    } else {
      console.log("  [SKIP]  Seller pricing config already exists");
    }

    // --- Seller Plans ---
    console.log("\n--- Seller Plans ---");
    const sellerPlanDefs = [
      { sellerKey: "sellerA", model: PricingModel.SUBSCRIPTION, monthlyFee: 2500, perOrderFee: null, feePercent: null, notes: "Standard monthly subscription for Nairobi Fresh Mart.", active: true },
      { sellerKey: "sellerB", model: PricingModel.SUBSCRIPTION, monthlyFee: 3000, perOrderFee: null, feePercent: null, notes: "Premium tier for electronics store.", active: true },
      { sellerKey: "sellerC", model: PricingModel.PAY_AS_YOU_GO, monthlyFee: null, perOrderFee: 50, feePercent: 3, notes: "Pay-as-you-go plan for fashion store.", active: true },
    ];

    for (const def of sellerPlanDefs) {
      const existing = await listAllDocuments<{ sellerId: string }>(COLLECTIONS.sellerPlans, [
        Query.equal("sellerId", users[def.sellerKey].id),
      ]);
      if (existing.length === 0) {
        await createDocument(
          COLLECTIONS.sellerPlans,
          {
            sellerId: users[def.sellerKey].id,
            model: def.model,
            monthlyFee: def.monthlyFee,
            perOrderFee: def.perOrderFee,
            feePercent: def.feePercent,
            notes: def.notes,
            active: def.active,
          }
        );
        console.log(`  [CREATE] Plan for ${users[def.sellerKey].name}`);
      } else {
        console.log(`  [SKIP]  Plan for ${users[def.sellerKey].name} already exists`);
      }
    }

    // --- Payment Methods ---
    console.log("\n--- Payment Methods ---");
    const paymentMethodDefs = [
      {
        sellerId: users.sellerA.id,
        type: "MPESA",
        accountName: "Amina Wanjiku",
        accountNumber: "254700000001",
        instructions: "Lipa na M-Pesa. Send money to the number above and enter your order number as the account reference.",
        isDefault: true,
      },
      {
        sellerId: users.sellerB.id,
        type: "MPESA",
        accountName: "Brian Kipchoge",
        accountNumber: "254700000002",
        instructions: "Pay via M-Pesa. Use your order ID as the reference.",
        isDefault: true,
      },
      {
        sellerId: users.sellerC.id,
        type: "BANK",
        accountName: "Mombasa Fashion House",
        accountNumber: "1234567890 - KCB",
        instructions: "Bank transfer to KCB account above. Upload transaction screenshot after payment.",
        isDefault: true,
      },
    ];

    for (const def of paymentMethodDefs) {
      const existing = await listAllDocuments<{ sellerId: string; type: string }>(COLLECTIONS.paymentMethods, [
        Query.equal("sellerId", def.sellerId),
        Query.equal("type", def.type),
      ]);
      if (existing.length === 0) {
        await createDocument(COLLECTIONS.paymentMethods, def);
        console.log(`  [CREATE] ${def.type} payment for seller ${def.sellerId}`);
      } else {
        console.log(`  [SKIP]  ${def.type} payment for seller ${def.sellerId} already exists`);
      }
    }

    // --- Marketplace Promos ---
    console.log("\n--- Marketplace Promos ---");
    const promoDefs = [
      {
        type: PromoType.BANNER,
        title: "Welcome to maSoKo",
        subtitle: "Shop from multiple local sellers in one cart",
        sortOrder: 0,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
        linkUrl: "/",
      },
      {
        type: PromoType.OFFER,
        title: "Fresh deals daily",
        subtitle: "New products from trusted sellers",
        sortOrder: 1,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
        linkUrl: "/",
      },
      {
        type: PromoType.BANNER,
        title: "Free delivery on orders over KSh 3,000",
        subtitle: "Shop more, save more",
        sortOrder: 2,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&q=80",
        linkUrl: "/",
      },
      {
        type: PromoType.MOST_SOLD,
        title: "Best sellers this week",
        subtitle: "Top picks from our marketplace",
        sortOrder: 3,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1607344645869-d13d49736794?w=800&q=80",
        linkUrl: "/",
      },
      {
        type: PromoType.APK,
        title: "Get the maSoKo Android App",
        subtitle: "Faster checkout, orders, and notifications",
        sortOrder: 4,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        linkUrl: "javascript:void(0)",
      },
    ];

    for (const promoData of promoDefs) {
      const existing = await listAllDocuments<{ type: string; title: string }>(COLLECTIONS.marketplacePromos, [
        Query.equal("type", promoData.type),
        Query.equal("title", promoData.title),
      ]);
      if (existing.length === 0) {
        await createDocument(COLLECTIONS.marketplacePromos, promoData);
        console.log(`  [CREATE] Promo "${promoData.title}"`);
      } else {
        console.log(`  [SKIP]  Promo "${promoData.title}" already exists`);
      }
    }

    // --- Sample Seller Order Items (most sold data) ---
    console.log("\n--- Sample Seller Order Items (for Most Sold aggregation) ---");
    const products = await listAllDocuments<{ id: string; name: string }>(COLLECTIONS.products, []);
    const sampleProducts = products.filter((p) => p.name.includes("Cable") || p.name.includes("Tomatoes") || p.name.includes("Earbuds") || p.name.includes("Maize"));

    // Create a past completed master order and seller orders with items
    let masterOrder: any = null;
    try {
      masterOrder = await createDocument(
        COLLECTIONS.masterOrders,
        {
          customerId: users.customer.id,
          totalAmount: 4980,
          status: "COMPLETED",
        },
        undefined
      );
      console.log(`  [CREATE] Master order ${masterOrder.id}`);
    } catch {}

    if (masterOrder) {
      const sellerGroups: Record<string, { subtotal: number; items: { productId: string; quantity: number; unitPrice: number }[] }> = {};
      for (const p of sampleProducts.slice(0, 4)) {
        const quantity = p.name.includes("Cable") ? 3 : p.name.includes("Maize") ? 5 : p.name.includes("Tomatoes") ? 4 : 2;
        const unitPrice = p.price;
        const sellerId = p.sellerId;
        if (!sellerGroups[sellerId]) {
          sellerGroups[sellerId] = { subtotal: 0, items: [] };
        }
        sellerGroups[sellerId].subtotal += quantity * unitPrice;
        sellerGroups[sellerId].items.push({ productId: p.id, quantity, unitPrice });
      }

      for (const [sellerId, group] of Object.entries(sellerGroups)) {
        const sellerOrder = await createDocument(
          COLLECTIONS.sellerOrders,
          {
            masterOrderId: masterOrder.id,
            sellerId,
            subtotal: group.subtotal,
            status: "DELIVERED",
          },
          undefined
        );
        console.log(`  [CREATE] Seller order ${sellerOrder.id} for ${sellerId}`);

        for (const item of group.items) {
          await createDocument(COLLECTIONS.sellerOrderItems, {
            ...item,
            sellerOrderId: sellerOrder.id,
          });
        }
        console.log(`  [CREATE] ${group.items.length} order items for seller order ${sellerOrder.id}`);
      }
    }

    console.log("\n=== Seeding completed successfully! ===");
    console.log("  Admin:    admin@masoko.local    / password123");
    console.log("  Seller A: amina@masoko.local  / password123  (Nairobi Fresh Mart)");
    console.log("  Seller B: brian@masoko.local  / password123  (Westlands Electronics)");
    console.log("  Seller C: faith@masoko.local  / password123  (Mombasa Fashion House)");
    console.log("  Customer: customer@masoko.local / password123");
    console.log("\nCollections seeded:");
    console.log("  users, stores, categories, products, carts, cartItems");
    console.log("  masterOrders, sellerOrders, sellerOrderItems");
    console.log("  paymentMethods, payments, notifications");
    console.log("  siteConfig, sellerPricingConfig, sellerPlans, marketplacePromos");
    process.exit(0);
  } catch (error) {
    console.error("\nError seeding Appwrite:", error);
    process.exit(1);
  }
}

seedAppwrite();
