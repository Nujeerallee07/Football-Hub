import { Link } from "react-router-dom";
import { useStandings, useFixtures, useTopScorers } from "@/hooks/useFootball";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader, LoadingSpinner } from "@/components/ui";
import { ArrowRight } from "lucide-react";

const PL_ID = 39;
const SEASON = 2024;

export function PremierLeaguePage() {
  const { data: standingsData, isLoading: loadingStandings } = useStandings(PL_ID);
  const { data: recent = [] } = useFixtures({ leagueId: PL_ID, last: 10 });
  const { data: upcoming = [] } = useFixtures({ leagueId: PL_ID, next: 10 });
  const { data: scorers = [] } = useTopScorers(PL_ID);

  const standings = standingsData?.league?.standings?.[0] ?? [];
  const topScorers = scorers.slice(0, 10);

  if (loadingStandings) return <div className="page-container"><LoadingSpinner /></div>;

  return (
    <div className="page-container space-y-10">
      <div className="flex items-center gap-4">
        {standingsData?.league?.logo && <img src={standingsData.league.logo} alt="Premier League" className="w-14 h-14 object-contain" />}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Premier League</h1>
          <p className="text-neutral-400 mt-1">{SEASON}/{SEASON + 1} Season • {standings.length} clubs</p>
        </div>
      </div>

      <section>
        <SectionHeader title="League Table" subtitle="Current standings" />
        {standings.length > 0 ? <LeagueTable standings={standings} showForm /> : <p className="text-neutral-500 text-sm">Standings unavailable.</p>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Latest Results" subtitle="Most recent matches" />
          <div className="space-y-3">
            {recent.length > 0 ? recent.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />) : <p className="text-neutral-500 text-sm">No recent results.</p>}
          </div>
        </section>
        <section>
          <SectionHeader
            title="Upcoming Fixtures"
            subtitle="Next matches"
            action={<Link to="/fixtures?league=39" className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors">All fixtures <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />) : <p className="text-neutral-500 text-sm">No upcoming fixtures.</p>}
          </div>
        </section>
      </div>

      {topScorers.length > 0 && (
        <section>
          <SectionHeader title="Top Scorers" subtitle={`${SEASON}/${SEASON + 1}`} />
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
                {topScorers.map((scorer: any, i: number) => {
                  const stat = scorer.statistics[0];
                  return (
                    <tr key={scorer.player.id} className={`border-b border-neutral-700/20 ${i % 2 === 0 ? "bg-pitch-800/40" : "bg-pitch-800/20"} hover:bg-pitch-700/40 transition-colors`}>
                      <td className="px-4 py-3 text-neutral-500 font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {scorer.player.photo && <img src={scorer.player.photo} alt={scorer.player.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                          <span className="text-white font-medium">{scorer.player.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {stat?.team.logo && <img src={stat.team.logo} alt={stat.team.name} className="w-5 h-5 object-contain" />}
                          <span className="text-neutral-300 text-sm">{stat?.team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-400 tabular-nums">{stat?.games.appearences ?? "-"}</td>
                      <td className="px-4 py-3 text-center"><span className="text-grass-400 font-bold tabular-nums">{stat?.goals.total ?? 0}</span></td>
                      <td className="px-4 py-3 text-center text-neutral-400 tabular-nums hidden sm:table-cell">{stat?.goals.assists ?? 0}</td>
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
