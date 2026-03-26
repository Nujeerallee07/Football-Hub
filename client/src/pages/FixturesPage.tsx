import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react";
import { useFixtures } from "@/hooks/useFootball";
import { FixtureCard } from "@/components/match/FixtureCard";
import { LoadingSpinner, ErrorState, EmptyState, Badge } from "@/components/ui";

const COMPETITION_OPTIONS = [
  { id: null, label: "All Leagues" },
  { id: 39, label: "Premier League" },
  { id: 2, label: "Champions League" },
  { id: 45, label: "FA Cup" },
  { id: 48, label: "EFL Cup" },
  { id: 3, label: "Europa League" },
];

export function FixturesPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);

  const { data: fixtures, isLoading, isError, refetch } = useFixtures({ date: selectedDate, leagueId: selectedLeague ?? undefined });

  const handlePrevDay = () => setSelectedDate((d) => format(subDays(new Date(d + "T12:00:00"), 1), "yyyy-MM-dd"));
  const handleNextDay = () => setSelectedDate((d) => format(addDays(new Date(d + "T12:00:00"), 1), "yyyy-MM-dd"));
  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const dateLabel = isToday ? "Today" : format(new Date(selectedDate + "T12:00:00"), "EEEE, d MMMM yyyy");

  return (
    <div className="page-container">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Fixtures</h1>
      <p className="text-neutral-400 mb-8">All upcoming matches — kick-off times in UK time (BST/GMT)</p>

      <div className="space-y-6">
        {/* Date Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-pitch-800 border border-neutral-700/50 rounded-xl p-1">
            <button onClick={handlePrevDay} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-pitch-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-grass-400" />
              <span className="text-white font-medium text-sm min-w-40 text-center">{dateLabel}</span>
            </div>
            <button onClick={handleNextDay} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-pitch-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 bg-pitch-800 border border-neutral-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-grass-500/50" />
          {!isToday && <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])} className="px-3 py-2 bg-pitch-700 hover:bg-pitch-600 text-white text-sm rounded-xl transition-colors">Today</button>}
        </div>

        {/* Competition Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-neutral-500" />
          {COMPETITION_OPTIONS.map((opt) => (
            <button key={opt.id ?? "all"} onClick={() => setSelectedLeague(opt.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLeague === opt.id ? "bg-grass-500/20 text-grass-400 border border-grass-500/30" : "bg-pitch-800 text-neutral-400 hover:text-white border border-neutral-700/30"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {!isLoading && fixtures && <p className="text-neutral-500 text-sm">{fixtures.length} match{fixtures.length !== 1 ? "es" : ""} found</p>}

        {isLoading && <LoadingSpinner />}
        {isError && <ErrorState message="Failed to load fixtures." onRetry={() => refetch()} />}
        {!isLoading && !isError && fixtures && fixtures.length === 0 && (
          <EmptyState title="No fixtures found" description={`No matches scheduled for ${dateLabel}${selectedLeague ? " in this competition" : ""}.`} icon={<Calendar className="w-12 h-12" />} />
        )}
        {!isLoading && fixtures && fixtures.length > 0 && <FixturesByLeague fixtures={fixtures} />}
      </div>
    </div>
  );
}

function FixturesByLeague({ fixtures }: { fixtures: any[] }) {
  const grouped = fixtures.reduce((acc: any, match: any) => {
    const key = match.league.id;
    if (!acc[key]) acc[key] = { league: match.league, matches: [] };
    acc[key].matches.push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.values(grouped).map(({ league, matches }: any) => (
        <div key={league.id}>
          <div className="flex items-center gap-2.5 mb-3">
            {league.logo && <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />}
            <span className="text-white font-semibold text-sm">{league.name}</span>
            <span className="text-neutral-500 text-xs">{league.country}</span>
            <Badge variant="default">{matches.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matches.map((match: any) => <FixtureCard key={match.fixture.id} match={match} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
