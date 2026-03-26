// ============================================
// Football Live Hub - The Odds API Service
// ============================================
import type { OddsAPIGame, OddsAPIBookmaker, OddsAPIOutcome } from "@/types";

const API_KEY = process.env.ODDS_API_KEY!;
const BASE_URL = process.env.ODDS_API_BASE_URL ?? "https://api.the-odds-api.com/v4";

// Sport keys for The Odds API
export const SPORT_KEYS = {
  PREMIER_LEAGUE: "soccer_epl",
  CHAMPIONS_LEAGUE: "soccer_uefa_champs_league",
  EUROPA_LEAGUE: "soccer_uefa_europa_league",
  FA_CUP: "soccer_fa_cup",
  LALIGA: "soccer_spain_la_liga",
  BUNDESLIGA: "soccer_germany_bundesliga",
  SERIE_A: "soccer_italy_serie_a",
  LIGUE_1: "soccer_france_ligue_one",
} as const;

export type SportKey = (typeof SPORT_KEYS)[keyof typeof SPORT_KEYS];

// UK bookmakers (preferred)
export const UK_BOOKMAKERS = [
  "bet365",
  "williamhill",
  "betfair",
  "paddypower",
  "ladbrokes",
  "coral",
  "skybet",
  "betvictor",
  "unibet",
  "bwin",
];

// ---- Generic Fetcher ----
async function fetchOddsAPI<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("apiKey", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());

  if (!res.ok) {
    const remaining = res.headers.get("x-requests-remaining");
    console.error(
      `[Odds API] HTTP ${res.status} | Remaining: ${remaining}`
    );
    throw new Error(`Odds API request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ============================================
// ODDS ENDPOINTS
// ============================================

/** Get upcoming odds for a sport */
export async function getOdds(
  sportKey: SportKey,
  regions: string = "uk",
  markets: string = "h2h",
  oddsFormat: string = "decimal"
): Promise<OddsAPIGame[]> {
  try {
    return await fetchOddsAPI<OddsAPIGame[]>(`/sports/${sportKey}/odds`, {
      regions,
      markets,
      oddsFormat,
      bookmakers: UK_BOOKMAKERS.join(","),
    });
  } catch {
    return [];
  }
}

/** Get odds for Premier League */
export async function getPremierLeagueOdds(): Promise<OddsAPIGame[]> {
  return getOdds(SPORT_KEYS.PREMIER_LEAGUE);
}

/** Get odds for Champions League */
export async function getChampionsLeagueOdds(): Promise<OddsAPIGame[]> {
  return getOdds(SPORT_KEYS.CHAMPIONS_LEAGUE);
}

/** Get available sports */
export async function getSports() {
  return fetchOddsAPI<{ key: string; title: string; active: boolean }[]>(
    "/sports"
  );
}

// ============================================
// ODDS UTILITIES
// ============================================

export interface ProcessedOdds {
  homeWin: number | null;
  draw: number | null;
  awayWin: number | null;
  bestHome: { bookmaker: string; odds: number } | null;
  bestDraw: { bookmaker: string; odds: number } | null;
  bestAway: { bookmaker: string; odds: number } | null;
  bookmakers: {
    name: string;
    home: number | null;
    draw: number | null;
    away: number | null;
  }[];
}

/** Extract and process odds from a game */
export function processOdds(game: OddsAPIGame): ProcessedOdds {
  const allBookmakers = game.bookmakers ?? [];

  let bestHome: { bookmaker: string; odds: number } | null = null;
  let bestDraw: { bookmaker: string; odds: number } | null = null;
  let bestAway: { bookmaker: string; odds: number } | null = null;

  const bookmakers = allBookmakers.map((bm: OddsAPIBookmaker) => {
    const h2h = bm.markets.find((m) => m.key === "h2h");
    if (!h2h) return { name: bm.title, home: null, draw: null, away: null };

    const homeOutcome = h2h.outcomes.find(
      (o: OddsAPIOutcome) => o.name === game.home_team
    );
    const awayOutcome = h2h.outcomes.find(
      (o: OddsAPIOutcome) => o.name === game.away_team
    );
    const drawOutcome = h2h.outcomes.find(
      (o: OddsAPIOutcome) => o.name === "Draw"
    );

    const home = homeOutcome?.price ?? null;
    const away = awayOutcome?.price ?? null;
    const draw = drawOutcome?.price ?? null;

    if (home !== null && (!bestHome || home > bestHome.odds)) {
      bestHome = { bookmaker: bm.title, odds: home };
    }
    if (draw !== null && (!bestDraw || draw > bestDraw.odds)) {
      bestDraw = { bookmaker: bm.title, odds: draw };
    }
    if (away !== null && (!bestAway || away > bestAway.odds)) {
      bestAway = { bookmaker: bm.title, odds: away };
    }

    return { name: bm.title, home, draw, away };
  });

  // Average odds across bookmakers
  const validHome = bookmakers.filter((b) => b.home !== null);
  const validDraw = bookmakers.filter((b) => b.draw !== null);
  const validAway = bookmakers.filter((b) => b.away !== null);

  const avg = (arr: { home: number | null; draw: number | null; away: number | null }[], key: "home" | "draw" | "away") =>
    arr.length
      ? arr.reduce((s, b) => s + (b[key] ?? 0), 0) / arr.length
      : null;

  return {
    homeWin: avg(validHome, "home"),
    draw: avg(validDraw, "draw"),
    awayWin: avg(validAway, "away"),
    bestHome,
    bestDraw,
    bestAway,
    bookmakers,
  };
}

/** Format odds to 2 decimal places */
export function formatOdds(odds: number | null): string {
  if (odds === null) return "N/A";
  return odds.toFixed(2);
}

/** Convert decimal odds to fractional (approx) */
export function decimalToFractional(decimal: number): string {
  if (decimal <= 1) return "0/1";
  const fraction = decimal - 1;
  // Find GCD for clean fraction
  const tolerance = 1e-3;
  let h1 = 1,
    h2 = 0,
    k1 = 0,
    k2 = 1;
  let b = fraction;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(fraction - h1 / k1) > fraction * tolerance);
  return `${h1}/${k1}`;
}

/** Calculate implied probability from decimal odds */
export function impliedProbability(decimal: number): number {
  return Math.round((1 / decimal) * 100);
}
