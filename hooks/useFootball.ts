// ============================================
// Football Live Hub - Custom Data Hooks
// ============================================
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";

// ---- Live Matches Hook ----
export function useLiveMatches(leagueId?: number) {
  const endpoint = leagueId
    ? `/api/football/live?league=${leagueId}`
    : "/api/football/live";

  return useQuery({
    queryKey: ["live-matches", leagueId],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch live matches");
      return res.json();
    },
    refetchInterval: 60 * 1000, // Refresh every 60 seconds
    staleTime: 30 * 1000,
  });
}

// ---- Fixtures Hook ----
export function useFixtures(params: {
  date?: string;
  leagueId?: number;
  teamId?: number;
  next?: number;
  last?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.date) searchParams.set("date", params.date);
  if (params.leagueId) searchParams.set("league", String(params.leagueId));
  if (params.teamId) searchParams.set("team", String(params.teamId));
  if (params.next) searchParams.set("next", String(params.next));
  if (params.last) searchParams.set("last", String(params.last));

  return useQuery({
    queryKey: ["fixtures", params],
    queryFn: async () => {
      const res = await fetch(`/api/football/fixtures?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch fixtures");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ---- Standings Hook ----
export function useStandings(leagueId: number) {
  return useQuery({
    queryKey: ["standings", leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/football/standings?league=${leagueId}`);
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Match Detail Hook ----
export function useMatchDetail(fixtureId: number) {
  return useQuery({
    queryKey: ["match-detail", fixtureId],
    queryFn: async () => {
      const res = await fetch(`/api/football/match/${fixtureId}`);
      if (!res.ok) throw new Error("Failed to fetch match detail");
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ---- Team Hook ----
export function useTeam(teamId: number) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/football/teams/${teamId}`);
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ---- Teams in League Hook ----
export function useLeagueTeams(leagueId: number) {
  return useQuery({
    queryKey: ["league-teams", leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/football/teams?league=${leagueId}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ---- Odds Hook ----
export function useOdds(sport: string) {
  return useQuery({
    queryKey: ["odds", sport],
    queryFn: async () => {
      const res = await fetch(`/api/odds?sport=${sport}`);
      if (!res.ok) throw new Error("Failed to fetch odds");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ---- Top Scorers Hook ----
export function useTopScorers(leagueId: number) {
  return useQuery({
    queryKey: ["top-scorers", leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/football/top-scorers?league=${leagueId}`);
      if (!res.ok) throw new Error("Failed to fetch top scorers");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ---- Search Hook ----
export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await fetch(
        `/api/football/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

// ---- Auto Refresh Hook ----
export function useAutoRefresh(queryKeys: string[][], interval = 60000) {
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, queryKeys]);

  useEffect(() => {
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [refresh, interval]);

  return refresh;
}
