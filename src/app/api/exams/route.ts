import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_MCQ_POOL } from "@/data/bams-ecosystem-data";
import { generateMockExamQuestions, scoreMockExam } from "@/lib/engines/exam-engine";

const GenerateSchema = z.object({
  mode: z.enum([
    "one_tap",
    "university",
    "professional",
    "subject",
    "topic",
    "pyq_only",
    "mixed",
    "weak_topic",
    "rapid",
  ]),
  subjectCodes: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional(),
  weakTopicIds: z.array(z.string()).optional(),
  questionCount: z.number().int().min(1).max(100).default(6),
  durationMinutes: z.number().int().min(1).max(180).default(15),
  negativeMarkingPerWrong: z.number().min(0).max(2).default(0.25),
  difficultyFilter: z.enum(["all", "easy", "medium", "hard"]).optional().default("all"),
});

const ScoreSchema = z.object({
  questionIds: z.array(z.string()).min(1),
  responses: z.record(z.string(), z.string().nullable()),
  negativeMarkingPerWrong: z.number().min(0).max(2).default(0.25),
  timeSpentSeconds: z.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "generate";
  const body = await req.json();

  if (action === "score") {
    const parsed = ScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const qSet = new Set(parsed.data.questionIds);
    const questions = DEMO_MCQ_POOL.filter((q) => qSet.has(q.id));
    const result = scoreMockExam({
      questions,
      responses: parsed.data.responses,
      negativeMarkingPerWrong: parsed.data.negativeMarkingPerWrong,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
    });
    return NextResponse.json({ result });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const questions = generateMockExamQuestions(DEMO_MCQ_POOL, parsed.data);
  return NextResponse.json({
    examId: `mock-${Date.now()}`,
    config: parsed.data,
    questions,
  });
}
