// app/api/odds/route.ts
import { NextResponse } from "next/server";
import {
  getOdds,
  SPORT_KEYS,
  type SportKey,
} from "@/services/oddsApi";

export const revalidate = 120;

const VALID_SPORTS = Object.values(SPORT_KEYS) as string[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? SPORT_KEYS.PREMIER_LEAGUE;
  const regions = searchParams.get("regions") ?? "uk";
  const markets = searchParams.get("markets") ?? "h2h";

  if (!VALID_SPORTS.includes(sport)) {
    return NextResponse.json({ error: "Invalid sport key" }, { status: 400 });
  }

  const data = await getOdds(sport as SportKey, regions, markets);
  return NextResponse.json(data);
}
