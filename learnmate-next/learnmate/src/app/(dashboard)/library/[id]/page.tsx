"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Box,
  Target,
  Search,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lightbulb,
  FileText,
  Volume2,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface TopicNode {
  id: string;
  name: string;
  pageRef: string;
  summary: string;
  formulaOrQuote: string;
  analogy: string;
  completed: boolean;
  bookmarked: boolean;
}

const SAMPLE_TOPICS: TopicNode[] = [
  {
    id: "t1",
    name: "Cell Membrane & Selective Permeability",
    pageRef: "Page 1, Paragraph 2",
    summary: "The phospholipid bilayer acts as a selective barrier regulating ions and organic molecules entering and exiting the cell.",
    formulaOrQuote: "The cell membrane regulates movement of substances into and out of the cell via passive and active transport.",
    analogy: "Like an airport security checkpoint with specific gates for passport holders.",
    completed: true,
    bookmarked: false,
  },
  {
    id: "t2",
    name: "Mitochondria & Chemiosmotic ATP Synthesis",
    pageRef: "Page 2, Section 2",
    summary: "Mitochondria release usable chemical energy (ATP) through cellular respiration across the inner cristae membrane.",
    formulaOrQuote: "C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~32 ATP + heat.",
    analogy: "Like a hydroelectric dam: protons rush through ATP Synthase turbines to generate energy currency.",
    completed: false,
    bookmarked: true,
  },
  {
    id: "t3",
    name: "Ribosomes, ER & Protein Packaging",
    pageRef: "Page 3, Section 3",
    summary: "Ribosomes synthesize polypeptide chains, the ER processes lipids and proteins, and the Golgi modifies and packages them.",
    formulaOrQuote: "The Golgi apparatus modifies, sorts, and packages proteins for targeted delivery.",
    analogy: "An Amazon fulfillment center: items are assembled, packaged, and labeled for courier dispatch.",
    completed: false,
    bookmarked: false,
  },
  {
    id: "t4",
    name: "Plant vs Animal Cells (Chloroplast & Cell Wall)",
    pageRef: "Page 4, Section 4",
    summary: "Plant cells possess rigid cellulose cell walls, large central vacuoles, and photosynthetic chloroplasts; animal cells do not.",
    formulaOrQuote: "6 CO2 + 6 H2O + Light -> C6H12O6 + 6 O2 (Photosynthesis).",
    analogy: "Plant cells wear a hard suit of armor (cell wall) with solar panels (chloroplasts) on top.",
    completed: false,
    bookmarked: false,
  },
];

export default function MaterialWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [docName, setDocName] = useState<string>("Introduction to Cell Biology & Energy Synthesis.pdf");
  const [docPages, setDocPages] = useState<number>(5);
  const [topics, setTopics] = useState<TopicNode[]>(SAMPLE_TOPICS);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("t2");
  const [searchTopic, setSearchTopic] = useState("");
  const [copied, setCopied] = useState(false);
  const [explanationDepth, setExplanationDepth] = useState<"simple" | "depth" | "example" | "podcast">("simple");
  const [docSummary, setDocSummary] = useState<string>("");
  const [docPrompt, setDocPrompt] = useState<string>("");

  useEffect(() => {
    if (!params?.id) return;
    const docId = Array.isArray(params.id) ? params.id[0] : params.id;

    // Check localStorage for the specific uploaded document
    try {
      const storedItem = localStorage.getItem(`learnmate_doc_${docId}`);
      if (storedItem) {
        const parsed = JSON.parse(storedItem);
        if (parsed.name) setDocName(parsed.name);
        if (parsed.pages) setDocPages(parsed.pages);
        if (parsed.customResponse) setDocSummary(parsed.customResponse);
        if (parsed.userPrompt) setDocPrompt(parsed.userPrompt);
        if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          setTopics(parsed.topics);
          setSelectedTopicId(parsed.topics[0].id);
          return;
        }
      }

      // Check materials array
      const allMats = localStorage.getItem("learnmate_materials");
      if (allMats) {
        const list = JSON.parse(allMats);
        const found = list.find((m: any) => m.id === docId);
        if (found) {
          if (found.name) setDocName(found.name);
          if (found.pages) setDocPages(found.pages);
          if (found.customResponse) setDocSummary(found.customResponse);
          if (found.userPrompt) setDocPrompt(found.userPrompt);
          if (Array.isArray(found.topics) && found.topics.length > 0) {
            setTopics(found.topics);
            setSelectedTopicId(found.topics[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load document from storage:", e);
    }
  }, [params?.id]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const toggleComplete = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const toggleBookmark = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bookmarked: !t.bookmarked } : t))
    );
  };

  const handleCopyQuote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchTopic.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Top Navigation & Meta ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link href="/library" className="p-2 rounded-xl bg-surface border border-line hover:border-slate-600 text-slate-400">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">Learning Workspace</span>
              <span className="text-2xs text-muted">&bull; {docPages} {docPages === 1 ? "Page" : "Pages"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {docName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/practice?materialId=${Array.isArray(params.id) ? params.id[0] : params.id}`}>
            <Button size="sm">
              <Target size={14} /> Diagnostic Quiz
            </Button>
          </Link>
          <Link href={`/visuals?topic=${encodeURIComponent(currentTopic?.name || docName)}`}>
            <Button variant="secondary" size="sm">
              <Box size={14} /> 3D Visualizer
            </Button>
          </Link>
          <Link href={`/tutor?topic=${encodeURIComponent(currentTopic?.name || docName)}`}>
            <Button variant="ghost" size="sm">
              <Brain size={14} /> Ask Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Workspace 2-Column Layout ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topic Navigator Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-panel border border-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Extracted Topics ({topics.length})
              </h3>
              <span className="text-2xs text-muted font-mono">
                {topics.filter((t) => t.completed).length}/{topics.length} done
              </span>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="Filter topics..."
                className="input-base pl-8 py-1.5 text-xs"
              />
            </div>

            {/* Topic List */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredTopics.map((topic) => {
                const isSelected = topic.id === selectedTopicId;

                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-violet-400/10 border-violet text-white shadow-sm font-semibold"
                        : "bg-surface border-line text-slate-300 hover:border-slate-700 hover:bg-surface/80"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-line text-slate-400 text-2xs font-mono">
                          {topic.pageRef.split(",")[0]}
                        </span>
                        {topic.bookmarked && <Bookmark size={11} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="truncate text-xs">{topic.name}</p>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(topic.id);
                      }}
                      className="p-1 text-slate-500 hover:text-mint"
                      title={topic.completed ? "Mark incomplete" : "Mark mastered"}
                    >
                      <CheckCircle2 size={16} className={topic.completed ? "text-mint fill-mint/20" : "text-line"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Topic Detail Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-6">
            {/* Topic Header & Citation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="violet">{currentTopic.pageRef}</Badge>
                  {currentTopic.completed && <Badge variant="mint">Topic Mastered</Badge>}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentTopic.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(currentTopic.id)}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    currentTopic.bookmarked
                      ? "bg-amber-400/10 border-amber-400 text-amber-300"
                      : "bg-surface border-line text-slate-400 hover:text-white"
                  }`}
                  title="Bookmark topic"
                >
                  <Bookmark size={15} className={currentTopic.bookmarked ? "fill-amber-400" : ""} />
                </button>
              </div>
            </div>

            {/* Depth Level Tabs */}
            <div className="flex items-center gap-2 border-b border-line/60 pb-3">
              <span className="text-2xs font-bold text-muted uppercase tracking-wider mr-2">Explanation Mode:</span>
              {[
                { id: "simple", label: "Explain Simply" },
                { id: "depth", label: "In-Depth Academic" },
                { id: "example", label: "Real-Life Analogy" },
                { id: "podcast", label: "Podcast Dialogue" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setExplanationDepth(m.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    explanationDepth === m.id
                      ? "bg-violet text-white shadow-sm"
                      : "bg-surface border border-line text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content Panel */}
            <div className="space-y-4">
              {explanationDepth === "simple" && (
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-2">
                  <span className="text-2xs font-semibold text-violet uppercase tracking-wider block">Grounded Core Concept</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentTopic.summary}</p>
                </div>
              )}

              {explanationDepth === "depth" && (
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-2">
                  <span className="text-2xs font-semibold text-violet uppercase tracking-wider block">Detailed Academic Synthesis</span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    This section of your uploaded chapter establishes the fundamental energetic mechanism. Cellular respiration oxidizes carbon bonds, funneling high-energy electrons down membrane complexes to synthesize adenosine triphosphate through rotatory chemiosmosis.
                  </p>
                </div>
              )}

              {explanationDepth === "example" && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-purple-300">
                    <Lightbulb size={16} className="text-amber-300" />
                    <span>Real-World Intuition Analogy</span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100 italic leading-relaxed">
                    "{currentTopic.analogy}"
                  </p>
                </div>
              )}

              {explanationDepth === "podcast" && (
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-violet-bright animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">NotebookLM-Style 2-Minute Deep Dive</span>
                    </div>
                    <Badge variant="mint">FastAPI + Gemini Active</Badge>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-panel border border-line space-y-1">
                      <span className="text-2xs font-bold text-violet font-mono uppercase">Host (Alex):</span>
                      <p className="text-slate-200">
                        "Welcome back! Today we're breaking down a tricky section from this chapter: <strong className="text-white">{currentTopic.name}</strong>. So what's the big intuition here?"
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-panel border border-line space-y-1">
                      <span className="text-2xs font-bold text-mint font-mono uppercase">Expert (Dr. Sam):</span>
                      <p className="text-slate-200">
                        "Think of it like this: {currentTopic.analogy}. In this material ({currentTopic.pageRef}), the key takeaway is that {currentTopic.summary.toLowerCase()}"
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-panel border border-line space-y-1">
                      <span className="text-2xs font-bold text-violet font-mono uppercase">Host (Alex):</span>
                      <p className="text-slate-200">
                        "And for exams, make sure you memorize the exact quote: <em className="text-purple-200">'{currentTopic.formulaOrQuote}'</em>!"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Passage Direct Quote */}
              <div className="p-4 rounded-2xl bg-ink/70 border border-line/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <FileText size={12} /> Source Passage Citation ({currentTopic.pageRef})
                  </span>
                  <button
                    onClick={() => handleCopyQuote(currentTopic.formulaOrQuote)}
                    className="text-2xs text-muted hover:text-white flex items-center gap-1"
                  >
                    {copied ? <Check size={12} className="text-mint" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy citation"}</span>
                  </button>
                </div>
                <blockquote className="text-xs font-mono text-slate-300 italic border-l-2 border-violet pl-3 py-1">
                  "{currentTopic.formulaOrQuote}"
                </blockquote>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link href={`/tutor?topic=${encodeURIComponent(currentTopic.name)}`}>
                  <Button variant="ghost" size="sm">
                    <Brain size={14} /> Ask AI Tutor About This
                  </Button>
                </Link>
                <Link href={`/visuals?topic=${encodeURIComponent(currentTopic.name)}`}>
                  <Button variant="ghost" size="sm">
                    <Box size={14} /> Visualize in 3D
                  </Button>
                </Link>
              </div>

              <button
                onClick={() => toggleComplete(currentTopic.id)}
                className={`text-xs px-3 py-2 rounded-xl border font-medium flex items-center gap-1.5 transition-all ${
                  currentTopic.completed
                    ? "bg-mint/15 border-mint/40 text-mint"
                    : "bg-surface border-line text-slate-300 hover:text-white"
                }`}
              >
                <CheckCircle2 size={15} />
                <span>{currentTopic.completed ? "Marked as Mastered" : "Mark as Completed"}</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
