// components/Footer.tsx

import Link from "next/link";
import venlogo from "@/public/logo/venlogo.jpeg";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="bg-[#152238] py-13 pb-8 text-[13.5px] text-[#8D95A3]">
      <div className="container">
        <div className="mb-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Image
                src={venlogo}
                alt="Ventariq Logo"
                width={100}
                height={100}
              />
              <small className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#8fa0b4] block">
                A StratX Solutions Product
              </small>
            </div>
            <p className="max-w-[280px] text-[#8D95A3]">
              Plan Less. Experience More. Complete Experience Planners for
              the events worth flying for.
            </p>
          </div>

          <div>
            <h5 className="mb-4 font-serif text-[14.5px] font-bold text-white">
              Current Editions
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/events/us-open" className="hover:text-white">
                  US Open 2026
                </Link>
              </li>
              <li>
                <Link href="/events/tiff" className="hover:text-white">
                  TIFF 2026
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 font-serif text-[14.5px] font-bold text-white">
              Company
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-white">
                  About StratX
                </Link>
              </li>
              <li>
                <Link href="/#difference" className="hover:text-white">
                  The Ventariq Difference
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 font-serif text-[14.5px] font-bold text-white">
              Contact
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="hover:text-white">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="/resend-guide" className="hover:text-white">
                  Resend My Planner
                </Link>
              </li>
              <li>
                <a
                  href="https://stratxct.com"
                  className="hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  info@stratxct.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span>© {new Date().getFullYear()} StratX Solutions LLC. All rights reserved.</span>
          <span>Connecticut, USA</span>
        </div>

        <p className="mt-4 max-w-[760px] text-[12px] leading-[1.6] text-[#6C7585]">
          Ventariq is an independent travel-planning product of StratX
          Solutions LLC and is not affiliated with, endorsed by, or
          sponsored by the USTA, the US Open, TIFF, the Toronto
          International Film Festival, or any other organization
          referenced in our guides. All names and marks belong to their
          respective owners.
        </p>
      </div>
    </footer>
  );
}
