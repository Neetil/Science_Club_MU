"use client";

import { useState, useEffect, useCallback } from "react";
import { Event } from "@/lib/data";
import * as XLSX from "xlsx";

interface EventRegistration {
  id: string;
  eventId: string;
  event: Event;
  name: string;
  email: string;
  phone: string | null;
  studentId: string | null;
  year: string | null;
  transactionId: string | null;
  additionalNotes: string | null;
  ip: string;
  createdAt: string;
}

export default function EventRegistrationsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [filterEventId, setFilterEventId] = useState<string>("all");

  const fetchRegistrations = useCallback(async () => {
    try {
      const url = filterEventId === "all" 
        ? "/api/admin/event-registrations"
        : `/api/admin/event-registrations?eventId=${filterEventId}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.sort((a: EventRegistration, b: EventRegistration) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    }
  }, [filterEventId]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const fetchData = async () => {
    try {
      const [regRes, eventsRes] = await Promise.all([
        fetch("/api/admin/event-registrations"),
        fetch("/api/admin/events"),
      ]);

      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData.sort((a: EventRegistration, b: EventRegistration) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;

    try {
      await fetch(`/api/admin/event-registrations?id=${id}`, { method: "DELETE" });
      fetchRegistrations();
      if (selectedRegistration?.id === id) {
        setSelectedRegistration(null);
      }
    } catch (error) {
      console.error("Failed to delete registration:", error);
    }
  };

  const handleExportToExcel = () => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations to export");
      return;
    }

    // Prepare data for Excel
    const excelData = filteredRegistrations.map((reg) => ({
      "Event Title": reg.event.title,
      "Event Category": reg.event.category,
      "Name": reg.name,
      "Email": reg.email,
      "Phone": reg.phone || "",
      "Student ID": reg.studentId || "",
      "Year/Semester": reg.year || "",
      "Transaction ID": reg.transactionId || "",
      "Additional Notes": reg.additionalNotes || "",
      "Registration Date": new Date(reg.createdAt).toLocaleString(),
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Registrations");

    // Generate filename with current date
    const eventTitle = filterEventId === "all" 
      ? "All Events" 
      : events.find((e) => e.id === filterEventId)?.title || "Event";
    const sanitizedEventTitle = eventTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `event_registrations_${sanitizedEventTitle}_${dateStr}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const filteredRegistrations = filterEventId === "all" 
    ? registrations 
    : registrations.filter((r) => r.eventId === filterEventId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Registrations</h1>
          <p className="text-zinc-400">
            {filteredRegistrations.length} total registration{filteredRegistrations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleExportToExcel}
          disabled={filteredRegistrations.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="eventFilter" className="text-sm font-medium text-zinc-300">
          Filter by Event:
        </label>
        <select
          id="eventFilter"
          value={filterEventId}
          onChange={(e) => setFilterEventId(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Events</option>
          {events
            .filter((e) => e.eventType === "upcoming")
            .map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              onClick={() => setSelectedRegistration(registration)}
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                registration.id === selectedRegistration?.id
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{registration.name}</h3>
                  <p className="text-sm text-zinc-400">{registration.email}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-cyan-300 mb-2">{registration.event.title}</p>
              {registration.phone && (
                <p className="text-xs text-zinc-400 mb-1">Phone: {registration.phone}</p>
              )}
              {registration.studentId && (
                <p className="text-xs text-zinc-400 mb-1">Student ID: {registration.studentId}</p>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                {new Date(registration.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-lg mb-2">No registrations yet</p>
              <p className="text-sm">Registrations will appear here when students register for events</p>
            </div>
          )}
        </div>

        {selectedRegistration && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedRegistration.event.title}
                </h2>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Name: {selectedRegistration.name}</p>
                  <p>Email: {selectedRegistration.email}</p>
                  {selectedRegistration.phone && <p>Phone: {selectedRegistration.phone}</p>}
                  {selectedRegistration.studentId && <p>Student ID: {selectedRegistration.studentId}</p>}
                  {selectedRegistration.year && <p>Year/Semester: {selectedRegistration.year}</p>}
                  {selectedRegistration.transactionId && <p className="text-emerald-300">Transaction ID: {selectedRegistration.transactionId}</p>}
                  <p>Date: {new Date(selectedRegistration.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedRegistration.additionalNotes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Additional Notes</h3>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-zinc-300 whitespace-pre-wrap">{selectedRegistration.additionalNotes}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <a
                href={`mailto:${selectedRegistration.email}?subject=Re: Registration for ${selectedRegistration.event.title}`}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors text-center"
              >
                Email Registrant
              </a>
              <button
                onClick={() => handleDelete(selectedRegistration.id)}
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

