// Home page — the Silhouette Lite homepage, adapted to the fleece store:
// full-viewport hero photo (no text on it), NEW COLLECTION section,
// PRODUCTS drag strip, Instagram strip. Header/footer come from the layout.

import Image from "next/image";
import Link from "next/link";
import DragStrip from "@/components/DragStrip";
import InstagramStrip from "@/components/InstagramStrip";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import ShopTheLook from "@/components/ShopTheLook";
import { PRODUCTS } from "@/lib/products";
import { TRUST_LINE } from "@/lib/store";

const LIFESTYLE_CARDS: { src: string; alt: string; label: string }[] = [
  {
    src: "/images/lifestyle-street.jpg",
    alt: "Model in fleece trousers on the street",
    label: "Street",
  },
  {
    src: "/images/lifestyle-boat.jpg",
    alt: "Model in fleece trousers by a boat",
    label: "Weekend",
  },
  {
    src: "/images/hero.jpg",
    alt: "Two models in fleece trousers against a concrete wall",
    label: "Everyday",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero — one full-viewport photograph, no headline, no button.
          The photo itself wipes in top-down while zooming out from 1.25
          (hero-entrance, globals.css) — the first thing the visitor sees. */}
      <section className="relative h-[100svh] w-full overflow-hidden bg-[#eeeeee]">
        <Image
          src="/images/hero.jpg"
          alt="Two models wearing FLEECE. fleece trousers against a concrete wall"
          fill
          priority
          className="hero-entrance object-cover object-center"
          sizes="100vw"
        />
      </section>

      {/* NEW COLLECTION */}
      <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal from="left">
            <h1 className="font-display text-[52px] font-bold uppercase leading-[0.95] tracking-tight sm:text-[76px]">
              New Collection
              <br />
              Dressed for
              <br />
              the moment
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-black/60">
              Step into the season&apos;s warmest fleece — brushed soft inside,
              made for slow mornings and cold evenings, and built around the
              idea that how you dress shapes your day.
            </p>
            <Link
              href="/collections/all"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Explore now
            </Link>
            <p className="mt-8 text-sm text-black/50">{TRUST_LINE}</p>
          </Reveal>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {LIFESTYLE_CARDS.map((card, i) => (
              <Reveal key={card.src} delay={i * 110} from="clip">
                <Link
                  href="/collections/all"
                  className="group relative block overflow-hidden rounded-2xl bg-[#eeeeee]"
                  aria-label={`Explore ${card.label} looks`}
                >
                  <div className="relative aspect-[3/5] w-full">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
                    Explore
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl">
              Products
            </h2>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-black/50">
              Small, mindful collection — built for everyday
            </p>
          </div>
        </Reveal>
        <div className="mt-10">
          <DragStrip>
            {PRODUCTS.map((product, i) => (
              <Reveal
                key={product.id}
                from="clip"
                delay={i * 100}
                className="w-[300px] shrink-0 snap-start sm:w-[340px]"
              >
                <ProductCard product={product} className="w-full" />
              </Reveal>
            ))}
          </DragStrip>
          <p className="mt-2 text-sm text-black/40">← Drag to explore →</p>
        </div>
      </section>

      {/* SHOP THE LOOK — Nike-style editorial section (see
          src/components/ShopTheLook.tsx). */}
      <ShopTheLook />

      <InstagramStrip />
    </main>
  );
}
