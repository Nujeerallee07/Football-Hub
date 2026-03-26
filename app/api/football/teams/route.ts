// app/api/football/teams/route.ts
import { NextResponse } from "next/server";
import { getTeamsByLeague, searchTeams, CURRENT_SEASON } from "@/services/footballApi";

export const revalidate = 600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("league");
  const query = searchParams.get("q");
  const season = searchParams.get("season");

  if (query) {
    const data = await searchTeams(query);
    return NextResponse.json(data);
  }

  if (leagueId) {
    const data = await getTeamsByLeague(
      Number(leagueId),
      season ? Number(season) : CURRENT_SEASON
    );
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "league or q param required" }, { status: 400 });
}
