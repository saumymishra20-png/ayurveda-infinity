"use client";

import React, { useState } from "react";
import {
  Home,
  BookOpen,
  CheckSquare,
  Sparkles,
  FolderOpen,
  FileQuestion,
  ClipboardCheck,
  Network,
  Layers,
  BookA,
  Stethoscope,
  Calendar,
  BarChart3,
  Users,
  Shield,
  Search,
  Sun,
  Moon,
  Flame,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
} from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import type { NavSection } from "@/components/GlobalSearchModal";

interface AppShellProps {
  activeSection: NavSection;
  onSelectSection: (s: NavSection) => void;
  onOpenSearch: () => void;
  onOpenFocus: () => void;
  onOpenAuth: () => void;
  children: React.ReactNode;
}

const NAV_GROUPS: {
  title: string;
  items: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[];
}[] = [
  {
    title: "Command",
    items: [
      { id: "home", label: "Command Center", icon: Home },
      { id: "planner", label: "Study Planner", icon: Calendar },
      { id: "analytics", label: "Performance", icon: BarChart3 },
    ],
  },
  {
    title: "Academic Core",
    items: [
      { id: "learn", label: "Syllabus & Notes", icon: BookOpen },
      { id: "pyqs", label: "PYQ Engine", icon: FileQuestion },
      { id: "practice", label: "MCQ Practice", icon: CheckSquare },
      { id: "mock", label: "Mock Exam Studio", icon: ClipboardCheck },
    ],
  },
  {
    title: "Intelligence & Recall",
    items: [
      { id: "ai", label: "AYURVEDA∞ AI", icon: Sparkles },
      { id: "mindmap", label: "Mind Maps", icon: Network },
      { id: "flashcards", label: "FSRS Flashcards", icon: Layers },
      { id: "glossary", label: "Sanskrit Glossary", icon: BookA },
      { id: "practicals", label: "Practicals & Viva", icon: Stethoscope },
    ],
  },
  {
    title: "Ecosystem",
    items: [
      { id: "library", label: "Digital Library", icon: FolderOpen },
      { id: "community", label: "Peer Community", icon: Users },
      { id: "admin", label: "Admin CMS", icon: Shield },
    ],
  },
];

const MOBILE_TABS: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "practice", label: "Practice", icon: CheckSquare },
  { id: "ai", label: "AI Tutor", icon: Sparkles },
  { id: "library", label: "Library", icon: FolderOpen },
];

export function AppShell({
  activeSection,
  onSelectSection,
  onOpenSearch,
  onOpenFocus,
  onOpenAuth,
  children,
}: AppShellProps) {
  const { theme, toggleTheme, profile, isOnline, pendingSyncCount, studyStats } =
    useAppState();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-primary)]/15 font-bold text-[var(--accent-primary)]">
                ∞
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight">AYURVEDA∞</span>
                <p className="text-[10px] text-[var(--text-secondary)]">BAMS Ecosystem</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      title={item.label}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        {/* Top Header */}
        <header className="glass-surface sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-base font-bold text-[var(--accent-primary)]">
                AYURVEDA∞
              </span>
            </div>
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]/40 sm:w-72"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search syllabus, PYQs, terms...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="ml-auto hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] sm:inline">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              title={isOnline ? "Online & Synced" : "Offline Mode — Changes Queued"}
              className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-[11px] sm:flex ${
                isOnline
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                  : "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]"
              }`}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Synced" : `Offline (${pendingSyncCount})`}
            </span>

            <button
              onClick={onOpenFocus}
              className="flex items-center gap-1.5 rounded-full bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-[#080E0C] shadow-sm transition hover:opacity-90"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>STUDY NOW</span>
              <span className="hidden text-[10px] opacity-80 sm:inline">
                ({studyStats.todayMinutes}m)
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Toggle light or dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs font-medium"
            >
              <UserCircle className="h-4 w-4 text-[var(--accent-gold)]" />
              <span className="hidden max-w-28 truncate sm:inline">{profile.name}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation (5 Core Tabs) */}
      <nav className="glass-surface fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--border-subtle)] py-2 md:hidden">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSection(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                active ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
