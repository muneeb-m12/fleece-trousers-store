// Product page — three-column top like the original: left description
// (serif) + spec table, centre large product image on pale grey, right
// purchase panel. Then "You might also like", Instagram strip, footer.

import Image from "next/image";
import { notFound } from "next/navigation";
import InstagramStrip from "@/components/InstagramStrip";
import ProductCard from "@/components/ProductCard";
import PurchasePanel from "@/components/PurchasePanel";
import Reveal from "@/components/Reveal";
import { getProduct, PRODUCTS, SPECS } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found — FLEECE." };
  return {
    title: `${product.name} — ${product.colour} · ${product.price ? `Rs ${product.price.toLocaleString("en-PK")}` : ""} | FLEECE.`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr_1fr] lg:gap-14">
          {/* Left — description + spec table */}
          <Reveal from="left">
            <p className="font-serif text-[19px] italic leading-relaxed text-black/80">
              {product.description}
            </p>
            <p className="mt-6 text-sm font-medium tracking-wide">
              Made in Pakistan — Built to last, designed to be worn.
            </p>
            <table className="mt-8 w-full text-sm">
              <tbody>
                {SPECS.map((spec) => (
                  <tr key={spec.label} className="border-t border-black/10">
                    <td className="py-3 pr-4 font-semibold">{spec.label}</td>
                    <td className="py-3 text-black/60">{spec.value}</td>
                  </tr>
                ))}
                <tr className="border-y border-black/10">
                  <td className="py-3 pr-4 font-semibold">Sizes</td>
                  <td className="py-3 text-black/60">M · L · XL · 2XL</td>
                </tr>
              </tbody>
            </table>
          </Reveal>

          {/* Centre — large product image(s), wiped in like the original */}
          <Reveal from="clip">
            <div
              className={`grid gap-3 ${
                product.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {product.images.map((src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-[#eeeeee]"
                >
                  <Image
                    src={src}
                    alt={`${product.name} — ${product.colour}`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right — purchase panel */}
          <Reveal from="right">
            <PurchasePanel product={product} />
          </Reveal>
        </div>
      </section>

      {/* You might also like */}
      <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            You might also like
          </h2>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-5">
          {others.map((p, i) => (
            <Reveal
              key={p.id}
              from="clip"
              delay={i * 100}
              className="w-[300px] shrink-0 sm:w-[340px]"
            >
              <ProductCard product={p} className="w-full" />
            </Reveal>
          ))}
        </div>
      </section>

      <InstagramStrip />
    </main>
  );
}
