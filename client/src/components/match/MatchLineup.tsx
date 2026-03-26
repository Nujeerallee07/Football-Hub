import { cn, getPositionColor, getFormationPositions } from "@/lib/utils";
import type { MatchLineup, Player } from "@/types";

interface MatchLineupProps { lineups: MatchLineup[] }

export function MatchLineupDisplay({ lineups }: MatchLineupProps) {
  if (!lineups || lineups.length < 2) {
    return (
      <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 p-8 text-center text-neutral-500">
        Lineup not yet available
      </div>
    );
  }

  const [home, away] = lineups;

  return (
    <div className="space-y-6">
      <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 overflow-hidden">
        <div className="p-4 border-b border-neutral-700/30 flex justify-between text-sm">
          <span className="text-white font-semibold">{home.team.name}</span>
          <span className="text-neutral-400">{home.formation} vs {away.formation}</span>
          <span className="text-white font-semibold">{away.team.name}</span>
        </div>
        <PitchFormation homeLineup={home} awayLineup={away} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LineupList lineup={home} />
        <LineupList lineup={away} />
      </div>
    </div>
  );
}

function PitchFormation({ homeLineup, awayLineup }: { homeLineup: MatchLineup; awayLineup: MatchLineup }) {
  const WIDTH = 320, HEIGHT = 480;
  const homePositions = getFormationPositions(homeLineup.formation, WIDTH, HEIGHT / 2);
  const awayPositions = getFormationPositions(awayLineup.formation, WIDTH, HEIGHT / 2).map(
    (p) => ({ x: WIDTH - p.x, y: HEIGHT - p.y })
  );

  const allPlayers = [
    ...homeLineup.startXI.slice(0, homePositions.length).map((p, i) => ({ player: p.player, pos: homePositions[i], side: "home" as const })),
    ...awayLineup.startXI.slice(0, awayPositions.length).map((p, i) => ({ player: p.player, pos: awayPositions[i], side: "away" as const })),
  ];

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(HEIGHT / WIDTH) * 100}%` }}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 w-full h-full">
        <rect width={WIDTH} height={HEIGHT} fill="#0a3320" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={0} y={i * (HEIGHT / 9)} width={WIDTH} height={HEIGHT / 18} fill="#0c3b26" />
        ))}
        <rect x={10} y={10} width={WIDTH - 20} height={HEIGHT - 20} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        <line x1={10} y1={HEIGHT / 2} x2={WIDTH - 10} y2={HEIGHT / 2} stroke="#1e6644" strokeWidth={1.5} />
        <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={40} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={2} fill="#1e6644" />
        <rect x={(WIDTH - 120) / 2} y={10} width={120} height={60} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        <rect x={(WIDTH - 60) / 2} y={10} width={60} height={28} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        <rect x={(WIDTH - 120) / 2} y={HEIGHT - 70} width={120} height={60} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        <rect x={(WIDTH - 60) / 2} y={HEIGHT - 38} width={60} height={28} fill="none" stroke="#1e6644" strokeWidth={1.5} />
        {allPlayers.map(({ player, pos, side }) => (
          <PlayerDot key={player.id} player={player} x={pos.x} y={pos.y} side={side} />
        ))}
      </svg>
    </div>
  );
}

function PlayerDot({ player, x, y, side }: { player: Player; x: number; y: number; side: "home" | "away" }) {
  const color = side === "home" ? "#00c853" : "#ef5350";
  const shortName = player.name.split(" ").pop() ?? player.name;
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill={color} opacity={0.9} />
      {player.number && (
        <text x={x} y={y + 4} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#050a0e">{player.number}</text>
      )}
      <text x={x} y={y + 18} textAnchor="middle" fontSize={6} fill="white" opacity={0.8}>
        {shortName.length > 8 ? shortName.slice(0, 7) + "." : shortName}
      </text>
    </g>
  );
}

function LineupList({ lineup }: { lineup: MatchLineup }) {
  return (
    <div className="bg-pitch-800 rounded-xl border border-neutral-700/50 overflow-hidden">
      <div className="p-4 border-b border-neutral-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lineup.team.logo && <img src={lineup.team.logo} alt={lineup.team.name} className="w-6 h-6 object-contain" />}
          <span className="text-white font-semibold text-sm">{lineup.team.name}</span>
        </div>
        <span className="text-neutral-400 text-xs bg-pitch-700 px-2 py-1 rounded">{lineup.formation}</span>
      </div>
      {lineup.coach && (
        <div className="px-4 py-2 border-b border-neutral-700/20 flex items-center justify-between">
          <span className="text-neutral-500 text-xs">Manager</span>
          <span className="text-neutral-300 text-xs font-medium">{lineup.coach.name}</span>
        </div>
      )}
      <div className="p-3 space-y-1">
        <p className="text-neutral-500 text-xs px-1 mb-2 font-medium uppercase tracking-wide">Starting XI</p>
        {lineup.startXI.map(({ player }) => <PlayerRow key={player.id} player={player} />)}
      </div>
      {lineup.substitutes.length > 0 && (
        <div className="p-3 border-t border-neutral-700/30 space-y-1">
          <p className="text-neutral-500 text-xs px-1 mb-2 font-medium uppercase tracking-wide">Substitutes</p>
          {lineup.substitutes.map(({ player }) => <PlayerRow key={player.id} player={player} subdued />)}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ player, subdued = false }: { player: Player; subdued?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-pitch-700/50 transition-colors", subdued && "opacity-60")}>
      {player.number && <span className="text-xs font-bold text-neutral-500 w-5 text-center flex-shrink-0">{player.number}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-neutral-200 truncate block">{player.name}</span>
      </div>
      {player.pos && (
        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0", getPositionColor(player.pos))}>{player.pos}</span>
      )}
    </div>
  );
}
