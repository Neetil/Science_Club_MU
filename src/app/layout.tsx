import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ClientBody } from "./ClientBody";
import { Navigation } from "./Navigation";
import { ToastProvider } from "@/components/ToastProvider";
import { MusicPlayer } from "@/components/MusicPlayer";
import { AstraBotpress } from "@/components/AstraBotpress";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com";

export const metadata: Metadata = {
  title: "Physics & Astronomy Club | Medicaps University",
  description: "Join the Physics & Astronomy Club at Medicaps University. Explore events, workshops, stargazing sessions, and connect with fellow space enthusiasts.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Physics & Astronomy Club | Medicaps University",
    description: "Join the Physics & Astronomy Club at Medicaps University. Explore events, workshops, stargazing sessions, and connect with fellow space enthusiasts.",
    url: baseUrl,
    siteName: "Physics & Astronomy Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physics & Astronomy Club | Medicaps University",
    description: "Join the Physics & Astronomy Club at Medicaps University. Explore events, workshops, stargazing sessions, and connect with fellow space enthusiasts.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-[#0a0d14] text-zinc-200 antialiased font-sans">
        <ToastProvider>
          <ClientBody>
            <div className="relative mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
              <Navigation />
              <main className="relative py-4 sm:py-6 md:py-8">
                {/* Page transition wrapper */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {children}
                </div>
              </main>
              <footer className="border-t border-white/10 py-8 text-sm text-zinc-400">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p>© {new Date().getFullYear()} Physics & Astronomy Club</p>
                  <p className="text-zinc-500">
                    Developed by{" "}
                    <a
                      href="https://neetil.in"
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-dotted underline-offset-4 transition-colors hover:text-zinc-200"
                    >
                      Neetil
                    </a>
                  </p>
                </div>
              </footer>
            </div>
            {/* Subtle starfield background */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_30%_-10%,rgba(15,90,120,0.25),transparent),radial-gradient(800px_400px_at_80%_0%,rgba(0,255,255,0.08),transparent)]" />
              <canvas id="stars-canvas" className="absolute inset-0 opacity-30" />
            </div>
            <MusicPlayer />
            <AstraBotpress />
            <Analytics />
          </ClientBody>
        </ToastProvider>
      </body>
    </html>
  );
}

