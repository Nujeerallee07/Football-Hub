import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useMatchDetail } from "@/hooks/useFootball";
import { MatchLineupDisplay } from "@/components/match/MatchLineup";
import { FixtureCard } from "@/components/match/FixtureCard";
import { StatBar, TabNav, Badge, SectionHeader, LoadingSpinner } from "@/components/ui";
import { formatOdds } from "@/services/oddsApi";
import { formatDateTime, getMatchState, getStatusLabel, cn, parseForm, getFormColor } from "@/lib/utils";
import {
  MapPin, Clock, User, AlertTriangle, TrendingUp, ExternalLink, Swords, BarChart2, Users, Goal, Star,
} from "lucide-react";
import type { MatchLineup, MatchEvent, MatchStatistic, Injury, Team } from "@/types";

const TABS = [
  { id: "lineups", label: "Lineups", icon: <Users className="w-4 h-4" /> },
  { id: "events", label: "Events", icon: <Goal className="w-4 h-4" /> },
  { id: "stats", label: "Stats", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "h2h", label: "H2H", icon: <Swords className="w-4 h-4" /> },
  { id: "odds", label: "Odds", icon: <TrendingUp className="w-4 h-4" /> },
];

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fixtureId = Number(id);
  const [activeTab, setActiveTab] = useState("lineups");

  const { data, isLoading, isError } = useMatchDetail(fixtureId);

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;
  if (isError || !data?.fixture) return <Navigate to="/" replace />;

  const { fixture, lineups = [], events = [], statistics = [], injuries = [], h2h = [], odds: oddsData = null, prediction = null } = data;
  const { teams, goals, league } = fixture;
  const state = getMatchState(fixture.fixture.status.short);
  const isLive = state === "live";
  const statusLabel = getStatusLabel(fixture.fixture.status.short, fixture.fixture.status.elapsed);

  return (
    <div className="page-container space-y-8">
      {/* Match Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card-gradient border border-neutral-700/30 p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-pitch-700/20 blur-3xl rounded-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            {league.logo && <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />}
            <span className="text-neutral-400 text-sm">{league.name}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-500 text-sm">{league.country}</span>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-8">
            <TeamDisplay name={teams.home.name} logo={teams.home.logo} id={teams.home.id} winner={teams.home.winner} />

            <div className="flex-shrink-0 text-center">
              {state === "upcoming" ? (
                <div>
                  <div className="text-3xl font-bold text-neutral-400">vs</div>
                  <div className="text-grass-400 text-sm font-semibold mt-1">{formatDateTime(fixture.fixture.date)}</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-5xl md:text-6xl font-display font-bold tabular-nums", teams.home.winner ? "text-white" : "text-neutral-400")}>
                      {goals.home ?? 0}
                    </span>
                    <span className="text-neutral-600 text-3xl">–</span>
                    <span className={cn("text-5xl md:text-6xl font-display font-bold tabular-nums", teams.away.winner ? "text-white" : "text-neutral-400")}>
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

            <TeamDisplay name={teams.away.name} logo={teams.away.logo} id={teams.away.id} winner={teams.away.winner} align="right" />
          </div>

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

      {/* Team Links */}
      <div className="flex flex-wrap gap-3">
        <Link to={`/teams/${teams.home.id}`} className="flex items-center gap-2 px-4 py-2.5 bg-pitch-800 border border-neutral-700/50 hover:border-neutral-600 rounded-xl text-sm text-white transition-all">
          <img src={teams.home.logo} alt={teams.home.name} className="w-5 h-5 object-contain" />
          {teams.home.name} Page
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </Link>
        <Link to={`/teams/${teams.away.id}`} className="flex items-center gap-2 px-4 py-2.5 bg-pitch-800 border border-neutral-700/50 hover:border-neutral-600 rounded-xl text-sm text-white transition-all">
          <img src={teams.away.logo} alt={teams.away.name} className="w-5 h-5 object-contain" />
          {teams.away.name} Page
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </Link>
      </div>

      {/* Tabbed Content */}
      <div className="space-y-6">
        <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="animate-fade-in">
          {activeTab === "lineups" && (
            <div className="space-y-6">
              <MatchLineupDisplay lineups={lineups} />
              {injuries.length > 0 && (
                <div>
                  <SectionHeader title="Injury Report" subtitle="Unavailable players" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {injuries.map((inj: Injury) => <InjuryRow key={inj.player.id} injury={inj} />)}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "events" && <EventsTimeline events={events} homeTeam={teams.home} awayTeam={teams.away} />}
          {activeTab === "stats" && <MatchStats stats={statistics} homeTeam={teams.home} awayTeam={teams.away} />}
          {activeTab === "h2h" && <HeadToHeadPanel h2h={h2h} homeTeam={teams.home} awayTeam={teams.away} />}
          {activeTab === "odds" && <OddsPanel oddsData={oddsData} prediction={prediction} homeTeam={teams.home} awayTeam={teams.away} />}
        </div>
      </div>
    </div>
  );
}

function TeamDisplay({ name, logo, id, winner, align = "left" }: { name: string; logo: string; id: number; winner?: boolean; align?: "left" | "right" }) {
  return (
    <Link to={`/teams/${id}`} className={cn("flex flex-col items-center gap-3 group max-w-32 sm:max-w-48", align === "right" ? "text-right" : "text-left")}>
      <img src={logo} alt={name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
      <span className={cn("font-display font-bold text-center text-sm sm:text-base leading-tight group-hover:text-white transition-colors", winner ? "text-white" : "text-neutral-300")}>
        {name}
      </span>
    </Link>
  );
}

function EventsTimeline({ events, homeTeam, awayTeam }: { events: MatchEvent[]; homeTeam: Team; awayTeam: Team }) {
  if (!events || events.length === 0) {
    return <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">No events recorded yet</div>;
  }
  return (
    <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 overflow-hidden">
      <div className="divide-y divide-neutral-700/30">
        {events.map((event, i) => {
          const isHome = event.team.id === homeTeam.id;
          const icon = getEventIcon(event.type, event.detail);
          return (
            <div key={i} className={cn("flex items-center gap-4 px-5 py-3 hover:bg-pitch-700/30 transition-colors", isHome ? "flex-row" : "flex-row-reverse")}>
              <img src={event.team.logo} alt={event.team.name} className="w-6 h-6 object-contain flex-shrink-0" />
              <div className={cn("flex-1", isHome ? "text-left" : "text-right")}>
                <span className="text-white text-sm font-medium">{event.player.name}</span>
                {event.assist?.name && <span className="text-neutral-500 text-xs block">Assist: {event.assist.name}</span>}
                <span className="text-neutral-500 text-xs">{event.detail}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl">{icon}</span>
                <span className="text-grass-400 font-bold text-sm tabular-nums w-10 text-center">
                  {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventIcon(type: string, detail: string): string {
  if (type === "Goal") {
    if (detail.toLowerCase().includes("own")) return "⚽🔴";
    if (detail.toLowerCase().includes("penalty")) return "⚽🎯";
    return "⚽";
  }
  if (type === "Card") {
    if (detail === "Yellow Card") return "🟨";
    if (detail === "Red Card") return "🟥";
    if (detail === "Yellow Red Card") return "🟧";
    return "🟨";
  }
  if (type === "subst") return "🔄";
  if (type === "Var") return "📺";
  return "•";
}

function MatchStats({ stats, homeTeam, awayTeam }: { stats: MatchStatistic[]; homeTeam: Team; awayTeam: Team }) {
  if (!stats || stats.length < 2) {
    return <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">Statistics not yet available</div>;
  }
  const homeStats = stats.find((s) => s.team.id === homeTeam.id);
  const awayStats = stats.find((s) => s.team.id === awayTeam.id);
  if (!homeStats || !awayStats) {
    return <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">Statistics not available</div>;
  }

  const getVal = (teamStats: MatchStatistic, label: string): number | string => {
    const stat = teamStats.statistics.find((s) => s.type === label);
    if (!stat || stat.value === null) return 0;
    if (typeof stat.value === "string" && stat.value.endsWith("%")) return Number(stat.value.replace("%", ""));
    return stat.value ?? 0;
  };

  const statRows = ["Ball Possession","Total Shots","Shots on Goal","Shots off Goal","Blocked Shots","Corner Kicks","Fouls","Yellow Cards","Red Cards","Offsides","Goalkeeper Saves","Total passes","Passes accurate","expected_goals"];

  return (
    <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-700/30">
        <div className="flex items-center gap-2">
          <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />
          <span className="text-white font-semibold text-sm">{homeTeam.name}</span>
        </div>
        <span className="text-neutral-500 text-xs">Match Stats</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{awayTeam.name}</span>
          <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />
        </div>
      </div>
      <div className="p-5 space-y-4">
        {statRows.map((statName) => {
          const homeVal = getVal(homeStats, statName);
          const awayVal = getVal(awayStats, statName);
          if (homeVal === 0 && awayVal === 0) return null;
          return <StatBar key={statName} label={statName === "expected_goals" ? "xG" : statName} homeValue={homeVal} awayValue={awayVal} />;
        })}
      </div>
    </div>
  );
}

function HeadToHeadPanel({ h2h, homeTeam, awayTeam }: { h2h: any[]; homeTeam: Team; awayTeam: Team }) {
  if (!h2h || h2h.length === 0) {
    return <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">No head-to-head history available</div>;
  }
  let homeWins = 0, draws = 0, awayWins = 0;
  h2h.forEach((match) => {
    const hg = match.goals.home ?? 0, ag = match.goals.away ?? 0;
    const isHome = match.teams.home.id === homeTeam.id;
    if (hg === ag) draws++;
    else if (isHome ? hg > ag : ag > hg) homeWins++;
    else awayWins++;
  });
  const total = homeWins + draws + awayWins;

  return (
    <div className="space-y-4">
      <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <img src={homeTeam.logo} alt={homeTeam.name} className="w-10 h-10 object-contain mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">{homeTeam.name}</p>
          </div>
          <div className="text-center flex-1 px-4">
            <p className="text-neutral-500 text-xs mb-2">Last {total} meetings</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-grass-400 font-bold text-2xl">{homeWins}</span>
              <span className="text-neutral-500">—</span>
              <span className="text-neutral-300 font-bold text-2xl">{draws}</span>
              <span className="text-neutral-500">—</span>
              <span className="text-red-400 font-bold text-2xl">{awayWins}</span>
            </div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-neutral-500 text-xs">W</span>
              <span className="text-neutral-500 text-xs">D</span>
              <span className="text-neutral-500 text-xs">W</span>
            </div>
          </div>
          <div className="text-center">
            <img src={awayTeam.logo} alt={awayTeam.name} className="w-10 h-10 object-contain mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">{awayTeam.name}</p>
          </div>
        </div>
        {total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="bg-grass-500 transition-all" style={{ width: `${(homeWins / total) * 100}%` }} />
            <div className="bg-neutral-500 transition-all" style={{ width: `${(draws / total) * 100}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${(awayWins / total) * 100}%` }} />
          </div>
        )}
      </div>
      <div className="space-y-3">
        {h2h.slice(0, 8).map((match: any) => <FixtureCard key={match.fixture.id} match={match} compact showLeague />)}
      </div>
    </div>
  );
}

function OddsPanel({ oddsData, prediction, homeTeam, awayTeam }: { oddsData: any; prediction: any; homeTeam: Team; awayTeam: Team }) {
  const bookmakers = oddsData?.bookmakers ?? [];
  return (
    <div className="space-y-6">
      {prediction?.predictions && (
        <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Match Prediction
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: homeTeam.name, value: prediction.predictions.percent.home, color: "text-grass-400" },
              { label: "Draw", value: prediction.predictions.percent.draw, color: "text-neutral-300" },
              { label: awayTeam.name, value: prediction.predictions.percent.away, color: "text-red-400" },
            ].map((p) => (
              <div key={p.label} className="text-center">
                <p className={cn("text-2xl font-bold", p.color)}>{p.value}</p>
                <p className="text-neutral-500 text-xs mt-1 truncate">{p.label}</p>
              </div>
            ))}
          </div>
          {prediction.predictions.advice && (
            <p className="text-neutral-300 text-sm bg-pitch-700/50 rounded-lg p-3 italic">"{prediction.predictions.advice}"</p>
          )}
          {prediction.predictions.winner && (
            <p className="text-neutral-400 text-sm mt-2">
              Predicted winner: <span className="text-white font-medium">{prediction.predictions.winner.name}</span>
              {prediction.predictions.winner.comment && <span className="text-neutral-500"> — {prediction.predictions.winner.comment}</span>}
            </p>
          )}
        </div>
      )}

      {bookmakers.length > 0 ? (
        <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-700/30">
            <h3 className="text-white font-semibold">Bookmaker Odds</h3>
            <p className="text-neutral-500 text-xs mt-0.5">Match result (1X2)</p>
          </div>
          <div className="grid grid-cols-4 gap-2 px-5 py-2 bg-pitch-700/20 text-xs text-neutral-500 font-medium">
            <span>Bookmaker</span>
            <span className="text-center">{homeTeam.name.split(" ")[0]}</span>
            <span className="text-center">Draw</span>
            <span className="text-center">{awayTeam.name.split(" ")[0]}</span>
          </div>
          <div className="divide-y divide-neutral-700/20">
            {bookmakers.map((bm: any) => {
              const bet = bm.bets?.find((b: any) => b.name === "Match Winner" || b.name === "Home/Draw/Away");
              if (!bet) return null;
              const homeOdd = bet.values?.find((v: any) => v.value === "Home")?.odd;
              const drawOdd = bet.values?.find((v: any) => v.value === "Draw")?.odd;
              const awayOdd = bet.values?.find((v: any) => v.value === "Away")?.odd;
              return (
                <div key={bm.id} className="grid grid-cols-4 gap-2 px-5 py-3 hover:bg-pitch-700/20 transition-colors">
                  <span className="text-neutral-300 text-sm font-medium truncate self-center">{bm.name}</span>
                  {[homeOdd, drawOdd, awayOdd].map((odd, i) => (
                    <div key={i} className="text-center">
                      <span className={cn("text-sm font-bold tabular-nums", odd ? "text-white" : "text-neutral-600")}>{odd ?? "—"}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">
          Odds not yet available for this match
        </div>
      )}

      <p className="text-neutral-600 text-xs text-center">
        18+ · Gamble Responsibly ·{" "}
        <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-400">
          BeGambleAware.org
        </a>
      </p>
    </div>
  );
}

function InjuryRow({ injury }: { injury: Injury }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-pitch-800 border border-red-500/15 rounded-xl">
      {injury.player.photo && (
        <img src={injury.player.photo} alt={injury.player.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      )}
      <img src={injury.team.logo} alt={injury.team.name} className="w-5 h-5 object-contain flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{injury.player.name}</p>
        <p className="text-red-400 text-xs">{injury.reason}</p>
      </div>
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
    </div>
  );
}
