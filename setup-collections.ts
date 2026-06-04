import "dotenv/config";
import { getAppwriteClient } from "./src/lib/appwrite/server.ts";
import { Databases, ID } from "node-appwrite";
import { COLLECTIONS } from "./src/lib/appwrite/config.ts";

async function setupCollections() {
  try {
    console.log("Setting up Appwrite collections...");
    
    const client = getAppwriteClient();
    const databases = new Databases(client);
    
    // Use the database ID we know from the test
    const databaseId = "6a21357a0017beda5c8e";
    
    // Verify database exists
    try {
      const database = await databases.get(databaseId);
      console.log(`✓ Using database: ${database.$id} (${database.name})`);
    } catch (err) {
      console.log(`✗ Error getting database: ${err.message}`);
      return;
    }
    
    // Create each collection if it doesn't exist
    for (const [collectionName, collectionId] of Object.entries(COLLECTIONS)) {
      try {
        // Check if collection already exists
        await databases.getCollection(databaseId, collectionId);
        console.log(`✓ Collection "${collectionName}" already exists (ID: ${collectionId})`);
      } catch (err) {
        // Collection does not exist, create it
        try {
          const collection = await databases.createCollection({
            databaseId: databaseId,
            collectionId: ID.unique(), // Generate new ID for the collection
            name: collectionName
            // Using defaults for other parameters:
            // permissions: [] (empty array - no role-based access)
            // documentSecurity: false
            // enabled: true
            // attributes: [] (empty array)
            // indexes: [] (empty array)
          });
          console.log(`✓ Created collection "${collectionName}" (ID: ${collection.$id})`);
        } catch (createErr) {
          console.log(`✗ Failed to create collection "${collectionName}": ${createErr.message}`);
        }
      }
    }
    
    console.log("\n✅ Collection setup completed!");
  } catch (error) {
    console.error("Error setting up collections:", error);
  }
}

setupCollections();