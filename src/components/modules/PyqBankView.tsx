"use client";

import React, { useMemo, useState } from "react";
import { Search, Bookmark, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { DEMO_PYQ_BANK, NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";
import { analyzePyqRecurrence } from "@/lib/engines/pyq-analytics";
import { useAppState } from "@/context/AppStateContext";

export function PyqBankView() {
  const { bookmarks, toggleBookmark, profile } = useAppState();
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [aiOutlines, setAiOutlines] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DEMO_PYQ_BANK.filter((item) => {
      if (subjectFilter !== "ALL" && item.subjectCode !== subjectFilter) return false;
      if (typeFilter !== "ALL" && item.qType !== typeFilter) return false;
      if (
        q &&
        !item.question.toLowerCase().includes(q) &&
        !item.topicTitle.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [query, subjectFilter, typeFilter]);

  const analytics = useMemo(() => analyzePyqRecurrence(filtered), [filtered]);

  const generateOutline = async (id: string, question: string, subjectName: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "professor",
          prompt: `Provide a structured university exam answer outline (Intro, Classical Reference, Key Points, Clinical Correlation) for: "${question}" (${subjectName}).`,
          studentContext: { professional: profile.professional, subject: subjectName },
        }),
      });
      const data = await res.json();
      setAiOutlines((prev) => ({ ...prev, [id]: data.text || data.error }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PYQ Engine & Recurrence Analytics</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Search university-style questions, inspect concept recurrence clusters, and generate structured answer outlines.
        </p>
      </div>

      {/* Integrity Banner */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 p-3.5 text-xs text-[var(--accent-gold)]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Verification Transparency:</strong> Sample entries below are clearly labeled{" "}
          <em>Demonstration Sample</em>. Official university question papers uploaded by administrators enter a verification queue before being marked Verified. {analytics.disclaimer}
        </p>
      </div>

      {/* Filters */}
      <div className="card-surface grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2">
          <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PYQs or topics..."
            className="w-full bg-transparent text-xs focus:outline-none"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
        >
          <option value="ALL">All Subjects</option>
          {NCISM_SUBJECTS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
        >
          <option value="ALL">All Question Types</option>
          <option value="LAQ">Long Answer (LAQ)</option>
          <option value="SAQ">Short Answer (SAQ)</option>
          <option value="Short Note">Short Note</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* PYQ List */}
        <div className="space-y-3 lg:col-span-8">
          {filtered.map((item) => {
            const isBookmarked = bookmarks.includes(item.id);
            return (
              <div key={item.id} className="card-surface rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="rounded-md bg-[var(--accent-primary)]/15 px-2 py-0.5 font-mono font-semibold text-[var(--accent-primary)]">
                      {item.subjectCode}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5">
                      {item.qType} • {item.marks} Marks
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5">
                      {item.university} • {item.examYear}
                    </span>
                    <span className="rounded-md bg-[var(--accent-gold)]/15 px-2 py-0.5 text-[var(--accent-gold)]">
                      {item.verificationStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className={
                      isBookmarked
                        ? "text-[var(--accent-gold)]"
                        : "text-[var(--text-secondary)]"
                    }
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2.5 text-sm font-medium leading-relaxed">
                  {item.question}
                </p>

                {item.referenceAnswer && (
                  <p className="mt-2 rounded-xl bg-[var(--bg-secondary)] p-2.5 text-xs text-[var(--text-secondary)]">
                    <strong className="text-[var(--accent-secondary)]">Reference Outline: </strong>
                    {item.referenceAnswer}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Topic: {item.topicTitle}
                  </span>
                  <button
                    onClick={() =>
                      generateOutline(item.id, item.question, item.subjectName)
                    }
                    disabled={loadingId === item.id}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)]/15 px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {loadingId === item.id ? "Generating..." : "AI Answer Outline"}
                  </button>
                </div>

                {aiOutlines[item.id] && (
                  <div className="mt-3 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--bg-secondary)] p-3 text-xs whitespace-pre-wrap">
                    {aiOutlines[item.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concept Recurrence Engine */}
        <div className="card-surface h-fit space-y-4 rounded-3xl p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-[var(--accent-primary)]" />
            Concept Recurrence Clusters
          </div>
          <div className="space-y-3">
            {analytics.clusters.map((cl) => (
              <div
                key={cl.conceptKey}
                className="rounded-2xl bg-[var(--bg-secondary)] p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--accent-primary)]">
                    {cl.appearanceCount}x Appeared
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--accent-gold)]">
                    {cl.priorityBand}
                  </span>
                </div>
                <p className="mt-1 font-medium">{cl.topicTitle}</p>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  Years: {cl.yearsAppeared.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
