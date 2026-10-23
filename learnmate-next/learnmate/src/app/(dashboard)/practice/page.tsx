"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Award,
  AlertTriangle,
  BookmarkCheck,
  BookOpen,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { demoQuestions, sampleText } from "@/lib/demo";
import { recordQuizAttempt } from "@/lib/userStats";
import type { Question } from "@/lib/types";

interface MaterialOption {
  id: string;
  name: string;
  pages?: number;
  text?: string;
  topics?: Array<{ id: string; name: string }>;
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const initialMaterialId = searchParams.get("materialId");
  const { user } = useAuth();

  const [availableMaterials, setAvailableMaterials] = useState<MaterialOption[]>([
    {
      id: "bio-ch7",
      name: "Introduction to Cell Biology & Energy Synthesis.pdf",
      pages: 5,
      text: sampleText,
      topics: [
        { id: "t1", name: "Cell Membrane & Transport" },
        { id: "t2", name: "Mitochondria & Chemiosmosis" },
        { id: "t3", name: "Ribosomes & Protein Packaging" },
        { id: "t4", name: "Plant vs Animal Cells" },
      ],
    },
  ]);

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("bio-ch7");
  const [activeDocTitle, setActiveDocTitle] = useState("Introduction to Cell Biology & Energy Synthesis.pdf");
  const [activeDocText, setActiveDocText] = useState(sampleText);
  const [activeDocTopics, setActiveDocTopics] = useState<string[]>([
    "Cell Membrane",
    "Mitochondria",
    "Ribosomes",
    "Chloroplasts",
  ]);

  const [questions, setQuestions] = useState<Question[]>(demoQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(demoQuestions.length).fill(-1)
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizKind, setQuizKind] = useState<"diagnostic" | "practice">("diagnostic");
  const [lastScore, setLastScore] = useState<{ score: number; total: number; pct: number } | null>(null);

  // Load uploaded materials from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          const userMats: MaterialOption[] = list.map((m: any) => ({
            id: m.id || `doc-${Date.now()}-${Math.random()}`,
            name: m.name || "Uploaded Study Document",
            pages: m.pages || 1,
            text: m.text || "",
            topics: Array.isArray(m.topics) ? m.topics : [],
          }));

          setAvailableMaterials((prev) => {
            const ids = new Set(userMats.map((u) => u.id));
            const merged = [...userMats, ...prev.filter((p) => !ids.has(p.id))];
            return merged;
          });

          // Check if an initialMaterialId was requested via query parameter
          const target = initialMaterialId
            ? userMats.find((m) => m.id === initialMaterialId) || userMats[0]
            : userMats[0];

          if (target) {
            setSelectedMaterialId(target.id);
            setActiveDocTitle(target.name);
            if (target.text) setActiveDocText(target.text);
            if (target.topics && target.topics.length > 0) {
              setActiveDocTopics(target.topics.map((t) => t.name));
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not load materials for quiz:", e);
    }
  }, [initialMaterialId]);

  const handleSelectMaterial = (mat: MaterialOption) => {
    setSelectedMaterialId(mat.id);
    setActiveDocTitle(mat.name);
    const textToUse = mat.text || sampleText;
    setActiveDocText(textToUse);
    if (mat.topics && mat.topics.length > 0) {
      setActiveDocTopics(mat.topics.map((t) => t.name));
    } else {
      setActiveDocTopics(["Core Concepts", "Structural Mechanics", "Operational Workflow"]);
    }
    // Auto-generate fresh personalized quiz for this specific material
    generateRealtimeQuiz(textToUse, mat.name, "diagnostic");
  };

  const generateRealtimeQuiz = async (
    textToUse: string,
    title: string,
    kind: "diagnostic" | "practice" = "diagnostic"
  ) => {
    setLoading(true);
    setSubmitted(false);
    setCurrentIdx(0);
    setQuizKind(kind);
    setLastScore(null);

    try {
      let weakList: string[] = [];
      try {
        const rawWeak = localStorage.getItem("learnmate_weak_topics");
        if (rawWeak) weakList = JSON.parse(rawWeak);
      } catch {}

      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: kind === "practice" ? "practice" : "quiz",
          text: textToUse || sampleText,
          weakTopics: weakList.length ? weakList : ["Core Definitions", "Mechanisms", "Applications"],
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      } else {
        // Fallback demo questions
        setQuestions(demoQuestions);
        setSelectedAnswers(new Array(demoQuestions.length).fill(-1));
      }
    } catch (err) {
      console.warn("Could not generate realtime quiz:", err);
      setQuestions(demoQuestions);
      setSelectedAnswers(new Array(demoQuestions.length).fill(-1));
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (optIdx: number) => {
    if (submitted) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce(
      (sum, a, i) => sum + (a === questions[i]?.correctIndex ? 1 : 0),
      0
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    setLastScore({ score, total, pct });

    const missed = questions
      .filter((q, i) => selectedAnswers[i] !== q.correctIndex)
      .map((q) => q.topic);

    // 1. Record quiz attempt in user stats
    recordQuizAttempt(user?.email, {
      materialTitle: activeDocTitle,
      score,
      total,
      weakTopics: missed,
    });

    // 2. Save weak topics for Revision Planner
    try {
      localStorage.setItem(
        "learnmate_weak_topics",
        JSON.stringify(missed.length ? missed : ["General Mastery Verified"])
      );
      localStorage.setItem(
        "learnmate_last_quiz",
        JSON.stringify({
          score,
          total,
          pct,
          weakTopics: missed,
          materialTitle: activeDocTitle,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not save weak topics:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Personalized Knowledge Assessment
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Gemini Realtime Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic & Practice Quizzes
          </h1>
          <p className="text-xs text-muted mt-1">
            Generate questions specifically synthesized from any uploaded PDF in your library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generateRealtimeQuiz(activeDocText, activeDocTitle, "diagnostic")}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Generate New Quiz</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateRealtimeQuiz(activeDocText, activeDocTitle, "practice")}
            disabled={loading}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Weak Topics Quiz</span>
          </Button>
        </div>
      </div>

      {/* ── Material Selector Pills (Choose ANY Uploaded PDF) ──── */}
      <div className="p-4 rounded-2xl bg-panel border border-line space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <BookOpen size={14} className="text-violet" />
            Select Material to Quiz:
          </span>
          <Link href="/library" className="text-2xs text-violet hover:underline flex items-center gap-1">
            Upload another PDF <ChevronRight size={12} />
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {availableMaterials.map((m) => {
            const isSelected = m.id === selectedMaterialId;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMaterial(m)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-indigo-600 text-white border border-indigo-400/40 shadow-sm"
                    : "bg-surface border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20"
                }`}
              >
                <FileText size={14} className={isSelected ? "text-emerald-300" : "text-slate-400"} />
                <span className="truncate max-w-[200px]">{m.name}</span>
                {m.pages && (
                  <span className="text-2xs font-mono opacity-60">
                    ({m.pages} {m.pages === 1 ? "pg" : "pgs"})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Material Context Bar ──────────────────────── */}
      <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-line flex flex-wrap items-center justify-between gap-2 text-2xs text-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Active Material:</span>
          <span className="text-violet-bright font-mono font-bold">{activeDocTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Detected Topics:</span>
          {activeDocTopics.slice(0, 3).map((topic, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-panel border border-line text-slate-300 font-mono"
            >
              {topic}
            </span>
          ))}
          {activeDocTopics.length > 3 && (
            <span className="text-slate-400 font-mono">+{activeDocTopics.length - 3} more</span>
          )}
        </div>
      </div>

      {/* ── Loading State ────────────────────────────────────── */}
      {loading ? (
        <Card className="p-12 text-center space-y-4">
          <RefreshCw size={32} className="mx-auto text-violet animate-spin" />
          <h3 className="text-sm font-bold text-white">Synthesizing Realtime Quiz with Gemini...</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Analyzing "{activeDocTitle}" to construct personalized diagnostic questions with evidence grounding.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Column */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-6 space-y-6">
              {/* Question Navigation Bar */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-violet/20 border border-violet/30 text-violet-bright font-mono font-bold text-xs">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <Badge variant="slate">{currentQ?.topic || "Core Concept"}</Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  {questions.map((_, i) => {
                    const isAnswered = selectedAnswers[i] !== -1;
                    const isCurrent = i === currentIdx;
                    let dotStyle = "bg-line text-slate-400";

                    if (submitted) {
                      const isCorrect = selectedAnswers[i] === questions[i].correctIndex;
                      dotStyle = isCorrect ? "bg-mint text-ink font-bold" : "bg-rose-500 text-white font-bold";
                    } else if (isCurrent) {
                      dotStyle = "bg-indigo-600 text-white font-medium border border-indigo-400/50 shadow-sm";
                    } else if (isAnswered) {
                      dotStyle = "bg-white/[0.08] text-white border border-white/[0.08]";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIdx(i)}
                        className={`w-7 h-7 rounded-lg text-2xs font-mono transition-all flex items-center justify-center ${dotStyle}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ?.prompt}
                </h3>
                {currentQ?.page && (
                  <span className="text-2xs text-muted font-mono flex items-center gap-1">
                    <BookmarkCheck size={12} className="text-violet-bright" />
                    Source Grounding: Page {currentQ.page} of {activeDocTitle}
                  </span>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQ?.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;

                  let style = "bg-surface border-line text-slate-300 hover:border-slate-600";
                  if (submitted) {
                    if (isCorrect) style = "bg-mint/20 border-mint text-mint font-semibold shadow-sm";
                    else if (isSelected && !isCorrect)
                      style = "bg-rose-500/20 border-rose-500 text-rose-300";
                    else style = "opacity-45 border-line";
                  } else if (isSelected) {
                    style = "bg-indigo-600/10 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/20";
                  }

                  const letter = ["A", "B", "C", "D"][optIdx] || String(optIdx + 1);

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-panel border border-line text-slate-300 font-mono font-bold text-2xs flex items-center justify-center shrink-0">
                          {letter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {submitted && isCorrect && (
                        <CheckCircle2 size={16} className="text-mint shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Rationale & Explanation (Shown on submission) */}
              {submitted && currentQ?.explanation && (
                <div className="p-4 rounded-xl bg-surface border border-white/[0.08] text-slate-300 text-xs space-y-1.5 animate-fade-in shadow-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Evidence-Based Explanation:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{currentQ.explanation}</p>
                </div>
              )}

              {/* Bottom Navigation & Submit Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentIdx < questions.length - 1 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    >
                      Next Question <ChevronRight size={14} />
                    </Button>
                  ) : !submitted ? (
                    <Button
                      size="sm"
                      disabled={selectedAnswers.includes(-1)}
                      onClick={handleSubmit}
                    >
                      Submit Quiz & Save Weak Topics
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => generateRealtimeQuiz(activeDocText, activeDocTitle, "diagnostic")}
                    >
                      Take Fresh Quiz
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Quiz Summary, Results & Revision Bridge */}
          <div className="lg:col-span-4 space-y-6">
            {submitted && lastScore ? (
              <Card className="p-5 space-y-4 border-violet/40 bg-gradient-to-b from-panel via-surface to-panel">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-amber-400" />
                    Quiz Score Result
                  </h3>
                  <Badge variant={lastScore.pct >= 70 ? "mint" : "violet"}>
                    {lastScore.pct}% Score
                  </Badge>
                </div>

                <div className="text-center py-2">
                  <div className="text-3xl font-extrabold text-white">
                    {lastScore.score} / {lastScore.total}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {lastScore.pct >= 80
                      ? "Outstanding comprehension of this document!"
                      : lastScore.pct >= 60
                      ? "Good foundational progress. Review weak points below."
                      : "Targeted revision recommended for low-scoring topics."}
                  </p>
                </div>

                {/* Weak Topics List */}
                <div className="space-y-2 pt-2 border-t border-line">
                  <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Flagged Weak Topics:
                  </span>
                  {questions
                    .filter((q, i) => selectedAnswers[i] !== q.correctIndex)
                    .map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium">{q.topic}</span>
                        <span className="text-2xs font-mono">Q{questions.indexOf(q) + 1}</span>
                      </div>
                    ))}
                </div>

                <Link href="/revision" className="block pt-2">
                  <Button size="sm" className="w-full">
                    <span>Open Spaced Revision Plan</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Target size={14} className="text-mint" />
                  Assessment Guide
                </h3>
                <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-violet/20 text-violet-bright font-mono text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Each quiz is synthesized live by Gemini using content from{" "}
                      <strong>{activeDocTitle}</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-violet/20 text-violet-bright font-mono text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Any question you answer incorrectly automatically updates your{" "}
                      <strong>Weak Topics Matrix</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-violet/20 text-violet-bright font-mono text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Weak topics feed directly into your 3-Day Spaced Repetition Revision Schedule.
                    </span>
                  </li>
                </ul>
              </Card>
            )}

            {/* Quick Links */}
            <Card className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Study Next
              </h3>
              <div className="space-y-2">
                <Link
                  href="/tutor"
                  className="p-3 rounded-xl bg-surface border border-line hover:border-violet/40 block transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Sparkles size={14} className="text-violet" />
                      Ask Tutor about {activeDocTitle.slice(0, 18)}...
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </Link>
                <Link
                  href="/visuals"
                  className="p-3 rounded-xl bg-surface border border-line hover:border-mint/40 block transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Layers size={14} className="text-mint" />
                      View 3D Spatial Models
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted text-sm">Loading practice quiz...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
