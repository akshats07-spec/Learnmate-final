"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Brain,
  Box,
  Target,
  Calendar,
  TrendingUp,
  CreditCard,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";

const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Library", href: "/library", icon: FolderOpen },
  { label: "AI Tutor", href: "/tutor", icon: Brain },
  { label: "3D Visual Learning", href: "/visuals", icon: Box, badge: "New" },
  { label: "Quizzes & Practice", href: "/practice", icon: Target },
  { label: "Revision Planner", href: "/revision", icon: Calendar },
  { label: "Progress & Analytics", href: "/progress", icon: TrendingUp },
  { label: "Subscription & Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-line bg-panel/90 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-gradient text-white">
            <BookOpen size={16} strokeWidth={2.5} />
          </span>
          <span className="font-bold text-white text-sm">LearnMate</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-surface border border-line text-slate-300"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-panel border-r border-line flex flex-col justify-between transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-line/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-gradient text-white shadow-glow-sm">
                <BookOpen size={16} strokeWidth={2.5} />
              </span>
              <div>
                <span className="font-bold text-white text-sm tracking-tight block">LearnMate</span>
                <span className="text-2xs text-muted block -mt-0.5">SaaS Workspace</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {SIDEBAR_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-violet-400/10 border border-violet/30 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={active ? "text-violet-bright" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="mint" className="text-2xs py-0 px-1.5">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-line bg-surface/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-violet-dim/30 border border-violet/40 text-violet-bright font-bold text-xs flex items-center justify-center shrink-0">
                {user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate">
                  {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student Demo"}
                </span>
                <span className="text-2xs text-muted block truncate">
                  {user?.email || "Pro Plan"}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
