"use client";

import React from "react";
import {
  Flame,
  Target,
  Layers,
  AlertTriangle,
  Sparkles,
  CalendarClock,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAppState } from "@/context/AppStateContext";
import { NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";
import type { NavSection } from "@/components/GlobalSearchModal";

export function DashboardHome({
  onNavigate,
  onOpenFocus,
}: {
  onNavigate: (s: NavSection) => void;
  onOpenFocus: () => void;
}) {
  const { profile, studyStats, flashcards, wrongQuestionIds, topicProgress } =
    useAppState();

  const dueCards = flashcards.filter(
    (c) => new Date(c.dueAt).getTime() <= Date.now()
  ).length;

  const profSubjects = NCISM_SUBJECTS.filter(
    (s) =>
      profile.professional === "INTERNSHIP" ||
      profile.professional === "PROF_4" ||
      s.professionalCode === profile.professional
  );

  const completionPct = Math.min(
    100,
    Math.round((studyStats.todayMinutes / profile.dailyStudyTargetMinutes) * 100)
  );

  const accuracy =
    studyStats.questionsAttempted > 0
      ? Math.round((studyStats.correctCount / studyStats.questionsAttempted) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero Command Header */}
      <section className="card-surface relative overflow-hidden rounded-3xl p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--accent-primary)]/15 px-3 py-0.5 text-[11px] font-semibold text-[var(--accent-primary)]">
                {profile.professional.replace("_", " ")} • {profile.university}
              </span>
              <span className="rounded-full bg-[var(--accent-gold)]/15 px-3 py-0.5 text-[11px] font-medium text-[var(--accent-gold)]">
                {profile.curriculumVersion === "NCISM_MSE_2022"
                  ? "NCISM 2021-22+"
                  : "Legacy 4-Prof"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Namaste, {profile.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Goal: {profile.examGoal} • {profSubjects.length} core subjects active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFocus}
              className="flex items-center gap-2 rounded-2xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-semibold text-[#080E0C] transition hover:opacity-90"
            >
              <Zap className="h-4 w-4" />
              Start Focus Sprint
            </button>
            <button
              onClick={() => onNavigate("mock")}
              className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 text-sm font-medium hover:border-[var(--accent-primary)]/50"
            >
              One-Tap Mock
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Daily Study Target</span>
            <Target className="h-4 w-4 text-[var(--accent-primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {studyStats.todayMinutes}{" "}
            <span className="text-sm font-normal text-[var(--text-secondary)]">
              / {profile.dailyStudyTargetMinutes}m
            </span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent-primary)]"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="card-surface rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Study Streak</span>
            <Flame className="h-4 w-4 text-[var(--accent-gold)]" />
          </div>
          <p className="mt-2 text-2xl font-bold">{studyStats.streakDays} Days</p>
          <p className="mt-2 text-xs text-[var(--accent-secondary)]">
            MCQ Accuracy: {accuracy}% ({studyStats.questionsAttempted} solved)
          </p>
        </div>

        <button
          onClick={() => onNavigate("flashcards")}
          className="card-surface rounded-2xl p-4 text-left transition hover:border-[var(--accent-primary)]/40"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>FSRS Due Cards</span>
            <Layers className="h-4 w-4 text-[var(--accent-secondary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold">{dueCards} Due</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Tap to launch spaced repetition queue
          </p>
        </button>

        <button
          onClick={() => onNavigate("practice")}
          className="card-surface rounded-2xl p-4 text-left transition hover:border-[var(--accent-gold)]/40"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Wrong-Answer Notebook</span>
            <AlertTriangle className="h-4 w-4 text-[var(--accent-gold)]" />
          </div>
          <p className="mt-2 text-2xl font-bold">{wrongQuestionIds.length} Flagged</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Retry missed questions immediately
          </p>
        </button>
      </section>

      {/* Main Grid: Performance Chart + Daily Capsule & Timetable */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface rounded-3xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Mock Exam Score Trend</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Recent accuracy progression across practice sprints
              </p>
            </div>
            <button
              onClick={() => onNavigate("analytics")}
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              Full Analytics →
            </button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyStats.mockHistory}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27C68B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#27C68B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,170,162,0.12)" />
                <XAxis dataKey="date" stroke="#9BAAA2" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#9BAAA2" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#15231D",
                    borderColor: "rgba(185,214,155,0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#27C68B"
                  strokeWidth={2}
                  fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {/* Daily Knowledge Capsule */}
          <div className="card-surface rounded-3xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-gold)]">
              <Sparkles className="h-4 w-4" />
              DAILY KNOWLEDGE CAPSULE
            </div>
            <h3 className="mt-2 text-sm font-semibold">
              Ashraya-Ashrayi Bhava Exception
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Unlike Pitta-Rakta and Kapha-Rasa/Mamsa, Vata and Asthi share an{" "}
              <strong className="text-[var(--text-primary)]">inverse</strong> relationship:
              Brimhana strengthens Asthi and pacifies Vata.
            </p>
            <p className="mt-2 text-[10px] text-[var(--accent-secondary)]">
              Source: Ashtanga Hridaya Sutrasthana 11/26–28
            </p>
          </div>

          {/* Exam Countdown */}
          <div className="card-surface rounded-3xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)]">
              <CalendarClock className="h-4 w-4" />
              TODAY&apos;S RECOMMENDED PLAN
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] px-3 py-2">
                <span>1. Revise Tridosha Quick Go Notes</span>
                <button
                  onClick={() => onNavigate("learn")}
                  className="text-[var(--accent-primary)]"
                >
                  Open
                </button>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] px-3 py-2">
                <span>2. Clear {dueCards} FSRS Flashcards</span>
                <button
                  onClick={() => onNavigate("flashcards")}
                  className="text-[var(--accent-primary)]"
                >
                  Start
                </button>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] px-3 py-2">
                <span>3. 15-Min PYQ Sprint</span>
                <button
                  onClick={() => onNavigate("pyqs")}
                  className="text-[var(--accent-primary)]"
                >
                  Go
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Active Professional Subjects Quick Grid */}
      <section className="card-surface rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your Professional Subjects</h2>
          <button
            onClick={() => onNavigate("learn")}
            className="text-xs font-medium text-[var(--accent-primary)]"
          >
            Browse All 19 NCISM Subjects →
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profSubjects.map((sub) => {
            const firstTopic = sub.topics[0];
            const pct = firstTopic ? topicProgress[firstTopic.id]?.percent ?? 0 : 0;
            return (
              <button
                key={sub.code}
                onClick={() => onNavigate("learn")}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-left transition hover:border-[var(--accent-primary)]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[var(--accent-primary)]/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent-primary)]">
                    {sub.code}
                  </span>
                  <BookOpen className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <p className="mt-2 text-sm font-semibold">{sub.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{sub.englishTitle}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{sub.topics.length} Core Topics</span>
                  <span>{pct}% Revised</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
