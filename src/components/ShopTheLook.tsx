// "Shop the Look" — Nike-style editorial section.
//
// Same section as the standalone public/shop-the-look.html, ported to
// React and wired into the store: it uses the site's header (no second
// nav here) and "Add all to bag" adds all three pieces to the shared
// cart (size L) via useCart.
//
// Motion is transform/opacity-only (60fps), driven by one rAF loop:
// the lineup is a slow auto-drift carousel — the row glides to the
// next look every 3.5s (900ms glide on the spring ease
// cubic-bezier(0.22, 1, 0.36, 1)), the centred model sharpens and
// scales up, the outgoing centre blurs/fades, a new model enters from
// the right edge, and the segment bar / look name / panel follow the
// centred model. The row also follows the pointer with depth-graded
// mouse parallax (centre model ±18px, next ±10px, outer ±5px, plus a
// tiny vertical shift). Drift pauses while hovering/touching the
// stage, in detail view, and for ~6s after a manual change; no drift
// under prefers-reduced-motion. Clicking a model glides it to the
// centre at ~1.6x while the others fade/blur away. Esc / Back /
// background click reverses; arrows and swipe switch looks in detail
// view.
//
// The row is 18 slots (three copies of the 6 looks) so the carousel
// can glide forever: when the centre would run off the end, it resets
// by exactly one look cycle (±6 slots), which shows the same looks at
// the same screen positions and is therefore invisible.
//
// Images come from src/lib/shop-looks.ts. The model photos are JPGs on
// pure white, not transparent PNGs — rendered with mix-blend-mode:
// multiply so the white disappears; swapping in real transparent PNGs
// only needs new entries in that array.

"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

/* Motion constants — keep in sync with public/shop-the-look.html. */
const SLOT_COUNT = 18; // three copies of the 6 looks (slots 0..17)
const LOOK_COUNT = 6;
const CENTRE_MIN = 3; // centre-slot range with a full window
const CENTRE_MAX = 14;
const INITIAL_CENTRE = 6; // look 01 centred at rest
const DRIFT_MS = 3500; // auto-drift interval
const GLIDE_MS = 900; // one drift step / manual glide
const RESUME_MS = 6000; // pause after a manual change
const lookOf = (slot: number) => ((slot % LOOK_COUNT) + LOOK_COUNT) % LOOK_COUNT;

/* Cubic-bezier easing solver (same curve as CSS cubic-bezier()). */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  function solveX(x: number) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      if (err > 0) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return t;
  }
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
}
const SPRING = cubicBezier(0.22, 1, 0.36, 1);

/* Depth of field: distance from the (moving) centre slot. Same curve
   as the original static version — only the centre moves now. */
function depthForSlot(slot: number, centre: number) {
  const d = Math.abs(slot - centre);
  return {
    s: Math.max(0.86, 1 - 0.055 * d),
    b: `${(d * 1.2).toFixed(1)}px`,
    o: Math.max(0.8, 1 - 0.08 * d).toFixed(2),
    z: 10 - Math.round(d),
  };
}
/* Parallax range by depth: the sharp centre model moves most, the
   next ones less, the blurred outer ones least. */
function parallaxRange(d: number) {
  if (d < 0.75) return { x: 18, y: 6 };
  if (d < 1.75) return { x: 10, y: 4 };
  return { x: 5, y: 2 };
}

type Glide = {
  fromCentre: number;
  toCentre: number;
  fromTx: number;
  toTx: number;
  start: number;
  onDone: (() => void) | null;
};

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

  /* Motion state lives in refs — the rAF loop is the only writer of
     the track transform and the per-model parallax vars (--mx/--my)
     while it runs, so it must never wait on a React render. */
  const centreSlotRef = useRef(INITIAL_CENTRE);
  const detailTargetRef = useRef<number | null>(null);
  const driftTxRef = useRef(0);
  const parallaxTxRef = useRef(0);
  const pointerNXRef = useRef(0);
  const pointerNYRef = useRef(0);
  const pointerOverRef = useRef(false);
  const parallaxXRef = useRef<number[]>(new Array(SLOT_COUNT).fill(0));
  const parallaxYRef = useRef<number[]>(new Array(SLOT_COUNT).fill(0));
  const glidingRef = useRef<Glide | null>(null);
  const motionRafRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const touchingRef = useRef(false);
  const inViewRef = useRef(false);
  const lastManualRef = useRef(0);
  const lastStepRef = useRef(0);
  const modeRef = useRef<Mode>("lineup");
  const reducedMotionRef = useRef(false);
  const finePointerRef = useRef(false);

  const look = SHOP_LOOKS[active];
  const total = shopLookTotal(look);

  /* ---- track + depth ---- */
  const writeTrack = useCallback(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    trackEl.style.transform = `translate3d(${(driftTxRef.current + parallaxTxRef.current).toFixed(1)}px, 0, 0)`;
  }, []);

  /* Drift translate that centres slot c. Computed from the current
     total track transform, so the parallax offset is preserved. */
  const txForSlot = useCallback((c: number) => {
    const el = modelRefs.current[c];
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!el || !scrollEl || !trackEl) return driftTxRef.current;
    const stageRect = scrollEl.getBoundingClientRect();
    const trackRect = trackEl.getBoundingClientRect();
    const slotCentre = trackRect.left + el.offsetLeft + el.offsetWidth / 2;
    const visibleCentre = stageRect.left + stageRect.width / 2;
    return driftTxRef.current + (visibleCentre - slotCentre);
  }, []);

  /* Depth vars for every model from a (possibly fractional) centre. */
  const applyLineupDepth = useCallback((centre: number) => {
    modelRefs.current.forEach((el, k) => {
      if (!el) return;
      const depth = depthForSlot(k, centre);
      el.style.setProperty("--s", String(depth.s));
      el.style.setProperty("--o", String(depth.o));
      el.style.setProperty("--b", depth.b);
      el.style.setProperty("--z", String(depth.z));
    });
  }, []);

  /* Instant, invisible centre reset: shifting the centre by exactly
     one look cycle (6 slots) shows the same looks at the same screen
     positions, so the row never has to sweep back across the rail. */
  const resetCentre = useCallback(
    (delta: number) => {
      centreSlotRef.current += delta;
      driftTxRef.current = txForSlot(centreSlotRef.current);
      writeTrack();
      applyLineupDepth(centreSlotRef.current);
    },
    [txForSlot, writeTrack, applyLineupDepth],
  );

  /* Bring a glide target into the [CENTRE_MIN, CENTRE_MAX] window,
     resetting the centre first when needed (invisible, see above). */
  const normalizeTarget = useCallback(
    (target: number) => {
      while (target > CENTRE_MAX) {
        resetCentre(-LOOK_COUNT);
        target -= LOOK_COUNT;
      }
      while (target < CENTRE_MIN) {
        resetCentre(LOOK_COUNT);
        target += LOOK_COUNT;
      }
      return target;
    },
    [resetCentre],
  );

  /* The centred look changed (a drift step or manual glide finished):
     segment bar, look name, and panel all follow it (state, so the
     panel remounts and crossfades via CSS). */
  const updateActiveLook = useCallback((next: number) => {
    setActive(next);
  }, []);

  /* ---- the single rAF motion loop: drift glide + mouse parallax ---- */
  const ensureMotionLoop = useCallback(() => {
    if (motionRafRef.current !== null || reducedMotionRef.current) return;
    const sectionEl = sectionRef.current;
    if (sectionEl) sectionEl.classList.add("stl-live");
    const tick = (now: number) => {
      motionRafRef.current = null;
      let busy = false;
      const g = glidingRef.current;
      if (g) {
        const p = Math.min(1, (now - g.start) / GLIDE_MS);
        const e = SPRING(p);
        const effCentre = g.fromCentre + (g.toCentre - g.fromCentre) * e;
        driftTxRef.current = g.fromTx + (g.toTx - g.fromTx) * e;
        centreSlotRef.current = effCentre;
        applyLineupDepth(effCentre);
        if (p >= 1) {
          centreSlotRef.current = g.toCentre;
          driftTxRef.current = txForSlot(g.toCentre);
          applyLineupDepth(g.toCentre);
          const done = g.onDone;
          glidingRef.current = null;
          updateActiveLook(lookOf(g.toCentre));
          if (done) done();
        } else busy = true;
      }
      if (modeRef.current === "lineup" && finePointerRef.current) {
        const lerp = (cur: number, tgt: number) => cur + (tgt - cur) * 0.12;
        parallaxTxRef.current = lerp(
          parallaxTxRef.current,
          pointerOverRef.current ? pointerNXRef.current * 20 : 0,
        );
        let settled = Math.abs(parallaxTxRef.current) < 0.1;
        modelRefs.current.forEach((el, k) => {
          if (!el) return;
          const d = Math.abs(k - centreSlotRef.current);
          const r = parallaxRange(d);
          const tx = pointerOverRef.current ? r.x * pointerNXRef.current * 2 : 0;
          const ty = pointerOverRef.current ? r.y * pointerNYRef.current * 2 : 0;
          parallaxXRef.current[k] = lerp(parallaxXRef.current[k] ?? 0, tx);
          parallaxYRef.current[k] = lerp(parallaxYRef.current[k] ?? 0, ty);
          el.style.setProperty("--mx", `${parallaxXRef.current[k].toFixed(1)}px`);
          el.style.setProperty("--my", `${parallaxYRef.current[k].toFixed(1)}px`);
          if (Math.abs(parallaxXRef.current[k]) > 0.1 || Math.abs(parallaxYRef.current[k]) > 0.1)
            settled = false;
        });
        if (!settled) busy = true;
      }
      writeTrack();
      if (busy) motionRafRef.current = requestAnimationFrame(tick);
      else if (sectionEl) sectionEl.classList.remove("stl-live");
    };
    motionRafRef.current = requestAnimationFrame(tick);
  }, [applyLineupDepth, txForSlot, writeTrack, updateActiveLook]);

  const stopMotionLoop = useCallback(() => {
    if (motionRafRef.current !== null) {
      cancelAnimationFrame(motionRafRef.current);
      motionRafRef.current = null;
    }
    if (sectionRef.current) sectionRef.current.classList.remove("stl-live");
  }, []);

  /* ---- glide ---- */
  const glideTo = useCallback(
    (targetCentre: number, onDone?: () => void) => {
      if (glidingRef.current) return;
      const target = normalizeTarget(targetCentre);
      if (target === Math.round(centreSlotRef.current)) {
        if (onDone) onDone();
        return;
      }
      if (reducedMotionRef.current) {
        centreSlotRef.current = target;
        driftTxRef.current = txForSlot(target);
        writeTrack();
        applyLineupDepth(target);
        updateActiveLook(lookOf(target));
        if (onDone) onDone();
        return;
      }
      glidingRef.current = {
        fromCentre: centreSlotRef.current,
        toCentre: target,
        fromTx: driftTxRef.current,
        toTx: txForSlot(target),
        start: performance.now(),
        onDone: onDone ?? null,
      };
      ensureMotionLoop();
    },
    [normalizeTarget, txForSlot, writeTrack, applyLineupDepth, updateActiveLook, ensureMotionLoop],
  );

  const finishGlideNow = useCallback(() => {
    const g = glidingRef.current;
    if (!g) return;
    glidingRef.current = null;
    centreSlotRef.current = g.toCentre;
    driftTxRef.current = txForSlot(g.toCentre);
    writeTrack();
    applyLineupDepth(g.toCentre);
    updateActiveLook(lookOf(g.toCentre));
    if (g.onDone) g.onDone();
  }, [txForSlot, writeTrack, applyLineupDepth, updateActiveLook]);

  const step = useCallback(
    (dir: number) => {
      if (modeRef.current !== "lineup" || glidingRef.current) return;
      lastStepRef.current = performance.now();
      glideTo(centreSlotRef.current + dir);
    },
    [glideTo],
  );

  const noteManual = useCallback(() => {
    lastManualRef.current = performance.now();
    lastStepRef.current = performance.now();
  }, []);

  const goToLook = useCallback(
    (lookIndex: number) => {
      const target = ((lookIndex % LOOK_COUNT) + LOOK_COUNT) % LOOK_COUNT;
      // Nearest slot showing this look (representatives are 6 apart).
      let best: number | null = null;
      let bestD = Infinity;
      for (let s = 0; s < SLOT_COUNT; s++) {
        if (lookOf(s) !== target) continue;
        const d = Math.abs(s - centreSlotRef.current);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      if (best !== null) glideTo(best);
    },
    [glideTo],
  );

  const resetParallaxNow = useCallback(() => {
    parallaxTxRef.current = 0;
    parallaxXRef.current.fill(0);
    parallaxYRef.current.fill(0);
    writeTrack();
    modelRefs.current.forEach((el) => {
      if (!el) return;
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  }, [writeTrack]);

  const nearestSlotForLook = useCallback((lookIndex: number, fromSlot: number) => {
    let best: number | null = null;
    let bestD = Infinity;
    for (let s = 0; s < SLOT_COUNT; s++) {
      if (lookOf(s) !== lookIndex) continue;
      const d = Math.abs(s - fromSlot);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best ?? fromSlot;
  }, []);

  /* Measure the px glide that puts model slot k at the centre of the
     stage. offsetLeft/offsetWidth are untransformed slot geometry (the
     model's offsetParent is the relatively-positioned track). */
  const centreModel = useCallback((k: number) => {
    const el = modelRefs.current[k];
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
    (k: number) => {
      modeRef.current = "detail";
      setMode("detail");
      finishGlideNow();
      stopMotionLoop();
      // Snap the parallax back to zero first (instant, while the model
      // transitions are off) so the detail glide is measured cleanly.
      const sectionEl = sectionRef.current;
      if (sectionEl) sectionEl.classList.add("stl-live");
      resetParallaxNow();
      if (sectionEl) sectionEl.classList.remove("stl-live");
      detailTargetRef.current = k;
      setDetailTarget(k);
      setActive(lookOf(k));
      centreModel(k);
    },
    [finishGlideNow, stopMotionLoop, resetParallaxNow, centreModel],
  );

  const switchDetail = useCallback(
    (i: number) => {
      const lookIndex = ((i % LOOK_COUNT) + LOOK_COUNT) % LOOK_COUNT;
      const next = nearestSlotForLook(lookIndex, detailTargetRef.current ?? 0);
      detailTargetRef.current = next;
      setDetailTarget(next);
      setActive(lookIndex);
      // Measure after the outgoing model starts leaving.
      requestAnimationFrame(() => centreModel(next));
    },
    [nearestSlotForLook, centreModel],
  );

  const exitDetail = useCallback(() => {
    // Snap the row so the detail look is centred (invisible: the other
    // models are still faded out), then fade the lineup back in.
    let c = detailTargetRef.current ?? INITIAL_CENTRE;
    while (c < CENTRE_MIN) c += LOOK_COUNT;
    while (c > CENTRE_MAX) c -= LOOK_COUNT;
    centreSlotRef.current = c;
    driftTxRef.current = txForSlot(c);
    writeTrack();
    // Restore the lineup depth imperatively — the render does not
    // write the depth vars (the rAF loop owns them).
    applyLineupDepth(c);
    modeRef.current = "lineup";
    setMode("lineup");
    detailTargetRef.current = null;
    setDetailTarget(null);
    setDx(0);
    setActive(lookOf(c));
    // Give the row a beat before the drift resumes.
    lastManualRef.current = performance.now();
    lastStepRef.current = performance.now();
  }, [txForSlot, writeTrack, applyLineupDepth]);

  /* Manual change (segment dot, arrow, swipe, keyboard): glide the row
     so that look reaches the centre; drift resumes ~6s later. */
  const goTo = useCallback(
    (i: number) => {
      if (modeRef.current === "detail") {
        switchDetail(i);
        return;
      }
      noteManual();
      if (glidingRef.current) return;
      goToLook(i);
    },
    [switchDetail, goToLook, noteManual],
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
            inViewRef.current = true;
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Client-only environment flags (matchMedia needs window). */
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    finePointerRef.current = window.matchMedia("(pointer: fine)").matches;
  }, []);

  /* Mirror mode into a ref for the motion loop / timer. */
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /* Initial track position + depth: centre look 01 before first
     paint, so the row never flashes in the wrong place. */
  useLayoutEffect(() => {
    driftTxRef.current = txForSlot(INITIAL_CENTRE);
    writeTrack();
    applyLineupDepth(INITIAL_CENTRE);
    lastStepRef.current = performance.now();
  }, [txForSlot, writeTrack, applyLineupDepth]);

  /* Keyboard: Esc goes back; arrows switch looks in detail view. */
  useEffect(() => {
    if (mode !== "detail") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitDetail();
      if (e.key === "ArrowLeft") switchDetail(active - 1);
      if (e.key === "ArrowRight") switchDetail(active + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, active, exitDetail, switchDetail]);

  /* Re-measure on resize (the slot geometry changes with the stage). */
  useEffect(() => {
    const onResize = () => {
      finishGlideNow();
      if (mode === "detail" && detailTarget !== null) centreModel(detailTarget);
      else {
        driftTxRef.current = txForSlot(centreSlotRef.current);
        writeTrack();
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode, detailTarget, centreModel, finishGlideNow, txForSlot, writeTrack]);

  /* Auto-drift timer: glide to the next look every 3.5s. Paused while
     the user hovers/touches the stage, in detail view, while the tab
     is hidden, and for ~6s after any manual change. */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (
        reducedMotionRef.current ||
        modeRef.current !== "lineup" ||
        !inViewRef.current ||
        hoveringRef.current ||
        touchingRef.current ||
        document.hidden ||
        glidingRef.current
      )
        return;
      const now = performance.now();
      if (now - lastManualRef.current < RESUME_MS || now - lastStepRef.current < DRIFT_MS) return;
      step(1);
    }, 300);
    return () => window.clearInterval(id);
  }, [step]);

  /* Stop the motion loop on unmount. */
  useEffect(() => {
    return () => {
      if (motionRafRef.current !== null) cancelAnimationFrame(motionRafRef.current);
    };
  }, []);

  /* Mouse parallax (transform-only, rAF + lerp, depth-graded). The row
     follows the pointer and each model shifts at its own rate, so the
     layering is clearly visible. Touch devices skip it (no mouse);
     reduced-motion users skip it entirely. */
  const onStageMouseMove = (e: ReactMouseEvent) => {
    if (reducedMotionRef.current || !finePointerRef.current || modeRef.current !== "lineup") return;
    const stageEl = scrollRef.current;
    if (!stageEl) return;
    const r = stageEl.getBoundingClientRect();
    pointerNXRef.current = (e.clientX - r.left) / r.width - 0.5;
    pointerNYRef.current = (e.clientY - r.top) / r.height - 0.5;
    pointerOverRef.current = true;
    ensureMotionLoop();
  };
  const onStageMouseEnter = () => {
    hoveringRef.current = true; // hover pauses the drift
    pointerOverRef.current = true;
  };
  const onStageMouseLeave = () => {
    hoveringRef.current = false;
    pointerOverRef.current = false;
    pointerNXRef.current = 0;
    pointerNYRef.current = 0;
    ensureMotionLoop(); // settle the parallax back to zero
  };

  /* Swipe: horizontal swipe switches looks. */
  const onTouchStart = (e: ReactTouchEvent) => {
    touchingRef.current = true;
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    touchingRef.current = false;
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

  /* The render owns only the detail-state vars and the static vars.
     The lineup depth vars (--s/--o/--b/--z) and the parallax offsets
     (--mx/--my) are owned imperatively by the rAF loop (and the layout
     effect below) — reading the motion refs during render would break
     React's render purity, and the loop overwrites them every frame
     while it runs anyway. */
  const modelStyle = (k: number): CSSProperties => {
    const base = {
      "--i": k,
      // Stagger by look, not slot, so the visible row rises 0..450ms.
      "--rise-delay": `${(k % LOOK_COUNT) * 90}ms`,
      "--float-delay": `${(k % LOOK_COUNT) * 0.45}s`,
    } as CSSProperties;
    if (mode === "detail") {
      if (k === detailTarget) {
        return {
          ...base,
          "--s": 1.6,
          "--hs": 1,
          "--o": 1,
          "--b": "0px",
          "--z": 20,
          "--dx": `${dx}px`,
        } as CSSProperties;
      }
      return {
        ...base,
        "--s": 1,
        "--hs": 0.95,
        "--o": 0,
        "--b": "8px",
        "--z": 1,
        "--dx": "0px",
      } as CSSProperties;
    }
    return {
      ...base,
      "--hs": 1,
      "--dx": "0px",
    } as CSSProperties;
  };

  return (
    <section
      ref={sectionRef}
      className={`stl${mode === "detail" ? " is-detail" : ""}`}
      aria-label="Shop the Look"
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
            onMouseMove={onStageMouseMove}
            onMouseEnter={onStageMouseEnter}
            onMouseLeave={onStageMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            tabIndex={0}
            role="group"
            aria-label="Look stage. Use left and right arrow keys to change look."
          >
            <div className="stl-scroll" ref={scrollRef}>
              <div className="stl-track" ref={trackRef}>
                {/* 18 slots: three copies of the 6 looks (see the note
                    at the top of this file). */}
                {Array.from({ length: SLOT_COUNT }, (_, k) => {
                  const item = SHOP_LOOKS[k % LOOK_COUNT];
                  return (
                    <div
                      key={k}
                      ref={(el) => {
                        modelRefs.current[k] = el;
                      }}
                      className={`stl-model${hovered === k ? " is-hovered" : ""}${
                        mode === "detail" && k === detailTarget ? " is-detail-target" : ""
                      }${mode === "detail" && k !== detailTarget ? " is-hidden-model" : ""}`}
                      style={modelStyle(k)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View look ${item.num}, ${item.name}`}
                      onClick={(e) => {
                        // A pin click highlights its product, not detail view.
                        if ((e.target as HTMLElement).closest(".stl-pin")) return;
                        if (mode === "detail" && detailTarget === k) return;
                        enterDetail(k);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (mode === "detail" && detailTarget === k) return;
                          enterDetail(k);
                        }
                      }}
                      onMouseEnter={() => setHovered(k)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(k)}
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
                              loading={k >= CENTRE_MIN && k <= 9 ? "eager" : "lazy"}
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
                  );
                })}
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
