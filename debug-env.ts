import "dotenv/config";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "./src/lib/appwrite/config";

console.log("Environment variables:");
console.log("NEXT_PUBLIC_APPWRITE_ENDPOINT:", JSON.stringify(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT));
console.log("NEXT_PUBLIC_APPWRITE_PROJECT_ID:", JSON.stringify(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID));
console.log("APPWRITE_API_KEY:", process.env.APPWRITE_API_KEY ? "SET" : "NOT SET");
console.log("APPWRITE_API_KEY length:", process.env.APPWRITE_API_KEY?.length || 0);

console.log("\nExported config values:");
console.log("APPWRITE_ENDPOINT:", JSON.stringify(APPWRITE_ENDPOINT));
console.log("APPWRITE_PROJECT_ID:", JSON.stringify(APPWRITE_PROJECT_ID));