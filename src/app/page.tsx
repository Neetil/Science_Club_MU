export default function Page() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent p-8 sm:p-12">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Medicaps University</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Physics & Astronomy Club
          </h1>
          <p className="mt-4 max-w-prose text-zinc-300">
            Exploring the cosmos through curiosity, experiments, and collaboration. Join us for talks, night sky observations, competitions, and research projects.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#updates" className="rounded-md bg-cyan-500/20 px-4 py-2 text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30 transition-colors">See Updates</a>
            <a href="/events" className="rounded-md bg-white/5 px-4 py-2 text-white ring-1 ring-white/10 hover:bg-white/10 transition-colors">Upcoming Events</a>
          </div>
        </div>
        {/* Animated particles (CSS-based waves) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(60%_40%_at_50%_120%,rgba(0,255,255,0.35),transparent)]" />
        </div>
      </section>

      {/* Updates Panel */}
      <section id="updates" className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white">Latest Updates</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4].map((i) => (
              <li key={i} className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-400/40 transition-colors">
                <p className="text-xs text-zinc-400">Update • {new Date().toLocaleDateString()}</p>
                <p className="mt-2 font-medium text-zinc-100">Sample announcement {i}</p>
                <p className="text-sm text-zinc-400">We'll publish real updates here. Stay tuned for stargazing nights, workshops, and competitions.</p>
                <span className="mt-3 inline-flex text-xs text-cyan-300 group-hover:text-cyan-200">Read more →</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-base font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li><a href="/about" className="hover:text-white">About the Club</a></li>
            <li><a href="/events" className="hover:text-white">Events</a></li>
            <li><a href="/gallery" className="hover:text-white">Gallery</a></li>
            <li><a href="/team" className="hover:text-white">Team</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </aside>
      </section>
    </div>
  )
}
