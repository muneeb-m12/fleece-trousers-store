// Minimal footer, like the original: copyright line + Privacy policy on
// the left, outlined circular Instagram and YouTube icons on the right.
// No shop links, no payment icons, no newsletter form.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <span className="font-semibold">© FLEECE. — Premium fleece trousers, Pakistan</span>
          <Link href="/collections/all" className="text-black/60 hover:text-black hover:underline">
            Privacy policy
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/30 transition hover:border-black hover:bg-black hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/30 transition hover:border-black hover:bg-black hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M22 8.2c-.2-1.4-1.4-2.5-2.8-2.7C17.4 5.2 14.8 5 12 5s-5.4.2-7.2.5C3.4 5.7 2.2 6.8 2 8.2 1.7 10 1.7 12 1.7 12s0 2 .3 3.8c.2 1.4 1.4 2.5 2.8 2.7 1.8.3 4.4.5 7.2.5s5.4-.2 7.2-.5c1.4-.2 2.6-1.3 2.8-2.7.3-1.8.3-3.8.3-3.8s0-2-.3-3.8ZM10 15V9l5.2 3L10 15Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
