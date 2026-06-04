import "dotenv/config";
import { Client, Databases, Permission, Role as AppwriteRole } from "node-appwrite";
import { createUser, getUserByEmail, createStore } from "./src/lib/db/users-stores";
import { createProduct } from "./src/lib/db/products";
import { createDocument, getDocument, listAllDocuments, Query } from "./src/lib/db/helpers";
import { COLLECTIONS } from "./src/lib/appwrite/config";
import bcrypt from "bcryptjs";
import { Role } from "./src/lib/types";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.io")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

async function ensureCollectionsExist() {
  console.log("Checking and synchronizing Appwrite database infrastructure...");

  const targetCollections = [
    {
      id: COLLECTIONS.users,
      name: "Users",
      attributes: [
        { name: "name",         type: "string",  size: 255,  required: true  },
        { name: "email",        type: "string",  size: 255,  required: true  },
        { name: "phone",        type: "string",  size: 50,   required: false },
        { name: "passwordHash", type: "string",  size: 255,  required: true  },
        { name: "role",         type: "string",  size: 50,   required: true  },
      ],
      indexes: [{ key: "idx_email", type: "key", attributes: ["email"] }],
    },
    {
      id: COLLECTIONS.stores,
      name: "Stores",
      attributes: [
        { name: "sellerId",    type: "string",  size: 255,  required: true  },
        { name: "name",        type: "string",  size: 255,  required: true  },
        { name: "description", type: "string",  size: 1000, required: false },
        { name: "latitude",    type: "float",               required: true  },
        { name: "longitude",   type: "float",               required: true  },
        { name: "address",     type: "string",  size: 500,  required: true  },
      ],
      indexes: [{ key: "idx_sellerId", type: "key", attributes: ["sellerId"] }],
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
        { name: "sellerId",   type: "string",  size: 255, required: true },
        { name: "storeId",    type: "string",  size: 255, required: true },
        { name: "categoryId", type: "string",  size: 255, required: true },
        { name: "name",       type: "string",  size: 255, required: true },
        { name: "price",      type: "integer",            required: true },
        { name: "stock",      type: "integer",            required: true },
        { name: "active",     type: "boolean",            required: true },
      ],
      indexes: [{ key: "idx_name_sellerId", type: "key", attributes: ["name", "sellerId"] }],
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
        { name: "defaultModel",        type: "string",  size: 50,   required: true  },
        { name: "subscriptionMonthly", type: "integer",             required: false },
        { name: "payAsYouGoFlatFee",   type: "integer",             required: false },
        { name: "payAsYouGoPercent",   type: "integer",             required: false },
        { name: "description",         type: "string",  size: 1000, required: false },
      ],
      indexes: [],
    },
    {
      id: COLLECTIONS.marketplacePromos,
      name: "Marketplace Promos",
      attributes: [
        { name: "type",      type: "string",  size: 50,  required: true  },
        { name: "title",     type: "string",  size: 255, required: true  },
        { name: "subtitle",  type: "string",  size: 255, required: false },
        { name: "sortOrder", type: "integer",            required: true  },
        { name: "active",    type: "boolean",            required: true  },
      ],
      indexes: [{ key: "idx_type_title", type: "key", attributes: ["type", "title"] }],
    },
  ];

  for (const col of targetCollections) {
    try {
      await databases.getCollection(DATABASE_ID, col.id);
      console.log(`Collection "${col.name}" (${col.id}) exists.`);
    } catch (error: any) {
      if (error.code === 404) {
        console.log(`Creating collection "${col.name}"...`);

        await databases.createCollection(DATABASE_ID, col.id, col.name, [
          Permission.read(AppwriteRole.any()),
          Permission.write(AppwriteRole.any()),
        ]);

        for (const attr of col.attributes) {
          if (attr.type === "string") {
            const size = (attr as any).size || 255;
            await databases.createStringAttribute(DATABASE_ID, col.id, attr.name, size, attr.required);
          } else if (attr.type === "integer") {
            await databases.createIntegerAttribute(DATABASE_ID, col.id, attr.name, attr.required);
          } else if (attr.type === "boolean") {
            await databases.createBooleanAttribute(DATABASE_ID, col.id, attr.name, attr.required);
          } else if (attr.type === "float") {
            await databases.createFloatAttribute(DATABASE_ID, col.id, attr.name, attr.required);
          }
        }

        console.log(`Attributes setup for "${col.name}". Waiting for build...`);
        await new Promise((resolve) => setTimeout(resolve, 3500));

        for (const index of col.indexes) {
          try {
            await databases.createIndex(DATABASE_ID, col.id, index.key, index.type as any, index.attributes);
            console.log(`Index "${index.key}" initialized.`);
          } catch (idxError) {
            console.warn(`Could not create index "${index.key}":`, idxError);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(`Collection "${col.name}" setup finalized.`);
      } else {
        throw error;
      }
    }
  }
}

async function seedAppwrite() {
  try {
    await ensureCollectionsExist();

    console.log("\nSeeding Appwrite database...");
    const passwordHash = await bcrypt.hash("password123", 12);

    // --- Users ---
    let admin = await getUserByEmail("admin@masoko.local");
    if (!admin) {
      admin = await createUser({ name: "Admin User", email: "admin@masoko.local", phone: "+254700000000", passwordHash, role: Role.ADMIN });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    let sellerA = await getUserByEmail("sellerA@masoko.local");
    if (!sellerA) {
      sellerA = await createUser({ name: "Seller A", email: "sellerA@masoko.local", phone: "+254700000001", passwordHash, role: Role.SELLER });
      console.log("Seller A created");
    } else {
      console.log("Seller A already exists");
    }

    let sellerB = await getUserByEmail("sellerB@masoko.local");
    if (!sellerB) {
      sellerB = await createUser({ name: "Seller B", email: "sellerB@masoko.local", phone: "+254700000002", passwordHash, role: Role.SELLER });
      console.log("Seller B created");
    } else {
      console.log("Seller B already exists");
    }

    let customer = await getUserByEmail("customer@masoko.local");
    if (!customer) {
      customer = await createUser({ name: "Demo Customer", email: "customer@masoko.local", phone: "+254700000003", passwordHash, role: Role.CUSTOMER });
      console.log("Customer created");
    } else {
      console.log("Customer already exists");
    }

    // --- Stores ---
    const storesA = await listAllDocuments<{ sellerId: string }>(COLLECTIONS.stores, [Query.equal("sellerId", sellerA.id)]);
    let storeA = storesA.length > 0 ? storesA[0] : null;
    if (!storeA) {
      storeA = await createStore({ sellerId: sellerA.id, name: "Nairobi Fresh Mart", description: "Fresh produce and groceries", latitude: -1.2864, longitude: 36.8172, address: "CBD, Nairobi" });
      console.log("Store A created");
    } else {
      console.log("Store A already exists");
    }

    const storesB = await listAllDocuments<{ sellerId: string }>(COLLECTIONS.stores, [Query.equal("sellerId", sellerB.id)]);
    let storeB = storesB.length > 0 ? storesB[0] : null;
    if (!storeB) {
      storeB = await createStore({ sellerId: sellerB.id, name: "Westlands Electronics", description: "Phones and accessories", latitude: -1.2674, longitude: 36.812, address: "Westlands, Nairobi" });
      console.log("Store B created");
    } else {
      console.log("Store B already exists");
    }

    // --- Categories ---
    const categoryNames = ["Groceries", "Electronics", "Fashion"];
    const categories: { [key: string]: string } = {};

    for (const name of categoryNames) {
      const existing = await listAllDocuments<{ name: string }>(COLLECTIONS.categories, [
        Query.equal("name", name),
      ]);
      if (existing.length === 0) {
        const category = await createDocument<{ name: string }>(COLLECTIONS.categories, { name });
        categories[name] = category.id;
        console.log(`Category "${name}" created`);
      } else {
        categories[name] = existing[0].id;
        console.log(`Category "${name}" already exists`);
      }
    }

    // --- Products ---
    const products = [
      { sellerId: sellerA.id, storeId: storeA.id, categoryId: categories["Groceries"],   name: "Tomatoes 1kg",    price: 120,  stock: 50, active: true },
      { sellerId: sellerA.id, storeId: storeA.id, categoryId: categories["Groceries"],   name: "Maize Flour 2kg", price: 180,  stock: 30, active: true },
      { sellerId: sellerB.id, storeId: storeB.id, categoryId: categories["Electronics"], name: "USB-C Cable",     price: 850,  stock: 20, active: true },
      { sellerId: sellerB.id, storeId: storeB.id, categoryId: categories["Electronics"], name: "Wireless Earbuds",price: 2500, stock: 10, active: true },
    ];

    for (const productData of products) {
      const existing = await listAllDocuments<{ name: string; sellerId: string }>(COLLECTIONS.products, [
        Query.equal("name", productData.name),
        Query.equal("sellerId", productData.sellerId),
      ]);
      if (existing.length === 0) {
        await createProduct(productData);
        console.log(`Product "${productData.name}" created`);
      } else {
        console.log(`Product "${productData.name}" already exists`);
      }
    }

    // --- Site Config (singleton) ---
    let siteConfig = null;
    try { siteConfig = await getDocument(COLLECTIONS.siteConfig, "default"); } catch {}
    if (!siteConfig) {
      await createDocument<{ marketplacePromoEnabled: boolean }>(
        COLLECTIONS.siteConfig,
        { marketplacePromoEnabled: true },
        "default"
      );
      console.log("Site config created");
    } else {
      console.log("Site config already exists");
    }

    // --- Seller Pricing Config (singleton) ---
    let pricingConfig = null;
    try { pricingConfig = await getDocument(COLLECTIONS.sellerPricingConfig, "default"); } catch {}
    if (!pricingConfig) {
      await createDocument(
        COLLECTIONS.sellerPricingConfig,
        {
          defaultModel: "SUBSCRIPTION",
          subscriptionMonthly: 2500,
          payAsYouGoFlatFee: 50,
          payAsYouGoPercent: 3,
          description: "Sellers pay a monthly subscription or a small fee per order.",
        },
        "default"
      );
      console.log("Seller pricing config created");
    } else {
      console.log("Seller pricing config already exists");
    }

    // --- Marketplace Promos ---
    const promos = [
      { type: "BANNER", title: "Welcome to maSoKo",  subtitle: "Shop from multiple local sellers in one cart", sortOrder: 0, active: true },
      { type: "OFFER",  title: "Fresh deals daily",   subtitle: "New products from trusted sellers",            sortOrder: 1, active: true },
    ];

    for (const promoData of promos) {
      const existing = await listAllDocuments<{ type: string; title: string }>(COLLECTIONS.marketplacePromos, [
        Query.equal("type", promoData.type),
        Query.equal("title", promoData.title),
      ]);
      if (existing.length === 0) {
        await createDocument(COLLECTIONS.marketplacePromos, promoData);
        console.log(`Promo "${promoData.title}" created`);
      } else {
        console.log(`Promo "${promoData.title}" already exists`);
      }
    }

    console.log("\nSeeding completed successfully!");
    console.log("  Admin:    admin@masoko.local    / password123");
    console.log("  Seller A: sellerA@masoko.local  / password123");
    console.log("  Seller B: sellerB@masoko.local  / password123");
    console.log("  Customer: customer@masoko.local / password123");
  } catch (error) {
    console.error("Error seeding Appwrite:", error);
    process.exit(1);
  }
}

seedAppwrite();
