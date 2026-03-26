// app/api/football/live/route.ts
import { NextResponse } from "next/server";
import { getLiveMatches, getLiveMatchesByLeague } from "@/services/footballApi";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("league");

  const matches = leagueId
    ? await getLiveMatchesByLeague(Number(leagueId))
    : await getLiveMatches();

  return NextResponse.json(matches, {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
