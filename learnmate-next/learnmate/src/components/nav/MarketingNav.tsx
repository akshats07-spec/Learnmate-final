"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu, X, ChevronRight
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-sm shrink-0 bg-surface transition-transform group-hover:scale-105">
            <img
              src="/logo-square.png"
              alt="LearnMate Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            LearnMate
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/login" className="btn-ghost rounded-lg px-3.5 py-1.5 text-xs font-medium">
            Log in
          </Link>
          <Link href="/signup"
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5">
            Get started <ChevronRight size={13} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:text-white"
          aria-label="Toggle navigation">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-panel p-4 space-y-2 animate-fade-in">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04]">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-line flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}
              className="btn-ghost rounded-lg px-3 py-2 text-xs font-medium text-center">
              Log in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}
              className="btn-primary rounded-lg px-3 py-2 text-xs font-semibold text-center">
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
