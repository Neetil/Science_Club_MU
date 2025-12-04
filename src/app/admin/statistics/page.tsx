"use client";

import { useState, useEffect } from "react";
import { Statistics } from "@/lib/data";

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics>({
    eventsConducted: 10,
    activeMembers: 60,
    outreachTrips: 5,
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const res = await fetch("/api/admin/statistics");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/statistics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });

      if (res.ok) {
        alert("Statistics updated successfully!");
      } else {
        alert("Failed to update statistics");
      }
    } catch (error) {
      console.error("Error saving statistics:", error);
      alert("Failed to update statistics");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Statistics Management</h1>
        <p className="text-zinc-400">Update club statistics displayed on the homepage</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Events Conducted
            </label>
            <input
              type="number"
              min="0"
              value={stats.eventsConducted}
              onChange={(e) =>
                setStats({ ...stats, eventsConducted: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Active Members
            </label>
            <input
              type="number"
              min="0"
              value={stats.activeMembers}
              onChange={(e) =>
                setStats({ ...stats, activeMembers: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Outreach Trips
            </label>
            <input
              type="number"
              min="0"
              value={stats.outreachTrips}
              onChange={(e) =>
                setStats({ ...stats, outreachTrips: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Statistics"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Events conducted</p>
            <p className="text-2xl font-bold text-cyan-300">{stats.eventsConducted}+</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Active members</p>
            <p className="text-2xl font-bold text-cyan-300">{stats.activeMembers}+</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Outreach trips</p>
            <p className="text-2xl font-bold text-cyan-300">{stats.outreachTrips}+</p>
          </div>
        </div>
      </div>
    </div>
  );
}

