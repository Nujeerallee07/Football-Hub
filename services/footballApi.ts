// ============================================
// Football Live Hub - API-Football Service
// ============================================
import axios, { AxiosInstance } from "axios";
import type {
  APIFootballResponse,
  Match,
  Standing,
  Team,
  MatchLineup,
  MatchEvent,
  MatchStatistic,
  HeadToHead,
  TopScorer,
  Player,
  Coach,
  Injury,
  MatchPrediction,
  BookmakerOdds,
} from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY!;
const BASE_URL =
  process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";

// League IDs
export const LEAGUE_IDS = {
  PREMIER_LEAGUE: Number(process.env.NEXT_PUBLIC_PREMIER_LEAGUE_ID ?? 39),
  CHAMPIONS_LEAGUE: Number(
    process.env.NEXT_PUBLIC_CHAMPIONS_LEAGUE_ID ?? 2
  ),
  FA_CUP: 45,
  EFL_CUP: 48,
  EUROPA_LEAGUE: 3,
  LALIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
} as const;

export const CURRENT_SEASON = Number(
  process.env.NEXT_PUBLIC_CURRENT_SEASON ?? 2024
);

// ---- Axios Instance ----
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
  timeout: 10000,
});

// ---- Generic Fetcher ----
async function fetchAPI<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T[]> {
  try {
    const { data } = await apiClient.get<APIFootballResponse<T>>(endpoint, {
      params,
    });
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("[API-Football] Errors:", data.errors);
    }
    return data.response ?? [];
  } catch (err) {
    console.error(`[API-Football] Failed to fetch ${endpoint}:`, err);
    return [];
  }
}

// ============================================
// FIXTURES
// ============================================

/** Get live matches across all leagues */
export async function getLiveMatches(): Promise<Match[]> {
  return fetchAPI<Match>("/fixtures", { live: "all" });
}

/** Get live matches for a specific league */
export async function getLiveMatchesByLeague(leagueId: number): Promise<Match[]> {
  return fetchAPI<Match>("/fixtures", { live: "all", league: leagueId });
}

/** Get today's fixtures for a league */
export async function getTodayFixtures(leagueId?: number): Promise<Match[]> {
  const today = new Date().toISOString().split("T")[0];
  const params: Record<string, string | number> = { date: today };
  if (leagueId) params.league = leagueId;
  return fetchAPI<Match>("/fixtures", params);
}

/** Get upcoming fixtures for a league */
export async function getUpcomingFixtures(
  leagueId: number,
  season: number = CURRENT_SEASON,
  next: number = 10
): Promise<Match[]> {
  return fetchAPI<Match>("/fixtures", {
    league: leagueId,
    season,
    next,
  });
}

/** Get recent results for a league */
export async function getRecentResults(
  leagueId: number,
  season: number = CURRENT_SEASON,
  last: number = 10
): Promise<Match[]> {
  return fetchAPI<Match>("/fixtures", {
    league: leagueId,
    season,
    last,
  });
}

/** Get fixtures by date range */
export async function getFixturesByDateRange(
  from: string,
  to: string,
  leagueId?: number,
  season: number = CURRENT_SEASON
): Promise<Match[]> {
  const params: Record<string, string | number> = { from, to, season };
  if (leagueId) params.league = leagueId;
  return fetchAPI<Match>("/fixtures", params);
}

/** Get a specific fixture by ID */
export async function getFixtureById(fixtureId: number): Promise<Match | null> {
  const results = await fetchAPI<Match>("/fixtures", { id: fixtureId });
  return results[0] ?? null;
}

/** Get fixtures for a specific team */
export async function getTeamFixtures(
  teamId: number,
  season: number = CURRENT_SEASON,
  last?: number,
  next?: number
): Promise<Match[]> {
  const params: Record<string, string | number> = { team: teamId, season };
  if (last) params.last = last;
  if (next) params.next = next;
  return fetchAPI<Match>("/fixtures", params);
}

// ============================================
// STANDINGS
// ============================================

export interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: Standing[][];
  };
}

/** Get league standings */
export async function getStandings(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<StandingsResponse | null> {
  const results = await fetchAPI<StandingsResponse>("/standings", {
    league: leagueId,
    season,
  });
  return results[0] ?? null;
}

// ============================================
// TEAMS
// ============================================

export interface TeamResponse {
  team: Team;
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

/** Get all teams in a league */
export async function getTeamsByLeague(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<TeamResponse[]> {
  return fetchAPI<TeamResponse>("/teams", { league: leagueId, season });
}

/** Get a specific team */
export async function getTeamById(teamId: number): Promise<TeamResponse | null> {
  const results = await fetchAPI<TeamResponse>("/teams", { id: teamId });
  return results[0] ?? null;
}

/** Search teams by name */
export async function searchTeams(query: string): Promise<TeamResponse[]> {
  return fetchAPI<TeamResponse>("/teams", { search: query });
}

// ============================================
// SQUADS & PLAYERS
// ============================================

export interface SquadResponse {
  team: Team;
  players: Player[];
}

/** Get team squad */
export async function getTeamSquad(teamId: number): Promise<Player[]> {
  const results = await fetchAPI<SquadResponse>("/players/squads", {
    team: teamId,
  });
  return results[0]?.players ?? [];
}

/** Get top scorers for a league */
export async function getTopScorers(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<TopScorer[]> {
  return fetchAPI<TopScorer>("/players/topscorers", {
    league: leagueId,
    season,
  });
}

/** Get top assists for a league */
export async function getTopAssists(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<TopScorer[]> {
  return fetchAPI<TopScorer>("/players/topassists", {
    league: leagueId,
    season,
  });
}

// ============================================
// MATCH DETAILS
// ============================================

/** Get lineups for a fixture */
export async function getMatchLineups(
  fixtureId: number
): Promise<MatchLineup[]> {
  return fetchAPI<MatchLineup>("/fixtures/lineups", { fixture: fixtureId });
}

/** Get events for a fixture (goals, cards, subs) */
export async function getMatchEvents(
  fixtureId: number
): Promise<MatchEvent[]> {
  return fetchAPI<MatchEvent>("/fixtures/events", { fixture: fixtureId });
}

/** Get statistics for a fixture */
export async function getMatchStatistics(
  fixtureId: number
): Promise<MatchStatistic[]> {
  return fetchAPI<MatchStatistic>("/fixtures/statistics", {
    fixture: fixtureId,
  });
}

/** Get head-to-head for two teams */
export async function getHeadToHead(
  team1Id: number,
  team2Id: number,
  last: number = 10
): Promise<Match[]> {
  return fetchAPI<Match>("/fixtures/headtohead", {
    h2h: `${team1Id}-${team2Id}`,
    last,
  });
}

// ============================================
// COACH
// ============================================

/** Get coach for a team */
export async function getTeamCoach(teamId: number): Promise<Coach | null> {
  const results = await fetchAPI<Coach>("/coachs", { team: teamId });
  return results[0] ?? null;
}

// ============================================
// INJURIES
// ============================================

/** Get injuries for a fixture */
export async function getFixtureInjuries(
  fixtureId: number
): Promise<Injury[]> {
  return fetchAPI<Injury>("/injuries", { fixture: fixtureId });
}

/** Get injuries for a team */
export async function getTeamInjuries(
  teamId: number,
  season: number = CURRENT_SEASON
): Promise<Injury[]> {
  return fetchAPI<Injury>("/injuries", { team: teamId, season });
}

// ============================================
// PREDICTIONS
// ============================================

export interface PredictionResponse {
  predictions: MatchPrediction;
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  teams: {
    home: Team & { last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } } };
    away: Team & { last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } } };
  };
  comparison: Record<string, { home: string; away: string }>;
  h2h: Match[];
}

/** Get match prediction */
export async function getMatchPrediction(
  fixtureId: number
): Promise<PredictionResponse | null> {
  const results = await fetchAPI<PredictionResponse>("/predictions", {
    fixture: fixtureId,
  });
  return results[0] ?? null;
}

// ============================================
// ODDS (API-Football)
// ============================================

export interface FixtureOddsResponse {
  fixture: { id: number };
  league: League;
  bookmakers: BookmakerOdds[];
}

/** Get odds for a fixture */
export async function getFixtureOdds(
  fixtureId: number
): Promise<FixtureOddsResponse | null> {
  const results = await fetchAPI<FixtureOddsResponse>("/odds", {
    fixture: fixtureId,
  });
  return results[0] ?? null;
}

/** Get odds for all upcoming fixtures in a league */
export async function getLeagueOdds(
  leagueId: number,
  season: number = CURRENT_SEASON,
  next: number = 10
): Promise<FixtureOddsResponse[]> {
  return fetchAPI<FixtureOddsResponse>("/odds", {
    league: leagueId,
    season,
    next,
  });
}
