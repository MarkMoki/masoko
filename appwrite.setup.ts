import "dotenv/config";
import { getAppwriteClient } from "./src/lib/appwrite/server.ts";
import { Databases, ID } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTIONS } from "./src/lib/appwrite/config.ts";

async function setupAppwrite() {
  try {
    console.log("Setting up Appwrite...");

    const client = getAppwriteClient();
    const databases = new Databases(client);

    // Check if database exists
    let database;
    try {
      database = await databases.get({ databaseId: APPWRITE_DATABASE_ID });
      console.log(`Database "${APPWRITE_DATABASE_ID}" already exists`);
    } catch (err) {
      // Database does not exist, create it
      database = await databases.create(
        ID.unique(),
        APPWRITE_DATABASE_ID,
        APPWRITE_DATABASE_ID
      );
      console.log(`Database "${APPWRITE_DATABASE_ID}" created`);
    }

    // For each collection, check if it exists and create if not
    for (const [collectionName, collectionId] of Object.entries(COLLECTIONS)) {
      try {
        await databases.getCollection(APPWRITE_DATABASE_ID, collectionId);
        console.log(`Collection "${collectionName}" already exists`);
      } catch (err) {
        // Collection does not exist, create it with minimal params
        try {
          await databases.createCollection({
            databaseId: APPWRITE_DATABASE_ID,
            collectionId: ID.unique(),
            name: collectionName
          });
          console.log(`Collection "${collectionName}" created with minimal params`);
        } catch (minimalErr) {
          console.error(`Failed to create collection "${collectionName}" with minimal params:`, minimalErr);
          throw minimalErr;
        }
      }
    }

    console.log("Appwrite setup completed successfully!");
  } catch (error) {
    console.error("Error setting up Appwrite:", error);
    process.exit(1);
  }
}

setupAppwrite();