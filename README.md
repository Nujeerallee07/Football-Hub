# ⚽ Football Live Hub

A production-ready, full-stack football dashboard built with **Next.js 14**, **React**, **TypeScript**, and **Tailwind CSS**. Delivers live Premier League and Champions League scores, fixtures, standings, betting odds, team pages and match details.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/football-live-hub)

---

## ✨ Features

- 🔴 **Live scores** — auto-refreshing ticker and match cards every 60 seconds
- 📅 **Fixtures** — browse by date and competition, UK timezone kick-offs
- 📊 **Standings** — full Premier League and Champions League tables with form
- 🎯 **Match detail** — lineups (SVG pitch), events timeline, stats, H2H, odds
- 💰 **Odds comparison** — best UK bookmaker odds (bet365, William Hill, etc.)
- 👥 **Team pages** — squad, manager, form, injuries, upcoming fixtures
- ⭐ **Favourites** — save teams locally with Zustand + localStorage
- 🔍 **Search** — ⌘K search modal for teams
- 📱 **Mobile-first** — fully responsive dark dashboard
- 🚀 **Vercel-ready** — ISR, server components, optimised caching

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (client) + React Query |
| Data fetching | Server Components + API Routes |
| APIs | API-Football v3, The Odds API v4 |
| Fonts | Syne (display) + Inter (body) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
football-live-hub/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Homepage
│   ├── premier-league/page.tsx      # PL table, scorers, fixtures
│   ├── champions-league/page.tsx    # UCL groups/league phase
│   ├── fixtures/                    # Date & league filter
│   ├── odds/page.tsx                # Bookmaker odds comparison
│   ├── teams/                       # Teams listing + detail pages
│   ├── match/[id]/                  # Match detail with tabs
│   └── api/                         # API route handlers
│       ├── football/live/
│       ├── football/fixtures/
│       ├── football/standings/
│       ├── football/teams/
│       ├── football/match/[id]/
│       ├── football/top-scorers/
│       ├── football/search/
│       └── odds/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               # Sticky nav + search modal
│   │   ├── LiveScoreTicker.tsx      # Scrolling live scores
│   │   └── Footer.tsx
│   ├── match/
│   │   ├── FixtureCard.tsx          # Match card component
│   │   ├── LeagueTable.tsx          # Standings table
│   │   └── MatchLineup.tsx          # SVG pitch + squad lists
│   ├── odds/
│   │   └── OddsCard.tsx             # Bookmaker odds card
│   ├── teams/
│   │   └── TeamCard.tsx             # Team card with favourites
│   └── ui/
│       └── index.tsx                # Shared UI primitives
├── services/
│   ├── footballApi.ts               # API-Football v3 (20+ endpoints)
│   └── oddsApi.ts                   # The Odds API v4
├── hooks/
│   └── useFootball.ts               # React Query hooks
├── lib/
│   ├── utils.ts                     # Utility functions
│   ├── store.ts                     # Zustand stores
│   └── providers.tsx                # React Query provider
└── types/
    └── index.ts                     # TypeScript types
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/football-live-hub.git
cd football-live-hub
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# API-Football — https://www.api-football.com/
NEXT_PUBLIC_API_FOOTBALL_KEY=your_key_here

# The Odds API — https://the-odds-api.com/
ODDS_API_KEY=your_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys

### API-Football
1. Sign up at [api-football.com](https://www.api-football.com/)
2. Free tier: **100 requests/day** (sufficient for development)
3. Pro plans available for production traffic
4. Your key goes in `NEXT_PUBLIC_API_FOOTBALL_KEY`

### The Odds API
1. Sign up at [the-odds-api.com](https://the-odds-api.com/)
2. Free tier: **500 requests/month**
3. Each call returns odds for all upcoming matches
4. Your key goes in `ODDS_API_KEY`

---

## 🌐 Deployment (Vercel)

### Option 1 — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option 2 — Vercel Dashboard

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_API_FOOTBALL_KEY`
   - `ODDS_API_KEY`
5. Deploy!

### Region

The `vercel.json` sets `"regions": ["lhr1"]` (London) for lowest latency to UK bookmaker APIs.

---

## ⚙️ Caching Strategy

| Data | Revalidation | Strategy |
|---|---|---|
| Live scores | 0s (no cache) | `force-dynamic` |
| Fixtures | 120s | ISR |
| Standings | 300s | ISR |
| Team data | 600s | ISR |
| Odds | 120s | ISR |
| Top scorers | 600s | ISR |

Client-side polling (React Query `refetchInterval`):
- Live match data: every **60 seconds**
- Odds: every **5 minutes**

---

## 🎨 Design System

### Colour Palette

| Name | Value | Usage |
|---|---|---|
| `pitch-950` | `#050a0e` | Page background |
| `pitch-800` | `#0f2040` | Card background |
| `grass-400` | `#00e676` | Live badges, accents |
| `grass-500` | `#00c853` | Buttons, CTAs |
| `amber-400` | `#ffb300` | Favourites, warnings |
| `red-500` | `#e53935` | Live ticker, cards |

### Typography

- **Display**: Syne — headings, team names, scores
- **Body**: Inter — paragraphs, labels, stats

---

## 🔧 Customisation

### Adding More Leagues

In `services/footballApi.ts`, add to `LEAGUE_IDS`:

```ts
export const LEAGUE_IDS = {
  // ...existing
  LALIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
};
```

Then add to the competition filter in `app/fixtures/FixturesContent.tsx`.

### Changing Bookmakers

In `services/oddsApi.ts`, edit `UK_BOOKMAKERS`:

```ts
export const UK_BOOKMAKERS = [
  "bet365", "williamhill", "betfair", ...
];
```

---

## 📄 Licence

MIT — free to use, modify and deploy.

---

## ⚠️ Disclaimer

Betting odds are displayed for **informational purposes only**. Football Live Hub does not accept bets or promote gambling. Users must be **18+** and gamble responsibly. Visit [BeGambleAware.org](https://www.begambleaware.org) for support.
