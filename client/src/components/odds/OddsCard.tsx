import { cn } from "@/lib/utils";
import { formatOdds, processOdds, type ProcessedOdds } from "@/services/oddsApi";
import type { OddsAPIGame } from "@/types";
import { TrendingUp, Star } from "lucide-react";

interface OddsCardProps { game: OddsAPIGame; odds: ProcessedOdds; className?: string }

export function OddsCard({ game, odds, className }: OddsCardProps) {
  const commenceDate = new Date(game.commence_time);
  const isToday = commenceDate.toDateString() === new Date().toDateString();

  return (
    <div className={cn("bg-pitch-800 border border-neutral-700/50 rounded-xl overflow-hidden hover:border-neutral-600 transition-all duration-200 hover:shadow-card-hover", className)}>
      <div className="px-4 py-3 border-b border-neutral-700/30 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{game.home_team} vs {game.away_team}</p>
          <p className="text-neutral-500 text-xs mt-0.5">
            {isToday
              ? `Today, ${commenceDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : commenceDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
        <TrendingUp className="w-4 h-4 text-neutral-500" />
      </div>

      <div className="p-4 grid grid-cols-3 gap-2">
        <OddsButton label="1" sublabel={game.home_team.split(" ").pop()!} odds={odds.homeWin} best={odds.bestHome} />
        <OddsButton label="X" sublabel="Draw" odds={odds.draw} best={odds.bestDraw} />
        <OddsButton label="2" sublabel={game.away_team.split(" ").pop()!} odds={odds.awayWin} best={odds.bestAway} />
      </div>

      <div className="px-4 pb-3 grid grid-cols-3 gap-2 text-center">
        {[odds.bestHome, odds.bestDraw, odds.bestAway].map((best, i) => (
          <p key={i} className="text-xs text-neutral-500 truncate">{best ? best.bookmaker : "—"}</p>
        ))}
      </div>

      {odds.bookmakers.length > 0 && (
        <BookmakerTable bookmakers={odds.bookmakers} homeTeam={game.home_team} awayTeam={game.away_team} />
      )}
    </div>
  );
}

function OddsButton({ label, sublabel, odds, best }: { label: string; sublabel: string; odds: number | null; best: { bookmaker: string; odds: number } | null }) {
  const isBest = best && odds && Math.abs(best.odds - odds) < 0.01;
  return (
    <button className={cn(
      "relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg border transition-all duration-200 hover:border-grass-500/50 hover:bg-pitch-700",
      isBest ? "border-grass-500/40 bg-grass-500/5" : "border-neutral-700/50 bg-pitch-700/30"
    )}>
      {isBest && <div className="absolute top-1 right-1"><Star className="w-2.5 h-2.5 text-grass-400 fill-grass-400" /></div>}
      <span className="text-neutral-500 text-xs font-bold">{label}</span>
      <span className={cn("text-lg font-bold tabular-nums", isBest ? "text-grass-400" : "text-white")}>{formatOdds(odds)}</span>
      <span className="text-neutral-500 text-xs truncate w-full text-center">{sublabel}</span>
    </button>
  );
}

function BookmakerTable({ bookmakers, homeTeam, awayTeam }: { bookmakers: ProcessedOdds["bookmakers"]; homeTeam: string; awayTeam: string }) {
  const validBMs = bookmakers.filter((b) => b.home !== null || b.draw !== null || b.away !== null);
  if (validBMs.length === 0) return null;

  return (
    <div className="border-t border-neutral-700/30">
      <details className="group">
        <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs text-neutral-400 hover:text-white transition-colors list-none">
          <span>Compare {validBMs.length} bookmakers</span>
          <span className="group-open:rotate-180 transition-transform text-lg leading-none">›</span>
        </summary>
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-neutral-500">
                <th className="text-left pb-2 font-medium">Bookmaker</th>
                <th className="text-center pb-2 font-medium">1</th>
                <th className="text-center pb-2 font-medium">X</th>
                <th className="text-center pb-2 font-medium">2</th>
              </tr>
            </thead>
            <tbody>
              {validBMs.map((bm) => (
                <tr key={bm.name} className="border-t border-neutral-700/20">
                  <td className="py-1.5 text-neutral-300 font-medium pr-4">{bm.name}</td>
                  <td className={cn("py-1.5 text-center tabular-nums", bm.home ? "text-white" : "text-neutral-600")}>{formatOdds(bm.home)}</td>
                  <td className={cn("py-1.5 text-center tabular-nums", bm.draw ? "text-white" : "text-neutral-600")}>{formatOdds(bm.draw)}</td>
                  <td className={cn("py-1.5 text-center tabular-nums", bm.away ? "text-white" : "text-neutral-600")}>{formatOdds(bm.away)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
