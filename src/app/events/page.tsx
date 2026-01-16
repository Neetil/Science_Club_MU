"use client";

import { useState, useEffect } from "react";
import { EventCardSkeleton } from "@/components/Skeleton";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType: "upcoming" | "past";
  image?: string;
  isPaid?: boolean;
  qrCodeUrl?: string | null;
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  const upcomingEvents = events.filter((e) => e.eventType === "upcoming");
  const pastEvents = events.filter((e) => e.eventType === "past");

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
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

      {/* Upcoming Events Section */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {upcomingEvents.length === 0 ? (
            /* Upcoming Events Banner - Only shown when no upcoming events */
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
          ) : (
            /* Upcoming Events List - Shown when there are upcoming events */
            <>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-2 text-xs uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Events
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  What's Next
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Join us for these exciting upcoming events
                </p>
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-teal-950/10 p-6 transition-all hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-1 cursor-pointer text-left"
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
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                              Register Now
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
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

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents
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
      )}

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
                  <p className="text-sm text-zinc-400">{selectedEvent.description}</p>
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
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={registrationForm.phone}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-zinc-300 mb-2">
                      Student ID / Roll Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      required
                      value={registrationForm.studentId}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, studentId: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      placeholder="Enter your student ID"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-zinc-300 mb-2">
                    Year / Semester <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="year"
                    required
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
                        This is a paid event. Please complete the payment of 100 Rs using the QR code below and enter your transaction ID.
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
                  <p className="mt-2 text-sm text-zinc-400">
                    If you find any problem in registering the event, please contact us through{" "}
                    <a href="/contact" className="text-emerald-400 hover:text-emerald-300 underline">
                      contact page
                    </a>
                    .
                  </p>
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

