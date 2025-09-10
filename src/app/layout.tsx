import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ClientBody } from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Physics & Astronomy Club | Medicaps University",
  description: "Explore events, research, and community at the Physics & Astronomy Club of Medicaps University.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-[#0a0d14] text-zinc-200 antialiased">
        <ClientBody>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 border-b border-white/10">
              <nav className="mx-auto flex h-14 items-center justify-between">
                <a href="/" className="group inline-flex items-baseline gap-2">
                  <span className="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">Physics & Astronomy Club</span>
                  <span className="hidden sm:inline text-xs text-zinc-400">Medicaps University</span>
                </a>
                <ul className="flex items-center gap-4 text-sm">
                  {[
                    ["Home", "/"],
                    ["About", "/about"],
                    ["Events", "/events"],
                    ["Gallery", "/gallery"],
                    ["Team", "/team"],
                    ["Contact", "/contact"],
                  ].map(([label, href]) => (
                    <li key={href as string}>
                      <a
                        href={href as string}
                        className="relative rounded px-3 py-2 text-zinc-300 hover:text-white transition-colors"
                      >
                        {label}
                        <span className="absolute inset-x-2 -bottom-[2px] h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </header>
            <main className="relative py-8">
              {/* Page transition wrapper */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
              </div>
            </main>
            <footer className="border-t border-white/10 py-8 text-sm text-zinc-400">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© {new Date().getFullYear()} Physics & Astronomy Club, Medicaps University</p>
                <p className="text-zinc-500">Built with Next.js • Bun • shadcn/ui</p>
              </div>
            </footer>
          </div>
          {/* Subtle starfield background */}
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_30%_-10%,rgba(15,90,120,0.25),transparent),radial-gradient(800px_400px_at_80%_0%,rgba(0,255,255,0.08),transparent)]" />
            <canvas id="stars-canvas" className="absolute inset-0 opacity-30" />
          </div>
        </ClientBody>
      </body>
    </html>
  );
}

