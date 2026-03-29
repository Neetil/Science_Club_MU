"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  ["Home", "/"],
  ["Events", "/events"],
  ["Gallery", "/gallery"],
  ["Team", "/team"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <nav className="flex h-16 items-center justify-between rounded-2xl backdrop-blur-md supports-[backdrop-filter]:bg-black/40 bg-black/30 border border-white/10 shadow-lg shadow-black/20 px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-baseline gap-2" onClick={() => setIsOpen(false)}>
          <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            Physics & Astronomy Club
          </span>
          <span className="hidden sm:inline text-xs text-zinc-400">Medicaps University</span>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-4 text-sm">
          {navItems.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className={`relative rounded px-3 py-2 transition-colors ${
                  pathname === href
                    ? "text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {label}
                {pathname === href && (
                  <span className="absolute inset-x-2 -bottom-[2px] h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                )}
              </Link>
            </li>
          ))}
          {/* Admin Link */}
          <li>
            <Link
              href="/admin/login"
              className={`relative rounded px-3 py-2 transition-colors ${
                pathname?.startsWith("/admin")
                  ? "text-white"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              Admin
              {pathname?.startsWith("/admin") && (
                <span className="absolute inset-x-2 -bottom-[2px] h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
              )}
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 text-zinc-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-x-4 top-20 z-40 rounded-2xl backdrop-blur-md bg-black/95 border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col p-2">
          {navItems.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base transition-colors touch-manipulation ${
                  pathname === href
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "text-zinc-300 hover:bg-white/5 active:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          {/* Admin Link for Mobile */}
          <li>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base transition-colors touch-manipulation ${
                pathname?.startsWith("/admin")
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-zinc-300 hover:bg-white/5 active:bg-white/10 hover:text-white"
              }`}
            >
              Admin
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

    </header>
  );
}

