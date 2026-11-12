"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  FileText,
  Pin,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { NCISM_SUBJECTS, SMART_NOTES_LIBRARY } from "@/data/bams-ecosystem-data";
import { useAppState } from "@/context/AppStateContext";

export function SyllabusNotesView() {
  const {
    profile,
    topicProgress,
    updateTopicProgress,
    bookmarks,
    toggleBookmark,
    personalNotes,
    savePersonalNote,
    deletePersonalNote,
  } = useAppState();

  const [selectedProf, setSelectedProf] = useState<string>("ALL");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("AyUG-KS");
  const [noteTier, setNoteTier] = useState<"master" | "easy" | "quick_go" | "personal">(
    "master"
  );

  // Personal Note Editor state
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("High-Yield, Exam");
  const [aiNoteDraft, setAiNoteDraft] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const visibleSubjects = useMemo(() => {
    if (selectedProf === "ALL") return NCISM_SUBJECTS;
    return NCISM_SUBJECTS.filter((s) => s.professionalCode === selectedProf);
  }, [selectedProf]);

  const activeSubject =
    NCISM_SUBJECTS.find((s) => s.code === selectedSubjectCode) ?? visibleSubjects[0];

  const activeNoteBundle =
    SMART_NOTES_LIBRARY.find((n) => n.subjectCode === activeSubject?.code) ??
    SMART_NOTES_LIBRARY[0];

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    savePersonalNote({
      id: editingId,
      title: noteTitle.trim(),
      subjectCode: activeSubject.code,
      content: noteContent.trim(),
      tags: noteTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      pinned: false,
    });
    setEditingId(undefined);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleGenerateAiNotes = async (tierLabel: string) => {
    setAiLoading(true);
    setAiNoteDraft(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "notes",
          prompt: `Create ${tierLabel} for BAMS subject ${activeSubject.name} (${activeSubject.code}), focusing on ${activeSubject.topics[0]?.title}. Include authentic Sanskrit terms without fabricating shloka numbers.`,
          studentContext: {
            professional: profile.professional,
            subject: activeSubject.name,
            language: profile.preferredLanguage,
          },
        }),
      });
      const data = await res.json();
      setAiNoteDraft(data.text || data.error);
    } catch {
      setAiNoteDraft("Unable to reach AI endpoint right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">NCISM Syllabus & 4-Tier Smart Notes</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Structured Professional → Subject → Topic hierarchy with Master, Easy, Quick Go & Personal Notes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PROF_1", "PROF_2", "PROF_3"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProf(p)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedProf === p
                  ? "bg-[var(--accent-primary)] text-[#080E0C]"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
              }`}
            >
              {p === "ALL" ? "All Professionals" : p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Subject & Topic Selector */}
        <div className="card-surface space-y-3 rounded-3xl p-4 lg:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Subjects ({visibleSubjects.length})
          </h2>
          <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
            {visibleSubjects.map((sub) => {
              const isSelected = sub.code === activeSubject?.code;
              return (
                <div
                  key={sub.code}
                  className={`rounded-2xl border p-3 transition ${
                    isSelected
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                  }`}
                >
                  <button
                    onClick={() => setSelectedSubjectCode(sub.code)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold text-[var(--accent-primary)]">
                        {sub.code}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {sub.professionalCode.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{sub.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {sub.englishTitle}
                    </p>
                  </button>

                  {isSelected && (
                    <div className="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-3">
                      {sub.topics.map((topic) => {
                        const prog = topicProgress[topic.id]?.percent ?? 0;
                        const bookmarked = bookmarks.includes(topic.id);
                        return (
                          <div
                            key={topic.id}
                            className="rounded-xl bg-[var(--bg-primary)]/60 p-2.5 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{topic.title}</p>
                                {topic.sanskritTerm && (
                                  <p className="text-[11px] text-[var(--accent-gold)]">
                                    {topic.sanskritTerm}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleBookmark(topic.id)}
                                  className={`p-1 ${
                                    bookmarked
                                      ? "text-[var(--accent-gold)]"
                                      : "text-[var(--text-secondary)]"
                                  }`}
                                  title="Bookmark topic"
                                >
                                  <Bookmark className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    updateTopicProgress(topic.id, prog >= 100 ? 0 : 100, 5)
                                  }
                                  className={`p-1 ${
                                    prog >= 100
                                      ? "text-[var(--accent-primary)]"
                                      : "text-[var(--text-secondary)]"
                                  }`}
                                  title="Mark completed"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <a
                        href={sub.ncismSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--accent-secondary)] hover:underline"
                      >
                        Official NCISM Syllabus <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Tier Smart Notes Workspace */}
        <div className="card-surface rounded-3xl p-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "master", label: "A. Master Notes" },
                  { id: "easy", label: "B. Easy Notes" },
                  { id: "quick_go", label: "C. Quick Go (5-15m)" },
                  { id: "personal", label: "D. Personal Notes" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setNoteTier(t.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    noteTier === t.id
                      ? "bg-[var(--accent-primary)] text-[#080E0C]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateAiNotes(noteTier)}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiLoading ? "Generating..." : "AI Notes Maker"}
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Print / Export PDF"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>

          {aiNoteDraft && (
            <div className="mt-4 rounded-2xl border border-[var(--accent-gold)]/40 bg-[var(--bg-secondary)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-[var(--accent-gold)]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent-gold)]">
                  AI-Generated Study Aid • Verify with Samhita
                </span>
                <button
                  onClick={() => setAiNoteDraft(null)}
                  className="text-xs text-[var(--text-secondary)]"
                >
                  Dismiss
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[var(--text-primary)]">
                {aiNoteDraft}
              </pre>
            </div>
          )}

          {noteTier !== "personal" ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-[var(--accent-gold)]">
                    {activeNoteBundle.sanskritTerm}
                  </span>
                  <h2 className="text-xl font-bold">{activeNoteBundle.title}</h2>
                </div>
                <span className="rounded-full bg-[var(--accent-primary)]/15 px-3 py-1 text-[10px] font-semibold uppercase text-[var(--accent-primary)]">
                  {activeNoteBundle.verificationStatus} • {activeNoteBundle.sourceCitation}
                </span>
              </div>

              {noteTier === "master" && (
                <div className="space-y-4 text-sm leading-relaxed">
                  <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-primary)]">
                      Definition & Introduction
                    </h3>
                    <p className="mt-1.5">{activeNoteBundle.masterNote.definition}</p>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {activeNoteBundle.masterNote.introduction}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-secondary)]">
                      Classification
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                      {activeNoteBundle.masterNote.classification.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-secondary)]">
                      Detailed Explanation & Clinical Significance
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      {activeNoteBundle.masterNote.detailedExplanation}
                    </p>
                    <p className="mt-2 rounded-xl border border-[var(--border-subtle)] p-3 text-xs">
                      <strong className="text-[var(--accent-gold)]">Clinical Pearl: </strong>
                      {activeNoteBundle.masterNote.clinicalSignificance}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-gold)]">
                      High-Yield University Exam Points
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {activeNoteBundle.masterNote.examPoints.map((pt) => (
                        <li
                          key={pt}
                          className="rounded-xl bg-[var(--bg-secondary)] px-3 py-2"
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {noteTier === "easy" && (
                <div className="space-y-4 text-sm">
                  <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 p-4">
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-primary)]">
                      Simple Hinglish Explanation
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {activeNoteBundle.easyNote.hinglishSummary}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-gold)]">
                      Everyday Analogy
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed">
                      {activeNoteBundle.easyNote.everydayAnalogy}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          <th className="py-2">Parameter</th>
                          <th className="py-2">Ayurveda Concept</th>
                          <th className="py-2">Modern Correlate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeNoteBundle.easyNote.comparisonTable.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-[var(--border-subtle)]/50"
                          >
                            <td className="py-2 font-medium">{row.parameter}</td>
                            <td className="py-2 text-[var(--accent-secondary)]">
                              {row.ayurveda}
                            </td>
                            <td className="py-2 text-[var(--text-secondary)]">
                              {row.modern}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {noteTier === "quick_go" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-primary)]">
                      One-Line High-Yield Facts
                    </h3>
                    <ul className="mt-2 space-y-2 text-xs">
                      {activeNoteBundle.quickGoNote.oneLiners.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
                    <h3 className="text-xs font-semibold uppercase text-[var(--accent-gold)]">
                      Memory Tricks & Mnemonics
                    </h3>
                    <ul className="mt-2 space-y-2 text-xs">
                      {activeNoteBundle.quickGoNote.memoryTricks.map((m) => (
                        <li key={m}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 sm:col-span-2">
                    <h3 className="text-xs font-semibold uppercase text-rose-400">
                      Common Exam Mistakes to Avoid
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
                      {activeNoteBundle.quickGoNote.commonMistakes.map((err) => (
                        <li key={err}>⚠ {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <form onSubmit={handleSaveNote} className="space-y-3 rounded-2xl bg-[var(--bg-secondary)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Plus className="h-4 w-4 text-[var(--accent-primary)]" />
                    {editingId ? "Edit Personal Note" : "Create Personal Note"} ({activeSubject.code})
                  </h3>
                </div>
                <input
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title (e.g., Panchavidha Vata Viva Summary)"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                />
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write structured notes, Sanskrit quotations, or table summaries..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#080E0C]"
                  >
                    Save Note (Autosave + Version History)
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {personalNotes.map((pn) => (
                  <div
                    key={pn.id}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-[var(--accent-primary)]">
                          {pn.subjectCode}
                        </span>
                        <h4 className="text-sm font-semibold">{pn.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingId(pn.id);
                            setNoteTitle(pn.title);
                            setNoteContent(pn.content);
                            setNoteTags(pn.tags.join(", "));
                          }}
                          className="rounded-lg p-1.5 text-xs text-[var(--text-secondary)] hover:bg-white/5"
                          title="Edit"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            savePersonalNote({ ...pn, pinned: !pn.pinned })
                          }
                          className={`rounded-lg p-1.5 ${
                            pn.pinned
                              ? "text-[var(--accent-gold)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                          title="Pin note"
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deletePersonalNote(pn.id)}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-white/5"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-[var(--text-secondary)]">
                      {pn.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                      {pn.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/5 px-2 py-0.5 text-[var(--accent-secondary)]"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="ml-auto">
                        Versions: {pn.versions.length + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
