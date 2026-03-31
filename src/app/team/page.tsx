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

const linkedInByName: Record<string, string> = {
  
  "Neetil Sahu": "https://www.linkedin.com/in/neetilsahu/",
  "Akshata Gangrade": "https://www.linkedin.com/in/akshata-gangrade-5808a2318/",
  "Ayushi Sharma": "https://www.linkedin.com/in/ayushi-sharma-528876294/",
  "Ami Jindal": "https://www.linkedin.com/in/ami-jindal-229678323/",
  "Prof. Malyaj Das": "https://www.linkedin.com/in/dr-malyaj-das-05654453/",
  "Prerna Dixit": "https://www.linkedin.com/in/prerna-dixit-5860a7354/",
  "Ayush Parmar": "https://www.linkedin.com/in/ayush-parmar-161227266/",
  "Raksha Shah": "https://www.linkedin.com/in/raksha-shah-02b722324/",
  "Kaya Kushwaha": "https://www.linkedin.com/in/kaya-kushwah-914875289/",
  "Tarang Choure": "https://www.linkedin.com/in/tarang-choure-161ba132a/",
  "Tasneem Dewaswala": "https://www.linkedin.com/in/tasneem-dewas/"
};

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
      {cards.map((person) => {
        const linkedInUrl = linkedInByName[person.name];
        return (
        <article
          key={person.id || person.name}
          className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 p-6 transition hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-900/20"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 bg-gradient-to-br ${accent}`}
          />
          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">{person.role}</p>
                <h3 className="text-xl font-semibold text-white">{person.name}</h3>
              </div>
              {linkedInUrl && (
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${person.name} LinkedIn profile`}
                  className="rounded-md border border-cyan-400/40 bg-cyan-500/10 p-1.5 text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:text-cyan-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              )}
            </div>
            <p className="text-sm text-zinc-300">{person.focus}</p>
          </div>
        </article>
        );
      })}
    </div>
  );
}

