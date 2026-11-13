// Scroll-reveal wrapper — the original's dominant animation: headings and
// images slide/fade in from the sides and images scale up on scroll.
// Implemented with IntersectionObserver; under prefers-reduced-motion the
// content renders immediately with no animation.

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** slide/fade direction */
  from?: "up" | "left" | "right" | "scale";
  delay?: number;
};

const HIDDEN: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translate-y-10 opacity-0",
  left: "-translate-x-10 opacity-0",
  right: "translate-x-10 opacity-0",
  scale: "scale-[1.04] opacity-0",
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

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : HIDDEN[from]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
