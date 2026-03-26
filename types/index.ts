// ============================================
// Football Live Hub - Core Types
// ============================================

// --- League & Competition ---
export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag?: string;
  season: number;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group?: string;
  form: string;
  status: string;
  description?: string;
  all: StandingStats;
  home: StandingStats;
  away: StandingStats;
}

export interface StandingStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: { for: number; against: number };
}

// --- Team ---
export interface Team {
  id: number;
  name: string;
  code?: string;
  country?: string;
  founded?: number;
  logo: string;
  venue?: Venue;
  website?: string;
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  capacity?: number;
  image?: string;
}

export interface Coach {
  id: number;
  name: string;
  photo?: string;
  nationality?: string;
  age?: number;
}

// --- Player ---
export interface Player {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  number?: number;
  pos?: "G" | "D" | "M" | "F";
  photo?: string;
  nationality?: string;
  injured?: boolean;
}

export interface TopScorer {
  player: Player;
  statistics: {
    team: Team;
    goals: { total: number; assists: number };
    games: { appearences: number; lineups: number; minutes: number };
  }[];
}

// --- Fixture / Match ---
export type FixtureStatus =
  | "TBD"
  | "NS"
  | "1H"
  | "HT"
  | "2H"
  | "ET"
  | "BT"
  | "P"
  | "SUSP"
  | "INT"
  | "FT"
  | "AET"
  | "PEN"
  | "PST"
  | "CANC"
  | "ABD"
  | "AWD"
  | "WO"
  | "LIVE";

export interface Fixture {
  id: number;
  referee?: string;
  timezone: string;
  date: string;
  timestamp: number;
  status: {
    long: string;
    short: FixtureStatus;
    elapsed?: number;
  };
  venue?: Venue;
}

export interface Match {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team & { winner?: boolean };
    away: Team & { winner?: boolean };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

// --- Match Details ---
export interface MatchLineup {
  team: Team;
  coach: Coach;
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
}

export interface MatchEvent {
  time: { elapsed: number; extra?: number };
  team: Team;
  player: { id: number; name: string };
  assist?: { id: number; name: string };
  type: "Goal" | "Card" | "subst" | "Var";
  detail: string;
  comments?: string;
}

export interface MatchStatistic {
  team: Team;
  statistics: {
    type: string;
    value: string | number | null;
  }[];
}

export interface HeadToHead {
  matches: Match[];
  homeWins: number;
  draws: number;
  awayWins: number;
}

// --- Odds ---
export interface OddsMarket {
  name: string;
  values: OddsValue[];
}

export interface OddsValue {
  value: string; // "Home", "Draw", "Away"
  odd: string;
}

export interface BookmakerOdds {
  id: number;
  name: string;
  bets: OddsMarket[];
}

export interface MatchOdds {
  fixture: { id: number };
  bookmakers: BookmakerOdds[];
}

// The Odds API format
export interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsAPIBookmaker[];
}

export interface OddsAPIBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsAPIMarket[];
}

export interface OddsAPIMarket {
  key: string;
  last_update: string;
  outcomes: OddsAPIOutcome[];
}

export interface OddsAPIOutcome {
  name: string;
  price: number;
}

// --- Injuries ---
export interface Injury {
  player: Player;
  team: Team;
  fixture: Fixture;
  league: League;
  reason: string;
}

// --- Predictions ---
export interface MatchPrediction {
  winner: { id: number; name: string; comment: string } | null;
  win_or_draw: boolean;
  under_over: string;
  goals: { home: string; away: string };
  advice: string;
  percent: { home: string; draw: string; away: string };
}

// --- Search ---
export interface SearchResult {
  type: "team" | "player" | "match";
  id: number;
  name: string;
  image?: string;
  subtitle?: string;
  href: string;
}

// --- Favourite Teams (local state) ---
export interface FavouriteTeam {
  id: number;
  name: string;
  logo: string;
  leagueId: number;
}

// --- API Response Wrappers ---
export interface APIFootballResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  paging: { current: number; total: number };
  response: T[];
}
