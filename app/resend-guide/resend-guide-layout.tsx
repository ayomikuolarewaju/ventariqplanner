// app/resend-guide/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend My Guide",
  description:
    "Lost your Ventariq download link? Enter the email you used at checkout and we'll resend your guide instantly.",
  robots: { index: true, follow: true },
};

export default function ResendGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
