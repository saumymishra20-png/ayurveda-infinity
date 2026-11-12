"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_FLASHCARDS } from "@/data/bams-ecosystem-data";
import { scheduleFsrsCard, type FsrsRating } from "@/lib/engines/fsrs";

export interface StudentProfile {
  name: string;
  email: string;
  isGuest: boolean;
  role: "student" | "content_editor" | "academic_reviewer" | "admin";
  curriculumVersion: "NCISM_MSE_2022" | "CCIM_LEGACY_4PROF";
  professional: "PROF_1" | "PROF_2" | "PROF_3" | "PROF_4" | "INTERNSHIP";
  university: string;
  college: string;
  academicYear: string;
  preferredLanguage: "English" | "Hindi" | "Hinglish";
  dailyStudyTargetMinutes: number;
  examGoal: string;
  strongSubjects: string[];
  weakSubjects: string[];
  onboardingCompleted: boolean;
}

export interface PersonalNote {
  id: string;
  title: string;
  subjectCode: string;
  topicId?: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
  versions: { timestamp: string; content: string }[];
}

export interface StudyStats {
  streakDays: number;
  todayMinutes: number;
  questionsAttempted: number;
  correctCount: number;
  mockHistory: { date: string; score: number; title: string }[];
}

interface AppContextValue {
  theme: "dark" | "light";
  toggleTheme: () => void;
  profile: StudentProfile;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  personalNotes: PersonalNote[];
  savePersonalNote: (note: Omit<PersonalNote, "updatedAt" | "versions"> & { id?: string }) => void;
  deletePersonalNote: (id: string) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  wrongQuestionIds: string[];
  recordQuestionResult: (questionId: string, isCorrect: boolean) => void;
  topicProgress: Record<string, { status: string; percent: number; confidence: number }>;
  updateTopicProgress: (topicId: string, percent: number, confidence?: number) => void;
  flashcards: typeof INITIAL_FLASHCARDS;
  reviewFlashcard: (id: string, rating: FsrsRating) => void;
  studyStats: StudyStats;
  addStudyMinutes: (mins: number) => void;
  recordMockScore: (title: string, scorePercent: number) => void;
  isOnline: boolean;
  pendingSyncCount: number;
}

const DEFAULT_PROFILE: StudentProfile = {
  name: "Aarav Sharma",
  email: "guest@ayurvedainfinity.edu",
  isGuest: true,
  role: "student",
  curriculumVersion: "NCISM_MSE_2022",
  professional: "PROF_1",
  university: "MUHS",
  college: "Government Ayurved College",
  academicYear: "2026-27",
  preferredLanguage: "English",
  dailyStudyTargetMinutes: 180,
  examGoal: "University Distinction & AIAPGET Foundation",
  strongSubjects: ["AyUG-KS"],
  weakSubjects: ["AyUG-RS"],
  onboardingCompleted: false,
};

const AppStateContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([
    {
      id: "pn-1",
      title: "Vata Prakriti Viva Checklist",
      subjectCode: "AyUG-KS",
      content:
        "Key Charaka Vimanasthana 8/98 features: Ruksha, Laghu, Chala, Bahu, Shighra, Shita, Parusha, Vishada. Always correlate with clinical pulse & bowel pattern.",
      tags: ["Viva", "Tridosha", "High-Yield"],
      pinned: true,
      updatedAt: new Date().toISOString(),
      versions: [],
    },
  ]);
  const [bookmarks, setBookmarks] = useState<string[]>(["top-ks-tridosha", "pyq-demo-1"]);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>(["mcq-4"]);
  const [topicProgress, setTopicProgress] = useState<
    Record<string, { status: string; percent: number; confidence: number }>
  >({
    "top-ks-tridosha": { status: "completed", percent: 100, confidence: 5 },
    "top-pv-shatpadartha": { status: "in_progress", percent: 65, confidence: 4 },
    "top-rs-marma": { status: "needs_revision", percent: 40, confidence: 2 },
  });
  const [flashcards, setFlashcards] = useState(INITIAL_FLASHCARDS);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    streakDays: 7,
    todayMinutes: 85,
    questionsAttempted: 42,
    correctCount: 34,
    mockHistory: [
      { date: "Nov 05", score: 68, title: "Prof 1 Rapid" },
      { date: "Nov 07", score: 74, title: "Kriya Sharir" },
      { date: "Nov 09", score: 79, title: "PYQ Sprint" },
      { date: "Nov 11", score: 83, title: "Mixed Mock" },
    ],
  });
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("ayurveda_theme") as "dark" | "light" | null;
      if (savedTheme) setTheme(savedTheme);
      const savedProfile = localStorage.getItem("ayurveda_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      const savedNotes = localStorage.getItem("ayurveda_notes");
      if (savedNotes) setPersonalNotes(JSON.parse(savedNotes));
    } catch {
      // ignore storage errors
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onOnline = () => {
      setIsOnline(true);
      setPendingSyncCount(0);
    };
    const onOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ayurveda_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const updateProfile = (patch: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("ayurveda_profile", JSON.stringify(next));
      return next;
    });
    if (!isOnline) setPendingSyncCount((c) => c + 1);
  };

  const savePersonalNote = (
    input: Omit<PersonalNote, "updatedAt" | "versions"> & { id?: string }
  ) => {
    setPersonalNotes((prev) => {
      const now = new Date().toISOString();
      const existing = input.id ? prev.find((n) => n.id === input.id) : undefined;
      let next: PersonalNote[];
      if (existing) {
        next = prev.map((n) =>
          n.id === existing.id
            ? {
                ...n,
                ...input,
                updatedAt: now,
                versions: [
                  { timestamp: n.updatedAt, content: n.content },
                  ...n.versions.slice(0, 9),
                ],
              }
            : n
        );
      } else {
        const created: PersonalNote = {
          id: input.id || `pn-${Date.now()}`,
          title: input.title,
          subjectCode: input.subjectCode,
          topicId: input.topicId,
          content: input.content,
          tags: input.tags,
          pinned: input.pinned,
          updatedAt: now,
          versions: [],
        };
        next = [created, ...prev];
      }
      localStorage.setItem("ayurveda_notes", JSON.stringify(next));
      return next;
    });
    if (!isOnline) setPendingSyncCount((c) => c + 1);
  };

  const deletePersonalNote = (id: string) => {
    setPersonalNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      localStorage.setItem("ayurveda_notes", JSON.stringify(next));
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const recordQuestionResult = (questionId: string, isCorrect: boolean) => {
    setStudyStats((prev) => ({
      ...prev,
      questionsAttempted: prev.questionsAttempted + 1,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
    }));
    setWrongQuestionIds((prev) => {
      if (isCorrect) return prev.filter((id) => id !== questionId);
      return prev.includes(questionId) ? prev : [...prev, questionId];
    });
  };

  const updateTopicProgress = (topicId: string, percent: number, confidence = 4) => {
    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: {
        status:
          percent >= 100
            ? "completed"
            : percent > 0
            ? "in_progress"
            : "not_started",
        percent,
        confidence,
      },
    }));
  };

  const reviewFlashcard = (id: string, rating: FsrsRating) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const result = scheduleFsrsCard(card, rating);
        return { ...card, ...result.card };
      })
    );
  };

  const addStudyMinutes = (mins: number) => {
    setStudyStats((prev) => ({ ...prev, todayMinutes: prev.todayMinutes + mins }));
  };

  const recordMockScore = (title: string, scorePercent: number) => {
    setStudyStats((prev) => ({
      ...prev,
      mockHistory: [
        ...prev.mockHistory,
        {
          date: new Date().toLocaleDateString("en-IN", { month: "short", day: "2-digit" }),
          score: Math.round(scorePercent),
          title,
        },
      ],
    }));
  };

  return (
    <AppStateContext.Provider
      value={{
        theme,
        toggleTheme,
        profile,
        updateProfile,
        personalNotes,
        savePersonalNote,
        deletePersonalNote,
        bookmarks,
        toggleBookmark,
        wrongQuestionIds,
        recordQuestionResult,
        topicProgress,
        updateTopicProgress,
        flashcards,
        reviewFlashcard,
        studyStats,
        addStudyMinutes,
        recordMockScore,
        isOnline,
        pendingSyncCount,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
