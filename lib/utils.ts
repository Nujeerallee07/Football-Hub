// ============================================
// Football Live Hub - Utility Library
// ============================================
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { toZonedTime, format as tzFormat } from "date-fns-tz";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FixtureStatus, Match } from "@/types";

// ---- Tailwind Merge ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// DATE & TIME UTILITIES
// ============================================

const UK_TIMEZONE = "Europe/London";

/** Format a UTC date to UK timezone */
export function toUKTime(dateString: string): Date {
  return toZonedTime(new Date(dateString), UK_TIMEZONE);
}

/** Format kick-off time in UK timezone */
export function formatKickOff(dateString: string): string {
  const date = toUKTime(dateString);
  return tzFormat(date, "HH:mm", { timeZone: UK_TIMEZONE });
}

/** Format a full date in UK timezone */
export function formatMatchDate(dateString: string): string {
  const date = toUKTime(dateString);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return tzFormat(date, "EEE d MMM", { timeZone: UK_TIMEZONE });
}

/** Format full date time */
export function formatDateTime(dateString: string): string {
  const date = toUKTime(dateString);
  return tzFormat(date, "EEE d MMM, HH:mm", { timeZone: UK_TIMEZONE });
}

/** Time ago helper */
export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

/** Is a match today? */
export function isMatchToday(dateString: string): boolean {
  return isToday(toUKTime(dateString));
}

// ============================================
// MATCH STATUS UTILITIES
// ============================================

export type MatchState = "live" | "finished" | "upcoming" | "postponed";

/** Determine the state of a match */
export function getMatchState(status: FixtureStatus): MatchState {
  const liveStatuses: FixtureStatus[] = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
  const finishedStatuses: FixtureStatus[] = ["FT", "AET", "PEN", "AWD", "WO"];
  const postponedStatuses: FixtureStatus[] = ["PST", "CANC", "ABD", "SUSP"];

  if (liveStatuses.includes(status)) return "live";
  if (finishedStatuses.includes(status)) return "finished";
  if (postponedStatuses.includes(status)) return "postponed";
  return "upcoming";
}

/** Get human-readable status label */
export function getStatusLabel(status: FixtureStatus, elapsed?: number): string {
  const labels: Partial<Record<FixtureStatus, string>> = {
    TBD: "TBD",
    NS: "Not Started",
    "1H": elapsed ? `${elapsed}'` : "1st Half",
    HT: "Half Time",
    "2H": elapsed ? `${elapsed}'` : "2nd Half",
    ET: elapsed ? `${elapsed}' ET` : "Extra Time",
    BT: "Break",
    P: "Penalties",
    SUSP: "Suspended",
    INT: "Interrupted",
    FT: "Full Time",
    AET: "AET",
    PEN: "Pen.",
    PST: "Postponed",
    CANC: "Cancelled",
    ABD: "Abandoned",
    AWD: "Awarded",
    WO: "Walkover",
    LIVE: "Live",
  };
  return labels[status] ?? status;
}

/** Get status colour class */
export function getStatusColor(status: FixtureStatus): string {
  const state = getMatchState(status);
  switch (state) {
    case "live": return "text-grass-400";
    case "finished": return "text-neutral-300";
    case "postponed": return "text-amber-400";
    default: return "text-neutral-400";
  }
}

// ============================================
// FORM UTILITIES
// ============================================

/** Parse form string to array of results */
export function parseForm(form: string): ("W" | "D" | "L")[] {
  return form
    .split("")
    .filter((c) => ["W", "D", "L"].includes(c))
    .slice(-5) as ("W" | "D" | "L")[];
}

/** Get form colour class */
export function getFormColor(result: "W" | "D" | "L"): string {
  switch (result) {
    case "W": return "bg-grass-500";
    case "D": return "bg-amber-500";
    case "L": return "bg-red-600";
  }
}

/** Calculate form points */
export function formPoints(form: string): number {
  return parseForm(form).reduce((acc, r) => {
    if (r === "W") return acc + 3;
    if (r === "D") return acc + 1;
    return acc;
  }, 0);
}

// ============================================
// POSITION UTILITIES
// ============================================

export function getPositionLabel(pos?: string): string {
  const labels: Record<string, string> = {
    G: "Goalkeeper",
    D: "Defender",
    M: "Midfielder",
    F: "Forward",
  };
  return labels[pos ?? ""] ?? pos ?? "Unknown";
}

export function getPositionColor(pos?: string): string {
  const colors: Record<string, string> = {
    G: "bg-amber-500 text-pitch-950",
    D: "bg-blue-500 text-white",
    M: "bg-grass-500 text-pitch-950",
    F: "bg-red-500 text-white",
  };
  return colors[pos ?? ""] ?? "bg-neutral-600 text-white";
}

// ============================================
// FORMATION UTILITIES
// ============================================

/** Parse formation string to array of numbers */
export function parseFormation(formation: string): number[] {
  return formation.split("-").map(Number).filter((n) => !isNaN(n));
}

/** Get player positions based on formation */
export function getFormationPositions(
  formation: string,
  totalWidth: number = 300,
  totalHeight: number = 450
): { x: number; y: number }[] {
  const lines = parseFormation(formation);
  const positions: { x: number; y: number }[] = [];
  const allLines = [1, ...lines]; // GK + outfield

  allLines.forEach((count, lineIdx) => {
    const y =
      totalHeight -
      (lineIdx / (allLines.length - 1)) * totalHeight * 0.9 -
      totalHeight * 0.05;
    for (let i = 0; i < count; i++) {
      const x = ((i + 1) / (count + 1)) * totalWidth;
      positions.push({ x, y });
    }
  });

  return positions;
}

// ============================================
// NUMBER / SCORE UTILITIES
// ============================================

export function formatGoals(goals: number | null): string {
  return goals !== null ? String(goals) : "-";
}

export function getMatchScore(match: Match): string {
  const { home, away } = match.goals;
  if (home === null || away === null) return "vs";
  return `${home} - ${away}`;
}

/** Format large numbers */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ============================================
// SLUG UTILITIES
// ============================================

export function teamSlug(name: string, id: number): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;
}

export function parseTeamSlug(slug: string): number {
  const parts = slug.split("-");
  return Number(parts[parts.length - 1]);
}

// ============================================
// IMAGE FALLBACKS
// ============================================

export function teamLogoFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=162d56&color=00e676&size=64&bold=true`;
}

export function playerPhotoFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=1e2d3d&color=8ba5bd&size=64`;
}
