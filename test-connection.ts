import "dotenv/config";
import { getAppwriteClient } from "./src/lib/appwrite/server.ts";
import { Databases, ID } from "node-appwrite";
import { APPWRITE_DATABASE_ID } from "./src/lib/appwrite/config.ts";

async function testConnection() {
  try {
    console.log("Testing Appwrite connection...");
    
    const client = getAppwriteClient();
    const databases = new Databases(client);
    
    // Try to get the database
    try {
      const database = await databases.get(APPWRITE_DATABASE_ID);
      console.log(`✓ Connected to database: ${database.$id} (${database.name})`);
    } catch (dbErr) {
      console.log(`Database "${APPWRITE_DATABASE_ID}" not found: ${dbErr.message}`);
      console.log("Creating database...");
      const database = await databases.create({
        databaseId: ID.unique(),
        name: APPWRITE_DATABASE_ID
        // enabled is optional
      });
      console.log(`✓ Created database: ${database.$id} (${database.name})`);
    }
    
    // Try to list a collection to see if it exists
    try {
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        "users",
        [Databases.Query.limit(1)]
      );
      console.log(`✓ Successfully queried users collection: ${result.total} documents`);
    } catch (collErr) {
      console.log(`Collection "users" not accessible yet: ${collErr.message}`);
      console.log("This is expected if the collection doesn't exist yet.");
    }
    
    console.log("\n✅ Appwrite connection test completed!");
  } catch (error) {
    console.error("❌ Failed to connect to Appwrite:", error);
    process.exit(1);
  }
}

testConnection();