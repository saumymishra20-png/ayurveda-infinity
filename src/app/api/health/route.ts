import { NextResponse } from "next/server";
import { getGeminiModelName, isGeminiConfigured } from "@/lib/ai/gemini";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "AYURVEDA∞",
    timestamp: new Date().toISOString(),
    integrations: {
      supabaseConfigured: isSupabaseServerConfigured(),
      geminiConfigured: isGeminiConfigured(),
      geminiModel: getGeminiModelName(),
    },
  });
}
