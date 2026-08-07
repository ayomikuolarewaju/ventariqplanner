// app/events/page.tsx

import EditionCard from "@/components/EditionCard";
import { getEvents } from "@/lib/events";

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Current Editions
          </p>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.07] text-white">
            Every guide we&apos;ve published.
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          {upcoming.length > 0 && (
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-xl font-bold text-[#152238]">
                Live Now
              </h2>
              <div className="grid gap-7 md:grid-cols-2">
                {upcoming.map((event, i) => (
                  <EditionCard key={event.slug} event={event} gradientIndex={i} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-6 font-serif text-xl font-bold text-[#5A6472]">
                Past Editions
              </h2>
              <div className="grid gap-7 md:grid-cols-2">
                {past.map((event, i) => (
                  <EditionCard key={event.slug} event={event} gradientIndex={i} />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <p className="text-[#5A6472]">No editions published yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
