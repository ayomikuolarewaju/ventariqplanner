// app/about/page.tsx

import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            About Us
          </p>
          <p className="max-w-2xl text-[17px] text-[#C9C2A8]">
            StratX Solutions, founded by Dr. Mojeed Oyeniyi, develops
            intelligent digital solutions that simplify real-world
            experiences. Through thoughtful technology and practical
            innovation, we build trusted solutions that create
            convenience for people, help them save time, and ultimately
            enhance their decisions and experiences.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
            Ventariq
          </p>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.07] text-[#152238]">
            Plan Less. <span className="text-[#8C6423]">Experience More.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] text-[#5A6472]">
            Ventariq is an Event Travel Intelligence solution developed
            by StratX. We help travelers confidently attend major events
            without the fear of uncertainties about the event
            destination, safety, and other logistics. Rather than
            engaging in time-consuming planning and searches across
            various platforms, Ventariq brings relevant information
            together in one organized experience, helping travelers
            spend less time planning and more time enjoying their
            events.
          </p>

          <div className="mt-10 rounded-[11px] border border-[#D8D2C2] bg-[#F4F1EA] p-7">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C6423]">
              Our Origin
            </p>
            <p className="max-w-2xl text-[#5A6472]">
              Ventariq started as ComfortLifeUS during the 2026 FIFA
              World Cup, when it provided valuable electronic Planners
              to fans that saved them ample planning time and delivered
              a great experience during the games.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0D1420] py-16 text-white">
        <div className="container">
          <span className="mb-5 inline-flex items-center gap-2 rounded-[20px] border border-[#B8863B]/40 px-3.5 py-1.5 text-[12.5px] text-[#B8863B]">
            🛡 A StratX Solutions LLC Company
          </span>
          <h2 className="max-w-2xl font-serif text-[27px] font-bold text-white">
            Built by a Connecticut-based company around one idea.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] text-[#B7BEC9]">
            Major events generate an enormous amount of scattered,
            unreliable planning information. StratX builds focused
            intelligence products that fix that, one event at a time —
            Ventariq is the first.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="rounded-[11px] border border-dashed border-[#D8D2C2] p-10 text-center">
            <h2 className="font-serif text-2xl font-bold text-[#152238]">
              Ready to plan your trip?
            </h2>
            <Link
              href="/events"
              className="mt-6 inline-block rounded-[5px] bg-[#B8863B] px-6 py-3 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
            >
              Browse Current Editions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
