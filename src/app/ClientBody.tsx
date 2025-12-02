"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClientBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const onHome = pathname === "/";
    if (!onHome) {
      setIsLoading(false);
      setProgress(1);
      return;
    }

    setIsLoading(true);
    setProgress(0);

    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setProgress(1);
      timerRef.current = null;
    }, 6000);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (!isLoading) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const start = performance.now();
    let frameId = 0;
    let intervalId: number | null = null;

    const updateProgress = () => {
      const elapsed = performance.now() - start;
      const next = Math.min(elapsed / 6000, 1);
      setProgress(next);
      return next;
    };

    const animate = () => {
      const next = updateProgress();
      if (next < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    // Fallback updates while the tab is hidden (rAF pauses when not visible)
    intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") return;
      const next = updateProgress();
      if (next >= 1 && intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }, 250);

    return () => {
      cancelAnimationFrame(frameId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const canvas = document.getElementById("stars-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
    }));

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.9)";

      for (const s of stars) {
        s.x = (s.x + s.vx + 1) % 1;
        s.y = (s.y + s.vy + 1) % 1;
        const px = s.x * w;
        const py = s.y * h;
        const r = Math.max(0.5, 1.8 * s.z);
        ctx.globalAlpha = 0.6 * s.z;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {isLoading && <LaunchOverlay progress={progress} />}
      <div
        className={cn(
          "relative transition-opacity duration-700 ease-out",
          isLoading ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {children}
      </div>
    </>
  );
}

function LaunchOverlay({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#01030a] via-[#040b19] to-[#02040d] text-center">
      <div className="absolute inset-0 opacity-80">
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,0.18),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.22),transparent_55%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-white">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full border border-cyan-400/25 animate-[spin_14s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-sky-400/40 animate-[spin_9s_linear_infinite_reverse]" />
          <div className="animate-launch-glow absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400 via-sky-300 to-blue-600 shadow-lg shadow-cyan-500/40" />
          <div className="absolute inset-6 flex items-center justify-center text-3xl font-bold tracking-tight text-white">
            PA
          </div>
          <span className="animate-shooting-star absolute left-[-15%] top-1/2 h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-cyan-100 to-transparent" />
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">Preparing Observation Deck</p>
          <p className="text-xs uppercase tracking-[0.6em] text-cyan-100/70">Igniting thrusters</p>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 transition-[width] duration-200 ease-out"
            style={{ width: `${clamped * 100}%` }}
          />
        </div>

        <p className="animate-blink-text text-sm text-zinc-300/80">
          Aligning telescopes and loading the club details...
        </p>

        <p className="mt-10 text-xs uppercase tracking-[0.4em] text-white/60">
          Developed by{" "}
          <a href="https://neetil.in" target="_blank" rel="noreferrer" className="font-semibold text-white">
            Neetil
          </a>
        </p>
      </div>
    </div>
  );
}
