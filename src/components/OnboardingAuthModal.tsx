"use client";

import React, { useState } from "react";
import { X, ShieldCheck, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { useAppState, type StudentProfile } from "@/context/AppStateContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CURRICULUM_VERSIONS, NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";

export function OnboardingAuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useAppState();
  const [tab, setTab] = useState<"onboarding" | "auth">("onboarding");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<StudentProfile>(profile);

  if (!open) return null;

  const supabaseReady = isSupabaseConfigured();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const supabase = createClient();
    if (!supabase) {
      updateProfile({
        email: email || profile.email,
        isGuest: false,
        onboardingCompleted: true,
      });
      setAuthMessage(
        "Supabase credentials are not configured in .env.local yet — signed into local academic profile mode."
      );
      return;
    }

    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setAuthMessage(error ? error.message : "Signed in successfully!");
      if (!error) updateProfile({ email, isGuest: false });
    } else if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: draft.name } },
      });
      setAuthMessage(
        error
          ? error.message
          : "Verification email sent! Check your inbox to confirm your account."
      );
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setAuthMessage(
        error ? error.message : "Password recovery link sent to your email."
      );
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) {
      setAuthMessage("Configure NEXT_PUBLIC_SUPABASE_URL & ANON_KEY to enable Google OAuth.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ ...draft, onboardingCompleted: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="card-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold">BAMS Profile, Curriculum & Account</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTab("onboarding")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === "onboarding"
                ? "bg-[var(--accent-primary)] text-[#080E0C]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            }`}
          >
            Academic Onboarding
          </button>
          <button
            onClick={() => setTab("auth")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === "auth"
                ? "bg-[var(--accent-primary)] text-[#080E0C]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            }`}
          >
            Sign In / Account ({supabaseReady ? "Supabase Live" : "Local Guest Mode"})
          </button>
        </div>

        {tab === "onboarding" ? (
          <form onSubmit={handleSaveOnboarding} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Student Name
                </label>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Curriculum Regulation
                </label>
                <select
                  value={draft.curriculumVersion}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      curriculumVersion: e.target.value as StudentProfile["curriculumVersion"],
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                >
                  {CURRICULUM_VERSIONS.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Current Professional
                </label>
                <select
                  value={draft.professional}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      professional: e.target.value as StudentProfile["professional"],
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                >
                  <option value="PROF_1">First Professional BAMS</option>
                  <option value="PROF_2">Second Professional BAMS</option>
                  <option value="PROF_3">Third / Final Professional BAMS</option>
                  {draft.curriculumVersion === "CCIM_LEGACY_4PROF" && (
                    <option value="PROF_4">Fourth Professional BAMS (Legacy)</option>
                  )}
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  University
                </label>
                <select
                  value={draft.university}
                  onChange={(e) => setDraft({ ...draft, university: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                >
                  <option value="MUHS">MUHS (Maharashtra)</option>
                  <option value="RGUHS">RGUHS (Karnataka)</option>
                  <option value="MGGAU">MGGAU (Uttar Pradesh)</option>
                  <option value="BHU">IMS-BHU (Varanasi)</option>
                  <option value="NIA">NIA (Jaipur)</option>
                  <option value="GAU">Gujarat Ayurved University</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  College Name
                </label>
                <input
                  value={draft.college}
                  onChange={(e) => setDraft({ ...draft, college: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Preferred Language
                </label>
                <select
                  value={draft.preferredLanguage}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      preferredLanguage: e.target.value as StudentProfile["preferredLanguage"],
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                >
                  <option value="English">English (with Sanskrit Terms)</option>
                  <option value="Hinglish">Hinglish (Easy Notes Mode)</option>
                  <option value="Hindi">Hindi + Sanskrit</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Daily Study Target (Minutes)
                </label>
                <input
                  type="number"
                  min={30}
                  max={720}
                  value={draft.dailyStudyTargetMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, dailyStudyTargetMinutes: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                  Exam Goal
                </label>
                <input
                  value={draft.examGoal}
                  onChange={(e) => setDraft({ ...draft, examGoal: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Focus / Weak Subject (Prioritized in Mock Exams & AI Planner)
              </label>
              <select
                value={draft.weakSubjects[0] || "AyUG-RS"}
                onChange={(e) => setDraft({ ...draft, weakSubjects: [e.target.value] })}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
              >
                {NCISM_SUBJECTS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent-primary)] px-5 py-2 text-xs font-semibold text-[#080E0C]"
              >
                Save & Personalize AYURVEDA∞
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex gap-2">
              {(["signin", "signup", "reset"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAuthMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                    authMode === m
                      ? "bg-white/10 text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {m === "signin" ? "Sign In" : m === "signup" ? "Create Account" : "Reset Password"}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bams-college.edu.in"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm"
              />
              {authMode !== "reset" && (
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm"
                />
              )}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-[#080E0C]"
              >
                {authMode === "signin" ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {authMode === "signin"
                  ? "Sign In with Email"
                  : authMode === "signup"
                  ? "Register & Verify Email"
                  : "Send Recovery Link"}
              </button>
            </form>

            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2.5 text-sm font-medium"
            >
              <ShieldCheck className="h-4 w-4 text-[var(--accent-gold)]" />
              Continue with Google
            </button>

            {authMessage && (
              <p className="rounded-xl bg-[var(--accent-primary)]/10 p-3 text-xs text-[var(--accent-primary)]">
                {authMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
