"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "Thank you for your message! We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Unique Header - Split Design */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center space-y-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-violet-900/10 to-fuchsia-900/20 p-8 sm:p-12 backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white sm:text-5xl">Get in Touch</h1>
          </div>
          <p className="text-lg leading-relaxed text-zinc-300">
            Have questions about our events, want to collaborate, or just curious about the cosmos?
            We're always listening. Send us a signal and we'll respond as soon as we're back in range.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-400/30">
                <svg
                  className="h-5 w-5 text-purple-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-200">Email</p>
                <a
                  href="mailto:science.club@medicaps.ac.in"
                  className="text-sm text-zinc-300 hover:text-purple-200 transition-colors"
                >
                  science.club@medicaps.ac.in
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-400/30">
                <svg
                  className="h-5 w-5 text-purple-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-200">Location</p>
                <p className="text-sm text-zinc-300">Medicaps University, Indore</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-400/30">
                <svg
                  className="h-5 w-5 text-purple-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-200">Response Time</p>
                <p className="text-sm text-zinc-300">Usually within 24-48 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Different Style */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900/40 via-purple-900/20 to-violet-900/30 p-8 sm:p-12 backdrop-blur-sm"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-purple-200">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-400/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-purple-200">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-400/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-purple-200">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-white focus:border-purple-400/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            >
              <option value="" className="bg-slate-900">
                Select a topic
              </option>
              <option value="general" className="bg-slate-900">
                General Inquiry
              </option>
              <option value="events" className="bg-slate-900">
                Events & Activities
              </option>
              <option value="membership" className="bg-slate-900">
                Membership
              </option>
              <option value="collaboration" className="bg-slate-900">
                Collaboration
              </option>
              <option value="other" className="bg-slate-900">
                Other
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-purple-200">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-400/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          {submitStatus.type && (
            <div
              className={`rounded-lg border p-4 ${
                submitStatus.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-200"
                  : "border-red-500/30 bg-red-500/10 text-red-200"
              }`}
            >
              <p className="text-sm">{submitStatus.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-violet-600"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Social Links Section - Different Card Style */}
      <section className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 p-8 sm:p-12 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Connect With Us</h2>
          <p className="mt-2 text-zinc-400">Follow our journey across the cosmos</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://www.instagram.com/medicaps_scienceclub?igsh=MXFldDI3a3RibDlxNg=="
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-purple-500/30 bg-white/5 px-6 py-4 transition hover:border-purple-400/60 hover:bg-purple-500/20"
          >
            <svg
              className="h-6 w-6 text-purple-300 group-hover:text-pink-400 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.098 3.603a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4z" />
            </svg>
            <span className="font-medium text-white group-hover:text-purple-200">Instagram</span>
          </a>
          <a
            href="https://www.linkedin.com/company/science-club-medicaps-university/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-purple-500/30 bg-white/5 px-6 py-4 transition hover:border-purple-400/60 hover:bg-purple-500/20"
          >
            <svg
              className="h-6 w-6 text-purple-300 group-hover:text-blue-400 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="font-medium text-white group-hover:text-purple-200">LinkedIn</span>
          </a>
        </div>
      </section>
    </div>
  );
}

