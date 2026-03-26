// Client-side odds utilities (no API keys)
import type { OddsAPIGame, OddsAPIBookmaker, OddsAPIOutcome } from "@/types";

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

export interface ProcessedOdds {
  homeWin: number | null;
  draw: number | null;
  awayWin: number | null;
  bestHome: { bookmaker: string; odds: number } | null;
  bestDraw: { bookmaker: string; odds: number } | null;
  bestAway: { bookmaker: string; odds: number } | null;
  bookmakers: { name: string; home: number | null; draw: number | null; away: number | null }[];
}

export function processOdds(game: OddsAPIGame): ProcessedOdds {
  const allBookmakers = game.bookmakers ?? [];

  let bestHome: { bookmaker: string; odds: number } | null = null;
  let bestDraw: { bookmaker: string; odds: number } | null = null;
  let bestAway: { bookmaker: string; odds: number } | null = null;

  const bookmakers = allBookmakers.map((bm: OddsAPIBookmaker) => {
    const h2h = bm.markets.find((m) => m.key === "h2h");
    if (!h2h) return { name: bm.title, home: null, draw: null, away: null };

    const homeOutcome = h2h.outcomes.find((o: OddsAPIOutcome) => o.name === game.home_team);
    const awayOutcome = h2h.outcomes.find((o: OddsAPIOutcome) => o.name === game.away_team);
    const drawOutcome = h2h.outcomes.find((o: OddsAPIOutcome) => o.name === "Draw");

    const home = homeOutcome?.price ?? null;
    const away = awayOutcome?.price ?? null;
    const draw = drawOutcome?.price ?? null;

    if (home !== null && (!bestHome || home > bestHome.odds)) bestHome = { bookmaker: bm.title, odds: home };
    if (draw !== null && (!bestDraw || draw > bestDraw.odds)) bestDraw = { bookmaker: bm.title, odds: draw };
    if (away !== null && (!bestAway || away > bestAway.odds)) bestAway = { bookmaker: bm.title, odds: away };

    return { name: bm.title, home, draw, away };
  });

  const validHome = bookmakers.filter((b) => b.home !== null);
  const validDraw = bookmakers.filter((b) => b.draw !== null);
  const validAway = bookmakers.filter((b) => b.away !== null);

  const avg = (arr: typeof bookmakers, key: "home" | "draw" | "away") =>
    arr.length ? arr.reduce((s, b) => s + (b[key] ?? 0), 0) / arr.length : null;

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

export function formatOdds(odds: number | null): string {
  if (odds === null) return "N/A";
  return odds.toFixed(2);
}

export function decimalToFractional(decimal: number): string {
  if (decimal <= 1) return "0/1";
  const fraction = decimal - 1;
  const tolerance = 1e-3;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = fraction;
  do {
    const a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(fraction - h1 / k1) > fraction * tolerance);
  return `${h1}/${k1}`;
}

export function impliedProbability(decimal: number): number {
  return Math.round((1 / decimal) * 100);
}
