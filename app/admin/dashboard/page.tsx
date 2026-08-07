// app/admin/dashboard/page.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: orderCount }, { count: eventCount }, { count: adminCount }] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("admins").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    {
      href: "/admin/orders",
      label: "Orders",
      count: orderCount ?? 0,
      description: "View and update fulfillment status",
    },
    {
      href: "/admin/events",
      label: "Events",
      count: eventCount ?? 0,
      description: "Manage events, plans, and locations",
    },
    {
      href: "/admin/admins",
      label: "Admins",
      count: adminCount ?? 0,
      description: "Manage who has admin access",
    },
  ];

  return (
    <main className="container py-10">
      <h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl bg-[#142050] p-6 transition-colors hover:bg-[#1a2a68]"
          >
            <p className="font-mono text-xs tracking-widest text-[#F5B301]">
              {card.label.toUpperCase()}
            </p>
            <p className="mt-3 text-4xl font-bold">{card.count}</p>
            <p className="mt-2 text-sm text-blue-200">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
