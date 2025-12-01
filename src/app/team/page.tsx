const execTeam = [
  {
    name: "Ayushi Sharma",
    role: "Club Captain",
    focus: "Guides the club vision, strategic planning, and operational excellence",
  },
  {
    name: "Akshata Gangrade",
    role: "Vice Captain",
    focus: "Oversees member involvement, and helps run major events",
  },
  {
    name: "Neetil Sahu",
    role: "Treasurer",
    focus: "Supervises budgeting, sponsorship, and resource planning",
  },
  {
    name: "Ami Jindal",
    role: "Secretary",
    focus: "Manages communication, documentation, and daily operations",
  },
];

const coordinators = [
  {
    name: "Prerna Dixit",
    role: "Astronomy Lead",
    focus: "Designs observation nights and telescope training",
  },
  {
    name: "Ayush Parmar",
    role: "Media Lead",
    focus: "Captures launches, edits reels, and runs socials",
  },
  {
    name: "Raksha Shah",
    role: "Marketing Lead",
    focus: "Plans campaigns, collaborations, and event buzz",
  },
  {
    name: "Tarang Choure",
    role: "Management Lead",
    focus: "Coordinates logistics, registrations, and timelines",
  },
  {
    name: "Tasneem Dewaswala",
    role: "Graphics Lead",
    focus: "Crafts visuals, posters, and brand systems",
  },
  {
    name: "Kaya Kushwaha",
    role: "Content Lead",
    focus: "Leads all writing, announcements, and knowledge content",
  },
];

const mentors = [
  {
    name: "Prof. Malyaj Das",
    role: "Faculty Mentor",
    focus: "Club-Incharge",
  },
  {
    name: "Prof. Priya Singh",
    role: "Faculty Mentor",
    focus: "Student Co-ordinator",
  },
];

export default function TeamPage() {
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
        <Grid cards={mentors} accent="from-indigo-400/20 to-blue-900/15" />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Command</p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        </div>
        <Grid cards={execTeam} accent="from-blue-400/20 to-indigo-900/15" />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Mission Control</p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
        </div>
        <Grid cards={coordinators} accent="from-indigo-400/20 to-blue-800/15" />
      </section>
    </div>
  );
}

type Card = {
  name: string;
  role: string;
  focus: string;
};

function Grid({ cards, accent }: { cards: Card[]; accent: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((person) => (
        <article
          key={person.name}
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

