// Scroll-reveal wrapper — the original's dominant animation, rebuilt to
// match its HEAVY feel: headings slide in ~96px from the sides over
// ~950ms, and images wipe in behind a clip-path mask while the image
// inside zooms out from 1.2 — that wipe + zoom is what makes the
// original's mid-transition frames look split/fragmented, with a brief
// blank flash before the content settles.
//
// Keyframe animations (not transitions) so the wipe and the zoom can run
// together, and so `animation-delay` holds the `from` state during
// staggered delays (fill-mode: both, see globals.css).
//
// Implemented with IntersectionObserver; under prefers-reduced-motion the
// content renders immediately with no animation.

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** slide/fade direction — "clip" is the image wipe + zoom */
  from?: "up" | "left" | "right" | "scale" | "clip";
  /** stagger delay in ms (cards sit ~90–120ms apart) */
  delay?: number;
};

const HIDDEN: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "rv-hidden-up",
  left: "rv-hidden-left",
  right: "rv-hidden-right",
  scale: "rv-hidden-scale",
  clip: "rv-hidden-clip",
};

const ANIM: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "rv-anim-up",
  left: "rv-anim-left",
  right: "rv-anim-right",
  scale: "rv-anim-scale",
  clip: "rv-anim-clip",
};

export default function Reveal({
  children,
  className = "",
  from = "up",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Under reduced motion the content is visible immediately, with no
  // observer and no animation (decided at first render, not in an effect).
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  // Clip variant: the outer div is the wipe mask (overflow hidden so the
  // zooming content cannot spill out mid-animation), the inner div is
  // the zooming image/content.
  if (from === "clip") {
    return (
      <div
        ref={ref}
        className={`${className} overflow-hidden ${
          visible ? ANIM.clip : HIDDEN.clip
        }`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          className={visible ? "rv-anim-clip-img" : "rv-hidden-clip-img"}
          style={{ animationDelay: `${delay}ms` }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? ANIM[from] : HIDDEN[from]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
