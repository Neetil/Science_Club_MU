"use client";

import { useState, useEffect } from "react";
import { Event } from "@/lib/data";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const upcomingEvents = events.filter((e) => e.eventType === "upcoming" && e.published);
  const pastEvents = events.filter((e) => e.eventType === "past" && e.published);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events Management</h1>
          <p className="text-zinc-400">Create, edit, and manage club events</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
        >
          + Add Event
        </button>
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            fetchEvents();
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Upcoming Events Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
            {upcomingEvents.length}
          </span>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 rounded-xl border border-white/10 bg-white/[0.02]">
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                    <span className="inline-block px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 mb-3">
                      {event.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowForm(true);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Past Events</h2>
          <span className="px-3 py-1 rounded-full bg-zinc-500/20 text-zinc-400 text-sm">
            {pastEvents.length}
          </span>
        </div>
        {pastEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 rounded-xl border border-white/10 bg-white/[0.02]">
            <p>No past events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                    <span className="inline-block px-2 py-1 rounded text-xs bg-zinc-500/20 text-zinc-400 mb-3">
                      {event.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowForm(true);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Draft Events (if any) */}
      {events.filter((e) => !e.published).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Drafts</h2>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
              {events.filter((e) => !e.published).length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter((e) => !e.published)
              .map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 mb-3">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowForm(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventForm({
  event,
  onClose,
  onSuccess,
}: {
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "",
    eventType: (event?.eventType as "upcoming" | "past") || "upcoming",
    image: event?.image || "",
    published: event?.published ?? false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/admin/events";
      const method = event ? "PUT" : "POST";
      const body = event ? { ...formData, id: event.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0a0d14] rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tag (Category) *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">Select tag</option>
              <option value="Workshop">Workshop</option>
              <option value="Lecture">Lecture</option>
              <option value="Competition">Competition</option>
              <option value="Observation">Observation</option>
              <option value="Outreach">Outreach</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Event Type *
            </label>
            <select
              required
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as "upcoming" | "past" })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="upcoming">Upcoming Event</option>
              <option value="past">Past Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm text-zinc-300">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Event"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

