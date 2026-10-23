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
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";

const NAV_GROUPS = [
  {
    group: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Library", href: "/library", icon: FolderOpen },
      { label: "Grounded AI Tutor", href: "/tutor", icon: Brain },
      { label: "3D Spatial Studio", href: "/visuals", icon: Box, badge: "Interactive" },
    ]
  },
  {
    group: "Practice & Mastery",
    items: [
      { label: "Diagnostic Quizzes", href: "/practice", icon: Target },
      { label: "Revision Planner", href: "/revision", icon: Calendar },
      { label: "Analytics & Stats", href: "/progress", icon: TrendingUp },
    ]
  },
  {
    group: "Account",
    items: [
      { label: "Plan & Billing", href: "/billing", icon: CreditCard },
      { label: "Settings & Profile", href: "/settings", icon: Settings },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial =
    user?.user_metadata?.display_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "S";

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Student Workspace";

  return (
    <>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-panel/95 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            LM
          </div>
          <span className="font-bold text-white text-sm tracking-tight">LearnMate</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-surface border border-line text-slate-300 hover:text-white"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-panel border-r border-line flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
                LM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm tracking-tight">LearnMate</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-white/[0.08] text-slate-300 border border-white/[0.06]">
                    v2.4
                  </span>
                </div>
                <span className="text-[11px] text-muted block -mt-0.5">Autonomous Learning</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grouped Nav List */}
          <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {NAV_GROUPS.map((g) => (
              <div key={g.group} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {g.group}
                </div>
                {g.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08] shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={15}
                          className={active ? "text-indigo-400" : "text-slate-400"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/25">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User Card & Logout Footer */}
          <div className="p-3 border-t border-line bg-surface/50">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-muted block truncate">
                    {user?.email || "Academic Free Tier"}
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await signOut();
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
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
