// "Shop the Look" — Nike-style editorial section.
//
// Same section as the standalone public/shop-the-look.html, ported to
// React and wired into the store: it uses the site's header (no second
// nav here) and "Add all to bag" adds all three pieces to the shared
// cart (size L) via useCart.
//
// Motion is transform/opacity-only (60fps): the lineup has
// depth-of-field (outer models smaller, blurred, faded), idle float +
// mouse parallax, pulsing pins; clicking a model glides it to the
// centre at ~1.6x with the spring ease cubic-bezier(0.22, 1, 0.36, 1)
// while the others fade/blur away. Esc / Back / background click
// reverses; arrows and swipe switch looks in detail view.
//
// Images come from src/lib/shop-looks.ts. The model photos are JPGs on
// pure white, not transparent PNGs — rendered with mix-blend-mode:
// multiply so the white disappears; swapping in real transparent PNGs
// only needs new entries in that array.

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { SHOP_LOOKS, shopLookTotal } from "@/lib/shop-looks";
import { formatPKR } from "@/lib/products";
import { useCart } from "@/lib/cart";

type Mode = "lineup" | "detail";

/* Depth of field in the lineup: distance from the row centre (2.5). */
function depthFor(i: number) {
  const d = Math.abs(i - (SHOP_LOOKS.length - 1) / 2);
  return {
    s: Math.max(0.86, 1 - 0.055 * d),
    b: `${(d * 1.2).toFixed(1)}px`,
    o: Math.max(0.8, 1 - 0.08 * d).toFixed(2),
    z: 10 - Math.round(d),
  };
}

export default function ShopTheLook() {
  const { add } = useCart();
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("lineup");
  const [detailTarget, setDetailTarget] = useState<number | null>(null);
  const [dx, setDx] = useState(0);
  const [added, setAdded] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const modelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchX = useRef<number | null>(null);
  const parallaxRaf = useRef<number | null>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const look = SHOP_LOOKS[active];
  const total = shopLookTotal(look);

  /* Measure the px glide that puts model i at the centre of the stage.
     offsetLeft/offsetWidth are untransformed slot geometry (the model's
     offsetParent is the relatively-positioned track). */
  const centreModel = useCallback((i: number) => {
    const el = modelRefs.current[i];
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!el || !scrollEl || !trackEl) return;
    const stageRect = scrollEl.getBoundingClientRect();
    const slotCentre = el.offsetLeft + el.offsetWidth / 2;
    const trackRect = trackEl.getBoundingClientRect();
    const visibleCentre = stageRect.left + stageRect.width / 2;
    const modelCentre = trackRect.left + slotCentre;
    setDx(Math.round(visibleCentre - modelCentre));
  }, []);

  const enterDetail = useCallback(
    (i: number) => {
      setMode("detail");
      setDetailTarget(i);
      setActive(i);
      centreModel(i);
    },
    [centreModel],
  );

  const switchDetail = useCallback(
    (i: number) => {
      const next = (i + SHOP_LOOKS.length) % SHOP_LOOKS.length;
      setDetailTarget(next);
      setActive(next);
      // Measure after the outgoing model starts leaving.
      requestAnimationFrame(() => centreModel(next));
    },
    [centreModel],
  );

  const exitDetail = useCallback(() => {
    setMode("lineup");
    setDetailTarget(null);
    setDx(0);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (mode === "detail") switchDetail(i);
      else setActive((i + SHOP_LOOKS.length) % SHOP_LOOKS.length);
    },
    [mode, switchDetail],
  );

  /* Entrance: IntersectionObserver adds .in-view; models rise from the
     floor with a stagger on first load. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Keyboard: Esc goes back; arrows switch looks in detail view. */
  useEffect(() => {
    if (mode !== "detail") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitDetail();
      if (e.key === "ArrowLeft") switchDetail((detailTarget ?? 0) - 1);
      if (e.key === "ArrowRight") switchDetail((detailTarget ?? 0) + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, detailTarget, exitDetail, switchDetail]);

  /* Re-measure the detail glide if the window resizes mid-detail. */
  useEffect(() => {
    const onResize = () => {
      if (mode === "detail" && detailTarget !== null) centreModel(detailTarget);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode, detailTarget, centreModel]);

  /* Gentle parallax on mouse move (transform-only, rAF-throttled;
     skipped for touch users and reduced-motion users). */
  const onMouseMove = (e: ReactMouseEvent) => {
    if (
      reducedMotion ||
      !window.matchMedia("(pointer: fine)").matches ||
      parallaxRaf.current !== null
    )
      return;
    const stageEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!stageEl || !trackEl) return;
    const clientX = e.clientX;
    parallaxRaf.current = requestAnimationFrame(() => {
      parallaxRaf.current = null;
      const r = stageEl.getBoundingClientRect();
      const nx = (clientX - r.left) / r.width - 0.5;
      trackEl.style.transform = `translate3d(${(nx * -14).toFixed(1)}px, 0, 0)`;
    });
  };
  const onMouseLeave = () => {
    if (trackRef.current) trackRef.current.style.transform = "";
  };

  /* Swipe: horizontal swipe switches looks. */
  const onTouchStart = (e: ReactTouchEvent) => {
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 40) return;
    goTo(active + (delta < 0 ? 1 : -1));
  };

  const onStageClick = (e: ReactMouseEvent) => {
    // Background click in detail view goes back (not model clicks).
    if (mode === "detail" && (e.target === e.currentTarget || (e.target as HTMLElement).classList?.contains("stl-track"))) {
      exitDetail();
    }
  };

  const onStageKeyDown = (e: ReactKeyboardEvent) => {
    if (mode !== "lineup") return;
    if (e.key === "ArrowLeft") goTo(active - 1);
    if (e.key === "ArrowRight") goTo(active + 1);
  };

  const addAll = () => {
    look.products.forEach((item) => add(item.product.id, "L"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const modelStyle = (i: number): CSSProperties => {
    const depth = depthFor(i);
    if (mode === "detail") {
      if (i === detailTarget) {
        return {
          "--i": i,
          "--s": 1.6,
          "--hs": 1,
          "--o": 1,
          "--b": "0px",
          "--z": 20,
          "--dx": `${dx}px`,
          "--rise-delay": `${i * 90}ms`,
          "--float-delay": `${i * 0.45}s`,
        } as CSSProperties;
      }
      return {
        "--i": i,
        "--s": depth.s,
        "--hs": 0.95,
        "--o": 0,
        "--b": "8px",
        "--z": 1,
        "--dx": "0px",
        "--rise-delay": `${i * 90}ms`,
        "--float-delay": `${i * 0.45}s`,
      } as CSSProperties;
    }
    return {
      "--i": i,
      "--s": depth.s,
      "--hs": 1,
      "--o": depth.o,
      "--b": depth.b,
      "--z": depth.z,
      "--dx": "0px",
      "--rise-delay": `${i * 90}ms`,
      "--float-delay": `${i * 0.45}s`,
    } as CSSProperties;
  };

  return (
    <section
      ref={sectionRef}
      className={`stl${mode === "detail" ? " is-detail" : ""}`}
      aria-label="Shop the Look"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Heading: crossfades into the look title in detail view. */}
      <div className="stl-head">
        <div className="stl-heading stl-heading-default">
          <h2>Shop the Look.</h2>
          <p>Six looks, styled head to toe. Tap a pin to see the pieces.</p>
        </div>
        <div className="stl-heading stl-heading-detail" aria-hidden={mode !== "detail"}>
          <h2>
            <span className="stl-eyebrow">Look {look.num}</span>
            {look.name}
          </h2>
          <p>Three pieces — {look.products.map((item) => item.product.colour).join(", ")}.</p>
        </div>
      </div>

      <div className="stl-body">
        <div>
          <div
            className={`stl-stage${hovered !== null ? " is-hovering" : ""}`}
            onClick={onStageClick}
            onKeyDown={onStageKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            tabIndex={0}
            role="group"
            aria-label="Look stage. Use left and right arrow keys to change look."
          >
            <div className="stl-scroll" ref={scrollRef}>
              <div className="stl-track" ref={trackRef}>
                {SHOP_LOOKS.map((item, i) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      modelRefs.current[i] = el;
                    }}
                    className={`stl-model${hovered === i ? " is-hovered" : ""}${
                      mode === "detail" && i === detailTarget ? " is-detail-target" : ""
                    }${mode === "detail" && i !== detailTarget ? " is-hidden-model" : ""}`}
                    style={modelStyle(i)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View look ${item.num}, ${item.name}`}
                    onClick={(e) => {
                      // A pin click highlights its product, not detail view.
                      if ((e.target as HTMLElement).closest(".stl-pin")) return;
                      if (mode === "detail" && detailTarget === i) return;
                      enterDetail(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (mode === "detail" && detailTarget === i) return;
                        enterDetail(i);
                      }
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="stl-model-rise">
                      <span className="stl-model-float">
                        <span className="stl-shadow" />
                        <span className="stl-model-hover">
                          <Image
                            className="stl-model-img"
                            src={item.model}
                            alt={item.alt}
                            width={1120}
                            height={2240}
                            priority={i === 0}
                            draggable={false}
                          />
                          {/* One pulsing pin in the lineup … */}
                          <button
                            type="button"
                            className="stl-pin stl-pin-lineup"
                            style={{ "--px": "50%", "--py": "62%" } as CSSProperties}
                            aria-label="See the pieces in this look"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHighlight(0);
                            }}
                          />
                          {/* … and three product pins on the outfit in detail view. */}
                          {item.products.map((prod, pi) => (
                            <button
                              key={prod.product.id}
                              type="button"
                              className={`stl-pin stl-pin-detail${highlight === pi ? " is-active" : ""}`}
                              style={
                                {
                                  "--px": `${prod.pin.x * 100}%`,
                                  "--py": `${prod.pin.y * 100}%`,
                                  "--pin-delay": `${pi * 80 + 120}ms`,
                                } as CSSProperties
                              }
                              aria-label={`Piece ${pi + 1}: ${prod.product.colour}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setHighlight(pi);
                              }}
                            />
                          ))}
                        </span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="stl-back"
              type="button"
              onClick={exitDetail}
            >
              ← Back to looks
            </button>
          </div>

          <div className="stl-controls">
            <button
              className="stl-arrow"
              type="button"
              aria-label="Previous look"
              onClick={() => goTo(active - 1)}
            >
              ←
            </button>
            <button
              className="stl-arrow"
              type="button"
              aria-label="Next look"
              onClick={() => goTo(active + 1)}
            >
              →
            </button>
            <div className="stl-segments" role="tablist" aria-label="Looks">
              {SHOP_LOOKS.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Look ${item.num}, ${item.name}`}
                  className={`stl-segment${i === active ? " is-active" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span className="stl-segment-bar" />
                  <span className="stl-segment-label">
                    {item.num} {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* "In this look" panel */}
        <aside className="stl-panel" aria-label="In this look">
          <p className="stl-panel-title">In this look</p>
          <p className="stl-panel-look">
            {look.num} · {look.name}
          </p>
          <div className="stl-panel-items" key={`${mode}-${active}`}>
            {look.products.map((item, pi) => (
              <Link
                key={item.product.id}
                className={`stl-panel-item${highlight === pi ? " is-active" : ""}`}
                style={{ "--item-delay": `${pi * 80}ms` } as CSSProperties}
                href={`/products/${item.product.slug}`}
                onMouseEnter={() => setHighlight(pi)}
              >
                <span
                  className={`stl-thumb${item.product.images.length > 1 ? " stl-thumb-split" : ""}`}
                >
                  {item.product.images.map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={200}
                      height={200}
                      loading="lazy"
                      draggable={false}
                    />
                  ))}
                </span>
                <span>
                  <span className="stl-panel-item-name">{item.product.name}</span>
                  <span className="stl-panel-item-colour">{item.product.colour}</span>
                </span>
                <span className="stl-panel-item-price">{formatPKR(item.product.price)}</span>
              </Link>
            ))}
          </div>
          <div className="stl-panel-total">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
          <button
            className={`stl-add-all${added ? " is-added" : ""}`}
            type="button"
            onClick={addAll}
          >
            {added ? `Added to bag ✓ — ${formatPKR(total)}` : `Add all to bag — ${formatPKR(total)}`}
          </button>
          <p className="stl-panel-note">Cash on delivery · 7-day exchange</p>
        </aside>
      </div>
    </section>
  );
}
