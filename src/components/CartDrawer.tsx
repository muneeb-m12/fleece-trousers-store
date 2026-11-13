// Cart drawer — slides in from the right over a dimmed backdrop, like the
// original. Heading "Your cart" + count badge, item rows, bold total, and
// the two full-width pills: "View cart" and "Checkout".

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR, getProductById } from "@/lib/products";

export default function CartDrawer() {
  const { items, count, subtotal, drawerOpen, justAdded, closeDrawer, remove, setQty } =
    useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      className={`fixed inset-0 z-[70] ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Your cart"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-semibold">
            Your cart
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b98a4a] text-[13px] font-bold text-white">
              {count}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none transition hover:bg-black/5"
          >
            ×
          </button>
        </div>

        {justAdded && count > 0 && (
          <p className="border-b border-black/10 px-6 py-3 text-sm text-black/60">
            Added {count} item{count === 1 ? "" : "s"} to your cart.
          </p>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-lg font-medium">Your shopping bag is empty.</p>
            <Link
              href="/collections/all"
              onClick={closeDrawer}
              className="rounded-full bg-black px-7 py-3 text-sm font-semibold text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 border-b border-black/10 py-4 last:border-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eeeeee]">
                      <Image
                        src={product.images[0]}
                        alt={`${product.name} — ${product.colour}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold leading-snug">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-sm text-black/50">
                            {product.colour} / {item.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.productId, item.size)}
                          aria-label={`Remove ${product.name} ${product.colour}`}
                          className="text-lg leading-none text-black/40 transition hover:text-black"
                        >
                          ×
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="flex items-center gap-3 text-sm">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(item.productId, item.size, item.qty - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-base leading-none"
                          >
                            −
                          </button>
                          <span>Qty {item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty(item.productId, item.size, item.qty + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-base leading-none"
                          >
                            +
                          </button>
                        </span>
                        <span className="text-sm font-semibold">
                          {formatPKR(product.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-black/10 px-6 py-5">
              <p className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPKR(subtotal)}</span>
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="rounded-full border border-black py-3 text-center text-sm font-semibold"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="rounded-full bg-black py-3 text-center text-sm font-semibold text-white"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
