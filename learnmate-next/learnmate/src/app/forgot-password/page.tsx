"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ink">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-md shrink-0 bg-surface group-hover:scale-105 transition-transform">
              <img
                src="/logo-square.png"
                alt="LearnMate Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">LearnMate</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-4">Reset your password</h2>
          <p className="text-xs text-muted">We will send a secure password reset link to your email</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-panel border border-line shadow-card space-y-5">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-mint/15 text-mint flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-semibold text-white">Check your email</h3>
              <p className="text-xs text-muted leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, we have sent instructions to reset your password.
              </p>
              <Link href="/login" className="block pt-2">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted">
          <Link href="/login" className="text-violet hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
