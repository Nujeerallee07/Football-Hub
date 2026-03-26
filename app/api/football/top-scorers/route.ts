// app/api/football/top-scorers/route.ts
import { NextResponse } from "next/server";
import { getTopScorers, CURRENT_SEASON } from "@/services/footballApi";

export const revalidate = 600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("league");
  const season = searchParams.get("season");

  if (!leagueId) {
    return NextResponse.json({ error: "league param required" }, { status: 400 });
  }

  const data = await getTopScorers(
    Number(leagueId),
    season ? Number(season) : CURRENT_SEASON
  );

  return NextResponse.json(data);
}
