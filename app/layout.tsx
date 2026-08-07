// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const BASE_URL = process.env.WEBSITE_URL || "https://ventariq.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Ventariq | Plan Less. Experience More.",
    template: "%s | Ventariq",
  },
  description:
    "Complete Experience Planners for the events worth flying for — researched against official sources and labeled by how confident we actually are.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Ventariq",
    title: "Ventariq | Plan Less. Experience More.",
    description:
      "Complete Experience Planners for the events worth flying for.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventariq | Plan Less. Experience More.",
    description:
      "Complete Experience Planners for the events worth flying for.",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1420",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-[#0D1420] font-sans antialiased">
        <Navbar />
        {children}
        <Footer />
      
      </body>
    </html>
  );
}
