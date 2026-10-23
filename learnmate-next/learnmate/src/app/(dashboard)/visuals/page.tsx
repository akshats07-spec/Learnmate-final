"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Sparkles,
  Layers,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Eye,
  HelpCircle,
  Cpu,
  Orbit,
  Dna,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Interactive3DCanvas, SpatialNode } from "@/components/ui/Interactive3DCanvas";

interface VisualModel {
  id: string;
  topic: string;
  conceptTitle: string;
  visualType?: string;
  explanation: string;
  breakdown: string[];
  analogy: string;
  nodes?: SpatialNode[];
  connections?: Array<[number, number]>;
  knowledgeCheck: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

const GALLERY_VISUALS: VisualModel[] = [
  {
    id: "v1",
    topic: "Mitochondria & Chemiosmosis",
    conceptTitle: "3D Cutaway of Mitochondrial Cristae & ATP Synthase",
    visualType: "cell",
    explanation:
      "Cutaway showing the outer membrane, intermembrane space with high proton density (H⁺), and inner membrane rotary ATP Synthase.",
    breakdown: [
      "Outer Membrane: Insulated phospholipid boundary enclosing the organelle.",
      "Intermembrane Space: Acts as a pressurized reservoir of pumped protons (H⁺).",
      "Inner Cristae Folds: Greatly folded surface maximizing electron transport density.",
      "Rotary ATP Synthase Hub: Rotates 360° as protons rush into the matrix, minting ATP from ADP.",
      "Matrix Core: Catalytic fluid containing mitochondrial ribosomes and Krebs cycle enzymes.",
    ],
    analogy:
      "Like a hydroelectric dam: dammed water turns turbines as it flows down, generating electricity.",
    nodes: [
      { label: "Outer Envelope", color: "#8b5cf6", x: 0, y: 70, z: 0 },
      { label: "Intermembrane H+ Reservoir", color: "#06b6d4", x: -60, y: 20, z: 30 },
      { label: "Inner Cristae Fold", color: "#10b981", x: 50, y: -20, z: -30 },
      { label: "Rotary ATP Synthase", color: "#f59e0b", x: -10, y: -60, z: 20 },
      { label: "Matrix Core Space", color: "#ec4899", x: 40, y: -40, z: 30 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    knowledgeCheck: {
      question: "What physical force directly powers the rotation of the ATP Synthase rotor?",
      options: [
        "Direct glucose oxidation",
        "The proton-motive electrochemical gradient (H⁺ flow)",
        "Passive water absorption",
        "Thermal molecular vibration",
      ],
      correctIndex: 1,
    },
  },
  {
    id: "v2",
    topic: "Phospholipid Bilayer",
    conceptTitle: "3D Spatial Model of the Fluid Mosaic Membrane",
    visualType: "molecule",
    explanation:
      "Visualization of hydrophilic phosphate heads facing aqueous environments and hydrophobic fatty acid tails forming an impermeable core.",
    breakdown: [
      "Extracellular Polar Heads: Hydrophilic phosphate moieties interacting with aqueous extracellular fluid.",
      "Outer Fatty Acid Tails: Hydrophobic saturated and unsaturated lipid chains pointing inward.",
      "Selective Ion Transporter: Transmembrane protein conduit with active gate.",
      "Cytosolic Fatty Acid Tails: Inner hydrophobic leaflet shielding ions.",
      "Cytosolic Polar Heads: Hydrophilic heads anchoring to the intracellular cytoskeleton.",
    ],
    analogy:
      "Like a crowd of people standing back-to-back with raincoats facing out and dry backs touching.",
    nodes: [
      { label: "Extracellular Polar Head", color: "#06b6d4", x: -50, y: 55, z: -20 },
      { label: "Hydrophobic Lipid Tail A", color: "#f59e0b", x: -45, y: 10, z: -10 },
      { label: "Transmembrane Channel", color: "#8b5cf6", x: 0, y: 0, z: 0 },
      { label: "Hydrophobic Lipid Tail B", color: "#f59e0b", x: 45, y: -10, z: 10 },
      { label: "Cytosolic Polar Head", color: "#10b981", x: 50, y: -55, z: 20 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    knowledgeCheck: {
      question: "Which component prevents water-soluble polar ions from freely diffusing through?",
      options: [
        "The hydrophobic fatty acid core",
        "Surface peripheral glycoproteins",
        "Cholesterol anchors only",
        "Cytosolic microfilaments",
      ],
      correctIndex: 0,
    },
  },
  {
    id: "v3",
    topic: "Ray Optics & Thin Lens",
    conceptTitle: "3D Ray Diagram & Focal Point Convergence",
    visualType: "optics",
    explanation:
      "Interactive ray diagram showing parallel light rays refracting through a biconvex lens to converge at the principal focal point (F).",
    breakdown: [
      "Light Source Emitter: Generates parallel coherent ray trajectories.",
      "Incident Ray Vector: Propagates through optical air medium.",
      "Optical Center (O): Geometric center of biconvex lens where rays pass undeviated.",
      "Principal Focal Point (F): Point where parallel rays converge after refraction.",
      "Real Inverted Conjugate: Formation location of real inverted focal image.",
    ],
    analogy: "Like traffic funneled from a three-lane highway down into a single bridge lane.",
    nodes: [
      { label: "Source Emitter", color: "#f59e0b", x: -75, y: 35, z: 0 },
      { label: "Front Focal Point (F1)", color: "#06b6d4", x: -35, y: 15, z: 0 },
      { label: "Optical Center (O)", color: "#8b5cf6", x: 0, y: 0, z: 0 },
      { label: "Principal Focus (F2)", color: "#10b981", x: 40, y: -15, z: 0 },
      { label: "Real Inverted Conjugate", color: "#ec4899", x: 75, y: -30, z: 0 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    knowledgeCheck: {
      question: "Where is a real, inverted image formed when an object is placed beyond 2F?",
      options: [
        "Between F and 2F on the opposite side",
        "At infinity",
        "Inside the focal length F",
        "At the exact position of the object",
      ],
      correctIndex: 0,
    },
  },
];

function VisualsContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic");

  const [availableTopics, setAvailableTopics] = useState<
    Array<{ id: string; topic: string; context?: string }>
  >([
    { id: "v1", topic: "Mitochondria & Chemiosmosis" },
    { id: "v2", topic: "Phospholipid Bilayer" },
    { id: "v3", topic: "Ray Optics & Thin Lens" },
  ]);

  const [activeVisual, setActiveVisual] = useState<VisualModel>(GALLERY_VISUALS[0]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load uploaded material topics from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          const userTopics: Array<{ id: string; topic: string; context?: string }> = [];
          list.forEach((mat: any) => {
            if (Array.isArray(mat.topics)) {
              mat.topics.forEach((t: any) => {
                userTopics.push({
                  id: t.id || `topic-${Date.now()}-${Math.random()}`,
                  topic: t.name,
                  context: t.summary || mat.text?.slice(0, 2000),
                });
              });
            }
          });

          if (userTopics.length > 0) {
            setAvailableTopics((prev) => {
              const existingNames = new Set(prev.map((p) => p.topic.toLowerCase()));
              const fresh = userTopics.filter((u) => !existingNames.has(u.topic.toLowerCase()));
              return [...fresh, ...prev];
            });
          }
        }
      }
    } catch (e) {
      console.warn("Could not load topics for visuals:", e);
    }
  }, []);

  const loadTopicVisual = async (topicName: string, contextText?: string) => {
    // 1. Check if it's in built-in gallery
    const match = GALLERY_VISUALS.find((v) => v.topic.toLowerCase() === topicName.toLowerCase());
    if (match) {
      setActiveVisual(match);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
      return;
    }

    // 2. Check persistent visual cache in localStorage
    const cacheKey = `learnmate_3d_${topicName.toLowerCase().trim()}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCached = JSON.parse(cached);
        setActiveVisual(parsedCached);
        setSelectedQuizAnswer(null);
        setQuizSubmitted(false);
        return;
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }

    // 3. Otherwise generate dynamic 3D visual concept via Gemini
    setIsGenerating(true);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);

    try {
      const res = await fetch("/api/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicName, context: contextText || "" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newModel: VisualModel = {
        id: `gen-${Date.now()}`,
        topic: topicName,
        conceptTitle: data.conceptTitle || `3D Spatial Model: ${topicName}`,
        visualType: data.visualType || "system",
        explanation: data.explanation || `3D geometric exploration of ${topicName}.`,
        breakdown: data.breakdown || [
          "Primary boundary and surface interface",
          "Internal functional subunit and catalytic center",
          "Dynamic transport gradient vector conduits",
        ],
        analogy: data.analogy || "Like a high-precision modular instrument assembly.",
        nodes: data.nodes || [
          { label: "Surface Layer", color: "#8b5cf6", x: 0, y: 70, z: 0 },
          { label: "Core Center", color: "#06b6d4", x: -60, y: -30, z: 35 },
          { label: "Conduit Flow", color: "#10b981", x: 60, y: -30, z: -35 },
        ],
        connections: data.connections || [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
        knowledgeCheck: data.knowledgeCheck || {
          question: `What is the principal spatial role of the core subunit in ${topicName}?`,
          options: [
            "Passive boundary insulation",
            "Active catalytic conversion and structural regulation",
            "Total inert molecular shielding",
            "Cellular death triggering only",
          ],
          correctIndex: 1,
        },
      };

      // Save to cache so clicking between topics is instant and unique
      try {
        localStorage.setItem(cacheKey, JSON.stringify(newModel));
      } catch (err) {
        console.warn("Could not save to visual cache:", err);
      }

      setActiveVisual(newModel);
    } catch (err) {
      console.error("Error loading visual:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      loadTopicVisual(initialTopic);
    }
  }, [initialTopic]);

  const handleRegenerate = () => {
    // Clear cache for this topic to force fresh regeneration
    try {
      localStorage.removeItem(`learnmate_3d_${activeVisual.topic.toLowerCase().trim()}`);
    } catch {}
    loadTopicVisual(activeVisual.topic);
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Spatial Learning Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Dual-Coding 3D Visualization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            3D Visual Learning Gallery
          </h1>
          <p className="text-xs text-muted mt-1">
            Transform abstract biology, tech, physics, and chemistry concepts into spatial 3D educational models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={isGenerating}>
            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
            <span>Regenerate Model</span>
          </Button>
        </div>
      </div>

      {/* ── Visual Model Selector Pills ──────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {availableTopics.map((v) => {
          const isActive = activeVisual.topic.toLowerCase() === v.topic.toLowerCase();
          return (
            <button
              key={v.id}
              onClick={() => loadTopicVisual(v.topic, v.context)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-indigo-600 text-white border border-indigo-400/40 shadow-sm"
                  : "bg-surface border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20"
              }`}
            >
              <Box size={14} className={isActive ? "text-emerald-300" : "text-slate-400"} />
              <span>{v.topic}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3D Visual Main Showcase ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Render Canvas Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Interactive3DCanvas
              nodes={activeVisual.nodes}
              connections={activeVisual.connections}
              visualType={activeVisual.visualType || "system"}
              title={activeVisual.conceptTitle}
              subtitle={activeVisual.topic}
            />

            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 z-30">
                <RefreshCw size={28} className="text-violet-bright animate-spin" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  Constructing Custom 3D Spatial Geometry...
                </span>
                <span className="text-2xs text-muted">
                  Gemini AI spatial vector calculation in progress
                </span>
              </div>
            )}
          </div>

          {/* Real-World Analogy Card */}
          <Card className="bg-surface border border-white/[0.08] text-slate-300 p-4">
            <div className="flex items-center gap-2 font-medium text-xs text-slate-200 mb-1">
              <Lightbulb size={16} className="text-amber-400" />
              <span>Cognitive Analogy</span>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{activeVisual.analogy}"
            </p>
          </Card>
        </div>

        {/* Right: Step-by-Step Breakdown & Knowledge Check */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step Breakdown */}
          <Card className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers size={14} className="text-violet" />
              Structural Component Breakdown
            </h3>

            <div className="space-y-2.5">
              {activeVisual.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-line text-xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-lg bg-violet/20 text-violet-bright font-mono font-bold text-2xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-xs">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Short Knowledge Check */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-mint" />
                Quick Knowledge Check
              </h3>
              <Badge variant="slate">Active Recall</Badge>
            </div>

            <p className="text-xs font-semibold text-white leading-snug">
              {activeVisual.knowledgeCheck.question}
            </p>

            <div className="space-y-2">
              {activeVisual.knowledgeCheck.options.map((opt, optIdx) => {
                const isSelected = selectedQuizAnswer === optIdx;
                const isCorrect = optIdx === activeVisual.knowledgeCheck.correctIndex;

                let style = "bg-surface border-line text-slate-300 hover:border-slate-600";
                if (quizSubmitted) {
                  if (isCorrect) style = "bg-mint/20 border-mint text-mint font-semibold";
                  else if (isSelected && !isCorrect)
                    style = "bg-rose-500/20 border-rose-500 text-rose-300";
                  else style = "opacity-50 border-line";
                } else if (isSelected) {
                  style = "bg-violet-400/20 border-violet text-white";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => !quizSubmitted && setSelectedQuizAnswer(optIdx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {quizSubmitted && isCorrect && (
                      <CheckCircle2 size={14} className="text-mint shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <Button
                size="sm"
                className="w-full"
                disabled={selectedQuizAnswer === null}
                onClick={() => setQuizSubmitted(true)}
              >
                Verify Answer
              </Button>
            ) : (
              <p className="text-2xs text-center text-muted">
                {selectedQuizAnswer === activeVisual.knowledgeCheck.correctIndex
                  ? "Correct! Spatial comprehension verified."
                  : "Review the labeled 3D components above to solidify this concept."}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VisualsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted text-sm">Loading visuals...</div>}>
      <VisualsContent />
    </Suspense>
  );
}
