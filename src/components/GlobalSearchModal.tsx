"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, X, BookOpen, FileText, HelpCircle, BookA, Stethoscope } from "lucide-react";
import {
  DEMO_MCQ_POOL,
  DEMO_PYQ_BANK,
  INITIAL_GLOSSARY,
  NCISM_SUBJECTS,
  PRACTICAL_MODULES,
  SMART_NOTES_LIBRARY,
} from "@/data/bams-ecosystem-data";

export type NavSection =
  | "home"
  | "learn"
  | "practice"
  | "mock"
  | "pyqs"
  | "ai"
  | "mindmap"
  | "flashcards"
  | "glossary"
  | "practicals"
  | "planner"
  | "analytics"
  | "library"
  | "community"
  | "admin";

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection, contextId?: string) => void;
}

export function GlobalSearchModal({
  open,
  onClose,
  onNavigate,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: {
      id: string;
      title: string;
      subtitle: string;
      category: string;
      section: NavSection;
    }[] = [];

    for (const s of NCISM_SUBJECTS) {
      if (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.englishTitle.toLowerCase().includes(q)
      ) {
        items.push({
          id: s.code,
          title: `${s.code} — ${s.name}`,
          subtitle: s.englishTitle,
          category: "Subject",
          section: "learn",
        });
      }
      for (const t of s.topics) {
        if (t.title.toLowerCase().includes(q)) {
          items.push({
            id: t.id,
            title: t.title,
            subtitle: `${s.code} • ${s.name}`,
            category: "Topic",
            section: "learn",
          });
        }
      }
    }

    for (const n of SMART_NOTES_LIBRARY) {
      if (n.title.toLowerCase().includes(q)) {
        items.push({
          id: n.topicId,
          title: n.title,
          subtitle: `Smart Notes (${n.subjectCode})`,
          category: "Notes",
          section: "learn",
        });
      }
    }

    for (const p of DEMO_PYQ_BANK) {
      if (p.question.toLowerCase().includes(q) || p.topicTitle.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          title: p.question.slice(0, 90) + (p.question.length > 90 ? "…" : ""),
          subtitle: `${p.subjectCode} • ${p.qType} (${p.examYear})`,
          category: "PYQ",
          section: "pyqs",
        });
      }
    }

    for (const m of DEMO_MCQ_POOL) {
      if (m.stem.toLowerCase().includes(q)) {
        items.push({
          id: m.id,
          title: m.stem.slice(0, 90) + "…",
          subtitle: `${m.subjectCode} • MCQ`,
          category: "MCQ",
          section: "practice",
        });
      }
    }

    for (const g of INITIAL_GLOSSARY) {
      if (
        g.sanskritTerm.toLowerCase().includes(q) ||
        g.englishMeaning.toLowerCase().includes(q)
      ) {
        items.push({
          id: g.id,
          title: `${g.sanskritTerm} (${g.devanagari})`,
          subtitle: g.englishMeaning,
          category: "Glossary",
          section: "glossary",
        });
      }
    }

    for (const pr of PRACTICAL_MODULES) {
      if (pr.title.toLowerCase().includes(q)) {
        items.push({
          id: pr.id,
          title: pr.title,
          subtitle: `${pr.subjectCode} • ${pr.category}`,
          category: "Practical",
          section: "practicals",
        });
      }
    }

    return items.slice(0, 12);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
      <div className="card-surface w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <Search className="h-5 w-5 text-[var(--accent-primary)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BAMS subjects, topics, PYQs, MCQs, Sanskrit terms, practicals..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-white/5"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              Type keywords like <span className="text-[var(--accent-primary)]">Tridosha</span>,{" "}
              <span className="text-[var(--accent-primary)]">Shatkriyakala</span>,{" "}
              <span className="text-[var(--accent-primary)]">Marma</span>, or{" "}
              <span className="text-[var(--accent-primary)]">Ksharasutra</span>.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No matching academic records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => {
                    onNavigate(item.section, item.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    {item.category === "Subject" || item.category === "Topic" ? (
                      <BookOpen className="h-4 w-4 text-[var(--accent-primary)]" />
                    ) : item.category === "Notes" ? (
                      <FileText className="h-4 w-4 text-[var(--accent-secondary)]" />
                    ) : item.category === "Glossary" ? (
                      <BookA className="h-4 w-4 text-[var(--accent-gold)]" />
                    ) : item.category === "Practical" ? (
                      <Stethoscope className="h-4 w-4 text-[var(--accent-primary)]" />
                    ) : (
                      <HelpCircle className="h-4 w-4 text-[var(--accent-gold)]" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-[var(--accent-secondary)]">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
