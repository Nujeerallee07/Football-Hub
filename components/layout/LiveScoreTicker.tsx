// components/layout/LiveScoreTicker.tsx
"use client";

import { useLiveMatches } from "@/hooks/useFootball";
import { getStatusLabel, formatGoals } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Match } from "@/types";
import { Zap } from "lucide-react";

export function LiveScoreTicker() {
  const { data: matches, isLoading } = useLiveMatches();

  if (isLoading || !matches || matches.length === 0) return null;

  // Duplicate items for seamless loop
  const items = [...matches, ...matches];

  return (
    <div className="bg-pitch-900 border-b border-neutral-700/50 overflow-hidden sticky top-16 z-40">
      <div className="flex items-center">
        {/* LIVE Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold tracking-widest uppercase z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-dot" />
          LIVE
        </div>

        {/* Ticker Track */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-0 animate-ticker whitespace-nowrap"
            style={{ width: "max-content" }}
          >
            {items.map((match, i) => (
              <TickerItem key={`${match.fixture.id}-${i}`} match={match} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerItem({ match }: { match: Match }) {
  const { fixture, teams, goals } = match;
  const elapsed = fixture.status.elapsed;
  const statusLabel = getStatusLabel(fixture.status.short, elapsed);

  return (
    <Link
      href={`/match/${fixture.id}`}
      className="inline-flex items-center gap-2 px-5 py-2.5 border-r border-neutral-700/30 hover:bg-pitch-800 transition-colors text-sm"
    >
      {/* Home Team */}
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 relative flex-shrink-0">
          <Image
            src={teams.home.logo}
            alt={teams.home.name}
            fill
            className="object-contain"
          />
        </div>
        <span className="text-neutral-200 text-xs font-medium hidden sm:inline">
          {teams.home.code ?? teams.home.name.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1">
        <span className="font-bold text-white tabular-nums">
          {formatGoals(goals.home)}
        </span>
        <span className="text-grass-400 text-xs font-bold px-1">{statusLabel}</span>
        <span className="font-bold text-white tabular-nums">
          {formatGoals(goals.away)}
        </span>
      </div>

      {/* Away Team */}
      <div className="flex items-center gap-1.5">
        <span className="text-neutral-200 text-xs font-medium hidden sm:inline">
          {teams.away.code ?? teams.away.name.slice(0, 3).toUpperCase()}
        </span>
        <div className="w-4 h-4 relative flex-shrink-0">
          <Image
            src={teams.away.logo}
            alt={teams.away.name}
            fill
            className="object-contain"
          />
        </div>
      </div>
    </Link>
  );
}
