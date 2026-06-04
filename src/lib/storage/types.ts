export interface StorageProvider {
  upload(
    file: File,
    folder: "products" | "stores"
  ): Promise<{ path: string; url: string }>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
