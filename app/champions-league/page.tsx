// app/champions-league/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import {
  getStandings,
  getRecentResults,
  getUpcomingFixtures,
  LEAGUE_IDS,
  CURRENT_SEASON,
} from "@/services/footballApi";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "UEFA Champions League 2024/25 – Fixtures, Results & Groups",
  description:
    "UEFA Champions League standings, fixtures, results and knockout stage bracket for the 2024/25 season.",
};

export const revalidate = 120;

export default async function ChampionsLeaguePage() {
  const [standingsRes, recentRes, upcomingRes] = await Promise.allSettled([
    getStandings(LEAGUE_IDS.CHAMPIONS_LEAGUE),
    getRecentResults(LEAGUE_IDS.CHAMPIONS_LEAGUE, CURRENT_SEASON, 12),
    getUpcomingFixtures(LEAGUE_IDS.CHAMPIONS_LEAGUE, CURRENT_SEASON, 12),
  ]);

  const standingsData =
    standingsRes.status === "fulfilled" ? standingsRes.value : null;
  const allStandings = standingsData?.league.standings ?? [];
  const recent = recentRes.status === "fulfilled" ? recentRes.value : [];
  const upcoming = upcomingRes.status === "fulfilled" ? upcomingRes.value : [];

  // Flatten all groups
  const flatStandings = allStandings.flat();
  const isGroupStage = allStandings.length > 1;

  return (
    <div className="page-container space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        {standingsData?.league.logo && (
          <div className="w-14 h-14 relative">
            <Image
              src={standingsData.league.logo}
              alt="Champions League"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            UEFA Champions League
          </h1>
          <p className="text-neutral-400 mt-1">
            {CURRENT_SEASON}/{CURRENT_SEASON + 1} Season
          </p>
        </div>
      </div>

      {/* Groups or League Phase */}
      {isGroupStage ? (
        <section>
          <SectionHeader title="Group Stage Tables" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allStandings.map((group, i) => (
              <div key={i}>
                <h3 className="text-neutral-400 text-sm font-semibold mb-2 px-1">
                  {group[0]?.group ?? `Group ${String.fromCharCode(65 + i)}`}
                </h3>
                <LeagueTable standings={group} compact showForm={false} />
              </div>
            ))}
          </div>
        </section>
      ) : flatStandings.length > 0 ? (
        <section>
          <SectionHeader title="League Phase Table" subtitle="2024/25 format" />
          <LeagueTable standings={flatStandings} showForm limit={36} />
        </section>
      ) : null}

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Recent Results" />
          <div className="space-y-3">
            {recent.length > 0 ? (
              recent.map((m) => <FixtureCard key={m.fixture.id} match={m} compact />)
            ) : (
              <p className="text-neutral-500 text-sm">No recent results.</p>
            )}
          </div>
        </section>

        <section>
          <SectionHeader title="Upcoming Fixtures" />
          <div className="space-y-3">
            {upcoming.length > 0 ? (
              upcoming.map((m) => <FixtureCard key={m.fixture.id} match={m} compact />)
            ) : (
              <p className="text-neutral-500 text-sm">No upcoming fixtures.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
