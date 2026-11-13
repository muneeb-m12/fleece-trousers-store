// Product catalogue — men's fleece trousers (assumed men's; see README).
// Prices are the PROPOSED launch prices from the Nov 2026 research:
// single Rs 2,199 / Pack of 2 Rs 3,499 at the dealer's ~Rs 1,000/piece cost.
// They are NOT yet confirmed by the user — change them here, in one place.
// Only Black + Charcoal are confirmed launch colours; the other colours
// are placeholders to swap once the supplier confirms them.
// Photos are AI-generated (see README), not photos of real stock.

export type Product = {
  id: string;
  slug: string;
  name: string;
  colour: string;
  price: number;
  compareAt?: number;
  badge?: string;
  /** one photo per trouser in the product (packs have two) */
  images: string[];
  /** swatch colours shown on the product page */
  swatches: string[];
  kind: "single" | "pack";
  description: string;
};

export const SIZES = ["M", "L", "XL", "2XL"] as const;
export type Size = (typeof SIZES)[number];

export const SPECS: { label: string; value: string }[] = [
  { label: "Country", value: "Pakistan" },
  { label: "Fabric", value: "280–320 GSM cotton fleece, brushed inside" },
  { label: "Fit", value: "Relaxed, tapered leg with ribbed ankle cuff" },
  { label: "Material", value: "100% cotton fleece" },
];

const DESC_SINGLE =
  "Heavyweight fleece trousers made for cold Pakistani winters. Brushed soft on the inside, with a ribbed ankle cuff, one zip pocket, and an elastic waist with drawstring. Cut relaxed through the leg and tapered at the ankle — made to be lived in, not just worn.";

const DESC_PACK =
  "Two pairs of our heavyweight fleece trousers in one pack — same 280–320 GSM brushed cotton fleece, ribbed ankle cuff, one zip pocket, and elastic waist with drawstring. One for now, one for the wash. Cut relaxed through the leg and tapered at the ankle.";

export const PRODUCTS: Product[] = [
  {
    id: "black",
    slug: "classic-fleece-trouser-jet-black",
    name: "Classic Fleece Trouser",
    colour: "Jet Black",
    price: 2199,
    images: ["/products/black.jpg"],
    swatches: ["#1c1c1e"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "charcoal",
    slug: "classic-fleece-trouser-charcoal",
    name: "Classic Fleece Trouser",
    colour: "Charcoal",
    price: 2199,
    images: ["/products/charcoal.jpg"],
    swatches: ["#3d3d42"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "navy",
    slug: "classic-fleece-trouser-navy",
    name: "Classic Fleece Trouser",
    colour: "Navy",
    price: 2199,
    images: ["/products/navy.jpg"],
    swatches: ["#1f2a44"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "grey",
    slug: "classic-fleece-trouser-heather-grey",
    name: "Classic Fleece Trouser",
    colour: "Heather Grey",
    price: 2199,
    images: ["/products/grey.jpg"],
    swatches: ["#8a8d90"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "olive",
    slug: "classic-fleece-trouser-olive",
    name: "Classic Fleece Trouser",
    colour: "Olive",
    price: 2199,
    images: ["/products/olive.jpg"],
    swatches: ["#4a4d33"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "brown",
    slug: "classic-fleece-trouser-chocolate-brown",
    name: "Classic Fleece Trouser",
    colour: "Chocolate Brown",
    price: 2199,
    images: ["/products/brown.jpg"],
    swatches: ["#4b3226"],
    kind: "single",
    description: DESC_SINGLE,
  },
  {
    id: "pack-black-charcoal",
    slug: "pack-of-2-fleece-trousers-black-charcoal",
    name: "Pack of 2 — Fleece Trousers",
    colour: "Black + Charcoal",
    price: 3499,
    compareAt: 4398,
    badge: "Best value",
    images: ["/products/black.jpg", "/products/charcoal.jpg"],
    swatches: ["#1c1c1e", "#3d3d42"],
    kind: "pack",
    description: DESC_PACK,
  },
  {
    id: "pack-black-navy",
    slug: "pack-of-2-fleece-trousers-black-navy",
    name: "Pack of 2 — Fleece Trousers",
    colour: "Black + Navy",
    price: 3499,
    compareAt: 4398,
    badge: "Best value",
    images: ["/products/black.jpg", "/products/navy.jpg"],
    swatches: ["#1c1c1e", "#1f2a44"],
    kind: "pack",
    description: DESC_PACK,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const formatPKR = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;
