import "dotenv/config";
import { getAppwriteClient } from "./src/lib/appwrite/server.ts";
import { Databases, ID } from "node-appwrite";

async function listCollections() {
  try {
    console.log("Listing collections...");
    
    const client = getAppwriteClient();
    const databases = new Databases(client);
    
    // Use the database ID we know from the test
    const databaseId = "6a21357a0017beda5c8e";
    
    try {
      const database = await databases.get(databaseId);
      console.log(`Database: ${database.$id} (${database.name})`);
    } catch (err) {
      console.log(`Error getting database: ${err.message}`);
      return;
    }
    
    // List collections
    try {
      const collections = await databases.listCollections(databaseId);
      console.log(`Found ${collections.collections.length} collections:`);
      for (const coll of collections.collections) {
        console.log(`  - ${coll.$id}: ${coll.name}`);
      }
    } catch (err) {
      console.log(`Error listing collections: ${err.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listCollections();