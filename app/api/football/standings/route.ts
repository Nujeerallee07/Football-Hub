// app/api/football/standings/route.ts
import { NextResponse } from "next/server";
import { getStandings, CURRENT_SEASON } from "@/services/footballApi";

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("league");
  const season = searchParams.get("season");

  if (!leagueId) {
    return NextResponse.json({ error: "league param required" }, { status: 400 });
  }

  const data = await getStandings(
    Number(leagueId),
    season ? Number(season) : CURRENT_SEASON
  );

  return NextResponse.json(data);
}
