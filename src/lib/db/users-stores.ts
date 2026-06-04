import { Query } from "node-appwrite";
import {
  COLLECTIONS,
  createDocument,
  findOne,
  getDocument,
  listAllDocuments,
  listDocuments,
  updateDocument,
  countDocuments,
  deleteDocument,
} from "./helpers";
import type { Role, Store, User } from "../types";

type UserDoc = Omit<User, "store" | "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
};

export async function getUserById(id: string, withStore = false) {
  const user = await getDocument<UserDoc>(COLLECTIONS.users, id);
  if (!withStore) return user as User;
  const store = await findOne<Store>(COLLECTIONS.stores, [
    Query.equal("sellerId", id),
  ]);
  return { ...user, store } as User;
}

export async function getUserByEmail(email: string) {
  return findOne<UserDoc>(COLLECTIONS.users, [Query.equal("email", email)]);
}

export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
}) {
  return createDocument<UserDoc>(COLLECTIONS.users, data);
}

export async function listUsersByRole(role: Role) {
  return listAllDocuments<UserDoc>(COLLECTIONS.users, [
    Query.equal("role", role),
    Query.orderDesc("$createdAt"),
  ]);
}

export async function getStoreById(id: string) {
  return getDocument<Store>(COLLECTIONS.stores, id);
}

export async function getStoreBySellerId(sellerId: string) {
  return findOne<Store>(COLLECTIONS.stores, [Query.equal("sellerId", sellerId)]);
}

export async function listStores(filters?: { mapOnly?: boolean }) {
  const queries = [Query.orderAsc("name")];
  if (filters?.mapOnly) {
    // Appwrite has no "not null" - filter in JS after fetch
    const stores = await listAllDocuments<Store>(COLLECTIONS.stores, queries);
    return stores.filter((s) => s.latitude != null && s.longitude != null);
  }
  return listAllDocuments<Store>(COLLECTIONS.stores, queries);
}

export async function createStore(data: {
  sellerId: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  imageUrl?: string;
}) {
  return createDocument<Store>(COLLECTIONS.stores, data);
}

export async function updateStore(
  id: string,
  data: Partial<Omit<Store, "id" | "sellerId" | "createdAt" | "updatedAt">>
) {
  return updateDocument<Store>(COLLECTIONS.stores, id, data);
}

export async function getStoreWithProducts(id: string) {
  const store = await getStoreById(id);
  const seller = await getUserById(store.sellerId);
  const { documents: products } = await listDocuments(
    COLLECTIONS.products,
    [Query.equal("storeId", id), Query.equal("active", true), Query.limit(100)]
  );
  return {
    ...store,
    seller: { id: seller.id, name: seller.name },
    products,
  };
}

export async function countProductsByStore(storeId: string) {
  return countDocuments(COLLECTIONS.products, [Query.equal("storeId", storeId)]);
}
