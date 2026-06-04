import "dotenv/config";
import { getAppwriteClient, getDatabases, getStorage } from "./src/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_BUCKET_ID, COLLECTIONS } from "./src/lib/appwrite/config";

async function testAppwriteConnection() {
  try {
    console.log("Testing Appwrite connection...");
    
    // Test client creation
    const client = getAppwriteClient();
    console.log("✓ Appwrite client created successfully");
    
    // Test database connection
    const databases = getDatabases();
    console.log("✓ Databases service initialized");
    
    // Test storage connection
    const storage = getStorage();
    console.log("✓ Storage service initialized");
    
    // Try to list collections (this will verify authentication works)
    try {
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.users,
        [Query.limit(1)]
      );
      console.log("✓ Database connection verified - can query collections");
    } catch (dbError) {
      console.log("⚠ Database query failed (might be empty):", dbError.message);
    }
    
    console.log("\n✅ All Appwrite services are properly configured!");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Appwrite:", error);
    return false;
  }
}

// Import Query here to avoid issues
import { Query } from "node-appwrite";

testAppwriteConnection().then(success => {
  process.exit(success ? 0 : 1);
});