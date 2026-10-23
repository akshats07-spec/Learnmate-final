"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";

  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await signUp(email, password, name);
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/onboarding?plan=${selectedPlan}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ink">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-sm">
              LM
            </span>
            <span className="text-xl font-bold tracking-tight text-white">LearnMate</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-4">Create your account</h2>
          <p className="text-xs text-muted">
            {selectedPlan !== "free" ? `Signing up for the ${selectedPlan.toUpperCase()} plan` : "Start learning free in under 60 seconds"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-xl bg-mint/10 border border-mint/30 text-mint text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Account created! Redirecting to your onboarding setup...</span>
          </div>
        )}

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-panel border border-line shadow-card space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Sharma"
            />

            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" disabled={loading || success} className="w-full">
              {loading ? "Creating account..." : "Start Learning Free"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
            <div className="relative flex justify-center text-2xs uppercase">
              <span className="bg-panel px-2 text-muted">Quick access</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding")}
            className="w-full justify-center text-xs"
          >
            <Sparkles size={14} className="text-violet mr-1" />
            Skip to Onboarding (Demo Mode)
          </Button>
        </div>

        {/* Log in prompt */}
        <p className="text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-violet font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <SignupContent />
    </Suspense>
  );
}
