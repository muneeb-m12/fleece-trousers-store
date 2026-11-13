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

## Shop the Look (Nike-style editorial section)

A "Shop the Look" section sits on the homepage between the PRODUCTS strip
and the Instagram strip (`src/components/ShopTheLook.tsx`, data in
`src/lib/shop-looks.ts`):

- Six looks in a row on a white studio background; outer models smaller,
  blurred and faded (depth of field), pulsing pin on each outfit, idle
  float + mouse parallax, prev/next arrows and a segmented progress bar
  with look names (01 Street Layers … 06 Off Duty).
- Motion (Nike video): the lineup is a slow auto-drift carousel — the
  row glides to the next look every 3.5s (900ms glide on the spring ease
  above), the centred model sharpens/scales up, the outgoing centre
  blurs/fades, and a new model enters from the right edge; it loops
  seamlessly (the row is 18 slots — three copies of the 6 looks — and
  resets by exactly one look cycle, which is invisible). Drift pauses
  while hovering/touching the stage, in detail view, and for ~6s after
  any manual change. Mouse parallax is depth-graded and clearly visible
  (centre model ±18px, next ±10px, outer ±5px, plus a tiny vertical
  shift, rAF + lerp). The segment bar, look name, and "In this look"
  panel follow whichever model is centred (panel crossfades ~300ms).
  The same motion lives in the standalone `public/shop-the-look.html`.
- Click/tap a model: the others fade and blur away while the chosen one
  scales ~1.6x and glides to the centre (spring ease
  `cubic-bezier(0.22, 1, 0.36, 1)`); the heading crossfades into the
  look title; three product pins scale in on the outfit; the "In this
  look" panel slides in from the right with staggered thumbnails and a
  black "Add all to bag" button (adds all three pieces, size L, to the
  shared cart). Back arrow / background click / Esc reverses; arrow keys
  and swipe switch looks in detail view with a crossfade.
- Entrance via IntersectionObserver (models rise from the floor, staggered);
  hover lifts a model 8px and dims the others to 70%; `prefers-reduced-motion`
  is respected; keyboard-accessible (focus rings, Esc to go back).
- Model photos: `public/models/model-*.jpg` — six full-body male models
  on pure white backgrounds (AI-generated). They are JPGs, **not** true
  transparent PNGs, so they render with `mix-blend-mode: multiply` and
  the white disappears on the light background. To swap in real
  transparent PNGs, replace the entries in `src/lib/shop-looks.ts` —
  the blend mode is harmless for PNGs with real transparency.
- The same section also exists as a **standalone single file**,
  `public/shop-the-look.html` (served at `/shop-the-look.html`), with
  its own minimal top nav and an "Add all to bag" that just shows an
  added state (no backend). Its image paths are relative
  (`models/…`, `products/…`), so it works both served and opened directly.

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
