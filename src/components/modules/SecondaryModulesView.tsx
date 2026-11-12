"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Calendar,
  BarChart3,
  FolderOpen,
  Users,
  Shield,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { NCISM_SUBJECTS, PRACTICAL_MODULES } from "@/data/bams-ecosystem-data";
import { useAppState } from "@/context/AppStateContext";

export function PracticalsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Stethoscope className="h-5 w-5 text-[var(--accent-primary)]" />
          Practical & Viva Preparation Center
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Instruments, OSPE stations, spotters, and subject-wise viva voce banks.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {PRACTICAL_MODULES.map((mod) => (
          <div key={mod.id} className="card-surface rounded-3xl p-5">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-md bg-[var(--accent-primary)]/15 px-2 py-0.5 font-mono font-semibold text-[var(--accent-primary)]">
                {mod.subjectCode} • {mod.category}
              </span>
              <span className="text-[var(--text-secondary)]">
                {mod.professionalCode.replace("_", " ")}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold">{mod.title}</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{mod.description}</p>

            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase text-[var(--accent-secondary)]">
                Key Identification Points
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs">
                {mod.keyIdentificationPoints.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-[var(--accent-gold)]">
                Viva Voce Bank
              </h3>
              {mod.vivaQuestions.map((vq, idx) => (
                <div key={idx} className="rounded-xl bg-[var(--bg-secondary)] p-3 text-xs">
                  <p className="font-semibold">Q: {vq.q}</p>
                  <p className="mt-1 text-[var(--text-secondary)]">A: {vq.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-[var(--accent-gold)]">
              ⚠ {mod.safetyDisclaimer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyPlannerView() {
  const { profile } = useAppState();
  const [examDate, setExamDate] = useState("2027-02-15");
  const [emergencyMode, setEmergencyMode] = useState(false);

  const daysLeft = Math.max(
    1,
    Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const profSubjects = NCISM_SUBJECTS.filter(
    (s) =>
      profile.professional === "INTERNSHIP" ||
      profile.professional === "PROF_4" ||
      s.professionalCode === profile.professional
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Calendar className="h-5 w-5 text-[var(--accent-primary)]" />
            Personalized Study Planner & Exam Countdown
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Adaptive daily/weekly allocation based on your target exam date and weak subjects.
          </p>
        </div>
        <button
          onClick={() => setEmergencyMode((e) => !e)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold ${
            emergencyMode
              ? "bg-rose-500 text-white"
              : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--accent-gold)]"
          }`}
        >
          {emergencyMode ? "Emergency Revision Mode: ON" : "Revision Emergency Mode"}
        </button>
      </div>

      <div className="card-surface grid gap-4 rounded-3xl p-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">
            University Exam Date
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
          />
        </div>
        <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Countdown</p>
          <p className="mt-1 text-2xl font-bold text-[var(--accent-primary)]">
            {daysLeft} Days Left
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Daily Target</p>
          <p className="mt-1 text-2xl font-bold">
            {profile.dailyStudyTargetMinutes} mins/day
          </p>
        </div>
      </div>

      <div className="card-surface rounded-3xl p-5">
        <h2 className="text-base font-semibold">
          {emergencyMode
            ? "High-Yield Emergency Triage Schedule (PYQ + Quick Go Only)"
            : "Weekly Subject Allocation"}
        </h2>
        <div className="mt-4 space-y-2.5">
          {profSubjects.map((s, idx) => (
            <div
              key={s.code}
              className="flex items-center justify-between rounded-2xl bg-[var(--bg-secondary)] px-4 py-3 text-xs"
            >
              <div>
                <span className="font-mono font-semibold text-[var(--accent-primary)]">
                  {s.code}
                </span>{" "}
                — {s.name}
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[var(--accent-secondary)]">
                {emergencyMode
                  ? `Priority ${idx + 1} • Quick Go + Top PYQs`
                  : `${Math.round(profile.dailyStudyTargetMinutes / Math.max(1, profSubjects.length))} mins/day`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const { studyStats } = useAppState();
  const subjectBars = [
    { subject: "AyUG-KS", mastery: 84 },
    { subject: "AyUG-PV", mastery: 72 },
    { subject: "AyUG-RS", mastery: 58 },
    { subject: "AyUG-SA1", mastery: 76 },
    { subject: "AyUG-RN", mastery: 68 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-5 w-5 text-[var(--accent-primary)]" />
          Academic Performance Analytics
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Data-driven subject mastery, mock accuracy, and revision consistency (no fake leaderboards).
        </p>
      </div>

      <div className="card-surface rounded-3xl p-6">
        <h2 className="mb-4 text-sm font-semibold">Subject Mastery Comparison (%)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,170,162,0.12)" />
              <XAxis dataKey="subject" stroke="#9BAAA2" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#9BAAA2" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#15231D",
                  borderColor: "rgba(185,214,155,0.2)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="mastery" fill="#27C68B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface rounded-3xl p-5">
        <h2 className="text-sm font-semibold">Recent Mock Attempts</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {studyStats.mockHistory.map((m, i) => (
            <div key={i} className="rounded-2xl bg-[var(--bg-secondary)] p-3 text-xs">
              <p className="text-[var(--text-secondary)]">{m.date}</p>
              <p className="font-semibold">{m.title}</p>
              <p className="mt-1 text-lg font-bold text-[var(--accent-primary)]">{m.score}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DigitalLibraryView() {
  const [resources, setResources] = useState([
    {
      id: "res-1",
      title: "Personal Dissection Lab Checklist (Rachana Sharir)",
      subject: "AyUG-RS",
      type: "PDF",
      size: "1.2 MB",
    },
    {
      id: "res-2",
      title: "Samhita Shloka Revision Sheet (Handwritten)",
      subject: "AyUG-SA1",
      type: "Image",
      size: "840 KB",
    },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResources((prev) => [
      {
        id: `res-${Date.now()}`,
        title: file.name,
        subject: "Personal Upload",
        type: file.type.includes("pdf") ? "PDF" : "Document",
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FolderOpen className="h-5 w-5 text-[var(--accent-primary)]" />
            Digital Academic Library
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Store personal study notes, lab records, and diagrams. Do not upload pirated copyrighted textbooks.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[var(--accent-primary)] px-4 py-2.5 text-xs font-semibold text-[#080E0C]">
          <Upload className="h-4 w-4" />
          Upload Resource
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <div key={r.id} className="card-surface rounded-2xl p-4 text-xs">
            <span className="rounded bg-[var(--accent-primary)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--accent-primary)]">
              {r.subject} • {r.type}
            </span>
            <p className="mt-2 text-sm font-semibold">{r.title}</p>
            <p className="mt-1 text-[var(--text-secondary)]">Size: {r.size}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityView() {
  const [posts, setPosts] = useState([
    {
      id: "cp-1",
      author: "2nd Prof Scholar",
      subject: "AyUG-RN",
      title: "Difference between Purvarupa and Samprapti in Jvara?",
      body: "Can someone clarify how Santapa manifests before full Vyakti?",
    },
  ]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const addPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosts((p) => [
      { id: `cp-${Date.now()}`, author: "You", subject: "General", title, body },
      ...p,
    ]);
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-5 w-5 text-[var(--accent-primary)]" />
          BAMS Peer Community & Doubt Rooms
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Moderated academic discussions. Private notes are never shared without explicit consent.
        </p>
      </div>

      <form onSubmit={addPost} className="card-surface space-y-3 rounded-3xl p-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ask an academic doubt..."
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add context or Samhita reference..."
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#080E0C]"
        >
          Post Doubt
        </button>
      </form>

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="card-surface rounded-2xl p-4 text-xs">
            <span className="font-semibold text-[var(--accent-primary)]">
              {p.subject} • {p.author}
            </span>
            <h3 className="mt-1 text-sm font-semibold">{p.title}</h3>
            <p className="mt-1 text-[var(--text-secondary)]">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCmsView() {
  const [queue, setQueue] = useState([
    {
      id: "rev-1",
      source: "MUHS Summer 2023 OCR Upload",
      question: "Describe Shadavidha Upakrama with indications.",
      status: "pending_review",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Shield className="h-5 w-5 text-[var(--accent-gold)]" />
          Administration & Content Verification CMS
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Role-protected (Student / Content Editor / Academic Reviewer / Admin) with audit logging and OCR verification queue.
        </p>
      </div>

      <div className="card-surface rounded-3xl p-5">
        <h2 className="text-sm font-semibold">OCR Question Verification Queue</h2>
        <div className="mt-3 space-y-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--bg-secondary)] p-3.5 text-xs"
            >
              <div>
                <p className="font-semibold">{item.question}</p>
                <p className="text-[var(--text-secondary)]">
                  {item.source} • Status: {item.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setQueue((q) =>
                      q.map((x) =>
                        x.id === item.id ? { ...x, status: "verified" } : x
                      )
                    )
                  }
                  className="flex items-center gap-1 rounded-xl bg-[var(--accent-primary)]/15 px-3 py-1.5 font-semibold text-[var(--accent-primary)]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                </button>
                <button
                  onClick={() =>
                    setQueue((q) =>
                      q.map((x) =>
                        x.id === item.id ? { ...x, status: "rejected" } : x
                      )
                    )
                  }
                  className="flex items-center gap-1 rounded-xl bg-rose-500/15 px-3 py-1.5 font-semibold text-rose-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
