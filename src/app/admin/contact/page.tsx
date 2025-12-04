"use client";

import { useState, useEffect } from "react";
import { ContactSubmission } from "@/lib/data";

export default function ContactPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/contact");
      const data = await res.json();
      setSubmissions(data.sort((a: ContactSubmission, b: ContactSubmission) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, read: boolean) => {
    try {
      await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Failed to update submission:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to delete submission:", error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const unreadCount = submissions.filter((s) => !s.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Submissions</h1>
          <p className="text-zinc-400">
            {submissions.length} total messages • {unreadCount} unread
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              onClick={() => setSelectedSubmission(submission)}
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                submission.id === selectedSubmission?.id
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : submission.read
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-cyan-500/30 bg-cyan-500/5"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{submission.name}</h3>
                  <p className="text-sm text-zinc-400">{submission.email}</p>
                </div>
                {!submission.read && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-2">{submission.subject}</p>
              <p className="text-xs text-zinc-400 line-clamp-2">{submission.message}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-lg mb-2">No messages yet</p>
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedSubmission.subject}
                </h2>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>From: {selectedSubmission.name}</p>
                  <p>Email: {selectedSubmission.email}</p>
                  <p>Date: {new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Message</h3>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-zinc-300 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors text-center"
              >
                Reply via Email
              </a>
              <button
                onClick={() => handleMarkRead(selectedSubmission.id, !selectedSubmission.read)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                {selectedSubmission.read ? "Mark Unread" : "Mark Read"}
              </button>
              <button
                onClick={() => handleDelete(selectedSubmission.id)}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

