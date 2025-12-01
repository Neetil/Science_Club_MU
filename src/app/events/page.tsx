"use client";

import { useState } from "react";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-16">
      {/* Hero Section - Advanced */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-950/40 via-teal-950/30 to-cyan-950/40" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-orb" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse-orb" style={{ animationDelay: "2s" }} />
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-400/20 animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-2 text-xs uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Upcoming Events
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200">
            Events
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-300 max-w-2xl mx-auto">
            Discover, learn, and connect through our exciting lineup of scientific events
          </p>
        </div>
      </section>

      {/* Placeholder Message */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-teal-950/20 to-cyan-950/30 backdrop-blur-sm p-12 sm:p-16 text-center">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Exciting Events Coming Soon
              </h2>

              {/* Description */}
              <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                We're currently preparing an incredible lineup of workshops, lectures, observations, and competitions. 
                Stay tuned for announcements about our upcoming events that will inspire, educate, and bring our community together.
              </p>

              {/* Decorative Line */}
              <div className="flex justify-center pt-4">
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              </div>

              {/* Call to Action */}
              <div className="pt-6">
                <p className="text-sm text-zinc-400">
                  Follow us on social media or check back soon for the latest updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-2 text-xs uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Past Events
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Our Journey So Far
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Relive the memorable moments from our past events that brought our community together
            </p>
          </div>

          {/* Search and Filters - Advanced */}
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Space Talk 2.0",
                description: "An electrifying deep dive into the birth of the universe - the Big Bang, cosmic explosions, and the mysteries of our cosmos.",
                category: "Lecture",
              },
              {
                title: "Blood Gone Bad 2.0",
                description: "An exciting campus-wide treasure hunt where participants followed creative clues hidden across different locations.",
                category: "Competition",
              },
              {
                title: "Astronomy Night",
                description: "A mesmerizing stargazing session where members explored the night sky, identified constellations, and observed celestial wonders.",
                category: "Observation",
              },
              {
                title: "Outreach to Ujjain",
                description: "An educational outreach program where we shared scientific knowledge and inspired students in Ujjain.",
                category: "Outreach",
              },
              {
                title: "Outreach to ISRO Exhibition",
                description: "A visit to the ISRO Exhibition where students explored real satellite models, rocket designs, and cutting-edge space technology.",
                category: "Outreach",
              },
              {
                title: "Outreach to IIT",
                description: "An inspiring visit to IIT where members learned about advanced research and innovation in physics and astronomy.",
                category: "Outreach",
              },
              {
                title: "Space Talk",
                description: "An engaging lecture series exploring fundamental concepts in physics and astronomy, featuring expert speakers and interactive discussions.",
                category: "Lecture",
              },
              {
                title: "Blood Gone Bad",
                description: "The first edition of our thrilling treasure hunt event that challenged participants to solve puzzles and navigate through campus clues.",
                category: "Competition",
              },
              {
                title: "Tambola - Tales of Science",
                description: "A fun-filled science-themed tambola event that combined entertainment with learning about scientific concepts and discoveries.",
                category: "Fun Event",
              },
              {
                title: "Mini Project Exhibition",
                description: "A comprehensive showcase of scientific projects, experiments, and innovations created by students, featuring interactive displays and demonstrations.",
                category: "Exhibition",
              },
              {
                title: "Workshop on Innovative Solution",
                description: "An interactive workshop focused on developing creative solutions to real-world problems through scientific thinking and innovative approaches.",
                category: "Workshop",
              },
            ]
            .filter((event) => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return (
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                event.category.toLowerCase().includes(query)
              );
            })
            .map((event, index) => (
              <div
                key={event.title}
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-teal-950/10 p-6 transition-all hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 mb-2">
                        {event.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

