"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { DEMO_MCQ_POOL, NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";
import {
  generateMockExamQuestions,
  scoreMockExam,
  type ExamQuestionItem,
  type ExamResultSummary,
  type MockGenerationMode,
} from "@/lib/engines/exam-engine";
import { useAppState } from "@/context/AppStateContext";

export function MockExamStudioView() {
  const { profile, recordMockScore } = useAppState();
  const [stage, setStage] = useState<"setup" | "running" | "result">("setup");

  // Setup config
  const [mode, setMode] = useState<MockGenerationMode>("one_tap");
  const [subjectCode, setSubjectCode] = useState("ALL");
  const [questionCount, setQuestionCount] = useState(6);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [negativeMarking, setNegativeMarking] = useState(0.25);

  // Active exam state
  const [questions, setQuestions] = useState<ExamQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [result, setResult] = useState<ExamResultSummary | null>(null);

  const startMock = (overrideMode?: MockGenerationMode) => {
    const activeMode = overrideMode ?? mode;
    const generated = generateMockExamQuestions(DEMO_MCQ_POOL, {
      mode: activeMode,
      subjectCodes: subjectCode === "ALL" ? undefined : [subjectCode],
      weakTopicIds: profile.weakSubjects,
      questionCount,
      durationMinutes,
      negativeMarkingPerWrong: negativeMarking,
      randomize: true,
    });
    setQuestions(generated);
    setCurrentIndex(0);
    setResponses({});
    setMarkedForReview({});
    setSecondsLeft(durationMinutes * 60);
    setResult(null);
    setStage("running");
  };

  const handleSubmit = () => {
    const totalAllocated = durationMinutes * 60;
    const spent = Math.max(1, totalAllocated - secondsLeft);
    const summary = scoreMockExam({
      questions,
      responses,
      negativeMarkingPerWrong: negativeMarking,
      timeSpentSeconds: spent,
    });
    setResult(summary);
    setStage("result");
    const pct = summary.maxScore > 0 ? (summary.finalScore / summary.maxScore) * 100 : 0;
    recordMockScore(`Mock (${mode})`, Math.max(0, pct));
  };

  useEffect(() => {
    if (stage !== "running") return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  });

  if (stage === "setup") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">One-Tap Mock Exam Studio</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Launch timed examinations in one click or customize marks, negative marking, and syllabus scope.
            </p>
          </div>
          <button
            onClick={() => startMock("one_tap")}
            className="flex items-center gap-2 rounded-2xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-semibold text-[#080E0C]"
          >
            <Zap className="h-4 w-4" />
            One-Tap Random Mock
          </button>
        </div>

        {/* Quick Modes */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { id: "one_tap", title: "One-Tap Random", desc: "Balanced rapid mix across subjects" },
              { id: "pyq_only", title: "PYQ-Only Mock", desc: "Strictly past university pattern items" },
              { id: "weak_topic", title: "Weak-Topic Drill", desc: "Targets your flagged weak subjects" },
              { id: "rapid", title: "Rapid Revision", desc: "High-speed 10-minute recall sprint" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                startMock(m.id);
              }}
              className="card-surface rounded-2xl p-4 text-left transition hover:border-[var(--accent-primary)]/50"
            >
              <p className="text-sm font-semibold text-[var(--accent-primary)]">{m.title}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Custom Configuration */}
        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-base font-semibold">Custom Examination Configuration</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Subject Scope
              </label>
              <select
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
              >
                <option value="ALL">Full Syllabus Mix</option>
                {NCISM_SUBJECTS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Questions ({DEMO_MCQ_POOL.length} in local bank)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Negative Marking (Per Wrong)
              </label>
              <select
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
              >
                <option value={0}>No Negative Marking (0)</option>
                <option value={0.25}>-0.25 (AIAPGET Standard)</option>
                <option value={0.5}>-0.50</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => startMock()}
              className="rounded-2xl bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-[#080E0C]"
            >
              Launch Mock Examination
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "running" && questions.length > 0) {
    const activeQ = questions[currentIndex];
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const secs = String(secondsLeft % 60).padStart(2, "0");

    return (
      <div className="space-y-5">
        {/* Exam Top Bar */}
        <div className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3">
          <div>
            <span className="text-xs font-semibold text-[var(--accent-primary)]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {activeQ.subjectCode} — {activeQ.subjectName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-secondary)] px-3 py-1.5 font-mono text-sm font-bold text-[var(--accent-gold)]">
              <Clock className="h-4 w-4" />
              {mins}:{secs}
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#080E0C]"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Question Card */}
          <div className="card-surface rounded-3xl p-6 lg:col-span-8">
            <p className="text-base font-medium leading-relaxed">{activeQ.stem}</p>

            <div className="mt-5 space-y-2.5">
              {activeQ.options.map((opt) => {
                const selected = responses[activeQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setResponses((prev) => ({ ...prev, [activeQ.id]: opt.id }))
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/15"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <span className="font-mono font-semibold text-[var(--accent-primary)]">
                      {opt.label}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [activeQ.id]: !prev[activeQ.id],
                    }))
                  }
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${
                    markedForReview[activeQ.id]
                      ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  Mark for Review
                </button>
                <button
                  onClick={() =>
                    setResponses((prev) => ({ ...prev, [activeQ.id]: null }))
                  }
                  className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  className="flex items-center gap-1 rounded-xl bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="card-surface h-fit rounded-3xl p-5 lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
              Question Palette
            </h3>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const answered = Boolean(responses[q.id]);
                const review = Boolean(markedForReview[q.id]);
                const active = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "ring-2 ring-[var(--accent-primary)]"
                        : ""
                    } ${
                      review
                        ? "bg-[var(--accent-gold)]/25 text-[var(--accent-gold)]"
                        : answered
                        ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Analysis View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Examination Result & Analysis</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Detailed subject, topic, and difficulty breakdown with personalized improvement steps.
          </p>
        </div>
        <button
          onClick={() => setStage("setup")}
          className="flex items-center gap-2 rounded-2xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#080E0C]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Mock Exam
        </button>
      </div>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-surface rounded-2xl p-4">
              <p className="text-xs text-[var(--text-secondary)]">Final Score</p>
              <p className="mt-1 text-2xl font-bold text-[var(--accent-primary)]">
                {result.finalScore} / {result.maxScore}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Negative Deducted: -{result.negativeMarksDeducted}
              </p>
            </div>
            <div className="card-surface rounded-2xl p-4">
              <p className="text-xs text-[var(--text-secondary)]">Accuracy</p>
              <p className="mt-1 text-2xl font-bold">{result.accuracyPercent}%</p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {result.correct} Correct • {result.incorrect} Wrong • {result.unattempted} Skipped
              </p>
            </div>
            <div className="card-surface rounded-2xl p-4 sm:col-span-2">
              <p className="text-xs font-semibold text-[var(--accent-gold)]">
                Personalized Improvement Plan
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
                {result.improvementPlan.map((step) => (
                  <li key={step}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold">Question-by-Question Review</h2>
            {questions.map((q, idx) => {
              const selected = responses[q.id];
              const correctOpt = q.options.find((o) => o.isCorrect);
              const isCorrect = selected === correctOpt?.id;
              return (
                <div key={q.id} className="card-surface rounded-2xl p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Q{idx + 1}. {q.stem}
                    </span>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2.5 py-0.5 font-semibold ${
                        !selected
                          ? "bg-white/5 text-[var(--text-secondary)]"
                          : isCorrect
                          ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {!selected ? "Unattempted" : isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="mt-2 text-[var(--accent-secondary)]">
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                    Correct: {correctOpt?.label}. {correctOpt?.text}
                  </p>
                  <p className="mt-1 text-[var(--text-secondary)]">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
