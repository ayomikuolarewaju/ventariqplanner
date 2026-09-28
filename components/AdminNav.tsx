"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/chat-leads", label: "Chat Leads" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-white/10 bg-[#0D1420]">
      <nav className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-6">
          <span className="font-serif text-lg font-bold text-white">
            Ventariq Admin
          </span>
          <ul className="hidden items-center gap-5 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[13px] font-semibold transition-colors ${
                      active ? "text-[#B8863B]" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-[5px] border border-white/25 px-4 py-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:border-[#B8863B] hover:text-white"
        >
          Log Out
        </button>
      </nav>
    </header>
  );
}
