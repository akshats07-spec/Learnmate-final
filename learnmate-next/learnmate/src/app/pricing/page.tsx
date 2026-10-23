"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { PLANS, formatPrice } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-ink text-slate-100">
      <MarketingNav />

      <main className="flex-1 py-16 md:py-24">
        <div className="container-page">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="violet" className="mb-3">Transparent Plans</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Invest in your <span className="gradient-text">academic mastery</span>
            </h1>
            <p className="text-sm sm:text-base text-muted">
              Choose the learning capacity you need. Switch or cancel your subscription at any time.
            </p>

            {/* Annual Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-xs font-medium ${!annual ? "text-white" : "text-muted"}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${annual ? "bg-violet" : "bg-slate-700"}`}
                aria-label="Toggle annual billing"
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-medium flex items-center gap-1.5 ${annual ? "text-white" : "text-muted"}`}>
                <span>Annual billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-mint/15 text-mint font-bold text-2xs">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {PLANS.filter(p => p.id !== "free").map((plan) => {
              const isPro = plan.id === "pro";
              const price = annual ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 transition-all relative flex flex-col justify-between ${
                    isPro
                      ? "bg-panel border-2 border-indigo-500 shadow-lg"
                      : "bg-surface border border-white/[0.08]"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-2xs font-bold uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted mb-6">{plan.tagline}</p>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs text-muted">/ month</span>
                    </div>

                    {annual && (
                      <p className="text-2xs text-mint mb-6">
                        Billed annually ({formatPrice(price * 12)} / year)
                      </p>
                    )}
                    {!annual && <div className="h-4 mb-6" />}

                    <ul className="space-y-3 text-xs text-slate-300 mb-8">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-mint shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/signup?plan=${plan.id}`}>
                    <Button variant={isPro ? "primary" : "outline"} className="w-full">
                      Get Started with {plan.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Free Demo Tier Callout */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-panel/60 border border-line flex flex-col sm:flex-row items-center justify-between gap-4 mb-20 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Badge variant="slate">Free Demo Tier</Badge>
                <span className="text-xs text-slate-300 font-semibold">Try before subscribing</span>
              </div>
              <p className="text-xs text-muted">
                Includes 2 uploads up to 5 pages, 10 AI tutor questions, and 3 diagnostic quizzes with zero credit card required.
              </p>
            </div>
            <Link href="/signup">
              <Button variant="ghost" size="sm" className="shrink-0">
                Start Free Demo
              </Button>
            </Link>
          </div>

          {/* Feature Comparison Table */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-line bg-panel/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface/60 text-slate-400">
                    <th className="p-4 font-semibold">Capabilities</th>
                    <th className="p-4 font-semibold text-center">Starter</th>
                    <th className="p-4 font-semibold text-center text-violet-bright">Pro</th>
                    <th className="p-4 font-semibold text-center">Ultra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-slate-300">
                  {[
                    ["Monthly Uploads", "10 documents", "50 documents", "Unlimited"],
                    ["Page Limit per Doc", "20 pages", "20 pages", "20 pages"],
                    ["AI Tutor Questions", "100 / month", "500 / month", "Unlimited"],
                    ["3D Educational Visuals", "10 / month", "50 / month", "Unlimited"],
                    ["Grounded Citations", "Included", "Included", "Included"],
                    ["Spaced Revision Planner", "Basic", "Advanced", "Full Adaptive"],
                    ["Weak Topic Diagnostic", "Yes", "Yes", "Yes"],
                    ["Analytics & Growth Trends", "Standard", "Comprehensive", "Deep Metrics"],
                    ["Priority Queue Processing", "Standard", "Faster", "Highest Priority"],
                  ].map(([feature, s, p, u], i) => (
                    <tr key={i} className="hover:bg-white/[.02]">
                      <td className="p-4 font-medium text-white">{feature}</td>
                      <td className="p-4 text-center">{s}</td>
                      <td className="p-4 text-center font-semibold text-violet-bright bg-violet/5">{p}</td>
                      <td className="p-4 text-center">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cancellation & Policy Notice */}
          <div className="max-w-2xl mx-auto text-center text-xs text-muted space-y-2">
            <p>
              All payments are processed securely in INR via Razorpay. Subscriptions renew automatically every month unless cancelled before the renewal date.
            </p>
            <p>
              You can cancel your subscription with one click inside your Account Settings at any time without fees.
            </p>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
