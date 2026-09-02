// app/intelligence-desk/page.tsx

import Link from "next/link";
import { articles } from "@/lib/intelligence-articles";

export default function IntelligenceDeskPage() {
  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container max-w-3xl">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Ventariq Intelligence Desk
          </p>
          <h1 className="mb-6 font-serif text-5xl font-bold leading-[1.07] text-white">
            Practical intelligence for better event travel.
          </h1>
          <div className="space-y-4 text-[16px] leading-[1.6] text-[#C9C2A8]">
            <p>
              Major-event travel involves more than buying a ticket. Where
              you stay, how you move, what you verify, how much time you
              allow, and what you plan around the event can significantly
              shape your overall experience.
            </p>
            <p>
              The Ventariq Intelligence Desk provides free, practical
              Event Travel Intelligence designed to help travelers make
              more informed decisions before and during major-event
              trips.
            </p>
            <p>
              Our focus is not simply on giving you more information. It
              is on helping you understand what matters, what to verify,
              what can create unnecessary friction, and how different
              travel decisions work together.
            </p>
            <p className="font-serif text-lg text-[#B8863B]">
              Plan Less. Experience More.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/intelligence-desk/${article.slug}`}
                className="group rounded-[11px] border border-[#D8D2C2] bg-white p-6.5 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(21,34,56,0.35)]"
              >
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-[#8C6423]">
                  {article.category}
                </p>
                <h2 className="mb-2.5 font-serif text-xl text-[#152238]">
                  {article.title}
                </h2>
                <p className="mb-4 text-[13.8px] text-[#5A6472]">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-[12px] text-[#9AA3B2]">
                  <span>
                    {article.publishedDate} · {article.readingTime}
                  </span>
                  <span className="font-bold text-[#152238] transition-transform group-hover:translate-x-1">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
