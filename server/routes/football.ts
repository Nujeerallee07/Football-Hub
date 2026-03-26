import { Router } from "express";
import {
  getLiveMatches,
  getFixtureById,
  getUpcomingFixtures,
  getRecentResults,
  getTodayFixtures,
  getTeamsByLeague,
  getTeamById,
  searchTeams,
  getStandings,
  getMatchLineups,
  getMatchEvents,
  getMatchStatistics,
  getFixtureInjuries,
  getFixtureOdds,
  getMatchPrediction,
  getHeadToHead,
  getTopScorers,
  getTeamSquad,
  getTeamCoach,
  getTeamFixtures,
  getTeamInjuries,
  LEAGUE_IDS,
  CURRENT_SEASON,
} from "../../services/footballApi";

export const footballRouter = Router();

// GET /api/football/live
footballRouter.get("/live", async (req, res) => {
  try {
    const { league } = req.query;
    const matches = await getLiveMatches();
    if (league) {
      const id = Number(league);
      return res.json(matches.filter((m) => m.league.id === id));
    }
    res.json(matches);
  } catch {
    res.status(500).json({ error: "Failed to fetch live matches" });
  }
});

// GET /api/football/fixtures
footballRouter.get("/fixtures", async (req, res) => {
  try {
    const { date, league, team, next, last } = req.query;

    if (date) {
      const leagueId = league ? Number(league) : undefined;
      const { data } = await import("axios").then((m) =>
        m.default.get("https://v3.football.api-sports.io/fixtures", {
          params: { date, league: leagueId, season: CURRENT_SEASON },
          headers: {
            "x-rapidapi-key": process.env.API_FOOTBALL_KEY!,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        })
      );
      return res.json(data.response ?? []);
    }

    if (team) {
      const teamId = Number(team);
      if (next) {
        const fixtures = await getTeamFixtures(teamId, CURRENT_SEASON, undefined, Number(next));
        return res.json(fixtures);
      }
      if (last) {
        const fixtures = await getTeamFixtures(teamId, CURRENT_SEASON, Number(last));
        return res.json(fixtures);
      }
    }

    if (league) {
      const leagueId = Number(league);
      if (next) return res.json(await getUpcomingFixtures(leagueId, CURRENT_SEASON, Number(next)));
      if (last) return res.json(await getRecentResults(leagueId, CURRENT_SEASON, Number(last)));
    }

    res.json(await getTodayFixtures());
  } catch {
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

// GET /api/football/standings
footballRouter.get("/standings", async (req, res) => {
  try {
    const { league, season } = req.query;
    if (!league) return res.status(400).json({ error: "league param required" });
    const data = await getStandings(Number(league), season ? Number(season) : undefined);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch standings" });
  }
});

// GET /api/football/teams
footballRouter.get("/teams", async (req, res) => {
  try {
    const { league, q } = req.query;
    if (q) {
      const results = await searchTeams(String(q));
      return res.json(results.slice(0, 8));
    }
    if (league) {
      return res.json(await getTeamsByLeague(Number(league)));
    }
    res.status(400).json({ error: "league or q param required" });
  } catch {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// GET /api/football/teams/:id — full team detail
footballRouter.get("/teams/:id", async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    if (isNaN(teamId)) return res.status(400).json({ error: "Invalid team ID" });

    const [teamRes, squadRes, coachRes, recentRes, upcomingRes, injuriesRes] =
      await Promise.allSettled([
        getTeamById(teamId),
        getTeamSquad(teamId),
        getTeamCoach(teamId),
        getTeamFixtures(teamId, CURRENT_SEASON, 5),
        getTeamFixtures(teamId, CURRENT_SEASON, undefined, 5),
        getTeamInjuries(teamId),
      ]);

    const teamData = teamRes.status === "fulfilled" ? teamRes.value : null;
    if (!teamData) return res.status(404).json({ error: "Team not found" });

    res.json({
      teamData,
      squad: squadRes.status === "fulfilled" ? squadRes.value : [],
      coach: coachRes.status === "fulfilled" ? coachRes.value : null,
      recent: recentRes.status === "fulfilled" ? recentRes.value : [],
      upcoming: upcomingRes.status === "fulfilled" ? upcomingRes.value : [],
      injuries: injuriesRes.status === "fulfilled" ? injuriesRes.value : [],
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch team detail" });
  }
});

// GET /api/football/match/:id — full match detail
footballRouter.get("/match/:id", async (req, res) => {
  try {
    const fixtureId = Number(req.params.id);
    if (isNaN(fixtureId)) return res.status(400).json({ error: "Invalid fixture ID" });

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

    let h2h = null;
    if (fixture.status === "fulfilled" && fixture.value) {
      h2h = await getHeadToHead(
        fixture.value.teams.home.id,
        fixture.value.teams.away.id,
        10
      );
    }

    res.json({
      fixture: fixture.status === "fulfilled" ? fixture.value : null,
      lineups: lineups.status === "fulfilled" ? lineups.value : [],
      events: events.status === "fulfilled" ? events.value : [],
      statistics: statistics.status === "fulfilled" ? statistics.value : [],
      injuries: injuries.status === "fulfilled" ? injuries.value : [],
      odds: odds.status === "fulfilled" ? odds.value : null,
      prediction: prediction.status === "fulfilled" ? prediction.value : null,
      h2h,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch match detail" });
  }
});

// GET /api/football/top-scorers
footballRouter.get("/top-scorers", async (req, res) => {
  try {
    const { league, season } = req.query;
    if (!league) return res.status(400).json({ error: "league param required" });
    const data = await getTopScorers(Number(league), season ? Number(season) : undefined);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch top scorers" });
  }
});

// GET /api/football/search
footballRouter.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).length < 2) return res.json([]);
    const teams = await searchTeams(String(q));
    const results = teams.slice(0, 8).map((t) => ({
      id: t.team.id,
      name: t.team.name,
      image: t.team.logo,
      subtitle: t.team.country,
      href: `/teams/${t.team.id}`,
      type: "team",
    }));
    res.json(results);
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});
