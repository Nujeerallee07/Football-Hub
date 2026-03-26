import { Link } from "react-router-dom";
import { cn, formatKickOff, formatMatchDate, getMatchState, getStatusLabel, formatGoals } from "@/lib/utils";
import type { Match } from "@/types";
import { MapPin } from "lucide-react";

interface FixtureCardProps {
  match: Match;
  compact?: boolean;
  showLeague?: boolean;
  className?: string;
}

export function FixtureCard({ match, compact = false, showLeague = false, className }: FixtureCardProps) {
  const { fixture, teams, goals, league } = match;
  const state = getMatchState(fixture.status.short);
  const isLive = state === "live";
  const isFinished = state === "finished";
  const isUpcoming = state === "upcoming";
  const statusLabel = getStatusLabel(fixture.status.short, fixture.status.elapsed);

  return (
    <Link
      to={`/match/${fixture.id}`}
      className={cn(
        "block bg-pitch-800 border rounded-xl hover:border-neutral-600 transition-all duration-200 hover:shadow-card-hover group",
        isLive ? "border-grass-500/40 shadow-glow-green/20" : "border-neutral-700/50",
        className
      )}
    >
      <div className={cn("p-4", compact && "p-3")}>
        <div className="flex items-center justify-between mb-3">
          {showLeague && (
            <div className="flex items-center gap-1.5">
              {league.logo && (
                <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />
              )}
              <span className="text-neutral-400 text-xs">{league.name}</span>
            </div>
          )}
          {!showLeague && (
            <span className="text-neutral-500 text-xs">{formatMatchDate(fixture.date)}</span>
          )}
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            isLive && "bg-grass-500/10 text-grass-400",
            isFinished && "bg-neutral-700 text-neutral-300",
            isUpcoming && "bg-pitch-700 text-neutral-400",
            state === "postponed" && "bg-amber-500/10 text-amber-400"
          )}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-grass-400 animate-live-dot" />}
            {statusLabel}
          </div>
        </div>

        <div className="space-y-2">
          <TeamRow name={teams.home.name} logo={teams.home.logo} goals={isUpcoming ? null : goals.home} winner={teams.home.winner} isLive={isLive} />
          <TeamRow name={teams.away.name} logo={teams.away.logo} goals={isUpcoming ? null : goals.away} winner={teams.away.winner} isLive={isLive} />
        </div>

        {(isUpcoming || compact === false) && (
          <div className="mt-3 pt-3 border-t border-neutral-700/40 flex items-center justify-between">
            {isUpcoming && (
              <span className="text-grass-400 text-xs font-semibold">KO: {formatKickOff(fixture.date)}</span>
            )}
            {fixture.venue?.name && !compact && (
              <div className="flex items-center gap-1 text-neutral-500 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{fixture.venue.city}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function TeamRow({ name, logo, goals, winner, isLive }: { name: string; logo: string; goals: number | null; winner?: boolean; isLive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <img
          src={logo}
          alt={name}
          className="w-6 h-6 object-contain flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=32&background=162d56&color=00e676`;
          }}
        />
        <span className={cn("text-sm truncate", winner ? "text-white font-semibold" : "text-neutral-300")}>
          {name}
        </span>
      </div>
      <span className={cn(
        "text-sm font-bold tabular-nums w-5 text-right flex-shrink-0",
        winner ? "text-white" : "text-neutral-400",
        isLive && goals !== null && "text-grass-400"
      )}>
        {goals !== null ? formatGoals(goals) : "-"}
      </span>
    </div>
  );
}
