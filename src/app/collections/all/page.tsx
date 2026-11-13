// Collection page — "Catalog": big heading left, "N items" right, thin
// rule, Availability / Price filters + Sort dropdown, 3-column grid.
// Filters and sorting are real (client state), not decoration.

"use client";

import { useMemo, useState } from "react";
import InstagramStrip from "@/components/InstagramStrip";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { PRODUCTS, type Product } from "@/lib/products";

type Availability = "all" | "in-stock";
type PriceFilter = "all" | "single" | "pack";
type Sort = "featured" | "price-asc" | "price-desc" | "name";

function sortProducts(list: Product[], sort: Sort): Product[] {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  if (sort === "name")
    copy.sort((a, b) =>
      `${a.name} ${a.colour}`.localeCompare(`${b.name} ${b.colour}`),
    );
  return copy;
}

const selectClass =
  "appearance-none rounded-full border border-black/20 bg-white px-4 py-2.5 pr-9 text-sm font-medium outline-none transition focus:border-black";

export default function CatalogPage() {
  const [availability, setAvailability] = useState<Availability>("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    // Everything is in stock — the filter exists because the original has
    // it; it filters honestly rather than inventing sold-out items.
    let list = PRODUCTS;
    if (availability === "in-stock") list = list.filter(() => true);
    if (price === "single") list = list.filter((p) => p.kind === "single");
    if (price === "pack") list = list.filter((p) => p.kind === "pack");
    return sortProducts(list, sort);
  }, [availability, price, sort]);

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-10 sm:px-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-6xl font-bold uppercase tracking-tight sm:text-7xl">
              Catalog
            </h1>
            <p className="pb-2 text-sm text-black/50">
              {visible.length} item{visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <hr className="mt-6 border-black/15" />
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black/50">Availability</span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as Availability)}
                className={selectClass}
                aria-label="Filter by availability"
              >
                <option value="all">All</option>
                <option value="in-stock">In stock</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black/50">Price</span>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value as PriceFilter)}
                className={selectClass}
                aria-label="Filter by price"
              >
                <option value="all">All prices</option>
                <option value="single">Singles — Rs 2,199</option>
                <option value="pack">Pack of 2 — Rs 3,499</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black/50">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className={selectClass}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="name">Name, A to Z</option>
              </select>
            </label>
          </div>
        </Reveal>

        {visible.length === 0 ? (
          <p className="py-20 text-center text-lg text-black/60">
            Nothing matches those filters.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product, i) => (
              <Reveal
                key={product.id}
                from="clip"
                delay={(i % 3) * 100}
                className="w-full"
              >
                <ProductCard product={product} className="w-full" />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <InstagramStrip />
    </main>
  );
}
