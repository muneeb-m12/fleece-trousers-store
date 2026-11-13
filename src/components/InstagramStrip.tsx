// Instagram strip — heading "@FLEECE", subtext, follow link, a row of
// 6 square images with an "INSTAGRAM" overlay on hover. Photos are reused
// AI-generated store photography (see README).

import Image from "next/image";
import Reveal from "@/components/Reveal";

const TILES: { src: string; alt: string }[] = [
  { src: "/images/hero.jpg", alt: "Two models in fleece trousers against a concrete wall" },
  { src: "/products/black.jpg", alt: "Jet Black fleece trousers, folded" },
  { src: "/images/lifestyle-street.jpg", alt: "Model in fleece trousers on the street" },
  { src: "/products/olive.jpg", alt: "Olive fleece trousers, folded" },
  { src: "/images/lifestyle-boat.jpg", alt: "Model in fleece trousers by a boat" },
  { src: "/products/brown.jpg", alt: "Chocolate Brown fleece trousers, folded" },
];

export default function InstagramStrip() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-8">
      <Reveal className="text-center">
        <h2 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          @FLEECE
        </h2>
        <p className="mt-3 text-base text-black/60">
          Follow the latest looks, moments and stories.
        </p>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
        >
          Follow us on Instagram
        </a>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((tile, i) => (
          <Reveal key={tile.src} delay={i * 90} from="clip">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-[#eeeeee]"
              aria-label="Open Instagram"
            >
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[11px] font-bold uppercase tracking-[0.25em] text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                Instagram
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
