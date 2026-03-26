import { Link } from "react-router-dom";
import { Star, ExternalLink } from "lucide-react";
import { cn, parseForm, getFormColor } from "@/lib/utils";
import { useFavouritesStore } from "@/lib/store";
import type { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  form?: string;
  position?: number;
  points?: number;
  manager?: string;
  leagueId?: number;
  className?: string;
}

export function TeamCard({ team, form, position, points, manager, leagueId = 39, className }: TeamCardProps) {
  const { isFavourite, addFavourite, removeFavourite } = useFavouritesStore();
  const favourite = isFavourite(team.id);

  const toggleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favourite) removeFavourite(team.id);
    else addFavourite({ id: team.id, name: team.name, logo: team.logo, leagueId });
  };

  return (
    <Link
      to={`/teams/${team.id}`}
      className={cn("block bg-pitch-800 border border-neutral-700/50 rounded-xl p-5 hover:border-neutral-600 transition-all duration-200 hover:shadow-card-hover group", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={team.logo}
            alt={team.name}
            className="w-12 h-12 object-contain flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
          />
          <div>
            <h3 className="text-white font-semibold text-base">{team.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {team.country && <span className="text-neutral-500 text-xs">{team.country}</span>}
              {team.founded && <span className="text-neutral-600 text-xs">Est. {team.founded}</span>}
            </div>
          </div>
        </div>
        <button onClick={toggleFavourite} className="p-1.5 rounded-lg hover:bg-pitch-700 transition-colors flex-shrink-0" aria-label={favourite ? "Remove from favourites" : "Add to favourites"}>
          <Star className={cn("w-4 h-4 transition-colors", favourite ? "text-amber-400 fill-amber-400" : "text-neutral-500")} />
        </button>
      </div>

      {(position !== undefined || points !== undefined || manager) && (
        <div className="mt-4 pt-3 border-t border-neutral-700/30 flex items-center gap-4">
          {position !== undefined && <div><p className="text-neutral-500 text-xs">Position</p><p className="text-white font-bold text-sm">{position}</p></div>}
          {points !== undefined && <div><p className="text-neutral-500 text-xs">Points</p><p className="text-grass-400 font-bold text-sm">{points}</p></div>}
          {manager && <div className="flex-1 min-w-0"><p className="text-neutral-500 text-xs">Manager</p><p className="text-neutral-300 text-sm truncate">{manager}</p></div>}
        </div>
      )}

      {form && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-neutral-500 text-xs">Form:</span>
          <div className="flex gap-1">
            {parseForm(form).map((r, i) => (
              <span key={i} className={cn("w-5 h-5 rounded text-xs font-bold flex items-center justify-center text-pitch-950", getFormColor(r))}>{r}</span>
            ))}
          </div>
        </div>
      )}

      {team.website && (
        <a href={team.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-grass-400 transition-colors">
          <ExternalLink className="w-3 h-3" />
          Official Website
        </a>
      )}
    </Link>
  );
}
