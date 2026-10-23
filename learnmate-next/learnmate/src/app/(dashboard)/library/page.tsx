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
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Brain,
  Box,
  Target,
  Sparkles,
  Command,
  FileCode,
  ArrowRight,
  X,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
  "Executive Summary",
  "Key Formulas & Definitions",
  "Top 5 Likely Exam Questions",
  "Explain Like I'm 5 (ELIF)",
  "5-Question Diagnostic Quiz",
  "3D Spatial Model",
];

export default function LibraryPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "image">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("Executive Summary");
  const [copied, setCopied] = useState(false);

  // Active quick response state
  const [quickResult, setQuickResult] = useState<{
    id: string;
    title: string;
    prompt: string;
    content: string;
    pages: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const promptToSend = explicitPrompt || userPrompt || "Executive Summary";

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
        `Successfully indexed "${docTitle}" (${data.pageCount || 1} pages). Synthesis available below.`
      );
    } catch (err: any) {
      setUploadNotice(err.message || "Upload failed. Please upload a PDF, text, or image file under 12 MB.");
    } finally {
      setUploading(false);
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* ── 1. Clean Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Workspace &bull; Document Ingestion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Study Material Library
          </h1>
          <p className="text-xs text-muted mt-1">
            Upload lecture notes, PDFs, and textbooks with custom AI instructions.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload size={14} />
          <span>Upload Document</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }}
        />
      </div>

      {/* ── 2. Command-Bar Ingestion Interface (Raycast Style) ─── */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Command size={14} className="text-indigo-400" />
            <span>Document Ingestion Instruction</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Powered by Gemini
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Executive Summary, Key Formulas, 5-Question Diagnostic Quiz..."
              className="w-full pl-3.5 pr-4 py-2.5 rounded-lg bg-panel border border-line focus:border-indigo-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shrink-0"
          >
            {uploading ? (
              <RefreshCw size={13} className="animate-spin text-indigo-400" />
            ) : (
              <Upload size={13} />
            )}
            <span>{uploading ? "Ingesting..." : "Select File & Process"}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
          {PROMPT_SUGGESTIONS.map((sug, idx) => {
            const isSelected = userPrompt.toLowerCase() === sug.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setUserPrompt(sug)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white border border-indigo-500"
                    : "bg-panel text-slate-300 border border-line hover:border-white/20 hover:text-white"
                }`}
              >
                {sug}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Message */}
      {uploadNotice && (
        <div className="p-3 rounded-lg bg-panel border border-line text-xs flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── 3. Generated Synthesis Drawer ─────────────────────── */}
      {quickResult && (
        <div className="p-5 sm:p-6 rounded-xl bg-surface border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {quickResult.prompt}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {quickResult.pages} {quickResult.pages === 1 ? "page" : "pages"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {quickResult.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(quickResult.content)}
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={() => setQuickResult(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="p-4 rounded-lg bg-panel border border-line text-xs text-slate-200 leading-relaxed max-h-96 overflow-y-auto space-y-2 whitespace-pre-line font-sans">
            {quickResult.content}
          </div>

          {/* Integrated Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link href={`/library/${quickResult.id}`}>
              <Button size="sm">
                Open Full Workspace <ArrowRight size={13} />
              </Button>
            </Link>
            <Link href="/tutor">
              <Button variant="secondary" size="sm">
                <Brain size={13} /> Ask Tutor About This
              </Button>
            </Link>
            <Link href={`/practice?materialId=${quickResult.id}`}>
              <Button variant="secondary" size="sm">
                <Target size={13} /> Take Diagnostic Quiz
              </Button>
            </Link>
            <Link href="/visuals">
              <Button variant="ghost" size="sm">
                <Box size={13} /> Open 3D Model
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── 4. Document List & Filter Section ─────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-line">
            {[
              { id: "all", label: "All Documents" },
              { id: "pdf", label: "PDFs" },
              { id: "image", label: "Images" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterType === tab.id
                    ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.06]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface border border-line text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="p-4 sm:p-5 rounded-xl bg-surface border border-line hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-panel border border-line flex items-center justify-center shrink-0">
                      {mat.type === "pdf" ? (
                        <FileText size={16} className="text-indigo-400" />
                      ) : (
                        <ImageIcon size={16} className="text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                        {mat.name}
                      </h4>
                      <span className="text-[11px] text-muted font-mono block">
                        {mat.pages} {mat.pages === 1 ? "page" : "pages"} &bull; {mat.topicsCount} topics
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {mat.userPrompt && (
                  <div className="p-2 rounded bg-panel border border-line text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Prompt: {mat.userPrompt}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between">
                <span className="text-[10px] text-muted">
                  Indexed: {mat.uploadedAt}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link href={`/library/${mat.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5">
                      Open <ChevronRight size={12} />
                    </Button>
                  </Link>
                  <Link href={`/practice?materialId=${mat.id}`}>
                    <Button size="sm" variant="secondary" className="h-7 text-xs px-2.5">
                      Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
