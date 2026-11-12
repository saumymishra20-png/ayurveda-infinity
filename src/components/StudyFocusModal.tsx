"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, X, Coffee, Sparkles } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { NCISM_SUBJECTS } from "@/data/bams-ecosystem-data";

export function StudyFocusModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addStudyMinutes } = useAppState();
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [subjectCode, setSubjectCode] = useState("AyUG-KS");
  const [sessionNotes, setSessionNotes] = useState("");
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if (mode === "focus") {
            addStudyMinutes(25);
            setCompletedMessage("25-minute Focus Session logged! Take a 5-minute break.");
            setMode("break");
            return 5 * 60;
          } else {
            setCompletedMessage("Break complete. Ready for your next focus sprint.");
            setMode("focus");
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, addStudyMinutes]);

  if (!open) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const handleLogEarly = () => {
    const elapsedMins = Math.max(1, Math.round((25 * 60 - secondsLeft) / 60));
    addStudyMinutes(elapsedMins);
    setCompletedMessage(`Logged ${elapsedMins} minute(s) to today's study tracker.`);
    setRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="card-surface w-full max-w-lg rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "focus" ? (
              <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            ) : (
              <Coffee className="h-5 w-5 text-[var(--accent-gold)]" />
            )}
            <h2 className="text-lg font-semibold">
              {mode === "focus" ? "Distraction-Free Study Mode" : "Mindful Break"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-6 flex flex-col items-center justify-center rounded-2xl bg-[var(--bg-secondary)] py-8">
          <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            {mode === "focus" ? "Pomodoro Sprint" : "Recovery Break"}
          </span>
          <div className="mt-2 font-mono text-6xl font-bold tracking-tight text-[var(--accent-primary)]">
            {mins}:{secs}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex items-center gap-2 rounded-full bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-[#080E0C] transition hover:opacity-90"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setSecondsLeft(mode === "focus" ? 25 * 60 : 5 * 60);
              }}
              className="rounded-full border border-[var(--border-subtle)] p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {mode === "focus" && (
              <button
                onClick={handleLogEarly}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--accent-secondary)] hover:bg-white/5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finish & Log
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">
              Active Subject
            </label>
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:outline-none"
            >
              {NCISM_SUBJECTS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">
              Session Scratchpad
            </label>
            <textarea
              rows={3}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Jot down Sanskrit shlokas, weak concepts, or quick recall points..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 text-sm focus:outline-none"
            />
          </div>

          {completedMessage && (
            <div className="rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 px-3 py-2 text-xs text-[var(--accent-primary)]">
              {completedMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
