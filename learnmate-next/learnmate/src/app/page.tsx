"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, Brain, Sparkles, Layers, Target, TrendingUp,
  FileText, Upload, ChevronRight, CheckCircle2, ArrowRight,
  HelpCircle, Eye, ShieldCheck, Zap, Box, Compass, RefreshCw
} from "lucide-react";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { PLANS, formatPrice } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-ink text-slate-100">
      <MarketingNav />

      {/* ── 1. Hero Section ───────────────────────────────────── */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Subtle executive radial spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="container-page text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono mb-8 animate-fade-in shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Document Grounded Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 text-white">
            Turn complex study material into <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">mastery</span>.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Upload your lecture notes, textbooks, and research papers. LearnMate parses topics, creates verified citations, renders interactive 3D concepts, and conducts targeted diagnostic quizzes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto shadow-md">
                Get started free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white border border-white/[0.08]">
                Explore features
              </Button>
            </Link>
          </div>

          {/* Interactive Product Preview Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-2xl p-1.5 bg-gradient-to-b from-white/[0.12] to-white/[0.02] border border-white/[0.08] shadow-2xl">
            <div className="rounded-xl bg-panel border border-white/[0.06] overflow-hidden">
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/90">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="text-2xs text-slate-400 font-mono ml-2">learnmate-workspace // biology-ch7.pdf</span>
                </div>
                <Badge variant="mint">Grounded AI Active</Badge>
              </div>

              {/* Workspace Mock Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 text-left bg-ink/70">
                {/* Left: Topic Tree */}
                <div className="md:col-span-4 space-y-2 border-r border-line/60 pr-4">
                  <div className="text-2xs font-semibold uppercase tracking-wider text-muted mb-2">Detected Topics (4)</div>
                  {[
                    { name: "Cell Membrane & Transport", mastery: 85, active: false },
                    { name: "Mitochondria & ATP Yield", mastery: 42, active: true },
                    { name: "Krebs Citric Acid Cycle", mastery: 68, active: false },
                    { name: "Electron Transport Chain", mastery: 28, active: false }
                  ].map((t, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      t.active ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-medium" : "bg-panel/40 border-line text-slate-300"
                    }`}>
                      <span className="font-medium truncate max-w-[150px]">{t.name}</span>
                      <span className="font-mono text-2xs opacity-80">{t.mastery}%</span>
                    </div>
                  ))}
                </div>

                {/* Right: 3D Visual & Grounded Explanation */}
                <div className="md:col-span-8 space-y-4">
                  <div className="p-4 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 rounded-lg overflow-hidden border border-white/[0.08] shrink-0 bg-surface">
                      <img
                        src="/logo.png"
                        alt="3D Spatial Learning Device"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="violet">3D Visual Preview</Badge>
                        <span className="text-2xs text-muted">Page 4, Paragraph 2</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">Mitochondrial Inner Cristae & ATP Synthase</h4>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        Protons (H⁺) are pumped across the inner membrane creating a steep gradient that powers the ATP Synthase rotary motor like water through a turbine.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-panel/80 border border-line flex items-center justify-between text-xs">
                    <span className="text-muted">Diagnostic Quiz Score: <strong className="text-white">3 / 5 (60%)</strong></span>
                    <span className="text-violet font-medium flex items-center gap-1">
                      Adaptive Revision Plan Generated <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Feature Section ─────────────────────────────────── */}
      <section id="features" className="section border-t border-line/60 bg-surface/30">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="mint" className="mb-3">Comprehensive Learning Engine</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Everything you need to master tough subjects
            </h2>
            <p className="text-sm sm:text-base text-muted">
              LearnMate connects document parsing, conversational AI, visual generation, and spaced repetition into one cohesive flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Multimodal Document Intelligence",
                desc: "Upload text-based or scanned PDFs, JPGs, and PNGs. LearnMate handles OCR and splits content into verified page citations.",
                badge: "PDF + Image OCR",
              },
              {
                icon: Brain,
                title: "Grounded AI Tutor",
                desc: "Ask any question and receive explanations with page-level citations. If a fact is missing from your material, the tutor explicitly warns you.",
                badge: "Hallucination Guard",
              },
              {
                icon: Box,
                title: "3D Educational Visuals",
                desc: "Generate conceptual 3D illustrations, cutaways, and labeled diagrams for biological systems, physics models, and chemical compounds.",
                badge: "Visual Learning",
              },
              {
                icon: Target,
                title: "Diagnostic Quizzes & Gap Detection",
                desc: "Take adaptive multiple-choice quizzes that pinpoint exactly which concepts you misunderstand and need to review.",
                badge: "Misconception Analysis",
              },
              {
                icon: Layers,
                title: "Personalized 3-Day Revision Plans",
                desc: "Get an automated study schedule prioritized by your weak spots with targeted practice questions and step-by-step solutions.",
                badge: "Spaced Repetition",
              },
              {
                icon: TrendingUp,
                title: "Longitudinal Progress Tracking",
                desc: "Track topic mastery over time, review past quiz attempts, and watch your confidence score grow toward 100%.",
                badge: "Retention Analytics",
              },
            ].map((f, i) => (
              <Card key={i} className="hover:border-violet/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-400/10 border border-violet/20 flex items-center justify-center text-violet-bright mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={20} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-4">{f.desc}</p>
                <Badge variant="slate">{f.badge}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="section border-t border-line/60">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="violet" className="mb-3">Streamlined Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              From raw notes to exam mastery in 5 steps
            </h2>
            <p className="text-sm text-muted">
              Designed around evidence-based cognitive psychology: active recall, spaced repetition, and dual-coding visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Upload", desc: "Drop your PDF, lecture slides, or image notes up to 20 pages." },
              { step: "02", title: "Discover", desc: "AI extracts topics, chapters, key formulas, and page references." },
              { step: "03", title: "Visualize", desc: "Generate 3D-style visual aids and analogies for complex concepts." },
              { step: "04", title: "Practice", desc: "Take a 5-question diagnostic quiz to diagnose weak spots." },
              { step: "05", title: "Master", desc: "Follow your personalized 3-day spaced plan with targeted questions." },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-panel/60 border border-line relative">
                <span className="font-mono text-2xl font-bold text-violet/40 mb-2 block">{s.step}</span>
                <h4 className="text-sm font-semibold text-white mb-1">{s.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Example Scenarios ──────────────────────────────── */}
      <section className="section border-t border-line/60 bg-surface/20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="amber" className="mb-3">Demonstrated Use Cases</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Built for every rigorous field of study
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                subject: "Medical & Life Sciences",
                doc: "Cellular Respiration & Krebs Cycle (5 Pages)",
                result: "Diagnosed confusion between Complex I vs II electron transport, generated cutaway mitochondrial cristae visual, lifted score from 60% to 100% on re-attempt.",
              },
              {
                subject: "Engineering & Physics",
                doc: "Thermodynamics & Heat Exchangers (12 Pages)",
                result: "Identified confusion in Carnot efficiency formulas, built 3D schematic of counter-current heat exchange, delivered prioritized Day 1-3 practice set.",
              },
              {
                subject: "Computer Science",
                doc: "Operating Systems & Virtual Memory (18 Pages)",
                result: "Discovered gap in page-fault address translation, generated 3D paging memory bus model, verified explanations strictly using lecture slide text.",
              },
            ].map((c, i) => (
              <Card key={i} className="bg-panel/40">
                <span className="text-2xs font-semibold text-violet uppercase tracking-wider block mb-1">{c.subject}</span>
                <h4 className="text-sm font-semibold text-white mb-2">{c.doc}</h4>
                <p className="text-xs text-muted leading-relaxed">{c.result}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Pricing Preview ────────────────────────────────── */}
      <section id="pricing" className="section border-t border-line/60">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="mint" className="mb-3">Simple Transparent Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Plans tailored to your study ambition
            </h2>
            <p className="text-sm text-muted">
              Choose the tier that fits your course volume. Billed in Indian Rupees (INR).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.filter(p => p.id !== "free").map((plan) => {
              const isPro = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 transition-all relative flex flex-col justify-between ${
                    isPro
                      ? "bg-panel border-2 border-violet shadow-glow"
                      : "bg-surface border border-line"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-violet text-white text-2xs font-bold uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted mb-4">{plan.tagline}</p>

                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        {formatPrice(plan.priceMonthly)}
                      </span>
                      <span className="text-xs text-muted">/ month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-mint shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/signup?plan=${plan.id}`}>
                    <Button
                      variant={isPro ? "primary" : "outline"}
                      className="w-full"
                    >
                      Choose {plan.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-xs text-violet hover:underline">
              View full plan feature comparison & billing FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Section ────────────────────────────────────── */}
      <section id="faq" className="section border-t border-line/60 bg-surface/20">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="sky" className="mb-2">Common Questions</Badge>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What types of study materials can I upload?",
                a: "You can upload PDF files, scanned documents, and images (PNG, JPG, WEBP) up to 20 pages or 12 MB. You can also paste raw text and notes directly into the workspace.",
              },
              {
                q: "How does the AI prevent hallucinations?",
                a: "LearnMate grounds every answer strictly in the text of your uploaded material. If you ask a question that cannot be proven by your document, the AI tutor explicitly warns you with an 'Unavailable in uploaded material' banner.",
              },
              {
                q: "Are the 3D visuals actually related to my material?",
                a: "Yes. When you request a visual for a topic (e.g. Mitochondria, Carnot cycle), LearnMate takes your extracted text and crafts an educational 3D visual concept with labeled components and step-by-step analogies.",
              },
              {
                q: "What payment methods are supported?",
                a: "We support Indian payment methods via Razorpay including UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, and Net Banking.",
              },
              {
                q: "Can I try LearnMate without entering credit card details?",
                a: "Yes! The free demo tier allows you to test document ingestion, diagnostic quizzes, and revision planning immediately with zero commitment.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-line bg-panel/70 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-medium text-white hover:bg-white/[.02]"
                >
                  <span>{faq.q}</span>
                  <ChevronRight size={16} className={`text-muted transition-transform ${activeFaq === i ? "rotate-90" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-line/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final Call to Action ───────────────────────────── */}
      <section className="section border-t border-line bg-surface/30">
        <div className="container-page text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to master your course materials?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of students turning passive reading into high-retention active recall. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto shadow-md">
                Start Learning Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white border border-white/[0.08]">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
