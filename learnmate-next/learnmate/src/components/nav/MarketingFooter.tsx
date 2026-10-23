import Link from "next/link";
import { BookOpen, Github, Twitter } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-ink/60 py-12">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-sm shrink-0 bg-surface">
                <img
                  src="/logo-square.png"
                  alt="LearnMate Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">LearnMate</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              Turn your study material into deep understanding with AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Product</h4>
            <ul className="space-y-2">
              {["Features", "How it works", "Pricing", "FAQ"].map(l => (
                <li key={l}><Link href={`#${l.toLowerCase().replace(/ /g,"-")}`}
                  className="text-sm text-muted hover:text-heading transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Account</h4>
            <ul className="space-y-2">
              {[["Log in", "/login"], ["Sign up", "/signup"], ["Dashboard", "/dashboard"], ["Billing", "/billing"]].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-muted hover:text-heading transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Terms", "Privacy", "Contact", "Billing policy"].map(l => (
                <li key={l}><Link href="#" className="text-sm text-muted hover:text-heading transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">© {new Date().getFullYear()} LearnMate. All rights reserved.</p>
          <p className="text-xs text-muted">Made for the Google AI Hackathon</p>
        </div>
      </div>
    </footer>
  );
}
