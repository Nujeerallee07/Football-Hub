// app/odds/page.tsx
"use client";

import { useState } from "react";
import { useOdds } from "@/hooks/useFootball";
import { SPORT_KEYS } from "@/services/oddsApi";
import { processOdds } from "@/services/oddsApi";
import { OddsCard } from "@/components/odds/OddsCard";
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader } from "@/components/ui";
import { TrendingUp, AlertCircle } from "lucide-react";

const SPORT_OPTIONS = [
  { key: SPORT_KEYS.PREMIER_LEAGUE, label: "Premier League" },
  { key: SPORT_KEYS.CHAMPIONS_LEAGUE, label: "Champions League" },
  { key: SPORT_KEYS.EUROPA_LEAGUE, label: "Europa League" },
  { key: SPORT_KEYS.FA_CUP, label: "FA Cup" },
];

export default function OddsPage() {
  const [selectedSport, setSelectedSport] = useState(SPORT_KEYS.PREMIER_LEAGUE);

  const { data: games, isLoading, isError, refetch } = useOdds(selectedSport);

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Betting Odds
        </h1>
        <p className="text-neutral-400">
          Best UK bookmaker odds — updated every 2 minutes
        </p>
      </div>

      {/* Gambling Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/80 text-sm">
          <strong>18+ Gamble Responsibly.</strong> Odds are for informational purposes only.
          Please visit{" "}
          <a
            href="https://www.begambleaware.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-300"
          >
            BeGambleAware.org
          </a>{" "}
          for help and support.
        </p>
      </div>

      {/* Sport Filter */}
      <div className="flex gap-2 flex-wrap">
        {SPORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedSport(opt.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSport === opt.key
                ? "bg-grass-500/20 text-grass-400 border border-grass-500/30"
                : "bg-pitch-800 text-neutral-400 hover:text-white border border-neutral-700/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Odds Grid */}
      {isLoading && <LoadingSpinner />}
      {isError && (
        <ErrorState
          message="Failed to load odds. Please check your API key."
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !isError && games && games.length === 0 && (
        <EmptyState
          title="No odds available"
          description="Odds for upcoming matches will appear here once available."
          icon={<TrendingUp className="w-12 h-12" />}
        />
      )}
      {!isLoading && games && games.length > 0 && (
        <>
          <SectionHeader
            title={SPORT_OPTIONS.find((o) => o.key === selectedSport)?.label ?? "Odds"}
            subtitle={`${games.length} match${games.length !== 1 ? "es" : ""} with odds`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {games.map((game) => (
              <OddsCard key={game.id} game={game} odds={processOdds(game)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
