import "dotenv/config";
import { Client, Databases } from "node-appwrite";
import { COLLECTIONS } from "./src/lib/appwrite/config";
import { listAllDocuments } from "./src/lib/db/helpers";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "masoko";

async function clearCollection(collectionId: string) {
  console.log(`  Clearing collection: ${collectionId}...`);
  const documents = await listAllDocuments<{ id: string }>(collectionId as any, []);
  
  for (const doc of documents) {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, doc.id);
    } catch (e: any) {
      console.warn(`    Failed to delete ${doc.id}:`, e?.message || e);
    }
  }
  console.log(`    Deleted ${documents.length} documents`);
}

async function clearDatabase() {
  try {
    console.log("\n=== Clearing Appwrite database ===\n");
    
    // Delete in reverse dependency order
    const deleteOrder = [
      COLLECTIONS.analytics,
      COLLECTIONS.reviews,
      COLLECTIONS.wishlistItems,
      COLLECTIONS.wishlists,
      COLLECTIONS.sellerOrderItems,
      COLLECTIONS.payments,
      COLLECTIONS.sellerOrders,
      COLLECTIONS.masterOrders,
      COLLECTIONS.marketplacePromos,
      COLLECTIONS.sellerPlans,
      COLLECTIONS.paymentMethods,
      COLLECTIONS.notifications,
      COLLECTIONS.products,
      COLLECTIONS.carts,
      COLLECTIONS.cartItems,
      COLLECTIONS.categories,
      COLLECTIONS.stores,
      COLLECTIONS.users,
    ];

    for (const collectionId of deleteOrder) {
      await clearCollection(collectionId);
    }

    // Reset site config and pricing config
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.siteConfig, "default");
      console.log("  Cleared site config");
    } catch {}
    
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.sellerPricingConfig, "default");
      console.log("  Cleared seller pricing config");
    } catch {}

    console.log("\n=== Database cleared successfully! ===\n");
    process.exit(0);
  } catch (error) {
    console.error("\nError clearing Appwrite:", error);
    process.exit(1);
  }
}

clearDatabase();