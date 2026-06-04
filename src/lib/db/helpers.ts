import { ID, Query, type Models } from "node-appwrite";
import { getDatabases } from "../appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTIONS } from "../appwrite/config";

export { ID, Query, APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS };

export type AppwriteDoc = Models.Document;

export function parseDoc<T extends Record<string, unknown>>(
  doc: AppwriteDoc
): T & { id: string; createdAt: string; updatedAt: string } {
  const { $id, $createdAt, $updatedAt, ...rest } = doc;
  return {
    id: $id,
    createdAt: $createdAt,
    updatedAt: $updatedAt,
    ...rest,
  } as T & { id: string; createdAt: string; updatedAt: string };
}

export async function getDocument<T extends Record<string, unknown>>(
  collectionId: string,
  documentId: string
) {
  const databases = getDatabases();
  const doc = await databases.getDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId
  );
  return parseDoc<T>(doc);
}

export async function createDocument<T extends Record<string, unknown>>(
  collectionId: string,
  data: Record<string, unknown>,
  documentId?: string
) {
  const databases = getDatabases();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId ?? ID.unique(),
    data
  );
  return parseDoc<T>(doc);
}

export async function updateDocument<T extends Record<string, unknown>>(
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
) {
  const databases = getDatabases();
  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId,
    data
  );
  return parseDoc<T>(doc);
}

export async function deleteDocument(
  collectionId: string,
  documentId: string
) {
  const databases = getDatabases();
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId
  );
}

export async function listDocuments<T extends Record<string, unknown>>(
  collectionId: string,
  queries: string[] = []
) {
  const databases = getDatabases();
  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    collectionId,
    queries
  );
  return {
    total: result.total,
    documents: result.documents.map((d) => parseDoc<T>(d)),
  };
}

export async function listAllDocuments<T extends Record<string, unknown>>(
  collectionId: string,
  queries: string[] = []
) {
  const all: (T & { id: string; createdAt: string; updatedAt: string })[] = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { documents, total } = await listDocuments<T>(collectionId, [
      ...queries,
      Query.limit(pageSize),
      Query.offset(offset),
    ]);
    all.push(...documents);
    offset += documents.length;
    if (offset >= total || documents.length === 0) break;
  }

  return all;
}

export async function findOne<T extends Record<string, unknown>>(
  collectionId: string,
  queries: string[]
) {
  const { documents } = await listDocuments<T>(collectionId, [
    ...queries,
    Query.limit(1),
  ]);
  return documents[0] ?? null;
}

export async function countDocuments(
  collectionId: string,
  queries: string[] = []
) {
  const { total } = await listDocuments(collectionId, [
    ...queries,
    Query.limit(1),
  ]);
  return total;
}

export async function deleteMany(
  collectionId: string,
  queries: string[]
) {
  const docs = await listAllDocuments(collectionId, queries);
  await Promise.all(
    docs.map((d) => deleteDocument(collectionId, d.id))
  );
  return docs.length;
}
