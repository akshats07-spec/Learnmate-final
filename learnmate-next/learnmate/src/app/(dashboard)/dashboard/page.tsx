"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Upload,
  Brain,
  Box,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  Activity,
  Layers
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getUserStats, formatStudyTime, UserStats } from "@/lib/userStats";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good afternoon");
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good morning");
    else if (hr < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const loaded = getUserStats(user?.email);
    setStats(loaded);
  }, [user]);

  const userName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const streakDays = stats?.streakDays ?? 1;
  const studyTimeFormatted = formatStudyTime(stats?.totalStudyMinutes ?? 25);
  const topicsCount = stats?.topicsDiscovered ?? 4;
  const masteryPct = stats?.overallMastery ?? 60;
  const activeTitle = stats?.activeMaterialTitle ?? "Cell Biology & Energy Synthesis.pdf";
  const activeId = stats?.activeMaterialId ?? "bio-ch7";
  const attempts = stats?.quizAttempts ?? [];

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* ── 1. Clean Executive Header ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Workspace &bull; {todayDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs text-muted mt-1">
            Grounded learning environment active. Here is your current academic telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/library">
            <Button size="sm">
              <Upload size={14} /> Upload Notes
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="secondary" size="sm">
              <Target size={14} /> Take Quiz
            </Button>
          </Link>
          <Link href="/tutor">
            <Button variant="ghost" size="sm">
              <Brain size={14} /> Open Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Metric KPI Cards (Clean SaaS Architecture) ────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line flex flex-col justify-between transition-all hover:border-white/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Study Streak</span>
            <span className="text-xs text-amber-400 font-mono flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Flame size={13} /> Active
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {streakDays} {streakDays === 1 ? "Day" : "Days"}
            </div>
            <p className="text-[11px] text-muted mt-1">Consecutive study sessions</p>
          </div>
        </div>

        {/* Study Time */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line flex flex-col justify-between transition-all hover:border-white/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Focus Time</span>
            <span className="text-xs text-indigo-400 font-mono flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <Clock size={13} /> Logged
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {studyTimeFormatted}
            </div>
            <p className="text-[11px] text-muted mt-1">Dedicated comprehension time</p>
          </div>
        </div>

        {/* Topics Count */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line flex flex-col justify-between transition-all hover:border-white/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Indexed Concepts</span>
            <span className="text-xs text-sky-400 font-mono flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              <Layers size={13} /> {stats?.materialsCount || 1} docs
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {topicsCount} Topics
            </div>
            <p className="text-[11px] text-muted mt-1">Extracted knowledge clusters</p>
          </div>
        </div>

        {/* Overall Mastery */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line flex flex-col justify-between transition-all hover:border-white/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Overall Mastery</span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Activity size={13} /> Calibrated
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{masteryPct}%</span>
              <span className="text-[11px] text-slate-400">retention</span>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full bg-white/[0.08] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Main Dashboard Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Coursework & Diagnostic Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Coursework Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Active Coursework Document
                </h3>
              </div>
              <Badge variant="mint">Ready for Study</Badge>
            </div>

            <div className="p-4 rounded-lg bg-panel border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Currently Loaded</span>
                <h4 className="text-base font-semibold text-white tracking-tight">{activeTitle}</h4>
                <p className="text-xs text-muted">
                  Indexed topics ready for Grounded AI Tutor, 3D Spatial Models, and Quizzes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/library/${activeId}`}>
                  <Button size="sm">
                    Open Workspace <ChevronRight size={14} />
                  </Button>
                </Link>
                <Link href={`/practice?materialId=${activeId}`}>
                  <Button variant="secondary" size="sm">
                    Take Quiz
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <Link
                href="/tutor"
                className="p-3 rounded-lg bg-panel/60 border border-line hover:border-white/20 transition-all flex items-center justify-between text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Brain size={15} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">Ask Grounded Tutor</span>
                </div>
                <ChevronRight size={13} className="text-slate-500" />
              </Link>
              <Link
                href="/visuals"
                className="p-3 rounded-lg bg-panel/60 border border-line hover:border-white/20 transition-all flex items-center justify-between text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Box size={15} className="text-cyan-400 shrink-0" />
                  <span className="font-medium">3D Spatial Model</span>
                </div>
                <ChevronRight size={13} className="text-slate-500" />
              </Link>
              <Link
                href="/practice"
                className="p-3 rounded-lg bg-panel/60 border border-line hover:border-white/20 transition-all flex items-center justify-between text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Target size={15} className="text-emerald-400 shrink-0" />
                  <span className="font-medium">Diagnostic Quiz</span>
                </div>
                <ChevronRight size={13} className="text-slate-500" />
              </Link>
            </div>
          </div>

          {/* Diagnostic Performance History */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-emerald-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Diagnostic Quiz Performance
                </h3>
              </div>
              <Link href="/practice" className="text-xs text-indigo-400 hover:underline font-medium">
                New Assessment &rarr;
              </Link>
            </div>

            {attempts.length > 0 ? (
              <div className="space-y-2.5">
                {attempts.slice(0, 3).map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="p-3.5 rounded-lg bg-panel border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-medium">
                          {att.materialTitle || "Diagnostic Assessment"}
                        </strong>
                        <span className="text-[11px] text-muted font-mono">{att.date}</span>
                      </div>
                      {att.weakTopics && att.weakTopics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-muted">Focus areas:</span>
                          {att.weakTopics.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[11px] border border-rose-500/20 font-medium"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white block">
                        {att.score} / {att.total} ({att.pct}%)
                      </span>
                      <span className={`text-[11px] font-medium ${att.pct >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                        {att.pct >= 70 ? "Mastery Demonstrated" : "Needs Spaced Review"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-panel/50 border border-line text-center space-y-2">
                <p className="text-xs text-slate-300">
                  No diagnostic assessments completed yet. Take a quiz to calibrate your knowledge gap matrix.
                </p>
                <Link href="/practice" className="inline-block pt-1">
                  <Button size="sm">
                    <Target size={14} /> Start Diagnostic Quiz
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spaced Revision & Fast Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Spaced Revision Schedule */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Spaced Revision Plan
                </h3>
              </div>
              <Link href="/revision" className="text-xs text-indigo-400 hover:underline font-medium">
                View Plan
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  day: "Day 1 (Immediate)",
                  task: `Review high-priority concepts in ${activeTitle.slice(0, 20)}...`,
                  duration: "5m",
                  status: "due",
                },
                {
                  day: "Day 2 (Active Recall)",
                  task: "Solve targeted practice questions on weak topics",
                  duration: "4m",
                  status: "scheduled",
                },
                {
                  day: "Day 3 (Consolidation)",
                  task: "Spatial knowledge check and formula verification",
                  duration: "6m",
                  status: "scheduled",
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-panel border border-line flex items-start gap-2.5 text-xs"
                >
                  <div className="w-4 h-4 rounded border border-white/20 mt-0.5 shrink-0 flex items-center justify-center">
                    {idx === 0 && <div className="w-2 h-2 rounded bg-indigo-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-indigo-300">{t.day}</span>
                      <span className="text-[10px] text-muted font-mono">{t.duration}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-snug truncate">{t.task}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/revision">
              <Button variant="outline" size="sm" className="w-full mt-1">
                Launch Revision Planner
              </Button>
            </Link>
          </div>

          {/* Core Grounded Capabilities */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface border border-line space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Autonomous Study Modules
            </h3>
            <div className="space-y-2">
              <Link
                href="/tutor"
                className="p-3 rounded-lg bg-panel border border-line hover:border-white/20 block transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Brain size={15} className="text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Grounded AI Tutor</span>
                  </div>
                  <ChevronRight size={13} className="text-slate-500" />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  100% document-bounded answers with verified citations and quotes.
                </p>
              </Link>

              <Link
                href="/visuals"
                className="p-3 rounded-lg bg-panel border border-line hover:border-white/20 block transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Box size={15} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-white">3D Spatial Studio</span>
                  </div>
                  <ChevronRight size={13} className="text-slate-500" />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Interactive HTML5 Canvas vector models powered by Dual-Coding science.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
