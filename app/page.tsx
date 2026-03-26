// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getLiveMatches,
  getUpcomingFixtures,
  getRecentResults,
  getStandings,
  LEAGUE_IDS,
  CURRENT_SEASON,
} from "@/services/footballApi";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader, Badge, EmptyState } from "@/components/ui";
import {
  formatKickOff,
  formatMatchDate,
  formatGoals,
  getMatchState,
  getStatusLabel,
} from "@/lib/utils";
import {
  Trophy,
  Zap,
  Calendar,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import type { Match } from "@/types";

export const metadata: Metadata = {
  title: "Football Live Hub – Live Scores, Fixtures & Odds",
  description:
    "The ultimate football dashboard — live Premier League and Champions League scores, upcoming fixtures, betting odds and standings.",
};

export const revalidate = 60;

export default async function HomePage() {
  // Fetch all homepage data in parallel
  const [liveMatches, plUpcoming, plRecent, uclUpcoming, plStandings] =
    await Promise.allSettled([
      getLiveMatches(),
      getUpcomingFixtures(LEAGUE_IDS.PREMIER_LEAGUE, CURRENT_SEASON, 6),
      getRecentResults(LEAGUE_IDS.PREMIER_LEAGUE, CURRENT_SEASON, 6),
      getUpcomingFixtures(LEAGUE_IDS.CHAMPIONS_LEAGUE, CURRENT_SEASON, 4),
      getStandings(LEAGUE_IDS.PREMIER_LEAGUE),
    ]);

  const live = liveMatches.status === "fulfilled" ? liveMatches.value : [];
  const upcoming = plUpcoming.status === "fulfilled" ? plUpcoming.value : [];
  const recent = plRecent.status === "fulfilled" ? plRecent.value : [];
  const uclFixtures = uclUpcoming.status === "fulfilled" ? uclUpcoming.value : [];
  const standings =
    plStandings.status === "fulfilled"
      ? plStandings.value?.league.standings[0] ?? []
      : [];

  // Filter live matches by major leagues
  const majorLive = live.filter((m) =>
    [
      LEAGUE_IDS.PREMIER_LEAGUE,
      LEAGUE_IDS.CHAMPIONS_LEAGUE,
      LEAGUE_IDS.EUROPA_LEAGUE,
    ].includes(m.league.id)
  );

  return (
    <div className="page-container space-y-12">
      {/* Hero Banner */}
      <HeroBanner liveCount={majorLive.length} />

      {/* Live Matches Section */}
      {majorLive.length > 0 && (
        <section>
          <SectionHeader
            title="Live Now"
            subtitle={`${majorLive.length} match${majorLive.length !== 1 ? "es" : ""} in progress`}
            action={
              <Badge variant="live">
                <span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />
                LIVE
              </Badge>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorLive.map((match) => (
              <FixtureCard key={match.fixture.id} match={match} showLeague />
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <QuickLinks />

      {/* Two-column: Upcoming + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <section>
          <SectionHeader
            title="Premier League Fixtures"
            subtitle="Upcoming matches"
            action={
              <Link
                href="/fixtures"
                className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((match) => (
                <FixtureCard key={match.fixture.id} match={match} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming fixtures"
              description="Check back soon for upcoming Premier League matches."
              icon={<Calendar className="w-10 h-10" />}
            />
          )}
        </section>

        {/* Recent Results */}
        <section>
          <SectionHeader
            title="Recent Results"
            subtitle="Premier League"
            action={
              <Link
                href="/premier-league"
                className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors"
              >
                Full table <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((match) => (
                <FixtureCard key={match.fixture.id} match={match} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent results"
              icon={<Trophy className="w-10 h-10" />}
            />
          )}
        </section>
      </div>

      {/* Champions League */}
      {uclFixtures.length > 0 && (
        <section>
          <SectionHeader
            title="Champions League"
            subtitle="Upcoming fixtures"
            action={
              <Link
                href="/champions-league"
                className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uclFixtures.map((match) => (
              <FixtureCard key={match.fixture.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* PL Table (compact) */}
      {standings.length > 0 && (
        <section>
          <SectionHeader
            title="Premier League Table"
            subtitle={`${CURRENT_SEASON}/${CURRENT_SEASON + 1} Season`}
            action={
              <Link
                href="/premier-league"
                className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors"
              >
                Full table <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <LeagueTable standings={standings} compact limit={10} showForm={false} />
        </section>
      )}
    </div>
  );
}

// ---- Sub-components ----

function HeroBanner({ liveCount }: { liveCount: number }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-card-gradient border border-neutral-700/30 p-8 md:p-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-grass-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          {liveCount > 0 ? (
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />
              {liveCount} LIVE
            </Badge>
          ) : (
            <Badge variant="default">
              <Zap className="w-3 h-3" />
              Live Hub
            </Badge>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
          Football at your{" "}
          <span className="text-gradient-green">fingertips</span>
        </h1>
        <p className="text-neutral-400 mt-4 text-lg max-w-xl">
          Real-time Premier League &amp; Champions League scores, fixtures,
          standings and betting odds — all in one place.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/premier-league"
            className="flex items-center gap-2 px-5 py-2.5 bg-grass-gradient text-pitch-950 font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-glow-green"
          >
            <Trophy className="w-4 h-4" />
            Premier League
          </Link>
          <Link
            href="/champions-league"
            className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl text-sm hover:bg-pitch-600 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Champions League
          </Link>
          <Link
            href="/odds"
            className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl text-sm hover:bg-pitch-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Betting Odds
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    {
      href: "/premier-league",
      icon: Trophy,
      label: "Premier League",
      desc: "Table & fixtures",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      href: "/champions-league",
      icon: Zap,
      label: "Champions League",
      desc: "UCL fixtures",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      href: "/fixtures",
      icon: Calendar,
      label: "All Fixtures",
      desc: "Browse by date",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      href: "/odds",
      icon: TrendingUp,
      label: "Betting Odds",
      desc: "Best bookmaker odds",
      color: "text-grass-400",
      bg: "bg-grass-500/10 border-grass-500/20",
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-card ${l.bg}`}
          >
            <l.icon className={`w-5 h-5 flex-shrink-0 ${l.color}`} />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{l.label}</p>
              <p className="text-neutral-500 text-xs">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
