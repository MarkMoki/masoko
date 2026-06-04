import "dotenv/config";
import { getAppwriteClient } from "./src/lib/appwrite/server.ts";
import { Databases, ID } from "node-appwrite";

async function testCreateCollection() {
  try {
    console.log("Testing collection creation...");
    
    const client = getAppwriteClient();
    const databases = new Databases(client);
    
    const databaseId = "6a21357a0017beda5c8e"; // From test-connection.ts
    
    // Try to create a test collection with minimal parameters
    try {
      const collection = await databases.createCollection({
        databaseId: databaseId,
        collectionId: ID.unique(),
        name: "test-collection"
      });
      console.log(`✓ Collection created: ${collection.$id} (${collection.name})`);
    } catch (createErr) {
      console.log(`✗ Error creating collection: ${createErr.message}`);
      console.log(`Error code: ${createErr.code}`);
      console.log(`Error type: ${createErr.type}`);
      
      // Try with all parameters explicitly set
      try {
        const collection = await databases.createCollection({
          databaseId: databaseId,
          collectionId: ID.unique(),
          name: "test-collection-2",
          permissions: [], // empty array
          documentSecurity: false,
          enabled: true,
          attributes: [],
          indexes: []
        });
        console.log(`✓ Collection created with all params: ${collection.$id} (${collection.name})`);
      } catch (createErr2) {
        console.log(`✗ Error creating collection with all params: ${createErr2.message}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testCreateCollection();