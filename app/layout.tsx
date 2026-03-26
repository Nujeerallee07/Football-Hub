// app/layout.tsx
import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { LiveScoreTicker } from "@/components/layout/LiveScoreTicker";
import { Footer } from "@/components/layout/Footer";
import { ReactQueryProvider } from "@/lib/providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Football Live Hub – Premier League & Champions League Live Scores",
    template: "%s | Football Live Hub",
  },
  description:
    "Real-time Premier League and Champions League scores, fixtures, standings, betting odds, and team stats. The ultimate football dashboard.",
  keywords: [
    "football",
    "live scores",
    "Premier League",
    "Champions League",
    "betting odds",
    "fixtures",
    "standings",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Football Live Hub",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-pitch-950 font-body antialiased min-h-screen">
        <ReactQueryProvider>
          <Navbar />
          <LiveScoreTicker />
          <main className="pt-16">{children}</main>
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
