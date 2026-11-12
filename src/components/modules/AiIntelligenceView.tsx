"use client";

import React, { useState } from "react";
import { Sparkles, Send, Upload, Mic, ShieldAlert } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import type { AiFeatureMode } from "@/lib/ai/gemini";

const MODES: { id: AiFeatureMode; label: string; placeholder: string }[] = [
  { id: "professor", label: "AI Professor", placeholder: "Ask any BAMS concept (e.g., Explain Agni & Avasthapaka with clinical correlation)..." },
  { id: "viva", label: "AI Viva Examiner", placeholder: "Type 'Start Viva on Rachana Sharir Marma' or answer the examiner's question..." },
  { id: "evaluator", label: "Answer Evaluator", placeholder: "Paste your 5-mark or 10-mark descriptive answer for rubric evaluation..." },
  { id: "doubt", label: "Doubt Solver (Image/PDF)", placeholder: "Describe your doubt or attach a diagram / handwritten note..." },
  { id: "translator", label: "Sanskrit & Hinglish Translator", placeholder: "Paste a Sanskrit shloka or concept to explain in English/Hinglish..." },
  { id: "planner", label: "AI Study Planner", placeholder: "Share your exam date, daily hours, and weak subjects..." },
  { id: "research", label: "Research Assistant", placeholder: "Ask about RCTs, Chi-square, t-test, or CTRI guidelines..." },
];

export function AiIntelligenceView() {
  const { profile } = useAppState();
  const [mode, setMode] = useState<AiFeatureMode>("professor");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; isAi?: boolean }[]
  >([
    {
      role: "assistant",
      text: "Namaste! I am AYURVEDA∞ Intelligence powered by Google Gemini. Select a mode above—AI Professor, Viva Examiner, Descriptive Answer Evaluator, or Doubt Solver—and ask your question.",
      isAi: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<{ base64: string; mime: string; name: string } | null>(
    null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1] || "";
      setMediaFile({ base64, mime: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt: userText,
          stream: true,
          studentContext: {
            professional: profile.professional,
            language: profile.preferredLanguage,
            weakTopics: profile.weakSubjects,
          },
          ...(mediaFile
            ? { mediaBase64: mediaFile.base64, mediaMimeType: mediaFile.mime }
            : {}),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.text || data.error, isAi: true },
        ]);
      } else if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        setMessages((prev) => [...prev, { role: "assistant", text: "", isAi: true }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              text: accumulated,
              isAi: true,
            };
            return copy;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network or server error reaching Gemini API.", isAi: true },
      ]);
    } finally {
      setLoading(false);
      setMediaFile(null);
    }
  };

  const activeConfig = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            AYURVEDA∞ Intelligence
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Context-aware Gemini assistant distinguishing Classical Samhita concepts, Modern correlations & AI-generated study aids.
          </p>
        </div>
      </div>

      {/* Mode Pills */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              mode === m.id
                ? "bg-[var(--accent-primary)] text-[#080E0C]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="card-surface flex h-[540px] flex-col overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-[11px] text-[var(--accent-gold)]">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>
            AI-generated educational assistance. Always verify shloka numbers & clinical protocols against NCISM textbooks.
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--accent-primary)] text-[#080E0C]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                }`}
              >
                {msg.isAi && (
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                    AI-Generated • {activeConfig.label}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3"
        >
          {mediaFile && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-1 text-xs">
              <span>Attached: {mediaFile.name}</span>
              <button
                type="button"
                onClick={() => setMediaFile(null)}
                className="text-rose-400"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label
              className="cursor-pointer rounded-xl border border-[var(--border-subtle)] p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Upload diagram, image, or PDF"
            >
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeConfig.placeholder}
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const SpeechRecognition =
                  (window as any).SpeechRecognition ||
                  (window as any).webkitSpeechRecognition;
                if (!SpeechRecognition) return;
                const rec = new SpeechRecognition();
                rec.lang = "en-IN";
                rec.onresult = (ev: any) => {
                  const transcript = ev.results?.[0]?.[0]?.transcript;
                  if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
                };
                rec.start();
              }}
              className="rounded-xl border border-[var(--border-subtle)] p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Voice input (where browser supported)"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-xs font-semibold text-[#080E0C] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
