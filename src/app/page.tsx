"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UpdateCardSkeleton, StatisticsSkeleton } from "@/components/Skeleton";

interface Update {
  id: string;
  date: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  eventId: string | null;
  event: {
    id: string;
    title: string;
    isPaid: boolean;
    qrCodeUrl: string | null;
  } | null;
}

interface Statistics {
  eventsConducted: number;
  activeMembers: number;
  outreachTrips: number;
}

// Helper function to check cache synchronously
const getCachedData = () => {
  const CACHE_KEY = "homepage_data";
  const CACHE_DURATION = 2.5 * 60 * 1000; // 2.5 minutes in milliseconds
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // If cache is still valid (less than 5 minutes old)
      if (now - timestamp < CACHE_DURATION) {
        return {
          updates: data.updates.slice(0, 4),
          statistics: data.statistics,
          hasCache: true,
        };
      }
    }
  } catch (error) {
    console.error("Error reading cache:", error);
  }
  
  return {
    updates: [],
    statistics: {
      eventsConducted: 0,
      activeMembers: 0,
      outreachTrips: 0,
    },
    hasCache: false,
  };
};

export default function Page() {
  // Initialize with cached data if available
  const cachedData = getCachedData();
  const hasInitializedFromCache = useRef(cachedData.hasCache);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>(cachedData.updates);
  const [statistics, setStatistics] = useState<Statistics>(cachedData.statistics);
  const [loading, setLoading] = useState(!cachedData.hasCache);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    isPaid: boolean;
    qrCodeUrl: string | null;
  } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    year: "",
    transactionId: "",
    additionalNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    const CACHE_KEY = "homepage_data";
    const CACHE_DURATION = 2.5 * 60 * 1000; // 2.5 minutes in milliseconds

    // If we already initialized from cache, just refresh silently in background
    if (hasInitializedFromCache.current) {
      // Just refresh cache silently in background without affecting UI
      setTimeout(async () => {
        try {
          const [updatesRes, statsRes] = await Promise.all([
            fetch("/api/updates"),
            fetch("/api/statistics"),
          ]);

          let updatesData: Update[] = [];
          let statsData: Statistics = {
            eventsConducted: 0,
            activeMembers: 0,
            outreachTrips: 0,
          };

          if (updatesRes.ok) {
            updatesData = await updatesRes.json();
          }

          if (statsRes.ok) {
            statsData = await statsRes.json();
          }

          // Update cache and state silently
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                data: {
                  updates: updatesData,
                  statistics: statsData,
                },
                timestamp: Date.now(),
              })
            );
            if (updatesData.length > 0) {
              setUpdates(updatesData.slice(0, 4));
              setStatistics(statsData);
            }
          } catch (error) {
            console.error("Error saving cache:", error);
          }
        } catch (error) {
          console.error("Failed to refresh cache:", error);
        }
      }, 1000);
      return;
    }

    const fetchFreshData = async (cacheKey: string) => {
      try {
        const [updatesRes, statsRes] = await Promise.all([
          fetch("/api/updates"),
          fetch("/api/statistics"),
        ]);

        let updatesData: Update[] = [];
        let statsData: Statistics = {
          eventsConducted: 0,
          activeMembers: 0,
          outreachTrips: 0,
        };

        if (updatesRes.ok) {
          updatesData = await updatesRes.json();
          setUpdates(updatesData.slice(0, 4)); // Show latest 4 updates
        }

        if (statsRes.ok) {
          statsData = await statsRes.json();
          setStatistics(statsData);
        }

        // Cache the data
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: {
                updates: updatesData,
                statistics: statsData,
              },
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error saving cache:", error);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check cache first (only if we didn't already initialize from cache)
    if (!hasInitializedFromCache.current) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          
          // If cache is still valid (less than 5 minutes old)
          if (now - timestamp < CACHE_DURATION) {
            // Use cached data immediately
            setUpdates(data.updates.slice(0, 4));
            setStatistics(data.statistics);
            setLoading(false);
            
            // Fetch fresh data in background to update cache (delayed to avoid blocking)
            setTimeout(() => {
              fetchFreshData(CACHE_KEY);
            }, 100);
            return;
          }
        }
      } catch (error) {
        console.error("Error reading cache:", error);
      }

      // No valid cache, fetch normally
      await fetchFreshData(CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    // If we initialized from cache, skip fetchData entirely
    // The cache will be refreshed silently in the background by fetchData
    // But we need to call it to set up the background refresh
    // However, fetchData will detect hasInitializedFromCache and skip
    if (hasInitializedFromCache.current) {
      // Just set up background refresh, don't do anything that affects loading
      fetchData();
    } else {
      // No cache, fetch normally
      fetchData();
    }
  }, [fetchData]);

  const expandedUpdate =
    expandedPanel !== null ? updates.find((u) => u.id === expandedPanel) ?? null : null;

  const handleEventRegistration = async (event: Update["event"]) => {
    if (!event) return;
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: "",
      category: "Event",
      isPaid: event.isPaid,
      qrCodeUrl: event.qrCodeUrl,
    });
    setShowRegistrationModal(true);
    setSubmitMessage(null);
    setRegistrationForm({
      name: "",
      email: "",
      phone: "",
      studentId: "",
      year: "",
      transactionId: "",
      additionalNotes: "",
    });
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          name: registrationForm.name,
          email: registrationForm.email,
          phone: registrationForm.phone,
          studentId: registrationForm.studentId,
          year: registrationForm.year,
          transactionId: selectedEvent.isPaid ? registrationForm.transactionId : undefined,
          additionalNotes: registrationForm.additionalNotes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMessage({ type: "success", text: data.message || "Registration successful!" });
        setTimeout(() => {
          setShowRegistrationModal(false);
          setSelectedEvent(null);
        }, 2000);
      } else {
        setSubmitMessage({ type: "error", text: data.error || "Failed to register. Please try again." });
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "Something went wrong. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

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
            {loading && updates.length === 0 ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <li key={i} className={i >= 2 ? "hidden md:block" : ""}>
                    <UpdateCardSkeleton />
                  </li>
                ))}
              </>
            ) : updates.length === 0 ? (
              <li className="col-span-2 text-center text-zinc-400 py-8">No updates available</li>
            ) : (
              updates.map((update) => (
              <li
                key={update.id}
                className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-400/40 active:border-cyan-400/50 transition-colors"
              >
                <p className="text-xs text-zinc-400">Update • {update.date}</p>
                <p className="mt-2 text-base sm:text-lg font-medium text-zinc-100">{update.title}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{update.shortDescription}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedPanel(update.id)}
                    className="inline-flex text-xs text-cyan-300 group-hover:text-cyan-200 active:text-cyan-100 transition-colors touch-manipulation"
                  >
                    Read more →
                  </button>
                  {update.event && update.event.id && (
                    <button
                      onClick={() => handleEventRegistration(update.event)}
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                    >
                      Register
                    </button>
                  )}
                </div>
              </li>
              ))
            )}
          </ul>
          <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:w-80 md:flex md:flex-col">
            <h3 className="text-base font-semibold text-white mb-4 text-center">Club Statistics</h3>
          <div className="space-y-4 md:flex-1 md:flex md:flex-col md:justify-between">
            {loading && updates.length === 0 ? (
              <>
                <StatisticsSkeleton />
                <StatisticsSkeleton />
                <StatisticsSkeleton />
              </>
            ) : (
              <>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                  <p className="text-xs text-zinc-400 mb-1">Events conducted</p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {statistics.eventsConducted}+
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                  <p className="text-xs text-zinc-400 mb-1">Active members</p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {statistics.activeMembers}+
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                  <p className="text-xs text-zinc-400 mb-1">Outreach trips</p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {statistics.outreachTrips}+
                  </p>
                </div>
              </>
            )}
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
                <div className="text-sm sm:text-base leading-relaxed text-zinc-300">
  <span className="whitespace-pre-line">
    {expandedUpdate?.fullDescription || expandedUpdate?.shortDescription}
  </span>

  {expandedUpdate.event && expandedUpdate.event.id && (
    <span className="ml-4 inline-flex float-right align-baseline">
      <button
        onClick={() => handleEventRegistration(expandedUpdate.event)}
        className="px-9 py-1.5 rounded-lg bg-emerald-600 text-white text-base font-medium hover:bg-emerald-500 transition-colors"
      >
        Register
      </button>
    </span>
  )}
</div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-cyan-950/40 backdrop-blur-sm p-8">
            <button
              onClick={() => {
                setShowRegistrationModal(false);
                setSelectedEvent(null);
                setSubmitMessage(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Register for Event</h2>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-emerald-300">{selectedEvent.title}</h3>
                </div>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={registrationForm.phone}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-zinc-300 mb-2">
                      Student ID / Roll Number
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      value={registrationForm.studentId}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, studentId: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      placeholder="Enter your student ID"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-zinc-300 mb-2">
                    Year / Semester
                  </label>
                  <input
                    type="text"
                    id="year"
                    value={registrationForm.year}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, year: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    placeholder="e.g., 2nd Year, 3rd Semester"
                  />
                </div>

                {selectedEvent.isPaid && (
                  <div className="space-y-4 p-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
                    <div>
                      <label className="block text-sm font-medium text-emerald-300 mb-2">
                        Payment Required
                      </label>
                      <p className="text-xs text-zinc-400 mb-4">
                        This is a paid event. Please complete the payment using the QR code below and enter your transaction ID.
                      </p>
                      {selectedEvent.qrCodeUrl && (
                        <div className="flex justify-center mb-4">
                          <img
                            src={selectedEvent.qrCodeUrl}
                            alt="Payment QR Code"
                            className="max-w-xs w-full rounded-lg border border-emerald-500/30"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="transactionId" className="block text-sm font-medium text-zinc-300 mb-2">
                        Transaction ID <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="transactionId"
                        required={selectedEvent.isPaid}
                        value={registrationForm.transactionId}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, transactionId: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                        placeholder="Enter your payment transaction ID"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-zinc-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="additionalNotes"
                    rows={3}
                    value={registrationForm.additionalNotes}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, additionalNotes: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                {submitMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitMessage.type === "success"
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/20 border border-red-500/30 text-red-300"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setSelectedEvent(null);
                      setSubmitMessage(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg border border-zinc-500/30 bg-zinc-900/20 text-zinc-300 hover:bg-zinc-800/30 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
