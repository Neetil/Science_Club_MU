"use client";

import { useEffect, useState } from "react";
import { Subscriber } from "@/lib/data";
import * as XLSX from "xlsx";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setSelectedSubscribers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
    }
  };

  const handleExport = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export");
      return;
    }

    const excelData = subscribers.map((s) => ({
      Email: s.email,
      "Subscribed At": new Date(s.createdAt as unknown as string).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `newsletter_subscribers_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map((s) => s.id)));
    }
  };

  const toggleSelectSubscriber = (id: string) => {
    setSelectedSubscribers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSendEmail = async (sendToAll: boolean) => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      setEmailStatus({ type: "error", message: "Please fill in both subject and message" });
      return;
    }

    const subscriberIdsToSend = sendToAll
      ? []
      : Array.from(selectedSubscribers);

    if (!sendToAll && subscriberIdsToSend.length === 0) {
      setEmailStatus({ type: "error", message: "Please select at least one subscriber" });
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/admin/subscribers/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          subscriberIds: sendToAll ? undefined : subscriberIdsToSend,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailStatus({
          type: "success",
          message: data.message || `Email sent successfully to ${data.sentCount} subscriber(s)`,
        });
        setEmailSubject("");
        setEmailMessage("");
        setSelectedSubscribers(new Set());
        setTimeout(() => {
          setShowEmailComposer(false);
          setEmailStatus(null);
        }, 3000);
      } else {
        setEmailStatus({
          type: "error",
          message: data.error || "Failed to send email",
        });
      }
    } catch (error) {
      setEmailStatus({
        type: "error",
        message: "Failed to send email. Please check your SMTP configuration.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Newsletter Subscribers</h1>
          <p className="text-zinc-400">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""} receiving event updates
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEmailComposer(!showEmailComposer)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {showEmailComposer ? "Hide Composer" : "Send Email"}
          </button>
          <button
            onClick={handleExport}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Email Composer */}
      {showEmailComposer && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Compose Email</h2>
          
          <div className="space-y-2">
            <label htmlFor="emailSubject" className="block text-sm font-medium text-zinc-300">
              Subject
            </label>
            <input
              id="emailSubject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="emailMessage" className="block text-sm font-medium text-zinc-300">
              Message
            </label>
            <textarea
              id="emailMessage"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Enter your message (supports line breaks)"
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-y"
            />
          </div>

          {emailStatus && (
            <div
              className={`p-3 rounded-lg ${
                emailStatus.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {emailStatus.message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSendEmail(false)}
              disabled={sendingEmail || selectedSubscribers.size === 0}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingEmail
                ? "Sending..."
                : `Send to Selected (${selectedSubscribers.size})`}
            </button>
            <button
              onClick={() => handleSendEmail(true)}
              disabled={sendingEmail || subscribers.length === 0}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingEmail ? "Sending..." : `Send to All (${subscribers.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Subscribers List */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {subscribers.length === 0 && (
          <div className="p-6 text-center text-zinc-400">
            <p className="text-lg mb-1">No subscribers yet</p>
            <p className="text-sm">Newsletter signups will appear here when students subscribe on the site.</p>
          </div>
        )}

        {subscribers.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-zinc-300">
              Select All ({selectedSubscribers.size} selected)
            </span>
          </div>
        )}

        {subscribers.map((subscriber) => (
          <div
            key={subscriber.id}
            className="flex items-center gap-4 px-4 py-3 flex-wrap"
          >
            <input
              type="checkbox"
              checked={selectedSubscribers.has(subscriber.id)}
              onChange={() => toggleSelectSubscriber(subscriber.id)}
              className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white break-words">{subscriber.email}</p>
              <p className="text-xs text-zinc-500">
                Subscribed at {new Date(subscriber.createdAt as unknown as string).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(subscriber.id)}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
