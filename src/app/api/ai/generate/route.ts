import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import {
  generateStructuredOrText,
  getGeminiModelName,
  isGeminiConfigured,
  streamAiResponse,
  type AiFeatureMode,
} from "@/lib/ai/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count += 1;
  return true;
}

const RequestSchema = z.object({
  mode: z.enum([
    "professor",
    "notes",
    "mcq",
    "mindmap",
    "viva",
    "evaluator",
    "planner",
    "translator",
    "flashcards",
    "research",
    "doubt",
  ]),
  prompt: z.string().min(1).max(8000),
  stream: z.boolean().optional().default(false),
  studentContext: z
    .object({
      professional: z.string().optional(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      language: z.string().optional(),
      weakTopics: z.array(z.string()).optional(),
    })
    .optional(),
  mediaBase64: z.string().optional(),
  mediaMimeType: z.string().optional(),
});

const SCHEMAS_BY_MODE: Partial<Record<AiFeatureMode, any>> = {
  mcq: {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stem: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                },
                required: ["label", "text", "isCorrect"],
              },
            },
            explanation: { type: Type.STRING },
            ayurvedicReference: { type: Type.STRING },
            difficulty: { type: Type.STRING },
          },
          required: ["stem", "options", "explanation", "difficulty"],
        },
      },
      aiLabel: { type: Type.STRING },
    },
    required: ["questions", "aiLabel"],
  },
  mindmap: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      label: { type: Type.STRING },
      sanskritTerm: { type: Type.STRING },
      description: { type: Type.STRING },
      color: { type: Type.STRING },
      children: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING },
            sanskritTerm: { type: Type.STRING },
            description: { type: Type.STRING },
            color: { type: Type.STRING },
          },
          required: ["id", "label", "description", "color"],
        },
      },
    },
    required: ["id", "label", "description", "color", "children"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before retrying." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mode, prompt, stream, studentContext, mediaBase64, mediaMimeType } =
      parsed.data;

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          isAiGenerated: true,
          label: "AI-Generated (Configuration Required)",
          text:
            "GEMINI_API_KEY is not configured yet on the server. Add GEMINI_API_KEY and GEMINI_MODEL in .env.local (or Vercel Environment Variables) to enable live AYURVEDA∞ Intelligence responses.",
        },
        { status: 200 }
      );
    }

    const supabase = await createServerSupabaseClient();
    let userId: string | null = null;
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const mediaPart =
      mediaBase64 && mediaMimeType
        ? { inlineData: { data: mediaBase64, mimeType: mediaMimeType } }
        : undefined;

    if (stream && !SCHEMAS_BY_MODE[mode]) {
      const geminiStream = await streamAiResponse({
        mode,
        prompt,
        studentContext,
        mediaPart,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of geminiStream) {
              if (chunk.text) {
                controller.enqueue(encoder.encode(chunk.text));
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-AI-Generated": "true",
          "X-AI-Model": getGeminiModelName(),
        },
      });
    }

    const result = await generateStructuredOrText({
      mode,
      prompt,
      studentContext,
      responseSchema: SCHEMAS_BY_MODE[mode],
      mediaPart,
    });

    if (supabase && userId && result.usage) {
      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        endpoint: `/api/ai/generate/${mode}`,
        model_name: result.model,
        prompt_tokens: result.usage.promptTokenCount ?? 0,
        completion_tokens: result.usage.candidatesTokenCount ?? 0,
        latency_ms: result.latencyMs,
        status: "success",
      });
    }

    return NextResponse.json({
      configured: true,
      isAiGenerated: true,
      label: "AI-Generated Educational Aid (Verify against NCISM/Samhita texts)",
      model: result.model,
      latencyMs: result.latencyMs,
      text: result.text,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
