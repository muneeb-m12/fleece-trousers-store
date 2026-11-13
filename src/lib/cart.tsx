// Shared cart state: React context over a tiny external store (read via
// useSyncExternalStore), persisted to localStorage. The external store is
// what makes the localStorage read hydration-safe: the server renders the
// empty cart, the client re-renders with the stored cart after hydration.
// All cart UI (header badge, drawer, cart page, checkout) reads from here.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import { getProductById, type Size } from "@/lib/products";

export type CartItem = {
  productId: string;
  size: Size;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  justAdded: boolean;
  add: (productId: string, size: Size, qty?: number) => void;
  remove: (productId: string, size: Size) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fleece-cart-v1";
const EMPTY: CartItem[] = [];

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as CartItem).productId === "string" &&
        typeof (i as CartItem).size === "string" &&
        typeof (i as CartItem).qty === "number",
    );
  } catch {
    return [];
  }
}

// --- external store -------------------------------------------------------
let cachedItems: CartItem[] | null = null;
const listeners = new Set<() => void>();

function getItemsSnapshot(): CartItem[] {
  if (cachedItems === null) cachedItems = loadInitial();
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribeItems(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function updateItems(updater: (prev: CartItem[]) => CartItem[]): void {
  const next = updater(getItemsSnapshot());
  cachedItems = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable — cart still works for the session
  }
  for (const listener of listeners) listener();
}
// --------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeItems,
    getItemsSnapshot,
    getServerSnapshot,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const add = useCallback((productId: string, size: Size, qty = 1) => {
    updateItems((prev) => {
      const found = prev.find(
        (i) => i.productId === productId && i.size === size,
      );
      if (found) {
        return prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, qty: i.qty + qty }
            : i,
        );
      }
      return [...prev, { productId, size, qty }];
    });
    setJustAdded(true);
    setDrawerOpen(true);
  }, []);

  const remove = useCallback((productId: string, size: Size) => {
    updateItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size)),
    );
  }, []);

  const setQty = useCallback((productId: string, size: Size, qty: number) => {
    updateItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.size === size))
        : prev.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, qty }
              : i,
          ),
    );
  }, []);

  const clear = useCallback(() => updateItems(() => []), []);
  const openDrawer = useCallback(() => {
    setJustAdded(false);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setJustAdded(false);
  }, []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const product = getProductById(item.productId);
      if (!product) continue;
      count += item.qty;
      subtotal += product.price * item.qty;
    }
    return { count, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      drawerOpen,
      justAdded,
      add,
      remove,
      setQty,
      clear,
      openDrawer,
      closeDrawer,
    }),
    [items, count, subtotal, drawerOpen, justAdded, add, remove, setQty, clear, openDrawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
