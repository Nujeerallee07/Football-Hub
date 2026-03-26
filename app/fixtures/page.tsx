// app/fixtures/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { FixturesContent } from "./FixturesContent";
import { LoadingSpinner } from "@/components/ui";

export const metadata: Metadata = {
  title: "Football Fixtures – Premier League, Champions League & More",
  description:
    "Browse all upcoming football fixtures, filter by date and competition. Kick-off times in UK timezone.",
};

export default function FixturesPage() {
  return (
    <div className="page-container">
      <h1 className="font-display text-3xl font-bold text-white mb-2">
        Fixtures
      </h1>
      <p className="text-neutral-400 mb-8">
        All upcoming matches — kick-off times in UK time (BST/GMT)
      </p>
      <Suspense fallback={<LoadingSpinner />}>
        <FixturesContent />
      </Suspense>
    </div>
  );
}
