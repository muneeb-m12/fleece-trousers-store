// Checkout — cash on delivery + WhatsApp. No card payment anywhere.
// Form: name, phone, address, city. "Place COD order" validates the form,
// shows a confirmation with an order number, and clears the cart.
// The WhatsApp button opens wa.me with the order summary prefilled — it
// stays disabled until the store's WhatsApp number is set in src/lib/store.ts.

"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR, getProductById } from "@/lib/products";
import { WHATSAPP_NUMBER, whatsappOrderUrl } from "@/lib/store";

const inputClass =
  "w-full rounded-xl border border-black/25 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-black/35 focus:border-black";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{
    name: string;
    phone: string;
    city: string;
    total: number;
    summary: string;
  } | null>(null);

  const summary = useMemo(() => {
    if (items.length === 0) return "";
    const lines = items.map((item) => {
      const p = getProductById(item.productId);
      if (!p) return "";
      return `• ${p.name} — ${p.colour} (${item.size}) × ${item.qty} — ${formatPKR(p.price * item.qty)}`;
    });
    return `New FLEECE. order\n${lines.join("\n")}\nSubtotal: ${formatPKR(subtotal)}`;
  }, [items, subtotal]);

  const whatsappUrl = placed
    ? whatsappOrderUrl(
        `${summary}\n\nName: ${placed.name}\nPhone: ${placed.phone}\nCity: ${placed.city}\nOrder: ${orderId ?? ""}`,
      )
    : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("Please fill in your name, phone, address and city.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError("");
    const id = `FL-${Date.now().toString().slice(-6)}`;
    setOrderId(id);
    setPlaced({ name: name.trim(), phone: phone.trim(), city: city.trim(), total: subtotal, summary });
    clear();
  };

  if (placed) {
    return (
      <main className="pt-16">
        <section className="mx-auto max-w-[720px] px-4 pb-24 pt-16 text-center sm:px-8">
          <p className="font-display text-5xl font-bold uppercase tracking-tight">
            Order placed
          </p>
          <p className="mt-4 text-lg text-black/60">
            Thank you, {placed.name}. Your order{" "}
            <span className="font-semibold text-black">{orderId}</span> is
            confirmed for cash on delivery — {formatPKR(placed.total)}. We will
            call or WhatsApp {placed.phone} to confirm before dispatch.
          </p>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white"
            >
              Send order on WhatsApp
            </a>
          ) : (
            <p className="mx-auto mt-8 max-w-md rounded-2xl bg-black/5 px-5 py-4 text-sm leading-relaxed text-black/60">
              WhatsApp ordering is not switched on yet — the store number is
              still being set up. Your COD order above is already placed.
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/collections/all"
              className="text-sm font-semibold underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-[1200px] px-4 pb-24 pt-10 sm:px-8">
        <h1 className="font-display text-6xl font-bold uppercase tracking-tight sm:text-7xl">
          Checkout
        </h1>
        <hr className="mt-6 border-black/15" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <p className="text-xl font-medium">Your shopping bag is empty.</p>
            <Link
              href="/collections/all"
              className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-lg font-semibold">Delivery details</h2>
              <p className="mt-1 text-sm text-black/50">
                Cash on delivery — pay when your order arrives.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className={inputClass}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone / WhatsApp number"
                  autoComplete="tel"
                  inputMode="tel"
                  className={inputClass}
                />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full delivery address (house, street, area)"
                  autoComplete="street-address"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  autoComplete="address-level2"
                  className={inputClass}
                />
              </div>
              {error && (
                <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
              )}
              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Place COD order — {formatPKR(subtotal)}
              </button>
              <p className="mt-4 text-center text-sm text-black/50">
                Delivery across Pakistan · Cash on delivery · 7-day exchange
              </p>
              {!WHATSAPP_NUMBER && (
                <p className="mt-3 text-center text-xs text-black/40">
                  WhatsApp ordering activates once the store number is added
                  (see README).
                </p>
              )}
            </form>

            <aside className="h-fit rounded-2xl bg-black/[0.04] p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {items.map((item) => {
                  const p = getProductById(item.productId);
                  if (!p) return null;
                  return (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>
                        {p.name} — {p.colour} ({item.size}) × {item.qty}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatPKR(p.price * item.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <hr className="my-4 border-black/10" />
              <p className="flex items-center justify-between text-base font-bold">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </p>
              <p className="mt-2 text-sm text-black/50">
                Delivery charges confirmed when we call to confirm your order.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
