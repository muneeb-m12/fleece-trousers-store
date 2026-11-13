// Purchase panel (right column of the product page): colour swatches,
// size buttons, quantity stepper, Add to cart, wishlist heart, trust line.

"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR, SIZES, type Product, type Size } from "@/lib/products";
import { TRUST_LINE } from "@/lib/store";

export default function PurchasePanel({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!size) return;
    add(product.id, size, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">
            {product.name}
          </h1>
          <p className="mt-1 text-lg text-black/60">{product.colour}</p>
        </div>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => setWishlisted((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 transition hover:border-black"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#000" : "none"}
            stroke="#000"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 21s-7.5-4.6-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.6l1 1.4 1-1.4C14 6.2 15.5 5 17.5 5 21 5 23 8.5 21.5 12c-2 4.4-9.5 9-9.5 9Z" />
          </svg>
        </button>
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {product.compareAt && (
          <span className="mr-3 text-lg font-normal text-black/40 line-through">
            {formatPKR(product.compareAt)}
          </span>
        )}
        {formatPKR(product.price)}
      </p>
      {product.badge && (
        <p className="mt-2 inline-block rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {product.badge} — save {formatPKR(product.compareAt! - product.price)}
        </p>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium">
          Colour: <span className="text-black/60">{product.colour}</span>
        </p>
        <div className="mt-2 flex gap-2">
          {product.swatches.map((hex) => (
            <span
              key={hex}
              className="h-8 w-8 rounded-md border border-black/20"
              style={{ backgroundColor: hex }}
              title={product.colour}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium">
          Size:{" "}
          <span className="text-black/60">{size ?? "Select a size"}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={`h-11 min-w-12 rounded-full border px-4 text-sm font-semibold transition ${
                size === s
                  ? "border-black bg-black text-white"
                  : "border-black/25 bg-white hover:border-black"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded-full border border-black/25">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-lg leading-none"
          >
            −
          </button>
          <span className="w-8 text-center text-base font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-lg leading-none"
          >
            +
          </button>
        </div>
        <p className="text-sm text-black/50">
          {formatPKR(product.price * qty)} total
        </p>
      </div>

      <button
        type="button"
        disabled={!size}
        onClick={handleAdd}
        className="mt-6 w-full rounded-full bg-black py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-black/30"
      >
        {added ? "Added to cart ✓" : size ? "Add to cart" : "Select a size to add"}
      </button>

      <p className="mt-5 text-sm leading-relaxed text-black/50">{TRUST_LINE}</p>
    </div>
  );
}
