import { GoogleGenAI, type Schema } from "@google/genai";

export type AiFeatureMode =
  | "professor"
  | "notes"
  | "mcq"
  | "mindmap"
  | "viva"
  | "evaluator"
  | "planner"
  | "translator"
  | "flashcards"
  | "research"
  | "doubt";

export interface AiGenerationOptions {
  mode: AiFeatureMode;
  prompt: string;
  studentContext?: {
    professional?: string;
    subject?: string;
    topic?: string;
    language?: string;
    weakTopics?: string[];
  };
  responseSchema?: Schema;
  temperature?: number;
  mediaPart?: {
    inlineData: {
      data: string;
      mimeType: string;
    };
  };
}

export const AYURVEDA_SYSTEM_INSTRUCTION = `You are AYURVEDA∞ Intelligence, an academic assistant for Bachelor of Ayurvedic Medicine and Surgery (BAMS) students in India following NCISM regulations.

NON-NEGOTIABLE ACADEMIC ACCURACY RULES:
1. Never invent official syllabus clauses, university examination papers, shloka chapter/verse numbers, clinical guidelines, or textbook page numbers.
2. Explicitly distinguish between:
   - [Classical Ayurvedic Concept] (e.g., Samhita-based Dosha/Dhatu/Srotas/Chikitsa principles)
   - [Modern Medical Correlation] (anatomy, physiology, pathology, pharmacology)
   - [AI-Generated Study Aid] (mnemonics, practice questions, simplified analogies)
3. Preserve authentic Sanskrit terminology (Devanagari + IAST/standard transliteration where helpful) without mistranslating technical Ayurvedic terms (e.g., do not reduce Agni merely to 'stomach acid' or Ojas merely to 'antibodies' without noting the distinction).
4. For clinical or viva feedback, state clearly that AI feedback is educational and does not replace supervised clinical training or official university marking.
5. If a source citation or verse number is uncertain, state that it should be verified against the prescribed textbook rather than guessing.`;

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function isGeminiConfigured(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY &&
      !process.env.GEMINI_API_KEY.includes("your_google_ai_studio")
  );
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

function buildContextualPrompt(options: AiGenerationOptions): string {
  const ctx = options.studentContext;
  const ctxBlock = ctx
    ? `\n[Student Context] Professional: ${ctx.professional || "General BAMS"} | Subject: ${ctx.subject || "General"} | Topic: ${ctx.topic || "General"} | Preferred Language: ${ctx.language || "English"}${
        ctx.weakTopics?.length ? ` | Weak Topics: ${ctx.weakTopics.join(", ")}` : ""
      }\n`
    : "";

  return `${ctxBlock}\n[Mode: ${options.mode.toUpperCase()}]\n${options.prompt}`;
}

export async function generateStructuredOrText(options: AiGenerationOptions) {
  const ai = getClient();
  const model = getGeminiModelName();
  const textPrompt = buildContextualPrompt(options);
  const contents = options.mediaPart ? [options.mediaPart, textPrompt] : textPrompt;

  const start = Date.now();
  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: AYURVEDA_SYSTEM_INSTRUCTION,
      temperature: options.temperature ?? 0.3,
      ...(options.responseSchema
        ? {
            responseMimeType: "application/json",
            responseSchema: options.responseSchema,
          }
        : {}),
    },
  });

  return {
    text: response.text ?? "",
    model,
    latencyMs: Date.now() - start,
    usage: response.usageMetadata ?? null,
    isAiGenerated: true as const,
  };
}

export async function streamAiResponse(options: AiGenerationOptions) {
  const ai = getClient();
  const model = getGeminiModelName();
  const textPrompt = buildContextualPrompt(options);
  const contents = options.mediaPart ? [options.mediaPart, textPrompt] : textPrompt;

  return ai.models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction: AYURVEDA_SYSTEM_INSTRUCTION,
      temperature: options.temperature ?? 0.35,
    },
  });
}
