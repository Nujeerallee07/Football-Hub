// app/api/football/search/route.ts
import { NextResponse } from "next/server";
import { searchTeams } from "@/services/footballApi";
import type { SearchResult } from "@/types";

export const revalidate = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const teams = await searchTeams(query);

  const results: SearchResult[] = teams.slice(0, 8).map((t) => ({
    type: "team",
    id: t.team.id,
    name: t.team.name,
    image: t.team.logo,
    subtitle: t.team.country,
    href: `/teams/${t.team.id}`,
  }));

  return NextResponse.json(results);
}
