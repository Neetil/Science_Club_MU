"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    events: 0,
    gallery: 0,
    team: 0,
    messages: 0,
    updates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [eventsRes, galleryRes, teamRes, contactRes, updatesRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/gallery"),
        fetch("/api/admin/team"),
        fetch("/api/admin/contact"),
        fetch("/api/admin/updates"),
      ]);

      if (eventsRes.ok) {
        const events = await eventsRes.json();
        setStats((prev) => ({ ...prev, events: events.length }));
      }
      if (galleryRes.ok) {
        const gallery = await galleryRes.json();
        setStats((prev) => ({ ...prev, gallery: gallery.length }));
      }
      if (teamRes.ok) {
        const team = await teamRes.json();
        setStats((prev) => ({ ...prev, team: team.length }));
      }
      if (contactRes.ok) {
        const contact = await contactRes.json();
        const unread = contact.filter((c: { read?: boolean }) => !c.read).length;
        setStats((prev) => ({ ...prev, messages: unread }));
      }
      if (updatesRes.ok) {
        const updates = await updatesRes.json();
        setStats((prev) => ({ ...prev, updates: updates.length }));
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome to the admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📅</span>
            <span className="text-xs text-zinc-400">Events</span>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : stats.events}</p>
          <p className="text-sm text-zinc-400 mt-1">Total events</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🖼️</span>
            <span className="text-xs text-zinc-400">Gallery</span>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : stats.gallery}</p>
          <p className="text-sm text-zinc-400 mt-1">Total images</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">👥</span>
            <span className="text-xs text-zinc-400">Team</span>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : stats.team}</p>
          <p className="text-sm text-zinc-400 mt-1">Team members</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📢</span>
            <span className="text-xs text-zinc-400">Updates</span>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : stats.updates}</p>
          <p className="text-sm text-zinc-400 mt-1">Published updates</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">✉️</span>
            <span className="text-xs text-zinc-400">Messages</span>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : stats.messages}</p>
          <p className="text-sm text-zinc-400 mt-1">Unread messages</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/events"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Events</h3>
            <p className="text-sm text-zinc-400">Create, edit, or delete events</p>
          </a>
          <a
            href="/admin/gallery"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Gallery</h3>
            <p className="text-sm text-zinc-400">Upload and organize images</p>
          </a>
          <a
            href="/admin/team"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Team</h3>
            <p className="text-sm text-zinc-400">Add or update team members</p>
          </a>
          <a
            href="/admin/updates"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Updates</h3>
            <p className="text-sm text-zinc-400">Create and publish updates</p>
          </a>
          <a
            href="/admin/contact"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">View Messages</h3>
            <p className="text-sm text-zinc-400">Check contact form submissions</p>
          </a>
        </div>
      </div>
    </div>
  );
}

