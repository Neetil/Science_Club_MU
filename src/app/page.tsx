"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Page() {
  const [expandedPanel, setExpandedPanel] = useState<number | null>(null);

  const SpaceTalkFullDescription = `Let's travel back 13.8 billion years into the moment everything began!

The Physics & Astronomy Club presents Space Talk 2.0, an electrifying deep dive into the birth of the universe - the Big Bang, cosmic explosions, the rise of galaxies, and the mysteries that still leave scientists stunned.

If you’ve ever wondered “Where did it all come from?” or “What happened before time existed?” - this is your moment.

📍 Minor Auditorium, F Block
🕒 2:00 PM – 5:00 PM
🗓  30 October 2025`;

  const BloodGoneBadFullDescription = `Blood Gone Bad 2.0 is an exciting campus-wide treasure hunt where participants follow a trail of creative clues hidden across different locations in the college. Each clue unlocks the next location. 

The final clue leads to a special antidote, marking the completion of the challenge.

📍 Whole Campus 
🕒 12:00 PM – 2:00 PM
📅  15 October 2025`;

  const OrientationCeremonyFullDescription = `This Orientation Ceremony is created to help you explore the club’s environment, meet the team behind it, and understand the roles you can take up. We share how each member contributes, what we expect from new students, and how joining us can add value to your academic and personal growth.

📍 Minor Auditorium, F Block
🕒 12:00 PM – 2:00 PM
📅  10 October 2025`;

  const ISROExhibitionFullDescription = `The Physics & Astronomy Club is organizing an exciting visit to the ISRO Exhibition, where students will explore real satellite models, rocket designs, mission demos, and cutting-edge space technology created by India’s top scientists.
  
  This trip offers a rare chance to learn how space missions are planned, how satellites work, and how ISRO continues to push boundaries with innovation. From interactive displays to inspiring research setups, the exhibition will spark curiosity and expand your understanding of space science like never before.

📍 Symbiosis University
🕒 10:00 AM – 3:00 PM
📅 23rd August 2025`;

  const updates = [
    {
      id: 1,
      date: "28/10/25",
      title: "Space Talk 2.0 ",
      shortDescription: "Space Talk 2.0 is happening on 30/10/25. If you’ve ever wondered “Where did it all come from?” this is your moment.",
      fullDescription: SpaceTalkFullDescription,
    },
    {
      id: 2,
      date: "11/10/25",
      title: "Blood Gone Bad 2.0",
      shortDescription: "Get ready for Blood Gone Bad 2.0 on 15/10/25. Uncover every hint, clues are all around the campus and secure the antidote that can save you.",
      fullDescription: BloodGoneBadFullDescription,
    },
    {
      id: 3,
      date: "08/10/25",
      title: "Orientation Ceremony",
      shortDescription: "A warm welcome to our new members as we introduce the club, our goals, and the exciting year ahead.",
      fullDescription: OrientationCeremonyFullDescription,
    },
    {
      id: 4,
      date: "20/08/25",
      title: "ISRO Exhibition",
      shortDescription: "We’re visiting the ISRO Exhibition at Symbiosis University on 23rd August - a chance to explore space tech.",
      fullDescription: ISROExhibitionFullDescription,
    },
  ];

  const expandedUpdate =
    expandedPanel !== null ? updates.find((u) => u.id === expandedPanel) ?? null : null;

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
            Exploring the cosmos through curiosity, discussions, experiments, collaboration and teamwork. Join us for expert talks, night sky observations, competitions, and hands-on research projects.
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
      <section id="updates" className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Latest Updates</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <ul className="col-span-2 grid gap-4 sm:grid-cols-2">
            {updates.map((update) => (
              <li
                key={update.id}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-400/40 transition-colors"
              >
                <p className="text-xs text-zinc-400">Update • {update.date}</p>
                <p className="mt-2 font-medium text-zinc-100">{update.title}</p>
                <p className="text-sm text-zinc-400">{update.shortDescription}</p>
                <button
                  onClick={() => setExpandedPanel(update.id)}
                  className="mt-3 inline-flex text-xs text-cyan-300 group-hover:text-cyan-200 transition-colors"
                >
                  Read more →
                </button>
              </li>
            ))}
          </ul>
          <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-base font-semibold text-white mb-4 text-center">Club Statistics</h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Events conducted</p>
              <p className="text-2xl font-bold text-cyan-300">10+</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Active members</p>
              <p className="text-2xl font-bold text-cyan-300">60+</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Outreach trips</p>
              <p className="text-2xl font-bold text-cyan-300">5+</p>
            </div>
          </div>
        </aside>
        </div>
      </section>

      {/* Expanded update modal with subtle spring animation */}
      <AnimatePresence>
        {expandedUpdate && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setExpandedPanel(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="relative w-full max-w-xl max-h-[65vh] overflow-y-auto rounded-2xl border border-cyan-400/60 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-900/50"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
            >
              <button
                onClick={() => setExpandedPanel(null)}
                className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-400">Update • {expandedUpdate.date}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{expandedUpdate.title}</h3>
                </div>
                <p className="text-base leading-relaxed text-zinc-300 whitespace-pre-line">
                  {expandedUpdate.fullDescription}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
