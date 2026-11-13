// Sticky header, like the original: transparent over the hero with white
// text/icons; solid white with black text once scrolled or on inner pages.
// Left: "Collections" (hover opens the full-width mega-menu). Centre: the
// FLEECE. wordmark. Right: account icon + cart icon with count badge.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { count, openDrawer } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const solid = !isHome || scrolled || menuOpen;
  const text = solid ? "text-black" : "text-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.08)]" : "bg-transparent text-white"
      }`}
      onMouseLeave={() => {
        setMenuOpen(false);
        setAccountOpen(false);
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
        {/* Left — Collections nav */}
        <nav className="flex flex-1 items-center">
          <div
            onMouseEnter={() => setMenuOpen(true)}
            className="relative"
          >
            <Link
              href="/collections/all"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-1.5 text-sm font-medium tracking-wide ${text}`}
            >
              Collections
              <span aria-hidden className="text-[10px]">⌄</span>
            </Link>
            {menuOpen && (
              <div className="absolute left-0 top-full pt-4">
                <div className="w-56 rounded-2xl border border-black/10 bg-white p-5 text-black shadow-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50">
                    Shop collection
                  </p>
                  <Link
                    href="/collections/all"
                    onClick={() => setMenuOpen(false)}
                    className="mt-3 block text-base font-medium hover:underline"
                  >
                    All products
                  </Link>
                  <Link
                    href="/collections/all"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 block text-base font-medium hover:underline"
                  >
                    Pack of 2 — Best value
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Centre — wordmark */}
        <Link
          href="/"
          className={`font-display text-[22px] font-bold uppercase leading-none tracking-[0.18em] ${text}`}
          aria-label="FLEECE. — home"
        >
          FLEECE.
        </Link>

        {/* Right — account + cart */}
        <div className="flex flex-1 items-center justify-end gap-1">
          <div className="relative">
            <button
              type="button"
              aria-label="Account"
              onClick={() => setAccountOpen((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 ${text}`}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
              </svg>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full w-64 rounded-2xl border border-black/10 bg-white p-5 text-black shadow-xl">
                <p className="text-sm font-semibold">Guest checkout</p>
                <p className="mt-1 text-sm leading-relaxed text-black/60">
                  No account needed — order with cash on delivery and we confirm
                  on WhatsApp.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            onClick={openDrawer}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 ${text}`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M6 8h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8Z" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Full-width mega-menu backdrop blur is handled by the menu panel;
          the original dims/blurs the hero behind it — the solid header + panel
          give the same effect without a separate overlay. */}
    </header>
  );
}
