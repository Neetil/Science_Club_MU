"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Update {
  id: string;
  date: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
}

interface Statistics {
  eventsConducted: number;
  activeMembers: number;
  outreachTrips: number;
}

export default function Page() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    eventsConducted: 0,
    activeMembers: 0,
    outreachTrips: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [updatesRes, statsRes] = await Promise.all([
        fetch("/api/updates"),
        fetch("/api/statistics"),
      ]);

      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        setUpdates(updatesData.slice(0, 4)); // Show latest 4 updates
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const expandedUpdate =
    expandedPanel !== null ? updates.find((u) => u.id === expandedPanel) ?? null : null;

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 sm:p-8 md:p-12">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Medicaps University</p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Physics & Astronomy Club
          </h1>
          <p className="mt-4 text-sm sm:text-base max-w-prose text-zinc-300">
            Exploring the cosmos through curiosity, discussions, experiments, collaboration and teamwork. Join us for expert talks, night sky observations, competitions, and hands-on research projects.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#updates" className="rounded-md bg-cyan-500/20 px-4 py-2 text-sm sm:text-base text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30 active:bg-cyan-500/40 transition-colors">See Updates</a>
            <a href="/events" className="rounded-md bg-white/5 px-4 py-2 text-sm sm:text-base text-white ring-1 ring-white/10 hover:bg-white/10 active:bg-white/15 transition-colors">Upcoming Events</a>
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
      <section id="updates" className="space-y-4 scroll-mt-20">
        <h2 className="text-lg sm:text-xl font-semibold text-white px-1">Latest Updates</h2>
        <div className="flex flex-col md:flex-row md:items-stretch gap-6">
          <ul className="flex flex-col md:flex-[2] md:grid md:grid-cols-2 gap-4">
            {loading ? (
              <li className="col-span-2 text-center text-zinc-400 py-8">Loading updates...</li>
            ) : updates.length === 0 ? (
              <li className="col-span-2 text-center text-zinc-400 py-8">No updates available</li>
            ) : (
              updates.map((update) => (
              <li
                key={update.id}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-400/40 active:border-cyan-400/50 transition-colors"
              >
                <p className="text-xs text-zinc-400">Update • {update.date}</p>
                <p className="mt-2 text-base sm:text-lg font-medium text-zinc-100">{update.title}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{update.shortDescription}</p>
                <button
                  onClick={() => setExpandedPanel(update.id)}
                  className="mt-3 inline-flex text-xs text-cyan-300 group-hover:text-cyan-200 active:text-cyan-100 transition-colors touch-manipulation"
                >
                  Read more →
                </button>
              </li>
              ))
            )}
          </ul>
          <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:w-80 md:flex md:flex-col">
            <h3 className="text-base font-semibold text-white mb-4 text-center">Club Statistics</h3>
          <div className="space-y-4 md:flex-1 md:flex md:flex-col md:justify-between">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Events conducted</p>
              <p className="text-2xl font-bold text-cyan-300">
                {loading ? "..." : `${statistics.eventsConducted}+`}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Active members</p>
              <p className="text-2xl font-bold text-cyan-300">
                {loading ? "..." : `${statistics.activeMembers}+`}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-zinc-400 mb-1">Outreach trips</p>
              <p className="text-2xl font-bold text-cyan-300">
                {loading ? "..." : `${statistics.outreachTrips}+`}
              </p>
            </div>
          </div>
        </aside>
        </div>
      </section>

      {/* Expanded update modal with subtle spring animation */}
      <AnimatePresence>
        {expandedUpdate && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-4 sm:py-8"
            onClick={() => setExpandedPanel(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[65vh] overflow-y-auto rounded-2xl border border-cyan-400/60 bg-slate-950/95 p-4 sm:p-6 shadow-2xl shadow-cyan-900/50"
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
                className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 hover:bg-white/10 active:bg-white/15 hover:text-white transition-colors touch-manipulation"
                aria-label="Close"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-4 pr-2">
                <div>
                  <p className="text-xs text-zinc-400">Update • {expandedUpdate.date}</p>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-white">{expandedUpdate.title}</h3>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-zinc-300 whitespace-pre-line">
                  {expandedUpdate?.fullDescription || expandedUpdate?.shortDescription}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
