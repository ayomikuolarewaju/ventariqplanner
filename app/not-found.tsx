// app/not-found.tsx

import Link from "next/link";
import { getFeaturedEvent } from "@/lib/events";

/**
 * not-found — ComfortLifeUS
 *
 * Keeps the ticket-stub language consistent with the rest of the site:
 * a torn boarding pass, since the joke writes itself for a travel app —
 * "this gate doesn't exist." Server component (no motion) since
 * not-found.tsx can be rendered without a client boundary; the
 * perforation/notch styling alone carries the visual weight.
 */

export default async function NotFound() {
  const featured = await getFeaturedEvent();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-[#142050] shadow-lg shadow-black/20">
        {/* stub header, like a ticket's top half */}
        <div className="relative bg-[#0D1B4B] p-8 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-[#9DB2FF]">
            BOARDING PASS
          </p>
          <p className="mt-6 font-display text-8xl leading-none tracking-wide text-[#E8002D]">
            404
          </p>
          <p className="mt-2 font-mono text-xs tracking-widest text-white/40">
            GATE NOT FOUND
          </p>
        </div>

        {/* perforation with punched notches, same family as every other card */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
          />
          <div
            aria-hidden
            className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
          />
          <div className="border-t border-dashed border-white/25" />
        </div>

        {/* stub footer */}
        <div className="p-8 text-center">
          <h1 className="font-display text-3xl tracking-wide">
            This route never boarded.
          </h1>
          <p className="mt-3 text-sm text-blue-200">
            The page you&apos;re looking for doesn&apos;t exist, moved, or
            the link's out of date. Let&apos;s get you back on route.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded bg-[#E8002D] px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
            <Link
              href="/events"
              className="rounded border border-white/25 px-6 py-3 text-sm font-bold text-white/90 transition-colors hover:border-white/60"
            >
              Browse Events
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-widest text-white/30">
            {featured.eyebrow}
          </p>
        </div>
      </div>
    </main>
  );
}
