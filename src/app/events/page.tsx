"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section - Advanced */}
      <section className="relative overflow-hidden">
        <div className="relative space-y-6 text-center">
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            Events
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-300">
            Discover, learn, and connect through our exciting lineup of scientific events
          </p>
        </div>
      </section>

      {/* Upcoming Events Banner */}
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

          {loading ? (
            <div className="text-center py-12 text-zinc-400">
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-lg mb-2">No events available</p>
              <p className="text-sm">Check back soon for upcoming events</p>
            </div>
          ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events
            .filter((event) => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return (
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                event.category.toLowerCase().includes(query)
              );
            })
                .map((event) => (
              <div
                    key={event.id}
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
          )}
        </div>
      </section>
    </div>
  );
}

