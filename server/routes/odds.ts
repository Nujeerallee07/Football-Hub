import { Router } from "express";
import { getOdds, SPORT_KEYS, type SportKey } from "../../services/oddsApi";

export const oddsRouter = Router();

const VALID_SPORTS = new Set(Object.values(SPORT_KEYS));

// GET /api/odds
oddsRouter.get("/", async (req, res) => {
  try {
    const sport = (req.query.sport as string) ?? SPORT_KEYS.PREMIER_LEAGUE;
    const regions = (req.query.regions as string) ?? "uk";
    const markets = (req.query.markets as string) ?? "h2h";

    if (!VALID_SPORTS.has(sport as SportKey)) {
      return res.status(400).json({ error: "Invalid sport key" });
    }

    const data = await getOdds(sport as SportKey, regions, markets);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch odds" });
  }
});
