"use client";

import { useState, useEffect } from "react";
import { Update, Event } from "@/lib/data";

type UpdateWithEvent = Update & { event?: Event | null };

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch("/api/admin/updates");
      const data = await res.json();
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    try {
      await fetch(`/api/admin/updates?id=${id}`, { method: "DELETE" });
      fetchUpdates();
    } catch (error) {
      console.error("Failed to delete update:", error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Updates Management</h1>
          <p className="text-zinc-400">Create and manage news updates</p>
        </div>
        <button
          onClick={() => {
            setEditingUpdate(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
        >
          + Add Update
        </button>
      </div>

      {showForm && (
        <UpdateForm
          update={editingUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingUpdate(null);
          }}
          onSuccess={() => {
            fetchUpdates();
            setShowForm(false);
            setEditingUpdate(null);
          }}
        />
      )}

      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{update.title}</h3>
                <p className="text-sm text-zinc-400">Update • {update.date}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  update.published
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {update.published ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-sm text-zinc-300 mb-4">{update.shortDescription}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingUpdate(update);
                  setShowForm(true);
                }}
                className="px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(update.id)}
                className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {updates.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg mb-2">No updates yet</p>
          <p className="text-sm">Click "Add Update" to create your first update</p>
        </div>
      )}
    </div>
  );
}

function UpdateForm({
  update,
  onClose,
  onSuccess,
}: {
  update: Update | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    date: update?.date || "",
    title: update?.title || "",
    shortDescription: update?.shortDescription || "",
    fullDescription: update?.fullDescription || "",
    eventId: (update as UpdateWithEvent)?.eventId || (update as UpdateWithEvent)?.event?.id || "",
    published: update?.published ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events when form opens
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          // Only show upcoming events for linking
          setEvents(data.filter((e: Event) => e.eventType === "upcoming"));
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Update form data when update prop changes
  useEffect(() => {
    if (update) {
      setFormData({
        date: update.date || "",
        title: update.title || "",
        shortDescription: update.shortDescription || "",
        fullDescription: update.fullDescription || "",
        eventId: (update as UpdateWithEvent)?.eventId || (update as UpdateWithEvent)?.event?.id || "",
        published: update.published ?? false,
      });
    } else {
      setFormData({
        date: "",
        title: "",
        shortDescription: "",
        fullDescription: "",
        eventId: "",
        published: false,
      });
    }
  }, [update]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/admin/updates";
      const method = update ? "PUT" : "POST";
      const body = update 
        ? { ...formData, id: update.id, eventId: formData.eventId || null } 
        : { ...formData, eventId: formData.eventId || null };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to save update");
      }
    } catch (error) {
      console.error("Error saving update:", error);
      alert("Failed to save update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0a0d14] rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {update ? "Edit Update" : "Create Update"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Date *
            </label>
            <input
              type="text"
              required
              placeholder="DD/MM/YY"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

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
              Short Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Full Description *
            </label>
            <textarea
              required
              rows={6}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Link to Event (Optional)
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">No event link</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 mt-1">
              Linking to an event will show a "Register" button on the homepage update card
            </p>
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
              {loading ? "Saving..." : "Save Update"}
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

