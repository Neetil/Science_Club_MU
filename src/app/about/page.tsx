"use client";

import { useEffect, useRef, useState } from "react";

export default function AboutPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section - Different Style */}
      <div className="relative overflow-hidden">
        <div className="relative space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs uppercase tracking-wider text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Our Story
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            About the Club
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-300">
            A community where curiosity meets discovery, and passion transforms into innovation.
          </p>
        </div>
      </div>

      {/* Mission & Vision - Asymmetric Layout */}
      <section className="grid gap-8 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <div className="group relative overflow-hidden rounded-3xl border-l-4 border-amber-500/50 bg-gradient-to-br from-amber-950/30 to-orange-950/20 p-8 shadow-xl shadow-amber-900/10">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 ring-2 ring-amber-500/30">
                <svg
                  className="h-6 w-6 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-lg leading-relaxed text-zinc-300">
            To ignite a cosmic spark in every curious mind - pushing students to question the unknown, challenge the impossible, and explore the universe with bold curiosity. Our mission is to turn the night sky into a classroom, physics into an adventure, and learning into a journey that stretches far beyond the limits of Earth.
            </p>
          </div>
        </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="group relative overflow-hidden rounded-3xl border-l-4 border-orange-500/50 bg-gradient-to-br from-orange-950/30 to-yellow-950/20 p-8 shadow-xl shadow-orange-900/10">
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 ring-2 ring-orange-500/30">
                <svg
                  className="h-6 w-6 text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            </div>
            <p className="text-lg leading-relaxed text-zinc-300">
            To shape a generation that dares to look up and wonder. We envision a community of explorers who decode the laws of nature, uncover cosmic mysteries, and dream fearlessly of worlds yet unseen. Our vision is to inspire minds that aim not just for the stars - but for the truth hidden behind them.
            </p>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* What We Do - Timeline Style */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">What We Do</h2>
          <p className="mt-2 text-zinc-400">Activities that define our journey</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "Expert Talks & Lectures",
              description:
                "We host renowned scientists, researchers, and industry experts who share their insights on cutting-edge developments in physics, astronomy, and space science.",
              icon: "🎤",
            },
            {
              title: "Night Sky Observations",
              description:
                "Regular stargazing sessions where members learn to identify constellations, observe celestial events, and use telescopes to explore the wonders of the universe.",
              icon: "🔭",
            },
            {
              title: "Hands-On Experiments",
              description:
                "Interactive workshops and lab sessions that bring theoretical concepts to life, allowing members to build, test, and learn through practical experimentation.",
              icon: "🧪",
            },
            {
              title: "Research Projects",
              description:
                "Collaborative research initiatives where students work on real-world problems, contribute to scientific publications, and develop critical thinking skills.",
              icon: "📊",
            },
            {
              title: "Competitions & Events",
              description:
                "Science fairs, quiz competitions, and hackathons that challenge members, celebrate achievements, and foster healthy competition within the community.",
              icon: "🏆",
            },
            {
              title: "Outreach Events",
              description:
                "Organizing exhibitions, educational visits, and public awareness campaigns to inspire the next generation and spread scientific knowledge beyond our campus boundaries.",
              icon: "🌍",
            },
          ].map((activity, index) => (
            <ScrollReveal key={activity.title} direction={index % 2 === 0 ? "left" : "right"}>
              <div className="group relative flex gap-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-transparent p-6 transition hover:border-amber-500/40 hover:bg-amber-950/30">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-3xl ring-2 ring-amber-500/20 group-hover:ring-amber-500/40 transition">
                {activity.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
                <p className="mt-2 text-zinc-300">{activity.description}</p>
              </div>
              <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-500/60 to-orange-500/60 opacity-0 transition group-hover:opacity-100" />
            </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Values - Hexagonal Cards */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Our Core Values</h2>
          <p className="mt-2 text-zinc-400">Principles that guide everything we do</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Curiosity", desc: "Always asking why and exploring the unknown" },
            { title: "Collaboration", desc: "Together we achieve more than alone" },
            { title: "Innovation", desc: "Turning ideas into reality through creativity" },
            { title: "Excellence", desc: "Striving for the highest standards in all we do" },
            { title: "Inclusivity", desc: "Welcoming all who share our passion" },
            { title: "Integrity", desc: "Honest, ethical, and responsible science" },
          ].map((value, index) => (
            <ScrollReveal key={value.title} direction={index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "left"}>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-orange-950/10 p-6 text-center transition hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <h3 className="text-xl font-bold text-amber-300">{value.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{value.desc}</p>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Join Us CTA - Different Style */}
      <ScrollReveal direction="left">
        <section className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-yellow-950/40 p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent)]" />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Join Us?</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-300">
            Become part of a community that's shaping the future of science and exploration. Whether
            you're a beginner or an expert, there's a place for you here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-orange-500 transition-all"
            >
              Get in Touch
            </a>
            <a
              href="/events"
              className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 px-6 py-3 font-semibold text-amber-200 hover:bg-amber-500/20 transition-all"
            >
              View Events
            </a>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}

function ScrollReveal({
  children,
  direction = "left",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-x-0"
          : direction === "left"
            ? "opacity-0 -translate-x-20"
            : "opacity-0 translate-x-20"
      }`}
    >
      {children}
    </div>
  );
}

