// "Shop the Look" data — one entry per look. Prices/names come from the
// real catalogue (getProductById), so they stay in one place in
// src/lib/products.ts. To swap in real transparent PNGs, replace the
// `model` paths below — the section renders them with
// mix-blend-mode: multiply, which is harmless for PNGs that already
// have transparency.

import { getProductById, type Product } from "@/lib/products";

export type LookProduct = {
  product: Product;
  /** pin position on the outfit in detail view (fractions of the image) */
  pin: { x: number; y: number };
};

export type ShopLook = {
  id: string;
  num: string;
  name: string;
  model: string;
  alt: string;
  products: LookProduct[];
};

function p(id: string, pin: { x: number; y: number }): LookProduct {
  const product = getProductById(id);
  if (!product) throw new Error(`Shop the Look: unknown product id "${id}"`);
  return { product, pin };
}

const WAIST = { x: 0.5, y: 0.44 };
const THIGH = { x: 0.38, y: 0.63 };
const CUFF = { x: 0.62, y: 0.86 };

export const SHOP_LOOKS: ShopLook[] = [
  {
    id: "street-layers",
    num: "01",
    name: "Street Layers",
    model: "/models/model-street-layers.jpg",
    alt: "Model wearing Jet Black fleece trousers and a charcoal crewneck",
    products: [
      p("black", WAIST),
      p("charcoal", THIGH),
      p("navy", CUFF),
    ],
  },
  {
    id: "studio-day",
    num: "02",
    name: "Studio Day",
    model: "/models/model-studio-day.jpg",
    alt: "Model wearing Navy fleece trousers and a black T-shirt",
    products: [
      p("navy", WAIST),
      p("grey", THIGH),
      p("black", CUFF),
    ],
  },
  {
    id: "gallery-opening",
    num: "03",
    name: "Gallery Opening",
    model: "/models/model-gallery-opening.jpg",
    alt: "Model wearing Chocolate Brown fleece trousers and an olive sweatshirt",
    products: [
      p("brown", WAIST),
      p("olive", THIGH),
      p("charcoal", CUFF),
    ],
  },
  {
    id: "night-in",
    num: "04",
    name: "Night In",
    model: "/models/model-night-in.jpg",
    alt: "Model wearing Charcoal fleece trousers and a dark grey sweatshirt",
    products: [
      p("charcoal", WAIST),
      p("grey", THIGH),
      p("black", CUFF),
    ],
  },
  {
    id: "essentials",
    num: "05",
    name: "The Essentials",
    model: "/models/model-essentials.jpg",
    alt: "Model wearing Heather Grey fleece trousers and a white T-shirt",
    products: [
      p("pack-black-charcoal", WAIST),
      p("navy", THIGH),
      p("grey", CUFF),
    ],
  },
  {
    id: "off-duty",
    num: "06",
    name: "Off Duty",
    model: "/models/model-off-duty.jpg",
    alt: "Model wearing Olive fleece trousers and a cream oversized T-shirt",
    products: [
      p("olive", WAIST),
      p("charcoal", THIGH),
      p("brown", CUFF),
    ],
  },
];

export function shopLookTotal(look: ShopLook): number {
  return look.products.reduce((n, item) => n + item.product.price, 0);
}
