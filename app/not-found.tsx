// app/not-found.tsx

import Link from "next/link";
import { getFeaturedEvent } from "@/lib/events";

export default async function NotFound() {
  const featured = await getFeaturedEvent();

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0D1420] px-6 py-24 text-white">
      <div className="w-full max-w-md text-center">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
          Not Yet Confirmed
        </p>

        <p className="font-serif text-8xl font-bold leading-none text-[#B8863B]">
          404
        </p>

        <h1 className="mt-6 font-serif text-3xl font-bold text-white">
          This page isn&apos;t in any edition.
        </h1>
        <p className="mt-4 text-[15px] text-[#C9C2A8]">
          It may have moved, or the link&apos;s out of date. Let&apos;s
          get you back to something researched.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-[5px] bg-[#B8863B] px-6 py-3 text-[14px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
          >
            Back to Home
          </Link>
          <Link
            href="/events"
            className="rounded-[5px] border border-white/28 px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:border-[#B8863B]"
          >
            Browse Current Editions
          </Link>
        </div>

        <p className="mt-10 text-[11px] uppercase tracking-widest text-white/30">
          {featured.eyebrow}
        </p>
      </div>
    </main>
  );
}
