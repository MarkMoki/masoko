import "dotenv/config";
import { createUser, getUserByEmail } from "./src/lib/db/users-stores";
import { createStore } from "./src/lib/db/users-stores";
import { createProduct } from "./src/lib/db/products";
import { createDocument, getDocument, listAllDocuments, Query } from "./src/lib/db/helpers";
import { COLLECTIONS } from "./src/lib/appwrite/config";
import bcrypt from "bcryptjs";
import { Role } from "./src/lib/types";

async function seedAppwrite() {
  try {
    console.log("Seeding Appwrite database...");

    const passwordHash = await bcrypt.hash("password123", 12);

    // Create Admin User
    let admin = await getUserByEmail("admin@masoko.local");
    if (!admin) {
      admin = await createUser({
        name: "Admin User",
        email: "admin@masoko.local",
        phone: "+254700000000",
        passwordHash,
        role: Role.ADMIN,
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Create Seller A
    let sellerA = await getUserByEmail("sellerA@masoko.local");
    if (!sellerA) {
      sellerA = await createUser({
        name: "Seller A",
        email: "sellerA@masoko.local",
        phone: "+254700000001",
        passwordHash,
        role: Role.SELLER,
      });
      console.log("Seller A created");
    } else {
      console.log("Seller A already exists");
    }

    // Create Seller B
    let sellerB = await getUserByEmail("sellerB@masoko.local");
    if (!sellerB) {
      sellerB = await createUser({
        name: "Seller B",
        email: "sellerB@masoko.local",
        phone: "+254700000002",
        passwordHash,
        role: Role.SELLER,
      });
      console.log("Seller B created");
    } else {
      console.log("Seller B already exists");
    }

    // Create Customer
    let customer = await getUserByEmail("customer@masoko.local");
    if (!customer) {
      customer = await createUser({
        name: "Demo Customer",
        email: "customer@masoko.local",
        phone: "+254700000003",
        passwordHash,
        role: Role.CUSTOMER,
      });
      console.log("Customer created");
    } else {
      console.log("Customer already exists");
    }

    // Create Store for Seller A
    let storeA = await getDocument(COLLECTIONS.stores, sellerA.id); // Assuming storeId is sellerId
    if (!storeA) {
      storeA = await createStore({
        sellerId: sellerA.id,
        name: "Nairobi Fresh Mart",
        description: "Fresh produce and groceries",
        latitude: -1.2864,
        longitude: 36.8172,
        address: "CBD, Nairobi",
      });
      console.log("Store A created");
    } else {
      console.log("Store A already exists");
    }

    // Create Store for Seller B
    let storeB = await getDocument(COLLECTIONS.stores, sellerB.id);
    if (!storeB) {
      storeB = await createStore({
        sellerId: sellerB.id,
        name: "Westlands Electronics",
        description: "Phones and accessories",
        latitude: -1.2674,
        longitude: 36.812,
        address: "Westlands, Nairobi",
      });
      console.log("Store B created");
    } else {
      console.log("Store B already exists");
    }

    // Create Categories
    const categoryNames = ["Groceries", "Electronics", "Fashion"];
    const categories: { [key: string]: string } = {}; // name -> id

    for (const name of categoryNames) {
      // Check if category exists by name
      const existing = await listAllDocuments<{ name: string }>(COLLECTIONS.categories, [
        Query.equal("name", name)
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

    // Create Products
    const products = [
      {
        sellerId: sellerA.id,
        storeId: storeA.id,
        categoryId: categories["Groceries"],
        name: "Tomatoes 1kg",
        price: 120,
        stock: 50,
        active: true,
      },
      {
        sellerId: sellerA.id,
        storeId: storeA.id,
        categoryId: categories["Groceries"],
        name: "Maize Flour 2kg",
        price: 180,
        stock: 30,
        active: true,
      },
      {
        sellerId: sellerB.id,
        storeId: storeB.id,
        categoryId: categories["Electronics"],
        name: "USB-C Cable",
        price: 850,
        stock: 20,
        active: true,
      },
      {
        sellerId: sellerB.id,
        storeId: storeB.id,
        categoryId: categories["Electronics"],
        name: "Wireless Earbuds",
        price: 2500,
        stock: 10,
        active: true,
      },
    ];

    for (const productData of products) {
      // Check if product already exists by name and sellerId (assuming unique together)
      const existing = await listAllDocuments<{ name: string; sellerId: string }>(COLLECTIONS.products, [
        Query.equal("name", productData.name),
        Query.equal("sellerId", productData.sellerId)
      ]);
      if (existing.length === 0) {
        await createProduct(productData);
        console.log(`Product "${productData.name}" created`);
      } else {
        console.log(`Product "${productData.name}" already exists`);
      }
    }

    // Create Site Config
    let siteConfig = await getDocument(COLLECTIONS.siteConfig, "default");
    if (!siteConfig) {
      siteConfig = await createDocument<{ marketplacePromoEnabled: boolean }>(
        COLLECTIONS.siteConfig,
        { marketplacePromoEnabled: true },
        "default"
      );
      console.log("Site config created");
    } else {
      console.log("Site config already exists");
    }

    // Create Seller Pricing Config
    let pricingConfig = await getDocument(COLLECTIONS.sellerPricingConfig, "default");
    if (!pricingConfig) {
      pricingConfig = await createDocument<
        Omit<typeof pricingConfig, "$id" | "$createdAt" | "$updatedAt">
      >(
        COLLECTIONS.sellerPricingConfig,
        {
          id: "default",
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

    // Create Marketplace Promos
    const promos = [
      {
        type: "BANNER",
        title: "Welcome to maSoKo",
        subtitle: "Shop from multiple local sellers in one cart",
        sortOrder: 0,
        active: true,
      },
      {
        type: "OFFER",
        title: "Fresh deals daily",
        subtitle: "New products from trusted sellers",
        sortOrder: 1,
        active: true,
      },
    ];

    for (const promoData of promos) {
      const existing = await listAllDocuments<{ type: string; title: string }>(COLLECTIONS.marketplacePromos, [
        Query.equal("type", promoData.type),
        Query.equal("title", promoData.title)
      ]);
      if (existing.length === 0) {
        await createDocument<typeof promoData>(COLLECTIONS.marketplacePromos, promoData);
        console.log(`Promo "${promoData.title}" created`);
      } else {
        console.log(`Promo "${promoData.title}" already exists`);
      }
    }

    console.log("Seeding completed successfully!");
    console.log("  Admin:    admin@masoko.local / password123");
    console.log("  Seller A: sellerA@masoko.local / password123");
    console.log("  Seller B: sellerB@masoko.local / password123");
    console.log("  Customer: customer@masoko.local / password123");
  } catch (error) {
    console.error("Error seeding Appwrite:", error);
    process.exit(1);
  }
}

seedAppwrite();