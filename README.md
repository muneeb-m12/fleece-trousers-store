# FLEECE. — Fleece Trousers Store (Pakistan)

A fresh Next.js store for men's fleece trousers, built from scratch. It
recreates the layout and feel of the **Hanzife "Silhouette Lite"** Shopify
theme demo (hanzife-silhouette-lite.myshopify.com, inspected 13 Nov 2026) —
minimal white/black design, full-viewport hero photo, NEW COLLECTION section,
draggable PRODUCTS strip, collection + product pages, cart drawer and cart
page — with the products, prices, currency and checkout replaced for a
Pakistani COD store. This is a clean rebuild: it shares nothing with the
earlier `fleece-trousers-website` project except the product data
(prices/names/sizes/specs). No rail, no "Try the Look", no Three.js.

## Stack

- Next.js 16.4.6, React 19.3, Tailwind CSS 4, App Router, TypeScript
- Cart in React context, persisted to localStorage (`src/lib/cart.tsx`)
- No backend, no database, no card payment — checkout is cash on delivery
  plus an optional WhatsApp order link

## Run it

```bash
npm install   # always run once after cloning/pulling
npm run dev   # http://localhost:3000
npm run build # production build
```

## Windows notes (important)

This project builds with **Webpack**, not Turbopack: on the owner's Windows
machine Turbopack's native SWC binary fails ("not a valid Win32 application"),
so `package.json` pins the scripts to `next dev --webpack` /
`next build --webpack`. Do not switch them back.

Tailwind v4 under Webpack needs its PostCSS plugin: `@tailwindcss/postcss`
is in devDependencies with `postcss.config.mjs`. The scaffold's
Turbopack-only setup (`@tailwindcss/turbopack`) compiles **no styles** under
Webpack — that mistake was made once in the old repo; this project has the
PostCSS plugin from the start.

## Pages

- `/` — hero photo (no text), NEW COLLECTION, PRODUCTS drag strip, Instagram
- `/collections/all` — "Catalog": Availability / Price filters, Sort, 3-col grid
- `/products/[slug]` — 3-column product page: description + spec table,
  large image, purchase panel (colour, sizes M/L/XL/2XL, quantity, Add to cart)
- `/cart` — cart page with quantity steppers and Subtotal
- `/checkout` — COD order form (name, phone, address, city) + order summary

## Products & prices (PROPOSED, not confirmed)

All prices live in one file: `src/lib/products.ts`. Change them there.

- 6 singles at **Rs 2,199**: Jet Black, Charcoal, Navy, Heather Grey, Olive,
  Chocolate Brown
- 2 Pack of 2 at **Rs 3,499** (compare-at Rs 4,398): Black + Charcoal,
  Black + Navy
- Sizes M / L / XL / 2XL. Specs: 280–320 GSM cotton fleece, brushed inside,
  ribbed ankle cuff, one zip pocket, elastic waist + drawstring.
- Only **Black + Charcoal** are confirmed launch colours — the other four
  colours are placeholders until a supplier confirms what can be stitched.

## Photos

All photos are **AI-generated** (no real product photos exist yet — no
samples have been ordered). They stand in until real photos are shot:

- `public/images/hero.jpg` — two headless models against a concrete wall
- `public/images/lifestyle-street.jpg`, `lifestyle-boat.jpg` — lifestyle cards
- `public/products/*.jpg` — six folded fleece joggers on pale grey, cropped
  from one 3×2 contact sheet (`public/images/products-contact-sheet.jpg`):
  black, charcoal, navy, heather grey, olive, chocolate brown

Swap any file with a real photo of the same name and it appears everywhere.

## WhatsApp ordering — one thing to set

The WhatsApp order button needs the store's WhatsApp number. Set it in
`src/lib/store.ts` (`WHATSAPP_NUMBER`, international format without "+",
e.g. `"923001234567"`). Until it is set, the button stays disabled and the
site says so — no number has been invented.

## What this store does NOT copy from the original

- The original's brand ("HANZIFE"), products (jackets), copy and USD prices
- Its demo-data flaws: two sold-out products and one $0.00 placeholder —
  everything here is in stock at a real price
- Its Shopify checkout — this store is COD + WhatsApp only
- Reviews, ratings, newsletter, search, chat — the original has none, and
  neither does this store
