import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { StorageProvider } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export class LocalStorageProvider implements StorageProvider {
  async upload(file: File, folder: "products" | "stores") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${randomBytes(16).toString("hex")}${ext}`;
    const dir = path.join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, filename);
    await writeFile(fullPath, buffer);
    const relativePath = `/uploads/${folder}/${filename}`;
    return { path: relativePath, url: relativePath };
  }

  async delete(filePath: string) {
    const normalized = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), "public", normalized);
    try {
      await unlink(fullPath);
    } catch {
      // ignore missing files
    }
  }

  getUrl(filePath: string) {
    return filePath.startsWith("/") ? filePath : `/${filePath}`;
  }
}

export const storage = new LocalStorageProvider();
