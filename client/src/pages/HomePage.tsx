import { Link } from "react-router-dom";
import { useLiveMatches, useFixtures, useStandings } from "@/hooks/useFootball";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LeagueTable } from "@/components/match/LeagueTable";
import { SectionHeader, Badge, EmptyState } from "@/components/ui";
import { Trophy, Zap, Calendar, TrendingUp, ArrowRight } from "lucide-react";

const PL_ID = 39;
const UCL_ID = 2;
const EL_ID = 3;
const SEASON = 2024;

export function HomePage() {
  const { data: live = [] } = useLiveMatches();
  const { data: upcoming = [] } = useFixtures({ leagueId: PL_ID, next: 6 });
  const { data: recent = [] } = useFixtures({ leagueId: PL_ID, last: 6 });
  const { data: uclFixtures = [] } = useFixtures({ leagueId: UCL_ID, next: 4 });
  const { data: standingsData } = useStandings(PL_ID);

  const majorLive = live.filter((m: any) => [PL_ID, UCL_ID, EL_ID].includes(m.league.id));
  const standings = standingsData?.league?.standings?.[0] ?? [];

  return (
    <div className="page-container space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-card-gradient border border-neutral-700/30 p-8 md:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-grass-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            {majorLive.length > 0 ? (
              <Badge variant="live">
                <span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />
                {majorLive.length} LIVE
              </Badge>
            ) : (
              <Badge variant="default"><Zap className="w-3 h-3" />Live Hub</Badge>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Football at your <span className="text-gradient-green">fingertips</span>
          </h1>
          <p className="text-neutral-400 mt-4 text-lg max-w-xl">
            Real-time Premier League &amp; Champions League scores, fixtures, standings and betting odds — all in one place.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/premier-league" className="flex items-center gap-2 px-5 py-2.5 bg-grass-gradient text-pitch-950 font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-glow-green">
              <Trophy className="w-4 h-4" />Premier League
            </Link>
            <Link to="/champions-league" className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl text-sm hover:bg-pitch-600 transition-colors">
              <Zap className="w-4 h-4" />Champions League
            </Link>
            <Link to="/odds" className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl text-sm hover:bg-pitch-600 transition-colors">
              <TrendingUp className="w-4 h-4" />Betting Odds
            </Link>
          </div>
        </div>
      </section>

      {/* Live Matches */}
      {majorLive.length > 0 && (
        <section>
          <SectionHeader
            title="Live Now"
            subtitle={`${majorLive.length} match${majorLive.length !== 1 ? "es" : ""} in progress`}
            action={<Badge variant="live"><span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />LIVE</Badge>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorLive.map((match: any) => <FixtureCard key={match.fixture.id} match={match} showLeague />)}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/premier-league", icon: Trophy, label: "Premier League", desc: "Table & fixtures", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { href: "/champions-league", icon: Zap, label: "Champions League", desc: "UCL fixtures", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { href: "/fixtures", icon: Calendar, label: "All Fixtures", desc: "Browse by date", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { href: "/odds", icon: TrendingUp, label: "Betting Odds", desc: "Best bookmaker odds", color: "text-grass-400", bg: "bg-grass-500/10 border-grass-500/20" },
          ].map((l) => (
            <Link key={l.href} to={l.href} className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-card ${l.bg}`}>
              <l.icon className={`w-5 h-5 flex-shrink-0 ${l.color}`} />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{l.label}</p>
                <p className="text-neutral-500 text-xs">{l.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader
            title="Premier League Fixtures"
            subtitle="Upcoming matches"
            action={<Link to="/fixtures" className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors">View all <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          {upcoming.length > 0 ? (
            <div className="space-y-3">{upcoming.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />)}</div>
          ) : <EmptyState title="No upcoming fixtures" description="Check back soon for upcoming Premier League matches." icon={<Calendar className="w-10 h-10" />} />}
        </section>
        <section>
          <SectionHeader
            title="Recent Results"
            subtitle="Premier League"
            action={<Link to="/premier-league" className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors">Full table <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          {recent.length > 0 ? (
            <div className="space-y-3">{recent.map((m: any) => <FixtureCard key={m.fixture.id} match={m} compact />)}</div>
          ) : <EmptyState title="No recent results" icon={<Trophy className="w-10 h-10" />} />}
        </section>
      </div>

      {/* UCL */}
      {uclFixtures.length > 0 && (
        <section>
          <SectionHeader
            title="Champions League"
            subtitle="Upcoming fixtures"
            action={<Link to="/champions-league" className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors">View all <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uclFixtures.map((m: any) => <FixtureCard key={m.fixture.id} match={m} />)}
          </div>
        </section>
      )}

      {/* PL Table */}
      {standings.length > 0 && (
        <section>
          <SectionHeader
            title="Premier League Table"
            subtitle={`${SEASON}/${SEASON + 1} Season`}
            action={<Link to="/premier-league" className="flex items-center gap-1 text-grass-400 hover:text-grass-300 text-sm transition-colors">Full table <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          <LeagueTable standings={standings} compact limit={10} showForm={false} />
        </section>
      )}
    </div>
  );
}
