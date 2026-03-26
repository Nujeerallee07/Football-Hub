import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { LiveScoreTicker } from "@/components/layout/LiveScoreTicker";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { FixturesPage } from "@/pages/FixturesPage";
import { PremierLeaguePage } from "@/pages/PremierLeaguePage";
import { ChampionsLeaguePage } from "@/pages/ChampionsLeaguePage";
import { MatchDetailPage } from "@/pages/MatchDetailPage";
import { OddsPage } from "@/pages/OddsPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { TeamDetailPage } from "@/pages/TeamDetailPage";

export default function App() {
  return (
    <div className="bg-pitch-950 font-body antialiased min-h-screen">
      <Navbar />
      <LiveScoreTicker />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/premier-league" element={<PremierLeaguePage />} />
          <Route path="/champions-league" element={<ChampionsLeaguePage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />
          <Route path="/odds" element={<OddsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
