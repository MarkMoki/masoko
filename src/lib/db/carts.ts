import { Query } from "node-appwrite";
import {
  COLLECTIONS,
  createDocument,
  findOne,
  getDocument,
  listDocuments,
  updateDocument,
  deleteDocument,
  deleteMany,
} from "./helpers";
import { enrichProduct, getProductById } from "./products";
import type { Cart, CartItem } from "../types";

type CartDoc = Omit<Cart, "items">;
type CartItemDoc = Omit<CartItem, "product">;

export async function getCartByCustomerId(customerId: string) {
  const cart = await findOne<CartDoc>(COLLECTIONS.carts, [
    Query.equal("customerId", customerId),
  ]);
  if (!cart) return null;
  const items = await listCartItems(cart.id);
  return { ...cart, items };
}

export async function createCart(customerId: string) {
  return createDocument<CartDoc>(COLLECTIONS.carts, { customerId });
}

export async function getOrCreateCart(customerId: string) {
  const existing = await getCartByCustomerId(customerId);
  if (existing) return existing;
  const cart = await createCart(customerId);
  return { ...cart, items: [] };
}

async function listCartItems(cartId: string) {
  const { documents } = await listDocuments<CartItemDoc>(
    COLLECTIONS.cartItems,
    [Query.equal("cartId", cartId)]
  );
  const enriched = await Promise.all(
    documents.map(async (item) => {
      const product = await getProductById(item.productId, true);
      return { ...item, product };
    })
  );
  return enriched;
}

export async function upsertCartItem(
  cartId: string,
  productId: string,
  quantity: number
) {
  const existing = await findOne<CartItemDoc>(COLLECTIONS.cartItems, [
    Query.equal("cartId", cartId),
    Query.equal("productId", productId),
  ]);
  if (existing) {
    return updateDocument<CartItemDoc>(COLLECTIONS.cartItems, existing.id, {
      quantity: existing.quantity + quantity,
    });
  }
  return createDocument<CartItemDoc>(COLLECTIONS.cartItems, {
    cartId,
    productId,
    quantity,
  });
}

export async function findCartItem(itemId: string, customerId: string) {
  const item = await getDocument<CartItemDoc>(COLLECTIONS.cartItems, itemId);
  const cart = await getDocument<CartDoc>(COLLECTIONS.carts, item.cartId);
  if (cart.customerId !== customerId) return null;
  return item;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  return updateDocument<CartItemDoc>(COLLECTIONS.cartItems, itemId, {
    quantity,
  });
}

export async function deleteCartItem(itemId: string) {
  await deleteDocument(COLLECTIONS.cartItems, itemId);
}

export async function clearCartItems(cartId: string) {
  return deleteMany(COLLECTIONS.cartItems, [Query.equal("cartId", cartId)]);
}

export async function getCartItemCount(customerId: string) {
  const cart = await findOne<CartDoc>(COLLECTIONS.carts, [
    Query.equal("customerId", customerId),
  ]);
  if (!cart) return 0;
  const { documents } = await listDocuments<CartItemDoc>(
    COLLECTIONS.cartItems,
    [Query.equal("cartId", cart.id), Query.limit(100)]
  );
  return documents.reduce((sum, i) => sum + i.quantity, 0);
}
