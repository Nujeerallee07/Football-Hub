// app/api/football/match/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getFixtureById,
  getMatchLineups,
  getMatchEvents,
  getMatchStatistics,
  getFixtureInjuries,
  getFixtureOdds,
  getMatchPrediction,
  getHeadToHead,
} from "@/services/footballApi";

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const fixtureId = Number(params.id);

  if (isNaN(fixtureId)) {
    return NextResponse.json({ error: "Invalid fixture ID" }, { status: 400 });
  }

  // Fetch all match data in parallel
  const [fixture, lineups, events, statistics, injuries, odds, prediction] =
    await Promise.allSettled([
      getFixtureById(fixtureId),
      getMatchLineups(fixtureId),
      getMatchEvents(fixtureId),
      getMatchStatistics(fixtureId),
      getFixtureInjuries(fixtureId),
      getFixtureOdds(fixtureId),
      getMatchPrediction(fixtureId),
    ]);

  // Get H2H if we have fixture data
  let h2h = null;
  if (fixture.status === "fulfilled" && fixture.value) {
    const homeId = fixture.value.teams.home.id;
    const awayId = fixture.value.teams.away.id;
    const h2hResult = await getHeadToHead(homeId, awayId, 10);
    h2h = h2hResult;
  }

  return NextResponse.json({
    fixture: fixture.status === "fulfilled" ? fixture.value : null,
    lineups: lineups.status === "fulfilled" ? lineups.value : [],
    events: events.status === "fulfilled" ? events.value : [],
    statistics: statistics.status === "fulfilled" ? statistics.value : [],
    injuries: injuries.status === "fulfilled" ? injuries.value : [],
    odds: odds.status === "fulfilled" ? odds.value : null,
    prediction: prediction.status === "fulfilled" ? prediction.value : null,
    h2h,
  });
}
