import { useStandings, useFixtures } from "@/hooks/useFootball";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader, LoadingSpinner } from "@/components/ui";

const UCL_ID = 2;
const SEASON = 2024;

export function ChampionsLeaguePage() {
  const { data: standingsData, isLoading } = useStandings(UCL_ID);
  const { data: recent = [] } = useFixtures({ leagueId: UCL_ID, last: 12 });
  const { data: upcoming = [] } = useFixtures({ leagueId: UCL_ID, next: 12 });

  const allStandings = standingsData?.league?.standings ?? [];
  const flatStandings = allStandings.flat();
  const isGroupStage = allStandings.length > 1;

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;

  return (
    <div className="page-container space-y-10">
      <div className="flex items-center gap-4">
        {standingsData?.league?.logo && (
          <img src={standingsData.league.logo} alt="Champions League" className="w-14 h-14 object-contain" />
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">UEFA Champions League</h1>
          <p className="text-neutral-400 mt-1">{SEASON}/{SEASON + 1} Season</p>
        </div>
      </div>

      {isGroupStage ? (
        <section>
          <SectionHeader title="Group Stage Tables" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allStandings.map((group: any[], i: number) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Recent Results" />
          <div className="space-y-3">
            {recent.length > 0
              ? recent.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />)
              : <p className="text-neutral-500 text-sm">No recent results.</p>}
          </div>
        </section>
        <section>
          <SectionHeader title="Upcoming Fixtures" />
          <div className="space-y-3">
            {upcoming.length > 0
              ? upcoming.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />)
              : <p className="text-neutral-500 text-sm">No upcoming fixtures.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
