// app/teams/TeamsContent.tsx
"use client";

import { useState, useMemo } from "react";
import { useLeagueTeams, useStandings } from "@/hooks/useFootball";
import { LEAGUE_IDS } from "@/services/footballApi";
import { useFavouritesStore } from "@/lib/store";
import { TeamCard } from "@/components/teams/TeamCard";
import { LoadingSpinner, ErrorState, EmptyState, SkeletonGrid } from "@/components/ui";
import { Star, Search, Users } from "lucide-react";

const LEAGUE_OPTIONS = [
  { id: LEAGUE_IDS.PREMIER_LEAGUE, label: "Premier League" },
  { id: LEAGUE_IDS.CHAMPIONS_LEAGUE, label: "Champions League" },
];

export function TeamsContent() {
  const [selectedLeague, setSelectedLeague] = useState(LEAGUE_IDS.PREMIER_LEAGUE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const { favourites } = useFavouritesStore();

  const { data: teamsData, isLoading, isError, refetch } = useLeagueTeams(selectedLeague);
  const { data: standingsData } = useStandings(selectedLeague);

  // Build a map of teamId → standing info
  const standingMap = useMemo(() => {
    const standings = standingsData?.league?.standings?.[0] ?? [];
    return new Map(
      standings.map((s: any) => [
        s.team.id,
        { rank: s.rank, points: s.points, form: s.form },
      ])
    );
  }, [standingsData]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    if (!teamsData) return [];
    let teams = teamsData;
    if (showFavourites) {
      const favIds = new Set(favourites.map((f) => f.id));
      teams = teams.filter((t: any) => favIds.has(t.team.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      teams = teams.filter((t: any) =>
        t.team.name.toLowerCase().includes(q) ||
        t.team.country?.toLowerCase().includes(q)
      );
    }
    // Sort by standing rank if available
    return teams.sort((a: any, b: any) => {
      const ra = standingMap.get(a.team.id)?.rank ?? 999;
      const rb = standingMap.get(b.team.id)?.rank ?? 999;
      return ra - rb;
    });
  }, [teamsData, searchQuery, showFavourites, favourites, standingMap]);

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* League Tabs */}
        <div className="flex gap-1 p-1 bg-pitch-800 border border-neutral-700/50 rounded-xl">
          {LEAGUE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedLeague(opt.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedLeague === opt.id
                  ? "bg-pitch-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-pitch-800 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-grass-500/50"
          />
        </div>

        {/* Favourites Toggle */}
        <button
          onClick={() => setShowFavourites(!showFavourites)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFavourites
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-pitch-800 border-neutral-700/50 text-neutral-400 hover:text-white"
          }`}
        >
          <Star className={`w-4 h-4 ${showFavourites ? "fill-amber-400" : ""}`} />
          Favourites
          {favourites.length > 0 && (
            <span className="bg-amber-500 text-pitch-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {favourites.length}
            </span>
          )}
        </button>
      </div>

      {/* Results Count */}
      {!isLoading && filteredTeams.length > 0 && (
        <p className="text-neutral-500 text-sm">
          {filteredTeams.length} club{filteredTeams.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Teams Grid */}
      {isLoading && <SkeletonGrid count={20} />}

      {isError && (
        <ErrorState
          message="Failed to load teams."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && filteredTeams.length === 0 && (
        <EmptyState
          title={showFavourites ? "No favourite teams yet" : "No teams found"}
          description={
            showFavourites
              ? "Click the star icon on any team card to add it to your favourites."
              : `No clubs match "${searchQuery}"`
          }
          icon={<Users className="w-12 h-12" />}
        />
      )}

      {!isLoading && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeams.map((t: any) => {
            const standing = standingMap.get(t.team.id);
            return (
              <TeamCard
                key={t.team.id}
                team={t.team}
                form={standing?.form}
                position={standing?.rank}
                points={standing?.points}
                leagueId={selectedLeague}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
