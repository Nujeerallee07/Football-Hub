// app/premier-league/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getStandings,
  getRecentResults,
  getUpcomingFixtures,
  getTopScorers,
  LEAGUE_IDS,
  CURRENT_SEASON,
} from "@/services/footballApi";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader } from "@/components/ui";
import { Trophy, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Premier League 2024/25 – Table, Fixtures & Top Scorers",
  description:
    "Full Premier League standings, latest results, upcoming fixtures, and top goal scorers for the 2024/25 season.",
};

export const revalidate = 120;

export default async function PremierLeaguePage() {
  const [standingsRes, recentRes, upcomingRes, scorersRes] =
    await Promise.allSettled([
      getStandings(LEAGUE_IDS.PREMIER_LEAGUE),
      getRecentResults(LEAGUE_IDS.PREMIER_LEAGUE, CURRENT_SEASON, 10),
      getUpcomingFixtures(LEAGUE_IDS.PREMIER_LEAGUE, CURRENT_SEASON, 10),
      getTopScorers(LEAGUE_IDS.PREMIER_LEAGUE),
    ]);

  const standingsData =
    standingsRes.status === "fulfilled" ? standingsRes.value : null;
  const standings = standingsData?.league.standings[0] ?? [];
  const recent = recentRes.status === "fulfilled" ? recentRes.value : [];
  const upcoming = upcomingRes.status === "fulfilled" ? upcomingRes.value : [];
  const scorers = scorersRes.status === "fulfilled" ? scorersRes.value.slice(0, 10) : [];

  return (
    <div className="page-container space-y-10">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        {standingsData?.league.logo && (
          <div className="w-14 h-14 relative">
            <Image
              src={standingsData.league.logo}
              alt="Premier League"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Premier League
          </h1>
          <p className="text-neutral-400 mt-1">
            {CURRENT_SEASON}/{CURRENT_SEASON + 1} Season •{" "}
            {standings.length} clubs
          </p>
        </div>
      </div>

      {/* Full Table */}
      <section>
        <SectionHeader title="League Table" subtitle="Current standings" />
        {standings.length > 0 ? (
          <LeagueTable standings={standings} showForm />
        ) : (
          <p className="text-neutral-500 text-sm">Standings unavailable.</p>
        )}
      </section>

      {/* Two columns: Recent + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <section>
          <SectionHeader
            title="Latest Results"
            subtitle="Most recent matches"
          />
          <div className="space-y-3">
            {recent.length > 0 ? (
              recent.map((m) => <FixtureCard key={m.fixture.id} match={m} compact />)
            ) : (
              <p className="text-neutral-500 text-sm">No recent results.</p>
            )}
          </div>
        </section>

        {/* Upcoming Fixtures */}
        <section>
          <SectionHeader
            title="Upcoming Fixtures"
            subtitle="Next matches"
            action={
              <Link
                href="/fixtures?league=39"
                className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors"
              >
                All fixtures <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="space-y-3">
            {upcoming.length > 0 ? (
              upcoming.map((m) => <FixtureCard key={m.fixture.id} match={m} compact />)
            ) : (
              <p className="text-neutral-500 text-sm">No upcoming fixtures.</p>
            )}
          </div>
        </section>
      </div>

      {/* Top Scorers */}
      {scorers.length > 0 && (
        <section>
          <SectionHeader title="Top Scorers" subtitle={`${CURRENT_SEASON}/${CURRENT_SEASON + 1}`} />
          <div className="bg-pitch-800 border border-neutral-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700/50 bg-pitch-800/80">
                  <th className="text-left px-4 py-3 text-neutral-500 font-medium w-10">#</th>
                  <th className="text-left px-4 py-3 text-neutral-500 font-medium">Player</th>
                  <th className="text-left px-4 py-3 text-neutral-500 font-medium hidden md:table-cell">Team</th>
                  <th className="text-center px-4 py-3 text-neutral-500 font-medium w-16">Apps</th>
                  <th className="text-center px-4 py-3 text-neutral-500 font-medium w-16">Goals</th>
                  <th className="text-center px-4 py-3 text-neutral-500 font-medium w-16 hidden sm:table-cell">Assists</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((scorer, i) => {
                  const stat = scorer.statistics[0];
                  return (
                    <tr
                      key={scorer.player.id}
                      className={`border-b border-neutral-700/20 ${i % 2 === 0 ? "bg-pitch-800/40" : "bg-pitch-800/20"} hover:bg-pitch-700/40 transition-colors`}
                    >
                      <td className="px-4 py-3 text-neutral-500 font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {scorer.player.photo && (
                            <div className="w-7 h-7 rounded-full overflow-hidden relative flex-shrink-0">
                              <Image
                                src={scorer.player.photo}
                                alt={scorer.player.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="text-white font-medium">{scorer.player.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {stat?.team.logo && (
                            <div className="w-5 h-5 relative">
                              <Image src={stat.team.logo} alt={stat.team.name} fill className="object-contain" />
                            </div>
                          )}
                          <span className="text-neutral-300 text-sm">{stat?.team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-400 tabular-nums">
                        {stat?.games.appearences ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-grass-400 font-bold tabular-nums">
                          {stat?.goals.total ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-400 tabular-nums hidden sm:table-cell">
                        {stat?.goals.assists ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
