// app/teams/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getTeamById,
  getTeamSquad,
  getTeamCoach,
  getTeamFixtures,
  getTeamInjuries,
  getStandings,
  LEAGUE_IDS,
  CURRENT_SEASON,
} from "@/services/footballApi";
import { FixtureCard } from "@/components/match/FixtureCard";
import { SectionHeader, Badge, StatBar } from "@/components/ui";
import { FavouriteButton } from "./FavouriteButton";
import {
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import {
  cn,
  parseForm,
  getFormColor,
  getPositionColor,
  getPositionLabel,
} from "@/lib/utils";
import type { Player } from "@/types";

interface TeamPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const teamData = await getTeamById(Number(params.id));
  if (!teamData) return { title: "Team Not Found" };
  return {
    title: `${teamData.team.name} – Squad, Fixtures & Stats`,
    description: `${teamData.team.name} squad, manager, recent form, upcoming fixtures and injuries. Official club information.`,
    openGraph: {
      images: [teamData.team.logo],
    },
  };
}

export const revalidate = 300;

export default async function TeamPage({ params }: TeamPageProps) {
  const teamId = Number(params.id);
  if (isNaN(teamId)) notFound();

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
  if (!teamData) notFound();

  const squad = squadRes.status === "fulfilled" ? squadRes.value : [];
  const coach = coachRes.status === "fulfilled" ? coachRes.value : null;
  const recent = recentRes.status === "fulfilled" ? recentRes.value : [];
  const upcoming = upcomingRes.status === "fulfilled" ? upcomingRes.value : [];
  const injuries = injuriesRes.status === "fulfilled" ? injuriesRes.value : [];

  const { team, venue } = teamData;

  // Group squad by position
  const goalkeepers = squad.filter((p) => p.pos === "G");
  const defenders = squad.filter((p) => p.pos === "D");
  const midfielders = squad.filter((p) => p.pos === "M");
  const forwards = squad.filter((p) => p.pos === "F");
  const unknown = squad.filter((p) => !["G","D","M","F"].includes(p.pos ?? ""));

  // Compute form from recent results
  const formString = recent
    .map((m) => {
      const isHome = m.teams.home.id === teamId;
      const homeGoals = m.goals.home ?? 0;
      const awayGoals = m.goals.away ?? 0;
      if (isHome) {
        return homeGoals > awayGoals ? "W" : homeGoals < awayGoals ? "L" : "D";
      } else {
        return awayGoals > homeGoals ? "W" : awayGoals < homeGoals ? "L" : "D";
      }
    })
    .join("");

  const injuredIds = new Set(injuries.map((i) => i.player.id));

  return (
    <div className="page-container space-y-10">
      {/* Team Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-card-gradient border border-neutral-700/30 p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-pitch-700/30 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="w-24 h-24 relative flex-shrink-0">
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              {team.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {team.country && (
                <span className="text-neutral-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {team.country}
                </span>
              )}
              {team.founded && (
                <span className="text-neutral-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Est. {team.founded}
                </span>
              )}
              {venue && (
                <span className="text-neutral-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {venue.name}, {venue.city}
                </span>
              )}
            </div>

            {/* Coach */}
            {coach && (
              <div className="flex items-center gap-2 mt-3">
                {coach.photo && (
                  <div className="w-7 h-7 rounded-full overflow-hidden relative">
                    <Image
                      src={coach.photo}
                      alt={coach.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-neutral-300 text-sm">
                  Manager:{" "}
                  <span className="text-white font-medium">{coach.name}</span>
                </span>
                {coach.nationality && (
                  <Badge variant="default">{coach.nationality}</Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 items-end">
            <FavouriteButton
              teamId={team.id}
              teamName={team.name}
              teamLogo={team.logo}
            />
            {team.website && (
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pitch-700 hover:bg-pitch-600 border border-neutral-600 text-white text-sm rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Official Website
              </a>
            )}
          </div>
        </div>

        {/* Recent Form */}
        {formString && (
          <div className="relative z-10 mt-6 pt-5 border-t border-neutral-700/30">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-sm">Recent form:</span>
              <div className="flex gap-1.5">
                {parseForm(formString).map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center text-pitch-950",
                      getFormColor(r)
                    )}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Venue Info */}
      {venue && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Stadium" value={venue.name} />
          <StatCard label="City" value={venue.city} />
          {venue.capacity && (
            <StatCard
              label="Capacity"
              value={venue.capacity.toLocaleString("en-GB")}
            />
          )}
          <StatCard label="Surface" value={venue.surface ?? "Grass"} />
        </div>
      )}

      {/* Injuries */}
      {injuries.length > 0 && (
        <section>
          <SectionHeader
            title="Injury News"
            subtitle={`${injuries.length} player${injuries.length !== 1 ? "s" : ""} unavailable`}
            action={
              <Badge variant="warning">
                <AlertTriangle className="w-3 h-3" />
                {injuries.length} injured
              </Badge>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {injuries.slice(0, 9).map((inj) => (
              <div
                key={`${inj.player.id}-${inj.fixture.id}`}
                className="flex items-center gap-3 p-3 bg-pitch-800 border border-red-500/20 rounded-xl"
              >
                {inj.player.photo && (
                  <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={inj.player.photo}
                      alt={inj.player.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {inj.player.name}
                  </p>
                  <p className="text-red-400 text-xs">{inj.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Squad */}
      <section>
        <SectionHeader
          title="Squad"
          subtitle={`${squad.length} players`}
          action={
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className={cn("w-3 h-3 rounded-sm", getPositionColor("G"))} /> GK
              <span className={cn("w-3 h-3 rounded-sm ml-2", getPositionColor("D"))} /> DEF
              <span className={cn("w-3 h-3 rounded-sm ml-2", getPositionColor("M"))} /> MID
              <span className={cn("w-3 h-3 rounded-sm ml-2", getPositionColor("F"))} /> FWD
            </div>
          }
        />
        <div className="space-y-6">
          {[
            { label: "Goalkeepers", players: goalkeepers },
            { label: "Defenders", players: defenders },
            { label: "Midfielders", players: midfielders },
            { label: "Forwards", players: forwards },
            ...(unknown.length > 0 ? [{ label: "Other", players: unknown }] : []),
          ].map(({ label, players }) =>
            players.length > 0 ? (
              <PositionSection
                key={label}
                label={label}
                players={players}
                injuredIds={injuredIds}
              />
            ) : null
          )}
        </div>
      </section>

      {/* Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Recent Results" />
          <div className="space-y-3">
            {recent.length > 0 ? (
              recent.map((m) => (
                <FixtureCard key={m.fixture.id} match={m} compact showLeague />
              ))
            ) : (
              <p className="text-neutral-500 text-sm">No recent results.</p>
            )}
          </div>
        </section>
        <section>
          <SectionHeader title="Upcoming Fixtures" />
          <div className="space-y-3">
            {upcoming.length > 0 ? (
              upcoming.map((m) => (
                <FixtureCard key={m.fixture.id} match={m} compact showLeague />
              ))
            ) : (
              <p className="text-neutral-500 text-sm">No upcoming fixtures.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-pitch-800 border border-neutral-700/50 rounded-xl p-4">
      <p className="text-neutral-500 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

function PositionSection({
  label,
  players,
  injuredIds,
}: {
  label: string;
  players: Player[];
  injuredIds: Set<number>;
}) {
  return (
    <div>
      <h3 className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
        {label}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            injured={injuredIds.has(player.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  injured,
}: {
  player: Player;
  injured: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors",
        injured
          ? "bg-red-500/5 border-red-500/20"
          : "bg-pitch-800/60 border-neutral-700/30 hover:border-neutral-600"
      )}
    >
      {player.photo ? (
        <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0">
          <Image
            src={player.photo}
            alt={player.name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=32&background=1e2d3d&color=8ba5bd`;
            }}
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center flex-shrink-0">
          <span className="text-neutral-400 text-xs font-bold">
            {player.name[0]}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white text-xs font-medium truncate">
            {player.name}
          </span>
          {injured && (
            <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
          )}
        </div>
        {player.number && (
          <span className="text-neutral-500 text-xs">#{player.number}</span>
        )}
      </div>
      {player.pos && (
        <span
          className={cn(
            "text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0",
            getPositionColor(player.pos)
          )}
        >
          {player.pos}
        </span>
      )}
    </div>
  );
}
