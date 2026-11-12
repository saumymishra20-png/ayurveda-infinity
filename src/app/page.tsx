"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlobalSearchModal, type NavSection } from "@/components/GlobalSearchModal";
import { StudyFocusModal } from "@/components/StudyFocusModal";
import { OnboardingAuthModal } from "@/components/OnboardingAuthModal";
import { DashboardHome } from "@/components/modules/DashboardHome";
import { SyllabusNotesView } from "@/components/modules/SyllabusNotesView";
import { PyqBankView } from "@/components/modules/PyqBankView";
import { McqPracticeView } from "@/components/modules/McqPracticeView";
import { MockExamStudioView } from "@/components/modules/MockExamStudioView";
import { AiIntelligenceView } from "@/components/modules/AiIntelligenceView";
import { MindMapStudioView } from "@/components/modules/MindMapStudioView";
import {
  FlashcardsView,
  GlossaryView,
} from "@/components/modules/FlashcardsGlossaryView";
import {
  AdminCmsView,
  AnalyticsView,
  CommunityView,
  DigitalLibraryView,
  PracticalsView,
  StudyPlannerView,
} from "@/components/modules/SecondaryModulesView";

export default function HomePage() {
  const [section, setSection] = useState<NavSection>("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AppShell
      activeSection={section}
      onSelectSection={setSection}
      onOpenSearch={() => setSearchOpen(true)}
      onOpenFocus={() => setFocusOpen(true)}
      onOpenAuth={() => setAuthOpen(true)}
    >
      {section === "home" && (
        <DashboardHome
          onNavigate={setSection}
          onOpenFocus={() => setFocusOpen(true)}
        />
      )}
      {section === "learn" && <SyllabusNotesView />}
      {section === "pyqs" && <PyqBankView />}
      {section === "practice" && <McqPracticeView />}
      {section === "mock" && <MockExamStudioView />}
      {section === "ai" && <AiIntelligenceView />}
      {section === "mindmap" && <MindMapStudioView />}
      {section === "flashcards" && <FlashcardsView />}
      {section === "glossary" && <GlossaryView />}
      {section === "practicals" && <PracticalsView />}
      {section === "planner" && <StudyPlannerView />}
      {section === "analytics" && <AnalyticsView />}
      {section === "library" && <DigitalLibraryView />}
      {section === "community" && <CommunityView />}
      {section === "admin" && <AdminCmsView />}

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(sec) => setSection(sec)}
      />
      <StudyFocusModal open={focusOpen} onClose={() => setFocusOpen(false)} />
      <OnboardingAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </AppShell>
  );
}
