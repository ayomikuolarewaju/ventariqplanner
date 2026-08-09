"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/events", label: "Current Editions" },
  { href: "/#desk", label: "Intelligence Desk" },
  { href: "/#difference", label: "The Ventariq Difference" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#B8863B]/35 bg-[#152238]">
      <nav className="container flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#B8863B] font-serif text-[17px] font-bold text-[#0D1420]">
            V
          </span>
          <span className="flex flex-col leading-[1.05]">
            <strong className="font-serif text-[20px] font-bold tracking-wide text-white">
              Ventariq
            </strong>
            <small className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#8fa0b4]">
              A StratX Solutions Product
            </small>
          </span>
        </Link>

        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-[58px] flex-col items-start gap-4 bg-[#152238] px-8 py-5 text-sm md:static md:flex md:flex-row md:items-center md:gap-0 md:bg-transparent md:p-0`}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#C9C2A8] transition-colors hover:text-white md:mr-8"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/events"
            className="rounded-[5px] bg-[#B8863B] px-4.5 py-2.5 text-[13.5px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
          >
            Get a Planner
          </Link>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="text-2xl text-white md:hidden"
        >
          ☰
        </button>
      </nav>
    </header>
  );
}
