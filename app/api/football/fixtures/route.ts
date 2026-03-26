// app/api/football/fixtures/route.ts
import { NextResponse } from "next/server";
import {
  getTodayFixtures,
  getUpcomingFixtures,
  getRecentResults,
  getTeamFixtures,
  getFixturesByDateRange,
  CURRENT_SEASON,
} from "@/services/footballApi";

export const revalidate = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const leagueId = searchParams.get("league");
  const teamId = searchParams.get("team");
  const next = searchParams.get("next");
  const last = searchParams.get("last");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let data;

  if (teamId) {
    data = await getTeamFixtures(
      Number(teamId),
      CURRENT_SEASON,
      last ? Number(last) : undefined,
      next ? Number(next) : undefined
    );
  } else if (from && to) {
    data = await getFixturesByDateRange(
      from,
      to,
      leagueId ? Number(leagueId) : undefined
    );
  } else if (next && leagueId) {
    data = await getUpcomingFixtures(Number(leagueId), CURRENT_SEASON, Number(next));
  } else if (last && leagueId) {
    data = await getRecentResults(Number(leagueId), CURRENT_SEASON, Number(last));
  } else {
    data = await getTodayFixtures(leagueId ? Number(leagueId) : undefined);
  }

  return NextResponse.json(data);
}
