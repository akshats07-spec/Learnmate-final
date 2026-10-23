"use client";
import { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Server,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { checkBackendHealth } from "@/lib/backend";

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || "Alex Sharma"
  );
  const [studySubject, setStudySubject] = useState("Human Biology & Cell Energetics");
  const [studyStyle, setStudyStyle] = useState("mixed");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; model?: string }>({ online: false });

  useEffect(() => {
    checkBackendHealth().then((status) => setBackendStatus(status));
  }, []);

  // Sync state when user or localStorage updates
  useEffect(() => {
    try {
      const localName = localStorage.getItem("learnmate_display_name");
      if (user?.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name);
      } else if (localName) {
        setDisplayName(localName);
      }

      const savedSubject = localStorage.getItem("learnmate_study_subject");
      if (savedSubject) setStudySubject(savedSubject);

      const savedStyle = localStorage.getItem("learnmate_study_style");
      if (savedStyle) setStudyStyle(savedStyle);
    } catch {}
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        studySubject,
        studyStyle,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearDemoData = () => {
    try {
      localStorage.removeItem("learnmate-demo-state-v1");
      localStorage.removeItem("learnmate_onboarding");
      localStorage.removeItem("learnmate_display_name");
      alert("Local study session reset successfully.");
      window.location.reload();
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
            Account Preferences
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          <span className="text-2xs text-muted">User Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your personal details, study configuration, and application preferences.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Profile changes successfully saved!</span>
        </div>
      )}

      {/* ── Profile Information ───────────────────────────────── */}
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-violet" />
          Personal Details
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />

            <Input
              label="Email Address"
              value={user?.email || "alex@university.edu"}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Primary Study Subject"
              value={studySubject}
              onChange={(e) => setStudySubject(e.target.value)}
              placeholder="e.g. Biology, Chemistry"
            />

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Study Style
              </label>
              <select
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
                className="input-base text-xs"
              >
                <option value="visual">Visual & 3D Models</option>
                <option value="practice">Active Recall & Practice</option>
                <option value="reading">Textual & In-Depth</option>
                <option value="mixed">Adaptive Hybrid</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save Profile Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Environment Status Card ───────────────────────────── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key size={16} className="text-mint" />
          External Service Integrations
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">FastAPI Python Microservice Backend</strong>
              <span className="text-2xs text-muted">Running on http://localhost:8000 with SQLite (learnmate.db)</span>
            </div>
            {backendStatus.online ? (
              <Badge variant="mint">Online (Port 8000)</Badge>
            ) : (
              <Badge variant="slate">Offline (Run python run.py)</Badge>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Google Gemini AI Studio</strong>
              <span className="text-2xs text-muted">Powering grounded reasoning, quizzes, and 3D visual concepts</span>
            </div>
            <Badge variant="mint">Online (gemini-3.5-flash)</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Supabase PostgreSQL & Auth</strong>
              <span className="text-2xs text-muted">User authentication and database persistence</span>
            </div>
            <Badge variant="violet">Configurable in .env</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Razorpay Payment Gateway</strong>
              <span className="text-2xs text-muted">Indian Rupee (INR) subscription management</span>
            </div>
            <Badge variant="slate">Sandbox Mode Active</Badge>
          </div>
        </div>
      </Card>

      {/* ── Data Management & Account Session ───────────────── */}
      <Card className="p-6 space-y-4 border-rose-500/30 bg-rose-500/5">
        <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-400" />
          Account Session & Data Management
        </h3>

        <p className="text-xs text-muted leading-relaxed">
          Log out of your current study profile or reset your local device learning cache.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => signOut()}
            className="text-rose-400 hover:text-white hover:bg-rose-600/40 border-rose-500/30 font-medium"
          >
            <LogOut size={14} /> Log Out of Account
          </Button>

          <Button variant="danger" size="sm" onClick={handleClearDemoData}>
            <Trash2 size={14} /> Reset Local Learning Session
          </Button>
        </div>
      </Card>
    </div>
  );
}
