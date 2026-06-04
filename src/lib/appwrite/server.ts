import { Client, Databases, Storage } from "node-appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
} from "./config";

function requireEnv(name: string, value: string) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

let client: Client | null = null;

export function getAppwriteClient() {
  if (!client) {
    client = new Client()
      .setEndpoint(requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", APPWRITE_ENDPOINT))
      .setProject(requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", APPWRITE_PROJECT_ID))
      .setKey(requireEnv("APPWRITE_API_KEY", process.env.APPWRITE_API_KEY ?? ""));
  }
  return client;
}

export function getDatabases() {
  return new Databases(getAppwriteClient());
}

export function getStorage() {
  return new Storage(getAppwriteClient());
}

export function getFileViewUrl(fileId: string) {
  const endpoint = APPWRITE_ENDPOINT.replace(/\/$/, "");
  const project = APPWRITE_PROJECT_ID;
  const bucket = process.env.APPWRITE_BUCKET_ID ?? "masoko-uploads";
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
}
