import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { getFileViewUrl, getStorage } from "../appwrite/server";
import { APPWRITE_BUCKET_ID } from "../appwrite/config";
import type { StorageProvider } from "./types";

export class AppwriteStorageProvider implements StorageProvider {
  private bucketId = APPWRITE_BUCKET_ID;

  async upload(file: File, folder: "products" | "stores") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : ".jpg";
    const filename = `${folder}/${ID.unique()}${ext}`;

    const storage = getStorage();
    const created = await storage.createFile(
      this.bucketId,
      ID.unique(),
      InputFile.fromBuffer(buffer, filename)
    );

    const url = getFileViewUrl(created.$id);
    return { path: created.$id, url };
  }

  async delete(fileRef: string) {
    const fileId = fileRef.startsWith("http")
      ? fileRef.split("/files/")[1]?.split("/")[0]
      : fileRef.replace(/^appwrite:\/\//, "");
    if (!fileId) return;
    try {
      const storage = getStorage();
      await storage.deleteFile(this.bucketId, fileId);
    } catch {
      // ignore missing files
    }
  }

  getUrl(fileRef: string) {
    if (fileRef.startsWith("http")) return fileRef;
    if (fileRef.startsWith("/uploads")) return fileRef;
    return getFileViewUrl(fileRef.replace(/^appwrite:\/\//, ""));
  }
}

export const storage = new AppwriteStorageProvider();
