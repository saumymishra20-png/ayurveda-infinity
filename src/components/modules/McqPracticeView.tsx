"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Sparkles, RotateCcw, BookOpen } from "lucide-react";
import { DEMO_MCQ_POOL, NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";
import { useAppState } from "@/context/AppStateContext";
import type { ExamQuestionItem } from "@/lib/engines/exam-engine";

export function McqPracticeView() {
  const { wrongQuestionIds, recordQuestionResult, profile } = useAppState();
  const [mode, setMode] = useState<"learning" | "exam">("learning");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [wrongOnly, setWrongOnly] = useState(false);
  const [extraAiQuestions, setExtraAiQuestions] = useState<ExamQuestionItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  const pool = useMemo(() => {
    const combined = [...DEMO_MCQ_POOL, ...extraAiQuestions];
    return combined.filter((q) => {
      if (subjectFilter !== "ALL" && q.subjectCode !== subjectFilter) return false;
      if (wrongOnly && !wrongQuestionIds.includes(q.id)) return false;
      return true;
    });
  }, [subjectFilter, wrongOnly, wrongQuestionIds, extraAiQuestions]);

  const handleSelect = (q: ExamQuestionItem, optionId: string) => {
    if (mode === "learning" && answers[q.id]) return;
    if (mode === "exam" && examSubmitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
    if (mode === "learning") {
      const opt = q.options.find((o) => o.id === optionId);
      recordQuestionResult(q.id, Boolean(opt?.isCorrect));
    }
  };

  const handleSubmitExamMode = () => {
    setExamSubmitted(true);
    for (const q of pool) {
      const chosen = answers[q.id];
      if (chosen) {
        const opt = q.options.find((o) => o.id === chosen);
        recordQuestionResult(q.id, Boolean(opt?.isCorrect));
      }
    }
  };

  const handleGenerateAiMcqs = async () => {
    setAiLoading(true);
    try {
      const targetSub =
        NCISM_SUBJECTS.find((s) => s.code === subjectFilter) ?? NCISM_SUBJECTS[2];
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "mcq",
          prompt: `Generate 2 high-yield BAMS MCQs for ${targetSub.name} (${targetSub.code}) with 4 options, 1 correct option, explanation, and authentic reference.`,
          studentContext: {
            professional: profile.professional,
            subject: targetSub.name,
          },
        }),
      });
      const data = await res.json();
      if (data.configured && data.text) {
        const parsed = JSON.parse(data.text);
        const mapped: ExamQuestionItem[] = (parsed.questions || []).map(
          (item: any, idx: number) => ({
            id: `ai-mcq-${Date.now()}-${idx}`,
            subjectCode: targetSub.code,
            subjectName: targetSub.name,
            topicId: targetSub.topics[0]?.id || "ai-topic",
            topicTitle: targetSub.topics[0]?.title || targetSub.name,
            qType: "mcq_single",
            stem: item.stem,
            options: (item.options || []).map((o: any, oi: number) => ({
              id: `ai-opt-${Date.now()}-${idx}-${oi}`,
              label: o.label,
              text: o.text,
              isCorrect: Boolean(o.isCorrect),
            })),
            marks: 1,
            difficulty: "medium",
            isPyq: false,
            isAiGenerated: true,
            sourceLabel: "AI-Generated Practice Question (Gemini)",
            explanation: item.explanation,
            ayurvedicReference: item.ayurvedicReference,
          })
        );
        setExtraAiQuestions((prev) => [...mapped, ...prev]);
      }
    } catch {
      // ignore malformed JSON if API not configured
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">MCQ Practice & Wrong-Answer Notebook</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Switch between instant Learning Mode and timed Exam Mode with detailed Ayurvedic explanations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setMode("learning");
              setExamSubmitted(false);
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
              mode === "learning"
                ? "bg-[var(--accent-primary)] text-[#080E0C]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
            }`}
          >
            Learning Mode
          </button>
          <button
            onClick={() => {
              setMode("exam");
              setExamSubmitted(false);
              setAnswers({});
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
              mode === "exam"
                ? "bg-[var(--accent-gold)] text-[#080E0C]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
            }`}
          >
            Exam Mode
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card-surface flex flex-wrap items-center gap-3 rounded-2xl p-4">
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

        <button
          onClick={() => setWrongOnly((w) => !w)}
          className={`rounded-xl border px-3 py-2 text-xs font-medium ${
            wrongOnly
              ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
          }`}
        >
          Wrong-Answer Notebook ({wrongQuestionIds.length})
        </button>

        <button
          onClick={handleGenerateAiMcqs}
          disabled={aiLoading}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)]/15 px-3.5 py-2 text-xs font-semibold text-[var(--accent-primary)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {aiLoading ? "Generating..." : "AI MCQ Generator"}
        </button>

        <button
          onClick={() => {
            setAnswers({});
            setExamSubmitted(false);
          }}
          className="rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)]"
          title="Reset responses"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {pool.length === 0 ? (
          <div className="card-surface rounded-2xl p-8 text-center text-sm text-[var(--text-secondary)]">
            No MCQs match the active filter. Try disabling Wrong-Answer Notebook filter or selecting All Subjects.
          </div>
        ) : (
          pool.map((q, idx) => {
            const chosenId = answers[q.id];
            const reveal =
              (mode === "learning" && Boolean(chosenId)) ||
              (mode === "exam" && examSubmitted);

            return (
              <div key={q.id} className="card-surface rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[var(--accent-primary)]">
                      Q{idx + 1} • {q.subjectCode}
                    </span>
                    <span className="rounded bg-white/5 px-2 py-0.5 uppercase">
                      {q.difficulty}
                    </span>
                    {q.isAiGenerated && (
                      <span className="rounded bg-[var(--accent-gold)]/20 px-2 py-0.5 text-[var(--accent-gold)]">
                        AI-Generated
                      </span>
                    )}
                  </div>
                  <span className="text-[var(--text-secondary)]">{q.sourceLabel}</span>
                </div>

                <p className="mt-3 text-sm font-medium leading-relaxed">{q.stem}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const isSelected = chosenId === opt.id;
                    let borderStyle = "border-[var(--border-subtle)] bg-[var(--bg-secondary)]";
                    if (reveal) {
                      if (opt.isCorrect) {
                        borderStyle = "border-[var(--accent-primary)] bg-[var(--accent-primary)]/15";
                      } else if (isSelected && !opt.isCorrect) {
                        borderStyle = "border-rose-500 bg-rose-500/15";
                      }
                    } else if (isSelected) {
                      borderStyle = "border-[var(--accent-gold)] bg-[var(--accent-gold)]/15";
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(q, opt.id)}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${borderStyle}`}
                      >
                        <span>
                          <strong className="mr-2">{opt.label}.</strong>
                          {opt.text}
                        </span>
                        {reveal && opt.isCorrect && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                        )}
                        {reveal && isSelected && !opt.isCorrect && (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {reveal && (
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3.5 text-xs">
                    <p className="font-semibold text-[var(--accent-primary)]">
                      Explanation
                    </p>
                    <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
                      {q.explanation}
                    </p>
                    {q.ayurvedicReference && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--accent-gold)]">
                        <BookOpen className="h-3.5 w-3.5" />
                        Reference: {q.ayurvedicReference}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {mode === "exam" && !examSubmitted && pool.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmitExamMode}
            className="rounded-2xl bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[#080E0C]"
          >
            Submit Practice Set
          </button>
        </div>
      )}
    </div>
  );
}
