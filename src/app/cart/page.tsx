// Cart page — large "Cart" heading, "N items" right, rows with rounded
// thumbnail, name, variant, price, red "Remove", right-aligned QTY stepper;
// right-aligned Subtotal + note; "Update" and "Checkout" pills.
// Empty state: "Your shopping bag is empty." + "Explore Collection".

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR, getProductById } from "@/lib/products";

export default function CartPage() {
  const { items, count, subtotal, remove, setQty } = useCart();
  const [updated, setUpdated] = useState(false);

  const handleUpdate = () => {
    setUpdated(true);
    window.setTimeout(() => setUpdated(false), 2000);
  };

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-10 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-6xl font-bold uppercase tracking-tight sm:text-7xl">
            Cart
          </h1>
          <p className="pb-2 text-sm text-black/50">
            {count} item{count === 1 ? "" : "s"}
          </p>
        </div>
        <hr className="mt-6 border-black/15" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <p className="text-xl font-medium">Your shopping bag is empty.</p>
            <Link
              href="/collections/all"
              className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-2">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 border-b border-black/10 py-6 sm:gap-6"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#eeeeee] sm:h-28 sm:w-28"
                    >
                      <Image
                        src={product.images[0]}
                        alt={`${product.name} — ${product.colour}`}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-base font-semibold leading-snug hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-sm text-black/50">
                            {product.colour} / {item.size}
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {formatPKR(product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.productId, item.size)}
                          className="text-sm text-red-600 underline underline-offset-2 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-auto flex justify-end pt-3">
                        <span className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
                            Qty
                          </span>
                          <span className="flex items-center rounded-full border border-black/25">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(item.productId, item.size, item.qty - 1)}
                              className="flex h-9 w-9 items-center justify-center text-base leading-none"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm font-semibold">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setQty(item.productId, item.size, item.qty + 1)}
                              className="flex h-9 w-9 items-center justify-center text-base leading-none"
                            >
                              +
                            </button>
                          </span>
                          <span className="w-24 text-right text-sm font-semibold">
                            {formatPKR(product.price * item.qty)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col items-end gap-2 text-right">
              <p className="text-lg font-bold">
                Subtotal&nbsp;&nbsp;{formatPKR(subtotal)}
              </p>
              <p className="text-sm text-black/50">
                Delivery across Pakistan · Cash on delivery · 7-day exchange
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="rounded-full bg-black/10 px-8 py-3.5 text-sm font-semibold transition hover:bg-black/15"
                >
                  {updated ? "Updated ✓" : "Update"}
                </button>
                <Link
                  href="/checkout"
                  className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
