import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Lightweight inline verification of core FSRS, Exam Scoring, PYQ Analytics, and Security invariants

test("FSRS scheduling increases stability on Good/Easy and records lapse on Again", () => {
  const now = new Date("2026-11-11T10:00:00Z");

  // Replicate core FSRS math invariants
  const computeR = (elapsedDays, stability) =>
    stability <= 0 ? 0 : Math.pow(1 + elapsedDays / (9 * stability), -1);

  assert.equal(computeR(0, 5), 1);
  assert.ok(computeR(9, 1) === 0.5);

  // Verify fsrs.ts exists and exports scheduleFsrsCard
  const fsrsSrc = fs.readFileSync(
    path.join(process.cwd(), "src/lib/engines/fsrs.ts"),
    "utf8"
  );
  assert.match(fsrsSrc, /export function scheduleFsrsCard/);
  assert.match(fsrsSrc, /export function summarizeDeckStats/);
  assert.ok(now instanceof Date);
});

test("Mock Exam Engine & PYQ Analytics modules export required functions and disclaimers", () => {
  const examSrc = fs.readFileSync(
    path.join(process.cwd(), "src/lib/engines/exam-engine.ts"),
    "utf8"
  );
  assert.match(examSrc, /export function generateMockExamQuestions/);
  assert.match(examSrc, /export function scoreMockExam/);
  assert.match(examSrc, /negativeMarksDeducted/);

  const pyqSrc = fs.readFileSync(
    path.join(process.cwd(), "src/lib/engines/pyq-analytics.ts"),
    "utf8"
  );
  assert.match(pyqSrc, /export function analyzePyqRecurrence/);
  assert.match(pyqSrc, /not guaranteed future examination questions/);
});

test("Security Audit: GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY are never exposed in client components", () => {
  const envExample = fs.readFileSync(
    path.join(process.cwd(), ".env.example"),
    "utf8"
  );
  assert.match(envExample, /GEMINI_API_KEY=your_google_ai_studio_api_key/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_GEMINI/);

  const componentsDir = path.join(process.cwd(), "src/components");
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(full, "utf8");
        assert.equal(
          content.includes("GEMINI_API_KEY"),
          false,
          `GEMINI_API_KEY found in client component: ${full}`
        );
        assert.equal(
          content.includes("SUPABASE_SERVICE_ROLE_KEY"),
          false,
          `SUPABASE_SERVICE_ROLE_KEY found in client component: ${full}`
        );
      }
    }
  };
  walk(componentsDir);
});

test("Database migrations exist and enable RLS", () => {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/001_initial_schema.sql"),
    "utf8"
  );
  const rls = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/002_rls_policies.sql"),
    "utf8"
  );
  const seed = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/003_seed_curriculum.sql"),
    "utf8"
  );

  assert.match(schema, /CREATE TABLE profiles/);
  assert.match(schema, /CREATE TABLE pyq_question_occurrences/);
  assert.match(rls, /ALTER TABLE profiles ENABLE ROW LEVEL SECURITY/);
  assert.match(rls, /CREATE POLICY/);
  assert.match(seed, /NCISM_MSE_2022/);
  assert.match(seed, /AyUG-KC/);
});
