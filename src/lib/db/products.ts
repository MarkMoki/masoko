import { Query } from "node-appwrite";
import {
  COLLECTIONS,
  createDocument,
  findOne,
  getDocument,
  listAllDocuments,
  listDocuments,
  updateDocument,
  deleteDocument,
  countDocuments,
} from "./helpers";
import { getUserById } from "./users-stores";
import type { Product, Category } from "../types";

type ProductDoc = Omit<Product, "seller" | "store" | "category">;

export async function enrichProduct(product: ProductDoc): Promise<Product> {
  const [seller, store, category] = await Promise.all([
    getUserById(product.sellerId).catch(() => null),
    product.storeId
      ? getDocument<{ id: string; name: string }>(
          COLLECTIONS.stores,
          product.storeId
        ).catch(() => null)
      : null,
    product.categoryId
      ? getDocument<Category>(COLLECTIONS.categories, product.categoryId).catch(
          () => null
        )
      : null,
  ]);
  return {
    ...product,
    seller: seller ? { id: seller.id, name: seller.name } : undefined,
    store: store ? { id: store.id, name: store.name } : null,
    category,
  };
}

export async function enrichProducts(products: ProductDoc[]) {
  return Promise.all(products.map(enrichProduct));
}

export async function getProductById(id: string, enrich = true) {
  const product = await getDocument<ProductDoc>(COLLECTIONS.products, id);
  return enrich ? enrichProduct(product) : product;
}

export async function findProduct(where: {
  id?: string;
  active?: boolean;
}) {
  const queries: string[] = [];
  if (where.id) queries.push(Query.equal("$id", where.id));
  if (where.active !== undefined)
    queries.push(Query.equal("active", where.active));
  const product = await findOne<ProductDoc>(COLLECTIONS.products, queries);
  return product;
}

export async function listProducts(options: {
  active?: boolean;
  q?: string;
  categoryId?: string;
  skip?: number;
  limit?: number;
  sellerId?: string;
}) {
  const queries: string[] = [Query.orderDesc("$createdAt")];
  if (options.active !== undefined)
    queries.push(Query.equal("active", options.active));
  if (options.categoryId)
    queries.push(Query.equal("categoryId", options.categoryId));
  if (options.sellerId)
    queries.push(Query.equal("sellerId", options.sellerId));
  if (options.q) queries.push(Query.search("name", options.q));
  if (options.limit) queries.push(Query.limit(options.limit));
  if (options.skip) queries.push(Query.offset(options.skip));

  const { documents, total } = await listDocuments<ProductDoc>(
    COLLECTIONS.products,
    queries
  );

  // Fallback text filter if search index missing
  let filtered = documents;
  if (options.q && documents.length === 0) {
    const all = await listAllDocuments<ProductDoc>(COLLECTIONS.products, [
      ...(options.active !== undefined
        ? [Query.equal("active", options.active)]
        : []),
    ]);
    const q = options.q.toLowerCase();
    filtered = all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false)
    );
    const skip = options.skip ?? 0;
    const limit = options.limit ?? filtered.length;
    return {
      products: filtered.slice(skip, skip + limit),
      total: filtered.length,
    };
  }

  return { products: filtered, total };
}

export async function countProducts(filters: {
  active?: boolean;
  q?: string;
  categoryId?: string;
}) {
  const { total } = await listProducts({ ...filters, limit: 1 });
  return total;
}

export async function createProduct(data: {
  sellerId: string;
  storeId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active?: boolean;
}) {
  return createDocument<ProductDoc>(COLLECTIONS.products, {
    active: true,
    ...data,
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<ProductDoc, "id" | "createdAt" | "updatedAt">>
) {
  return updateDocument<ProductDoc>(COLLECTIONS.products, id, data);
}

export async function decrementProductStock(id: string, quantity: number) {
  const product = await getDocument<ProductDoc>(COLLECTIONS.products, id);
  return updateProduct(id, { stock: product.stock - quantity });
}

export async function deleteProduct(id: string) {
  await deleteDocument(COLLECTIONS.products, id);
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const products = await listAllDocuments<ProductDoc>(COLLECTIONS.products, [
    Query.equal("active", true),
  ]);
  const idSet = new Set(ids);
  return products.filter((p) => idSet.has(p.id));
}
