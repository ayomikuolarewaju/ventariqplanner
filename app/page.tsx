// app/page.tsx

import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import HeroExcerptCard from "@/components/HeroExcerptCard";
import EditionCard from "@/components/EditionCard";
import { getEvents } from "@/lib/events";

const SPORT_ICONS: Record<string, string> = {
  Tennis: "🎾",
  Football: "⚽",
  Film: "🎬",
  Basketball: "🏀",
  Baseball: "⚾",
};

export default async function Home() {
  const events = await getEvents();
  const slides = events
    .filter((e) => !!e.heroImage)
    .map((e) => ({ src: e.heroImage as string, alt: `${e.name} Experience Planner` }));

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0D1420] py-28 pb-24 text-white md:min-h-[640px]">
        <HeroSlideshow slides={slides} />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 12%, rgba(184,134,59,0.16), transparent 40%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1420]/70 via-[#0D1420]/85 to-[#0D1420]" />

        <div className="container relative z-10 grid items-end gap-14 md:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-[650px] rounded-[10px] bg-[#0D1420]/90 px-6 py-10 md:px-10 md:py-14">
            <span className="mb-5 inline-flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
              <span className="h-[1.5px] w-[22px] bg-[#B8863B]" />
              Event Intelligence, Not Guesswork
            </span>

            <h1 className="mb-5 font-serif text-4xl font-bold leading-[1.07] text-white md:text-[50px]">
              Plan Less.
              <br />
              <em className="not-italic text-[#B8863B]">Experience More</em>.
            </h1>

            <p className="mb-8 max-w-[480px] text-[17.5px] text-[#C9C2A8]">
              Complete Experience Planners for the events worth flying for —
              tickets, venues, transit, and dining, researched against
              official sources and labeled by how confident we actually are.
            </p>

            <div className="mb-10 flex flex-wrap gap-3.5">
              <Link
                href="/events"
                className="rounded-[5px] bg-[#B8863B] px-6.5 py-3.5 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
              >
                Browse Current Editions
              </Link>
              <Link
                href="#difference"
                className="rounded-[5px] border border-white/28 px-6.5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-[#B8863B]"
              >
                See How We Verify
              </Link>
            </div>

            <div className="flex flex-wrap">
              {[
                { num: String(events.length || 2), lbl: "Events live for 2026" },
                { num: "50+", lbl: "Pages per guide" },
                { num: "4", lbl: "Confidence tags, every claims supported" },
              ].map((stat) => (
                <div
                  key={stat.lbl}
                  className="mb-3.5 mr-8 border-l-2 border-[#B8863B] pl-3.5"
                >
                  <span className="block font-serif text-[21px] font-bold text-white">
                    {stat.num}
                  </span>
                  <span className="text-xs text-[#9AA3B2]">{stat.lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <HeroExcerptCard />
        </div>
      </section>

      {/* EDITIONS */}
      <section id="editions" className="py-20">
        <div className="container">
          <div className="mb-13 max-w-[660px]">
            <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
              Current Editions
            </p>
            <h2 className="mb-3.5 font-serif text-[33px] font-bold text-[#152238]">
              {events.length} event{events.length !== 1 ? "s" : ""}.{" "}
              {events.length} complete guide{events.length !== 1 ? "s" : ""}.
            </h2>
            <p className="text-base text-[#5A6472]">
              Every Ventariq guide is a single flagship planner per event —
              comprehensive rather than fragmented, so there&apos;s one
              clear thing to buy and one clear thing to trust.
            </p>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2">
              {events.map((event, i) => (
                <EditionCard key={event.slug} event={event} gradientIndex={i} />
              ))}
            </div>
          ) : (
            <p className="text-[#5A6472]">No editions published yet.</p>
          )}
        </div>
      </section>

      {/* INTELLIGENCE DESK */}
      <section id="desk" className="bg-[#FCFBF8] py-20">
        <div className="container">
          <div className="mb-13 max-w-[660px]">
            <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
              Event Intelligence Desk
            </p>
            <h2 className="mb-3.5 font-serif text-[33px] font-bold text-[#152238]">
              A living product, not a static download.
            </h2>
            <p className="text-base text-[#5A6472]">
              Editions get real, versioned updates when time-sensitive
              details change — this is where we keep track of what&apos;s
              live, what&apos;s next, and what&apos;s being revised.
            </p>
          </div>

          <div className="overflow-hidden rounded-[11px] border border-[#D8D2C2] bg-white">
            {events.map((event) => (
              <DeskRow
                key={event.slug}
                icon={SPORT_ICONS[event.sport] ?? "📍"}
                title={`${event.name}${event.status === "upcoming" ? "" : " (Concluded)"}`}
                description={event.tagline}
                status={event.status === "upcoming" ? "Live" : "Archived"}
                statusColor={
                  event.status === "upcoming"
                    ? "bg-[#E8F2EC] text-[#3E6B52]"
                    : "bg-[#EDEEF1] text-[#5A6472]"
                }
              />
            ))}
            <DeskRow
              icon="↻"
              title="Edition updates"
              description="Versioned revisions whenever ticket policy, pricing, or venue details shift"
              status="Ongoing"
              statusColor="bg-[#EDEEF1] text-[#2A3E5C]"
            />
            <DeskRow
              icon="＋"
              title="Kanet"
              description="The next StratX product"
              status="Coming Soon"
              statusColor="bg-[#F3EEE2] text-[#8C6423]"
              last
            />
          </div>
        </div>
      </section>

      {/* THE VENTARIQ DIFFERENCE */}
      {/* <section id="difference" className="bg-[#F4F1EA] py-20">
        <div className="container">
          <div className="mb-13 max-w-[660px]">
            <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
              The Ventariq Difference
            </p>
            <h2 className="mb-3.5 font-serif text-[33px] font-bold text-[#152238]">
              Every claim, labeled by how sure we are.
            </h2>
            <p className="text-base text-[#5A6472]">
              Free blogs give you an answer. We give you an answer and
              tell you exactly how much to trust it — the same four-tag
              system runs through every guide we publish.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[10px] border border-[#D8D2C2] bg-[#D8D2C2] md:grid-cols-2">
            <DiffCell
              tag="✅ Verified"
              tagClass="bg-[#EAECF1] text-[#152238]"
              text="Confirmed directly against an official source — the venue, the transit authority, the festival itself."
            />
            <DiffCell
              tag="💡 Ventariq Insight"
              tagClass="bg-[#FBF4E6] text-[#8C6423]"
              text="Patterns we've synthesized across multiple reliable sources when no single official answer exists."
            />
            <DiffCell
              tag="⏱ Time Saver"
              tagClass="bg-[#EDF0F5] text-[#2A3E5C]"
              text="A specific action that cuts waiting, confusion, or a wasted trip across town."
            />
            <DiffCell
              tag="💰 Money Saver"
              tagClass="bg-[#FBF0DE] text-[#8C6423]"
              text="A concrete way to spend less without experiencing less."
            />
          </div>
        </div>
      </section> */}

      {/* HOW WE WORK */}
      {/* <section id="how-we-work" className="py-20">
        <div className="container">
          <div className="mb-13 max-w-[660px]">
            <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
              Research Standard
            </p>
            <h2 className="mb-3.5 font-serif text-[33px] font-bold text-[#152238]">
              Built like a research product, not a listicle.
            </h2>
            <p className="text-base text-[#5A6472]">
              Professionalism comes from showing the process: what gets
              researched, how it&apos;s labeled, how it&apos;s designed,
              and how it&apos;s updated.
            </p>
          </div>

          <div className="grid grid-cols-2 border-t border-[#D8D2C2] md:grid-cols-4">
            <MethodStep
              n="01 · Research"
              title="Official sources first"
              text="Event organizers, venue operators, and transit agencies are checked directly — not scraped from someone else's guess."
            />
            <MethodStep
              n="02 · Structure"
              title="Turn facts into decisions"
              text="Raw information becomes comparison tables, maps, decision trees, and checklists built for use under time pressure."
            />
            <MethodStep
              n="03 · Label"
              title="Show confidence clearly"
              text="Fact, synthesis, and uncertainty are visually distinguished — never blended together into one confident-sounding voice."
            />
            <MethodStep
              n="04 · Revise"
              title="Versioned, not static"
              text="Each edition is dated and numbered, so a current guide is never confused with an outdated copy."
            />
          </div>
        </div>
      </section> */}

      {/* ABOUT STRIP */}
      <section id="about" className="bg-[#0D1420] py-16 text-white">
        <div className="container grid items-center gap-14 md:grid-cols-2">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-[20px] border border-[#B8863B]/40 px-3.5 py-1.5 text-[12.5px] text-[#B8863B]">
              🛡 A StratX Solutions LLC Company
            </span>
            <h2 className="mb-4 font-serif text-[27px] font-bold text-white">
              Ventariq is built by StratX Solutions — a Connecticut-based
              company built around one idea.
            </h2>
            <p className="mb-5 text-[15px] text-[#B7BEC9]">
              Major events generate an enormous amount of scattered,
              unreliable planning information. StratX builds focused
              intelligence products that fix that, one event at a time —
              Ventariq is the first.
            </p>
            <Link
              href="/about"
              className="inline-block rounded-[5px] border border-white/28 px-6.5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-[#B8863B]"
            >
              More about StratX →
            </Link>
          </div>

          <div className="rounded-[10px] border border-dashed border-white/28 bg-white/[0.03] p-5.5">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="font-serif text-sm text-[#9AA3B2]">
                What&apos;s Next
              </span>
              <span className="rounded-[20px] bg-[#B8863B]/15 px-2.5 py-1 text-[11px] font-bold text-[#B8863B]">
                Coming Soon
              </span>
            </div>
            <h4 className="mb-1.5 font-serif text-[19px] text-white">
              Kanet
            </h4>
            <p className="text-[13px] text-[#9AA3B2]">
              StratX&apos;s next product is in development. Details to
              follow as it gets closer to launch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DeskRow({
  icon,
  title,
  description,
  status,
  statusColor,
  last,
}: {
  icon: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4.5 px-6 py-5 ${
        last ? "" : "border-b border-[#D8D2C2]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[9px] bg-[#F4F1EA] text-lg">
          {icon}
        </div>
        <div>
          <h4 className="mb-0.5 font-serif text-base text-[#152238]">
            {title}
          </h4>
          <p className="text-[12.8px] text-[#5A6472]">{description}</p>
        </div>
      </div>
      <span
        className={`whitespace-nowrap rounded-[20px] px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] ${statusColor}`}
      >
        {status}
      </span>
    </div>
  );
}

function DiffCell({
  tag,
  tagClass,
  text,
}: {
  tag: string;
  tagClass: string;
  text: string;
}) {
  return (
    <div className="bg-white px-6 py-6.5">
      <span
        className={`mb-3.5 inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-1 text-xs font-bold ${tagClass}`}
      >
        {tag}
      </span>
      <p className="text-[13.8px] text-[#5A6472]">{text}</p>
    </div>
  );
}

function MethodStep({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-[#D8D2C2] py-7 pr-5.5">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8C6423]">
        {n}
      </div>
      <h3 className="mb-2 font-serif text-[17px] text-[#152238]">{title}</h3>
      <p className="text-[13.6px] text-[#5A6472]">{text}</p>
    </div>
  );
}
