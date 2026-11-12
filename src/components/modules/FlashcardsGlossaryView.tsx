"use client";

import React, { useMemo, useState } from "react";
import { RotateCw, Search, BookA, Layers } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { INITIAL_GLOSSARY } from "@/data/bams-ecosystem-data";
import { summarizeDeckStats, type FsrsRating } from "@/lib/engines/fsrs";

export function FlashcardsView() {
  const { flashcards, reviewFlashcard } = useAppState();
  const [flipped, setFlipped] = useState(false);

  const stats = useMemo(() => summarizeDeckStats(flashcards), [flashcards]);
  const dueCards = useMemo(
    () => flashcards.filter((c) => new Date(c.dueAt).getTime() <= Date.now()),
    [flashcards]
  );

  const currentCard = dueCards[0] ?? flashcards[0];

  const handleRate = (rating: FsrsRating) => {
    if (!currentCard) return;
    reviewFlashcard(currentCard.id, rating);
    setFlipped(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Layers className="h-5 w-5 text-[var(--accent-primary)]" />
          FSRS Spaced-Repetition Flashcards
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Active recall powered by Free Spaced Repetition Scheduler (FSRS).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Due Now</p>
          <p className="text-xl font-bold text-[var(--accent-primary)]">{stats.dueCount}</p>
        </div>
        <div className="card-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-[var(--text-secondary)]">New</p>
          <p className="text-xl font-bold">{stats.newCount}</p>
        </div>
        <div className="card-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Learning</p>
          <p className="text-xl font-bold text-[var(--accent-gold)]">{stats.learningCount}</p>
        </div>
        <div className="card-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Mature</p>
          <p className="text-xl font-bold text-[var(--accent-secondary)]">{stats.matureCount}</p>
        </div>
      </div>

      {currentCard && (
        <div className="card-surface mx-auto max-w-2xl rounded-3xl p-6 text-center">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span className="font-mono text-[var(--accent-primary)]">
              {currentCard.subjectCode} • {currentCard.cardType}
            </span>
            <span>
              State: {currentCard.state} • Reps: {currentCard.reps}
            </span>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            className="my-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[var(--bg-secondary)] p-6 transition hover:bg-[var(--bg-elevated)]"
          >
            {currentCard.sanskrit && (
              <p className="mb-2 text-sm text-[var(--accent-gold)]">
                {currentCard.sanskrit}
              </p>
            )}
            <p className="text-lg font-semibold">
              {flipped ? currentCard.back : currentCard.front}
            </p>
            <span className="mt-4 flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <RotateCw className="h-3 w-3" /> Tap card to flip
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { r: 1, label: "Again", cls: "bg-rose-500/15 text-rose-400" },
                { r: 2, label: "Hard", cls: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]" },
                { r: 3, label: "Good", cls: "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]" },
                { r: 4, label: "Easy", cls: "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]" },
              ] as const
            ).map((btn) => (
              <button
                key={btn.r}
                onClick={() => handleRate(btn.r)}
                className={`rounded-xl py-2.5 text-xs font-semibold transition hover:opacity-85 ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GlossaryView() {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INITIAL_GLOSSARY;
    return INITIAL_GLOSSARY.filter(
      (g) =>
        g.sanskritTerm.toLowerCase().includes(q) ||
        g.englishMeaning.toLowerCase().includes(q) ||
        g.devanagari.includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookA className="h-5 w-5 text-[var(--accent-gold)]" />
          Ayurvedic Terminology Dictionary
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Verified Sanskrit terms with Devanagari script, transliteration, Hindi & English meanings, and Samhita citations.
        </p>
      </div>

      <div className="card-surface flex items-center gap-2 rounded-2xl px-4 py-3">
        <Search className="h-4 w-4 text-[var(--text-secondary)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Sanskrit term, Devanagari, or English meaning..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((g) => (
          <div key={g.id} className="card-surface rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--accent-primary)]">
                  {g.sanskritTerm}{" "}
                  <span className="font-normal text-[var(--accent-gold)]">
                    ({g.devanagari})
                  </span>
                </h3>
                <p className="text-xs italic text-[var(--text-secondary)]">
                  {g.transliteration} • {g.subjectCode}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{g.englishMeaning}</p>
            <p className="mt-1 text-xs text-[var(--accent-secondary)]">
              Hindi: {g.hindiMeaning}
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              {g.contextualExplanation}
            </p>
            <p className="mt-3 text-[11px] text-[var(--accent-gold)]">
              Source: {g.referenceSource}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
