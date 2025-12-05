"use client";

import { useState, useEffect } from "react";
import { TeamCardSkeleton } from "@/components/Skeleton";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  category: "executive" | "coordinator" | "mentor";
  image?: string;
  order: number;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setLoading(false);
    }
  };

  const mentors = teamMembers.filter((m) => m.category === "mentor");
  const execTeam = teamMembers.filter((m) => m.category === "executive");
  const coordinators = teamMembers.filter((m) => m.category === "coordinator");

  if (loading) {
    return (
      <div className="space-y-16">
        <header className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 via-blue-900/15 to-indigo-800/10 p-10 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Meet the Crew</p>
          <h1 className="mt-3 text-4xl font-black text-white">Team & Mentors</h1>
          <p className="mt-4 max-w-3xl text-lg text-zinc-300">
            A multidisciplinary crew of observers, makers, researchers, and storytellers that keep the Physics &
            Astronomy Club in perpetual orbit. Every initiative from sky watches to research, guided by
            this team.
          </p>
        </header>
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
            <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Mentors</p>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
            <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Command</p>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
            <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Mission Control</p>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <header className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 via-blue-900/15 to-indigo-800/10 p-10 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Meet the Crew</p>
        <h1 className="mt-3 text-4xl font-black text-white">Team & Mentors</h1>
        <p className="mt-4 max-w-3xl text-lg text-zinc-300">
          A multidisciplinary crew of observers, makers, researchers, and storytellers that keep the Physics &
          Astronomy Club in perpetual orbit. Every initiative from sky watches to research, guided by
          this team.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Mentors</p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        </div>
        {mentors.length > 0 ? (
        <Grid cards={mentors} accent="from-indigo-400/20 to-blue-900/15" />
        ) : (
          <p className="text-center text-zinc-400 py-8">No mentors available</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Command</p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        </div>
        {execTeam.length > 0 ? (
        <Grid cards={execTeam} accent="from-blue-400/20 to-indigo-900/15" />
        ) : (
          <p className="text-center text-zinc-400 py-8">No command team members available</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Mission Control</p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
        </div>
        {coordinators.length > 0 ? (
        <Grid cards={coordinators} accent="from-indigo-400/20 to-blue-800/15" />
        ) : (
          <p className="text-center text-zinc-400 py-8">No mission control members available</p>
        )}
      </section>
    </div>
  );
}

type Card = {
  name: string;
  role: string;
  focus: string;
  id?: string;
};

function Grid({ cards, accent }: { cards: Card[]; accent: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((person) => (
        <article
          key={person.id || person.name}
          className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 p-6 transition hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-900/20"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 bg-gradient-to-br ${accent}`}
          />
          <div className="relative space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">{person.role}</p>
            <h3 className="text-xl font-semibold text-white">{person.name}</h3>
            <p className="text-sm text-zinc-300">{person.focus}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

