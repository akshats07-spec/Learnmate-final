"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Brain,
  Send,
  User,
  Bot,
  AlertTriangle,
  BookmarkCheck,
  Quote,
  Sparkles,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Mic,
  MicOff,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { sampleText } from "@/lib/demo";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  found?: boolean;
  page?: number | null;
  evidence?: string;
  nextStep?: string;
  timestamp: string;
}

function TutorContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic");

  const [activeDocTitle, setActiveDocTitle] = useState("Introduction to Cell Biology (5 Pages)");
  const [activeDocText, setActiveDocText] = useState(sampleText);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      sender: "ai",
      text: initialTopic
        ? `I am ready to explain "${initialTopic}". Ask any question and I will answer with verified evidence and page citations from your document.`
        : "Hello. I am your LearnMate Grounded AI Tutor. I answer questions strictly using facts from your uploaded study material. If a question is outside the text, I will explicitly flag it as unavailable.",
      found: true,
      page: null,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState(initialTopic ? `Explain ${initialTopic} in simple terms` : "");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          let matched = list[0];
          if (initialTopic) {
            const found = list.find((m: any) =>
              m.topics?.some((t: any) => t.name.toLowerCase().includes(initialTopic.toLowerCase()))
            );
            if (found) matched = found;
          }

          if (matched && matched.text) {
            setActiveDocTitle(`${matched.name} (${matched.pages || 1} ${matched.pages === 1 ? "Page" : "Pages"})`);
            setActiveDocText(matched.text);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load active doc for tutor:", e);
    }
  }, [initialTopic]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain",
          text: activeDocText || sampleText,
          question: q,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.result?.answer || "Explanation complete.",
        found: data.result?.found ?? true,
        page: data.result?.page ?? null,
        evidence: data.result?.evidence || "",
        nextStep: data.result?.nextStep || "Ask another question about this chapter.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "I experienced a momentary connection pause. Please try asking again!",
          found: true,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              AI Workspace &bull; Grounded Tutoring
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-mono">Bound to Source</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Grounded AI Tutor
          </h1>
          <p className="text-xs text-muted mt-1">
            Answers are strictly constrained to facts stated in your uploaded material.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-surface px-3 py-1.5 rounded-lg border border-line flex items-center gap-2">
            <BookOpen size={13} className="text-indigo-400 shrink-0" />
            <span className="truncate max-w-[240px]">{activeDocTitle}</span>
          </span>
        </div>
      </div>

      {/* ── Chat Container (Claude / ChatGPT Enterprise Layout) ─── */}
      <div className="rounded-xl bg-surface border border-line overflow-hidden flex flex-col h-[620px] shadow-sm">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === "ai";

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-lg bg-panel border border-line text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    isAi
                      ? m.found === false
                        ? "bg-rose-500/10 border border-rose-500/25 text-rose-200"
                        : "bg-panel border border-line text-slate-200"
                      : "bg-white/[0.08] text-white border border-white/[0.1] shadow-sm"
                  }`}
                >
                  {/* Out of scope warning */}
                  {isAi && m.found === false && (
                    <div className="p-2 rounded bg-rose-500/15 text-rose-300 font-medium text-[11px] flex items-center gap-1.5 border border-rose-500/20">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>FACT UNAVAILABLE IN UPLOADED MATERIAL</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line text-slate-200">{m.text}</p>

                  {/* Grounded Citation */}
                  {isAi && m.found && m.page && (
                    <div className="pt-2 border-t border-line flex items-center gap-1.5 text-[11px] text-indigo-300 font-mono">
                      <BookmarkCheck size={12} className="text-indigo-400" />
                      <span>Verified Citation: Page {m.page}</span>
                    </div>
                  )}

                  {/* Direct Quoted Evidence */}
                  {isAi && m.evidence && (
                    <blockquote className="text-[11px] text-slate-400 italic bg-ink/70 p-2.5 rounded border border-line flex items-start gap-2">
                      <Quote size={12} className="text-slate-500 shrink-0 mt-0.5" />
                      <span>"{m.evidence}"</span>
                    </blockquote>
                  )}

                  {/* Next Step / Suggested Query */}
                  {isAi && m.nextStep && (
                    <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500">Recommendation:</span>
                      <span className="text-slate-300">{m.nextStep}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-right text-slate-500">{m.timestamp}</div>
                </div>

                {!isAi && (
                  <div className="w-7 h-7 rounded-lg bg-panel border border-line text-slate-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-panel border border-line text-indigo-400 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="p-3 rounded-xl bg-panel border border-line text-xs text-muted flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-indigo-400" />
                <span>Searching source documents and verifying evidence...</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 bg-panel border-t border-line">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to voice input... speak clearly now..."
                  : "Ask anything about this document (or use mic)..."
              }
              className={`input-base text-xs sm:text-sm py-2 px-3 rounded-lg transition-all ${
                isListening
                  ? "border-rose-500 bg-rose-500/10 placeholder:text-rose-300"
                  : ""
              }`}
            />

            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                  : "bg-surface border-line text-slate-400 hover:text-white hover:border-white/20"
              }`}
              title={isListening ? "Stop voice typing" : "Voice dictation"}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <Button
              type="submit"
              disabled={!input.trim() || loading}
              size="sm"
              className="px-3.5 h-9"
            >
              <Send size={14} />
            </Button>
          </form>

          {/* Preset Questions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-slate-500">Suggested queries:</span>
            {[
              "Explain mitochondria in simple terms",
              "What is the difference between plant and animal cells?",
              "What is quantum entanglement? (Out-of-scope test)",
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="text-[11px] px-2.5 py-1 rounded bg-surface border border-line text-slate-300 hover:text-white hover:border-white/20 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted text-sm">Loading tutor workspace...</div>}>
      <TutorContent />
    </Suspense>
  );
}
