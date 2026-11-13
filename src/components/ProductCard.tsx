// Product card — large photo on a pale-grey background, name + price below,
// wishlist heart, and a "Choose a size" quick-add pop-over (size required
// to add, like the original). Pack-of-2 cards show two photos side by side.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR, SIZES, type Product, type Size } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!size) return;
    add(product.id, size, 1);
    setAdded(true);
    setPickerOpen(false);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article
      className="group relative w-[300px] shrink-0 snap-start sm:w-[340px]"
      onMouseLeave={() => setPickerOpen(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#eeeeee]">
        <Link href={`/products/${product.slug}`} aria-label={`${product.name} — ${product.colour}`}>
          {product.images.length > 1 ? (
            <div className="flex aspect-square">
              {product.images.map((src) => (
                <div key={src} className="relative h-full flex-1">
                  <Image
                    src={src}
                    alt={`${product.name} — ${product.colour}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 300px, 340px"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-square">
              <Image
                src={product.images[0]}
                alt={`${product.name} — ${product.colour}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 300px, 340px"
              />
            </div>
          )}
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => setWishlisted((v) => !v)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#000" : "none"}
            stroke="#000"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 21s-7.5-4.6-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.6l1 1.4 1-1.4C14 6.2 15.5 5 17.5 5 21 5 23 8.5 21.5 12c-2 4.4-9.5 9-9.5 9Z" />
          </svg>
        </button>

        {/* Quick-add size pop-over */}
        <div
          className={`absolute inset-x-3 bottom-3 rounded-2xl bg-white p-4 shadow-xl transition-all duration-300 ${
            pickerOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
            Select a size
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`h-10 min-w-11 rounded-full border px-3 text-sm font-semibold transition ${
                  size === s
                    ? "border-black bg-black text-white"
                    : "border-black/25 bg-white hover:border-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!size}
            onClick={handleAdd}
            className="mt-3 w-full rounded-full bg-black py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-black/30"
          >
            {added ? "Added ✓" : size ? "Add to cart" : "Choose a size"}
          </button>
        </div>

        {/* Mobile/touch: a visible quick-add button (hover does not exist) */}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="absolute bottom-3 left-3 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg sm:hidden"
        >
          {size ? `Add — ${size}` : "Choose a size"}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-[15px] font-medium leading-snug hover:underline"
          >
            {product.name} — {product.colour}
          </Link>
        </div>
        <p className="shrink-0 text-[15px] font-semibold">
          {product.compareAt && (
            <span className="mr-2 text-sm font-normal text-black/40 line-through">
              {formatPKR(product.compareAt)}
            </span>
          )}
          {formatPKR(product.price)}
        </p>
      </div>
    </article>
  );
}
