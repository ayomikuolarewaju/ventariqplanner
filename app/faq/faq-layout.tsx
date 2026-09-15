// app/faq/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "How guide delivery works, what happens if you lose your download link, refund policy, and everything else about buying a Ventariq Experience Planner.",
  robots: { index: true, follow: true },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
