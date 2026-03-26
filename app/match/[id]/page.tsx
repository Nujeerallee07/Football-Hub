// app/match/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getFixtureById,
  getMatchLineups,
  getMatchEvents,
  getMatchStatistics,
  getFixtureInjuries,
  getFixtureOdds,
  getMatchPrediction,
  getHeadToHead,
  CURRENT_SEASON,
} from "@/services/footballApi";
import { processOdds, formatOdds } from "@/services/oddsApi";
import { MatchLineupDisplay } from "@/components/match/MatchLineup";
import { FixtureCard } from "@/components/match/FixtureCard";
import { SectionHeader, StatBar, Badge } from "@/components/ui";
import { MatchDetailClient } from "./MatchDetailClient";
import {
  formatDateTime,
  getMatchState,
  getStatusLabel,
  cn,
} from "@/lib/utils";
import {
  MapPin,
  Clock,
  User,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Zap,
} from "lucide-react";
import type { MatchEvent, MatchStatistic } from "@/types";

interface MatchPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const fixture = await getFixtureById(Number(params.id));
  if (!fixture) return { title: "Match Not Found" };
  const { teams, fixture: f } = fixture;
  return {
    title: `${teams.home.name} vs ${teams.away.name} – Live Score & Lineups`,
    description: `${teams.home.name} v ${teams.away.name} live score, starting lineups, match statistics, and betting odds.`,
  };
}

export const revalidate = 60;

export default async function MatchPage({ params }: MatchPageProps) {
  const fixtureId = Number(params.id);
  if (isNaN(fixtureId)) notFound();

  const [
    fixtureRes,
    lineupsRes,
    eventsRes,
    statsRes,
    injuriesRes,
    oddsRes,
    predictionRes,
  ] = await Promise.allSettled([
    getFixtureById(fixtureId),
    getMatchLineups(fixtureId),
    getMatchEvents(fixtureId),
    getMatchStatistics(fixtureId),
    getFixtureInjuries(fixtureId),
    getFixtureOdds(fixtureId),
    getMatchPrediction(fixtureId),
  ]);

  const fixture = fixtureRes.status === "fulfilled" ? fixtureRes.value : null;
  if (!fixture) notFound();

  const lineups = lineupsRes.status === "fulfilled" ? lineupsRes.value : [];
  const events = eventsRes.status === "fulfilled" ? eventsRes.value : [];
  const stats = statsRes.status === "fulfilled" ? statsRes.value : [];
  const injuries = injuriesRes.status === "fulfilled" ? injuriesRes.value : [];
  const oddsData = oddsRes.status === "fulfilled" ? oddsRes.value : null;
  const prediction = predictionRes.status === "fulfilled" ? predictionRes.value : null;

  // Head to head
  const h2h = await getHeadToHead(
    fixture.teams.home.id,
    fixture.teams.away.id,
    8
  );

  const { teams, goals, league } = fixture;
  const state = getMatchState(fixture.fixture.status.short);
  const isLive = state === "live";
  const statusLabel = getStatusLabel(
    fixture.fixture.status.short,
    fixture.fixture.status.elapsed
  );

  return (
    <div className="page-container space-y-8">
      {/* Match Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card-gradient border border-neutral-700/30 p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-pitch-700/20 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10">
          {/* League */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {league.logo && (
              <div className="w-5 h-5 relative">
                <Image src={league.logo} alt={league.name} fill className="object-contain" />
              </div>
            )}
            <span className="text-neutral-400 text-sm">{league.name}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-500 text-sm">{league.country}</span>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Home Team */}
            <TeamDisplay
              name={teams.home.name}
              logo={teams.home.logo}
              id={teams.home.id}
              winner={teams.home.winner}
            />

            {/* Score / Status */}
            <div className="flex-shrink-0 text-center">
              {state === "upcoming" ? (
                <div>
                  <div className="text-3xl font-bold text-neutral-400">vs</div>
                  <div className="text-grass-400 text-sm font-semibold mt-1">
                    {formatDateTime(fixture.fixture.date)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-5xl md:text-6xl font-display font-bold tabular-nums",
                        teams.home.winner ? "text-white" : "text-neutral-400"
                      )}
                    >
                      {goals.home ?? 0}
                    </span>
                    <span className="text-neutral-600 text-3xl">–</span>
                    <span
                      className={cn(
                        "text-5xl md:text-6xl font-display font-bold tabular-nums",
                        teams.away.winner ? "text-white" : "text-neutral-400"
                      )}
                    >
                      {goals.away ?? 0}
                    </span>
                  </div>
                  <div className="mt-2">
                    {isLive ? (
                      <Badge variant="live">
                        <span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />
                        {statusLabel}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400 text-sm">{statusLabel}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <TeamDisplay
              name={teams.away.name}
              logo={teams.away.logo}
              id={teams.away.id}
              winner={teams.away.winner}
              align="right"
            />
          </div>

          {/* Match Meta */}
          <div className="flex items-center justify-center flex-wrap gap-4 mt-6 pt-5 border-t border-neutral-700/30">
            {fixture.fixture.venue && (
              <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{fixture.fixture.venue.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDateTime(fixture.fixture.date)}</span>
            </div>
            {fixture.fixture.referee && (
              <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
                <User className="w-3.5 h-3.5" />
                <span>{fixture.fixture.referee}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Club Links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/teams/${teams.home.id}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-pitch-800 border border-neutral-700/50 hover:border-neutral-600 rounded-xl text-sm text-white transition-all"
        >
          <div className="w-5 h-5 relative">
            <Image src={teams.home.logo} alt={teams.home.name} fill className="object-contain" />
          </div>
          {teams.home.name} Page
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </Link>
        <Link
          href={`/teams/${teams.away.id}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-pitch-800 border border-neutral-700/50 hover:border-neutral-600 rounded-xl text-sm text-white transition-all"
        >
          <div className="w-5 h-5 relative">
            <Image src={teams.away.logo} alt={teams.away.name} fill className="object-contain" />
          </div>
          {teams.away.name} Page
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </Link>
      </div>

      {/* Tabbed Content */}
      <MatchDetailClient
        fixtureId={fixtureId}
        isLive={isLive}
        lineups={lineups}
        events={events}
        stats={stats}
        injuries={injuries}
        h2h={h2h}
        oddsData={oddsData}
        prediction={prediction}
        homeTeam={teams.home}
        awayTeam={teams.away}
      />
    </div>
  );
}

// ---- Team Display ----
function TeamDisplay({
  name,
  logo,
  id,
  winner,
  align = "left",
}: {
  name: string;
  logo: string;
  id: number;
  winner?: boolean;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={`/teams/${id}`}
      className={cn(
        "flex flex-col items-center gap-3 group max-w-32 sm:max-w-48",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 relative group-hover:scale-105 transition-transform duration-300">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain drop-shadow-lg"
        />
      </div>
      <span
        className={cn(
          "font-display font-bold text-center text-sm sm:text-base leading-tight",
          winner ? "text-white" : "text-neutral-300",
          "group-hover:text-white transition-colors"
        )}
      >
        {name}
      </span>
    </Link>
  );
}
