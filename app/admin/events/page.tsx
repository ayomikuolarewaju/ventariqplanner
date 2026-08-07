// app/admin/events/page.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import DeleteEventButton from "@/components/DeleteEventButton";

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, slug, name, status")
    .order("created_at", { ascending: false });

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="rounded bg-[#E8002D] px-5 py-2 text-sm font-bold"
        >
          + New Event
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-[#142050]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 font-mono text-xs tracking-widest text-white/50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((event) => (
              <tr key={event.id} className="border-t border-white/10">
                <td className="p-4 font-bold">{event.name}</td>
                <td className="p-4 text-white/60">{event.slug}</td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-1 font-mono text-[10px] tracking-widest ${
                      event.status === "upcoming"
                        ? "bg-[#E8002D]/20 text-[#E8002D]"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {event.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="mr-4 text-white/70 hover:text-white"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton eventId={event.id} />
                </td>
              </tr>
            ))}
            {(events ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/50">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
