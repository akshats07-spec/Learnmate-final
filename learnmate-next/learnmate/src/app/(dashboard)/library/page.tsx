"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Upload,
  FileText,
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RefreshCw,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Brain,
  Box,
  Target,
  Send,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface MaterialItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "text";
  pages: number;
  topicsCount: number;
  mastery: number;
  uploadedAt: string;
  lastStudied: string;
  status: "ready" | "processing" | "failed";
  text?: string;
  topics?: any[];
  userPrompt?: string;
  customResponse?: string;
}

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: "bio-ch7",
    name: "Introduction to Cell Biology & Energy Synthesis.pdf",
    type: "pdf",
    pages: 5,
    topicsCount: 4,
    mastery: 68,
    uploadedAt: "Today, 10:15 AM",
    lastStudied: "2 hours ago",
    status: "ready",
  },
  {
    id: "physics-optics",
    name: "Ray Optics & Thin Lens Diagrams.png",
    type: "image",
    pages: 1,
    topicsCount: 3,
    mastery: 45,
    uploadedAt: "Yesterday",
    lastStudied: "Yesterday",
    status: "ready",
  },
];

const PROMPT_SUGGESTIONS = [
  "⚡ Quick Executive Summary",
  "🔑 Key Formulas & Definitions",
  "❓ Top 5 Likely Exam Questions",
  "💡 Explain Like I'm 5 (ELIF)",
  "🎯 5-Question Diagnostic Quiz",
  "🧊 Create 3D Spatial Model",
];

export default function LibraryPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "image">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("Quick Executive Summary");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  // ChatGPT-style active quick response state
  const [quickResult, setQuickResult] = useState<{
    id: string;
    title: string;
    prompt: string;
    content: string;
    pages: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's saved materials from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p: any) => p.id));
          const combined = [...parsed, ...INITIAL_MATERIALS.filter((m) => !ids.has(m.id))];
          setMaterials(combined);
        }
      }
    } catch (err) {
      console.warn("Could not load materials from storage:", err);
    }
  }, []);

  const handleFileUpload = async (file: File, explicitPrompt?: string) => {
    if (!file) return;
    setUploadNotice(null);
    setUploading(true);
    const promptToSend = explicitPrompt || userPrompt || "Quick Executive Summary";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userPrompt", promptToSend);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const topics = data.topics || [];
      const newId = `doc-${Date.now()}`;
      const docTitle = data.title || file.name;

      const newItem: MaterialItem = {
        id: newId,
        name: docTitle,
        type: file.type.includes("pdf") ? "pdf" : "image",
        pages: data.pageCount || 1,
        topicsCount: topics.length || 3,
        mastery: 20,
        uploadedAt: "Just now",
        lastStudied: "Just now",
        status: "ready",
        text: data.text || "",
        topics: topics,
        userPrompt: promptToSend,
        customResponse: data.customResponse,
      };

      setMaterials((prev) => {
        const updated = [newItem, ...prev];
        try {
          localStorage.setItem("learnmate_materials", JSON.stringify(updated));
          localStorage.setItem(`learnmate_doc_${newId}`, JSON.stringify(newItem));
        } catch (e) {
          console.warn("Storage quota exceeded:", e);
        }
        return updated;
      });

      // Display ChatGPT-style Instant Result Drawer
      if (data.customResponse) {
        setQuickResult({
          id: newId,
          title: docTitle,
          prompt: promptToSend,
          content: data.customResponse,
          pages: data.pageCount || 1,
        });
      }

      setUploadNotice(
        `Successfully analyzed "${docTitle}" (${data.pageCount || 1} pages)! Your ${promptToSend.toLowerCase()} is ready below.`
      );
    } catch (err: any) {
      setUploadNotice(err.message || "Upload failed. Please try a text PDF or image under 12 MB.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string) => {
    setMaterials((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem("learnmate_materials", JSON.stringify(updated));
        localStorage.removeItem(`learnmate_doc_${id}`);
      } catch (e) {}
      return updated;
    });
    if (quickResult?.id === id) setQuickResult(null);
  };

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || m.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Smart Ingestion Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Document Prompting & Quick Summaries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Study Library
          </h1>
          <p className="text-xs text-muted mt-1">
            Upload any textbook, lecture slides, or PDF and specify what you need — from quick summaries to exam prep.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-glow-sm"
        >
          <Upload size={14} />
          <span>Upload PDF or Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }}
        />
      </div>

      {/* ── ChatGPT-Style Prompt & Upload Box ─────────────────── */}
      <Card className="p-6 border-violet/30 bg-gradient-to-b from-panel via-surface/60 to-panel space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              What do you want LearnMate to do with your document?
            </h3>
          </div>
          <Badge variant="mint">ChatGPT-Style Prompting</Badge>
        </div>

        {/* Prompt Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g. Give me a quick executive summary with 5 key bullet points, or explain chapter 2..."
            className="w-full pl-4 pr-32 py-3 rounded-2xl bg-ink/80 border border-line focus:border-violet text-xs text-white placeholder-slate-500 transition-all shadow-inner"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-violet hover:bg-violet-bright text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {uploading ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            <span>Select PDF</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-2xs text-muted font-medium shrink-0">Quick Actions:</span>
          {PROMPT_SUGGESTIONS.map((sug, idx) => {
            const cleanText = sug.replace(/^[^a-zA-Z0-9]+/, "").trim();
            const isSelected = userPrompt.toLowerCase().includes(cleanText.toLowerCase());

            return (
              <button
                key={idx}
                onClick={() => setUserPrompt(cleanText)}
                className={`px-3 py-1.5 rounded-xl text-2xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-violet text-white border-violet shadow-sm"
                    : "bg-panel/70 border-line text-slate-300 hover:text-white hover:border-slate-500"
                }`}
              >
                {sug}
              </button>
            );
          })}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFileUpload(f);
          }}
          className="p-6 rounded-2xl border-2 border-dashed border-line hover:border-violet/60 bg-ink/30 hover:bg-ink/50 transition-all text-center cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/20 text-violet-bright flex items-center justify-center mx-auto">
            {uploading ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {uploading
                ? `Gemini is processing your document & generating "${userPrompt}"...`
                : "Drop PDF or image here to upload with this instruction"}
            </h4>
            <p className="text-2xs text-muted mt-0.5">
              Supports text PDFs, lecture notes, PNG, and JPG up to 20 pages (12 MB max).
            </p>
          </div>
        </div>
      </Card>

      {/* ── ChatGPT-Style Quick Result Card (Generated on Upload) ──── */}
      {quickResult && (
        <Card className="p-6 border-mint/40 bg-gradient-to-b from-panel via-surface to-panel space-y-4 animate-fade-in shadow-glow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-mint/20 border border-mint/40 text-mint text-2xs font-mono font-bold flex items-center gap-1">
                  <Sparkles size={11} /> Instant AI Synthesis
                </span>
                <span className="text-2xs text-muted font-mono">&bull; {quickResult.pages} Pages</span>
              </div>
              <h3 className="text-base font-bold text-white">{quickResult.title}</h3>
              <p className="text-2xs text-violet-bright font-mono mt-0.5">
                Instruction: "{quickResult.prompt}"
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(quickResult.content)}
                className="text-xs"
              >
                {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
              <button
                onClick={() => setQuickResult(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-panel"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="p-4 rounded-2xl bg-ink/70 border border-line text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal space-y-2">
            {quickResult.content}
          </div>

          {/* Action Bridge: Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <Link href={`/tutor?topic=${encodeURIComponent(quickResult.title)}`}>
              <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-xs">
                <Brain size={14} className="text-violet" />
                <span>Ask AI Tutor More</span>
              </Button>
            </Link>
            <Link href={`/practice?materialId=${quickResult.id}`}>
              <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-xs">
                <Target size={14} className="text-mint" />
                <span>Take Diagnostic Quiz</span>
              </Button>
            </Link>
            <Link href={`/visuals?topic=${encodeURIComponent(quickResult.title)}`}>
              <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-xs">
                <Box size={14} className="text-amber-400" />
                <span>Generate 3D Model</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Upload notice */}
      {uploadNotice && (
        <div className="p-3.5 rounded-xl bg-violet-dim/20 border border-violet/30 text-violet-bright text-xs flex items-center gap-2">
          <Sparkles size={16} />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* ── Search & Filter Controls ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-panel border border-line">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs text-muted font-medium flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {(["all", "pdf", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all uppercase text-2xs ${
                filterType === t
                  ? "bg-violet text-white shadow-sm"
                  : "bg-surface border border-line text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Materials List / Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => {
          const isPdf = mat.type === "pdf";

          return (
            <Card key={mat.id} className="p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-surface border border-line text-violet">
                      {isPdf ? <FileText size={18} /> : <ImageIcon size={18} />}
                    </div>
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold tracking-wider">
                        {isPdf ? `${mat.pages} Pages` : "Image Note"} &bull; {mat.topicsCount} Topics
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{mat.name}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    title="Delete material"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Mastery progress */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-2xs">
                    <span className="text-muted">Mastery Retention:</span>
                    <span className="font-mono font-bold text-white">{mat.mastery}%</span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-violet to-mint h-1.5 rounded-full"
                      style={{ width: `${mat.mastery}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-2xs text-muted mt-3 pt-3 border-t border-line/60">
                  <span>Uploaded: {mat.uploadedAt}</span>
                  <span>&bull;</span>
                  <span>Studied: {mat.lastStudied}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/practice?materialId=${mat.id}`}>
                    <Button size="sm" className="w-full justify-center text-xs">
                      <span>Take Quiz</span>
                    </Button>
                  </Link>
                  <Link href={`/visuals?topic=${encodeURIComponent(mat.name)}`}>
                    <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                      <span>3D Model</span>
                    </Button>
                  </Link>
                </div>
                <Link href={`/library/${mat.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                    <span>Open Learning Workspace</span>
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
