"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Events", href: "/admin/events", icon: "📅" },
  { label: "Gallery", href: "/admin/gallery", icon: "🖼️" },
  { label: "Team", href: "/admin/team", icon: "👥" },
  { label: "Updates", href: "/admin/updates", icon: "📢" },
  { label: "Contact", href: "/admin/contact", icon: "✉️" },
  { label: "Statistics", href: "/admin/statistics", icon: "📈" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-black/30 border-r border-white/10 min-h-screen p-4">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Admin Panel</span>
        </Link>
        <p className="text-xs text-zinc-400 mt-1">Physics & Astronomy Club</p>
      </div>

      <nav className="space-y-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition-colors mb-2"
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-medium">View Site</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}

