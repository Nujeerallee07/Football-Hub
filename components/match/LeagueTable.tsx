// components/match/LeagueTable.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cn, parseForm, getFormColor } from "@/lib/utils";
import type { Standing } from "@/types";

interface LeagueTableProps {
  standings: Standing[];
  compact?: boolean;
  highlightTeamId?: number;
  showForm?: boolean;
  limit?: number;
}

export function LeagueTable({
  standings,
  compact = false,
  highlightTeamId,
  showForm = true,
  limit,
}: LeagueTableProps) {
  const rows = limit ? standings.slice(0, limit) : standings;

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-700/50 bg-pitch-800/80">
            <th className="text-left px-4 py-3 text-neutral-500 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-neutral-500 font-medium">Team</th>
            {!compact && (
              <>
                <th className="text-center px-3 py-3 text-neutral-500 font-medium w-10">P</th>
                <th className="text-center px-3 py-3 text-neutral-500 font-medium w-10">W</th>
                <th className="text-center px-3 py-3 text-neutral-500 font-medium w-10">D</th>
                <th className="text-center px-3 py-3 text-neutral-500 font-medium w-10">L</th>
                <th className="text-center px-3 py-3 text-neutral-500 font-medium w-14">GD</th>
              </>
            )}
            {compact && (
              <th className="text-center px-3 py-3 text-neutral-500 font-medium w-10">P</th>
            )}
            <th className="text-center px-4 py-3 text-neutral-500 font-medium w-14">Pts</th>
            {showForm && !compact && (
              <th className="text-center px-4 py-3 text-neutral-500 font-medium">Form</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isHighlighted = highlightTeamId === row.team.id;
            const descColor = getDescriptionColor(row.description);

            return (
              <tr
                key={row.team.id}
                className={cn(
                  "border-b border-neutral-700/30 transition-colors",
                  isHighlighted
                    ? "bg-grass-500/10"
                    : i % 2 === 0
                    ? "bg-pitch-800/40 hover:bg-pitch-800/70"
                    : "bg-pitch-800/20 hover:bg-pitch-800/50"
                )}
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {descColor && (
                      <div className={cn("w-1 h-5 rounded-full flex-shrink-0", descColor)} />
                    )}
                    <span
                      className={cn(
                        "font-medium text-sm",
                        row.rank <= 4 ? "text-grass-400" : "text-neutral-400"
                      )}
                    >
                      {row.rank}
                    </span>
                  </div>
                </td>

                {/* Team */}
                <td className="px-4 py-3">
                  <Link
                    href={`/teams/${row.team.id}`}
                    className="flex items-center gap-2.5 hover:text-white group/team"
                  >
                    <div className="w-6 h-6 relative flex-shrink-0">
                      <Image
                        src={row.team.logo}
                        alt={row.team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium group-hover/team:text-white transition-colors",
                        isHighlighted ? "text-white" : "text-neutral-200"
                      )}
                    >
                      {row.team.name}
                    </span>
                  </Link>
                </td>

                {/* Stats */}
                {!compact && (
                  <>
                    <td className="px-3 py-3 text-center text-neutral-400 tabular-nums">{row.all.played}</td>
                    <td className="px-3 py-3 text-center text-neutral-400 tabular-nums">{row.all.win}</td>
                    <td className="px-3 py-3 text-center text-neutral-400 tabular-nums">{row.all.draw}</td>
                    <td className="px-3 py-3 text-center text-neutral-400 tabular-nums">{row.all.lose}</td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      <span
                        className={cn(
                          "font-medium",
                          row.goalsDiff > 0 ? "text-grass-400" : row.goalsDiff < 0 ? "text-red-400" : "text-neutral-400"
                        )}
                      >
                        {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                      </span>
                    </td>
                  </>
                )}
                {compact && (
                  <td className="px-3 py-3 text-center text-neutral-400 tabular-nums">{row.all.played}</td>
                )}

                {/* Points */}
                <td className="px-4 py-3 text-center">
                  <span className={cn("font-bold tabular-nums", isHighlighted ? "text-grass-400" : "text-white")}>
                    {row.points}
                  </span>
                </td>

                {/* Form */}
                {showForm && !compact && row.form && (
                  <td className="px-4 py-3">
                    <FormBadges form={row.form} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      {!compact && (
        <div className="px-4 py-3 border-t border-neutral-700/30 bg-pitch-800/30 flex flex-wrap gap-4">
          <LegendItem color="bg-grass-500" label="Champions League" />
          <LegendItem color="bg-blue-500" label="Europa League" />
          <LegendItem color="bg-amber-500" label="Conference League" />
          <LegendItem color="bg-red-600" label="Relegation" />
        </div>
      )}
    </div>
  );
}

function FormBadges({ form }: { form: string }) {
  const results = parseForm(form);
  return (
    <div className="flex gap-1 justify-center">
      {results.map((r, i) => (
        <span
          key={i}
          className={cn(
            "w-5 h-5 rounded-sm text-xs font-bold flex items-center justify-center text-pitch-950",
            getFormColor(r)
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
      <div className={cn("w-3 h-3 rounded-sm", color)} />
      {label}
    </div>
  );
}

function getDescriptionColor(description?: string): string | null {
  if (!description) return null;
  const lower = description.toLowerCase();
  if (lower.includes("champions league")) return "bg-grass-500";
  if (lower.includes("europa league")) return "bg-blue-500";
  if (lower.includes("conference")) return "bg-amber-500";
  if (lower.includes("relegation")) return "bg-red-600";
  return null;
}
