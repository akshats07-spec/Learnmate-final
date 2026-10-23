"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Target,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buildTasks } from "@/lib/demo";
import type { RevisionTask } from "@/lib/types";

export default function RevisionPage() {
  const [weakTopics, setWeakTopics] = useState<string[]>(["Organelles", "Energy processes"]);
  const [docTitle, setDocTitle] = useState<string>("Cell Biology & Energetics");
  const [tasks, setTasks] = useState<RevisionTask[]>(buildTasks(["Organelles", "Energy processes"]));
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("Tasks dynamically prioritized around your diagnosed weak topics.");

  useEffect(() => {
    try {
      const savedWeak = localStorage.getItem("learnmate_weak_topics");
      let activeWeak = ["Organelles", "Energy processes"];
      if (savedWeak) {
        const parsed = JSON.parse(savedWeak);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeWeak = parsed;
          setWeakTopics(parsed);
        }
      }

      const savedMats = localStorage.getItem("learnmate_materials");
      let activeText = "";
      if (savedMats) {
        const list = JSON.parse(savedMats);
        if (Array.isArray(list) && list.length > 0) {
          if (list[0].name) setDocTitle(list[0].name);
          if (list[0].text) activeText = list[0].text;
        }
      }

      // Generate dynamic plan if we have text and weak topics
      if (activeText && activeWeak.length > 0) {
        fetchPlan(activeText, activeWeak);
      } else {
        setTasks(buildTasks(activeWeak));
      }
    } catch (e) {
      console.warn("Could not load weak topics for revision:", e);
    }
  }, []);

  const fetchPlan = async (text: string, topicsToRevise: string[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revise",
          text,
          weakTopics: topicsToRevise,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        if (data.plan.summary) setSummary(data.plan.summary);
        if (Array.isArray(data.plan.days)) {
          const generatedTasks: RevisionTask[] = [];
          data.plan.days.forEach((d: any) => {
            if (Array.isArray(d.tasks)) {
              d.tasks.forEach((t: any, idx: number) => {
                generatedTasks.push({
                  id: `rev-${d.day}-${idx}-${Date.now()}`,
                  topic: t.topic || topicsToRevise[0] || "Review",
                  title: t.title || "Targeted Concept Review",
                  detail: t.detail || "Review core notes and verify formula citations.",
                  minutes: t.minutes || 5,
                  done: false,
                });
              });
            }
          });
          if (generatedTasks.length > 0) {
            setTasks(generatedTasks);
            return;
          }
        }
      }
      setTasks(buildTasks(topicsToRevise));
    } catch {
      setTasks(buildTasks(topicsToRevise));
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  // Divide tasks across 3 days
  const day1Tasks = tasks.slice(0, Math.ceil(tasks.length / 3));
  const day2Tasks = tasks.slice(Math.ceil(tasks.length / 3), Math.ceil((tasks.length * 2) / 3));
  const day3Tasks = tasks.slice(Math.ceil((tasks.length * 2) / 3));

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Adaptive Revision Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <Badge variant="mint" className="text-2xs py-0">
              <BookOpen size={10} className="mr-1" /> {docTitle}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalised Spaced Revision Plan
          </h1>
          <p className="text-xs text-muted mt-1 max-w-xl">
            {summary}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/practice">
            <Button size="sm">
              <Target size={14} /> Practice Weak Spots
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Diagnosed Mistakes Banner ─────────────────────────── */}
      <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-amber-200">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div>
            <strong className="text-white block font-medium">Diagnosed Mistakes From Your Recent Quiz:</strong>
            <span className="text-2xs text-amber-300/80">
              {weakTopics.join(" • ")}
            </span>
          </div>
        </div>
        <Link href="/practice">
          <Button variant="ghost" size="sm" className="text-amber-200 hover:text-white shrink-0 border border-amber-500/30">
            Retake Quiz
          </Button>
        </Link>
      </div>

      {/* ── Progress Card ─────────────────────────────────────── */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Revision Completion Rate
          </span>
          <div className="text-xl font-bold text-white">
            {completedCount} of {tasks.length} Tasks Completed ({progressPct}%)
          </div>
        </div>

        <div className="w-full sm:w-64 bg-surface rounded-full h-2 border border-white/[0.08] overflow-hidden">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </Card>

      {/* ── Daily Schedule Breakdown ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            day: "Day 1 (Immediate Review)",
            duration: "15 mins",
            focus: weakTopics[0] || "Foundational Recall",
            tasks: day1Tasks,
          },
          {
            day: "Day 2 (Active Recall)",
            duration: "12 mins",
            focus: weakTopics[1] || weakTopics[0] || "Targeted Mechanism",
            tasks: day2Tasks,
          },
          {
            day: "Day 3 (Consolidation)",
            duration: "10 mins",
            focus: "Full Mastery Retake",
            tasks: day3Tasks,
          },
        ].map((daySchedule, dIdx) => (
          <Card key={dIdx} className="p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-xs font-bold text-violet uppercase">{daySchedule.day}</span>
                <span className="text-2xs text-muted font-mono">{daySchedule.duration}</span>
              </div>

              <p className="text-2xs text-muted font-medium">Focus: {daySchedule.focus}</p>

              <div className="space-y-2">
                {daySchedule.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleDone(task.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                      task.done
                        ? "bg-mint/10 border-mint/30 text-slate-400 line-through opacity-70"
                        : "bg-surface border-line text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {task.done ? (
                      <CheckSquare size={16} className="text-mint shrink-0 mt-0.5" />
                    ) : (
                      <Square size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-white leading-snug">{task.title}</strong>
                      <span className="text-2xs text-muted block mt-0.5">{task.detail}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-2xs text-muted">
              Estimated study time: {daySchedule.duration}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
