// app/teams/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamsContent } from "./TeamsContent";
import { LoadingSpinner } from "@/components/ui";

export const metadata: Metadata = {
  title: "Football Teams – Premier League & Champions League Clubs",
  description:
    "Browse all Premier League and Champions League clubs. View squads, formations, manager info and recent form.",
};

export default function TeamsPage() {
  return (
    <div className="page-container">
      <h1 className="font-display text-3xl font-bold text-white mb-2">
        Teams
      </h1>
      <p className="text-neutral-400 mb-8">
        Premier League and Champions League clubs
      </p>
      <Suspense fallback={<LoadingSpinner />}>
        <TeamsContent />
      </Suspense>
    </div>
  );
}
