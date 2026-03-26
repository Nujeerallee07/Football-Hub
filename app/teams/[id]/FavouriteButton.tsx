// app/teams/[id]/FavouriteButton.tsx
"use client";

import { Star } from "lucide-react";
import { useFavouritesStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  teamId: number;
  teamName: string;
  teamLogo: string;
  leagueId?: number;
}

export function FavouriteButton({
  teamId,
  teamName,
  teamLogo,
  leagueId = 39,
}: FavouriteButtonProps) {
  const { isFavourite, addFavourite, removeFavourite } = useFavouritesStore();
  const favourite = isFavourite(teamId);

  const toggle = () => {
    if (favourite) {
      removeFavourite(teamId);
    } else {
      addFavourite({ id: teamId, name: teamName, logo: teamLogo, leagueId });
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
        favourite
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-pitch-700 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
      )}
    >
      <Star
        className={cn("w-4 h-4", favourite && "fill-amber-400")}
      />
      {favourite ? "Saved" : "Save Team"}
    </button>
  );
}
