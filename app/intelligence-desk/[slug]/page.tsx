// app/intelligence-desk/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticle, CALLOUT_META, type ContentBlock } from "@/lib/intelligence-articles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
  };
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-[16px] leading-[1.7] text-[#33404F]">{block.text}</p>;

    case "list":
      return (
        <ul className="space-y-2 pl-1">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15.5px] leading-[1.6] text-[#33404F]">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B8863B]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "numbered":
      return (
        <div className="space-y-5">
          {block.items.map((item, i) => (
            <div key={item.heading}>
              <h3 className="mb-1.5 font-serif text-lg text-[#152238]">
                {i + 1}. {item.heading}
              </h3>
              <p className="text-[15.5px] leading-[1.6] text-[#33404F]">{item.text}</p>
            </div>
          ))}
        </div>
      );

    case "callout": {
      const meta = CALLOUT_META[block.kind];
      return (
        <div
          className="rounded-[6px] border-l-4 p-5"
          style={{ backgroundColor: meta.bg, borderColor: meta.text }}
        >
          <p className="mb-1.5 text-[11px] font-bold tracking-[0.04em]" style={{ color: meta.text }}>
            {meta.label}
          </p>
          <p className="text-[15px] leading-[1.6]" style={{ color: meta.text }}>
            {block.text}
          </p>
        </div>
      );
    }

    case "takeaway":
      return (
        <div className="rounded-[10px] bg-[#152238] p-7 text-center text-white">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#B8863B]">
            The Ventariq Takeaway
          </p>
          <h3 className="font-serif text-xl text-white">{block.title}</h3>
          {block.text && (
            <p className="mt-2 text-[14.5px] text-[#C9C2A8]">{block.text}</p>
          )}
        </div>
      );
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main>
      <section className="border-b border-[#D8D2C2] bg-[#FCFBF8] py-16">
        <div className="container max-w-2xl">
          <Link
            href="/intelligence-desk"
            className="mb-6 inline-block text-[13px] font-semibold text-[#5A6472] hover:text-[#152238]"
          >
            ← Intelligence Desk
          </Link>
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
            {article.category}
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold leading-[1.1] text-[#152238]">
            {article.title}
          </h1>
          <p className="text-[13px] text-[#9AA3B2]">
            {article.publishedDate} · {article.readingTime}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-2xl space-y-6">
          {article.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}

          {/* CTA -- every article ends here */}
          <div className="rounded-[11px] border border-dashed border-[#D8D2C2] p-8 text-center">
            <p className="mb-2 text-[13px] text-[#5A6472]">Planning an event now?</p>
            <p className="mb-5 font-serif text-lg text-[#152238]">
              Explore Ventariq&apos;s current event intelligence and
              Experience Planners.
            </p>
            <Link
              href="/events"
              className="inline-block rounded-[5px] bg-[#B8863B] px-6 py-3 text-[14px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
            >
              View Current Events & Planners →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
