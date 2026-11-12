export type MockGenerationMode =
  | "one_tap"
  | "university"
  | "professional"
  | "subject"
  | "topic"
  | "pyq_only"
  | "mixed"
  | "weak_topic"
  | "rapid";

export interface ExamQuestionItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  topicId: string;
  topicTitle: string;
  qType: "mcq_single" | "assertion_reason" | "case_based" | "laq" | "saq";
  stem: string;
  options: { id: string; label: string; text: string; isCorrect: boolean }[];
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  isPyq: boolean;
  isAiGenerated: boolean;
  sourceLabel: string;
  explanation: string;
  ayurvedicReference?: string;
}

export interface MockExamConfig {
  mode: MockGenerationMode;
  professionalCode?: string;
  subjectCodes?: string[];
  topicIds?: string[];
  weakTopicIds?: string[];
  questionCount: number;
  durationMinutes: number;
  negativeMarkingPerWrong: number;
  difficultyFilter?: "all" | "easy" | "medium" | "hard";
  randomize?: boolean;
}

export interface ExamSubmissionInput {
  questions: ExamQuestionItem[];
  responses: Record<string, string | null>; // questionId -> selectedOptionId
  negativeMarkingPerWrong: number;
  timeSpentSeconds: number;
}

export interface PerformanceBreakdownItem {
  key: string;
  label: string;
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracyPercent: number;
  marksScored: number;
  maxMarks: number;
}

export interface ExamResultSummary {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  rawScore: number;
  negativeMarksDeducted: number;
  finalScore: number;
  maxScore: number;
  accuracyPercent: number;
  timeSpentSeconds: number;
  bySubject: PerformanceBreakdownItem[];
  byTopic: PerformanceBreakdownItem[];
  byDifficulty: PerformanceBreakdownItem[];
  improvementPlan: string[];
}

export function generateMockExamQuestions(
  pool: ExamQuestionItem[],
  config: MockExamConfig
): ExamQuestionItem[] {
  let filtered = [...pool];

  if (config.mode === "pyq_only") {
    filtered = filtered.filter((q) => q.isPyq);
  } else if (config.mode === "weak_topic" && config.weakTopicIds?.length) {
    const weakSet = new Set(config.weakTopicIds);
    const weakMatches = filtered.filter((q) => weakSet.has(q.topicId));
    if (weakMatches.length > 0) filtered = weakMatches;
  }

  if (config.subjectCodes && config.subjectCodes.length > 0) {
    const subSet = new Set(config.subjectCodes);
    const subMatches = filtered.filter((q) => subSet.has(q.subjectCode));
    if (subMatches.length > 0) filtered = subMatches;
  }

  if (config.topicIds && config.topicIds.length > 0) {
    const topSet = new Set(config.topicIds);
    const topMatches = filtered.filter((q) => topSet.has(q.topicId));
    if (topMatches.length > 0) filtered = topMatches;
  }

  if (config.difficultyFilter && config.difficultyFilter !== "all") {
    const diffMatches = filtered.filter(
      (q) => q.difficulty === config.difficultyFilter
    );
    if (diffMatches.length > 0) filtered = diffMatches;
  }

  if (config.randomize !== false) {
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
  }

  return filtered.slice(0, Math.min(config.questionCount, filtered.length));
}

export function scoreMockExam(input: ExamSubmissionInput): ExamResultSummary {
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let rawScore = 0;
  let negativeMarksDeducted = 0;
  let maxScore = 0;

  const subjectMap = new Map<string, PerformanceBreakdownItem>();
  const topicMap = new Map<string, PerformanceBreakdownItem>();
  const diffMap = new Map<string, PerformanceBreakdownItem>();

  const updateBucket = (
    map: Map<string, PerformanceBreakdownItem>,
    key: string,
    label: string,
    isAttempted: boolean,
    isCorrect: boolean,
    marksScored: number,
    maxMarks: number
  ) => {
    const existing = map.get(key) ?? {
      key,
      label,
      total: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      accuracyPercent: 0,
      marksScored: 0,
      maxMarks: 0,
    };
    existing.total += 1;
    existing.maxMarks += maxMarks;
    existing.marksScored += marksScored;
    if (!isAttempted) existing.unattempted += 1;
    else if (isCorrect) existing.correct += 1;
    else existing.incorrect += 1;

    const bucketAttempted = existing.correct + existing.incorrect;
    existing.accuracyPercent =
      bucketAttempted > 0
        ? Number(((existing.correct / bucketAttempted) * 100).toFixed(1))
        : 0;
    map.set(key, existing);
  };

  for (const q of input.questions) {
    maxScore += q.marks;
    const selectedId = input.responses[q.id] ?? null;
    const isAttempted = selectedId !== null && selectedId !== "";
    const correctOption = q.options.find((o) => o.isCorrect);
    const isCorrect = Boolean(isAttempted && correctOption && selectedId === correctOption.id);

    let marksForQ = 0;
    if (!isAttempted) {
      unattempted += 1;
    } else if (isCorrect) {
      correct += 1;
      rawScore += q.marks;
      marksForQ = q.marks;
    } else {
      incorrect += 1;
      negativeMarksDeducted += input.negativeMarkingPerWrong;
      marksForQ = -input.negativeMarkingPerWrong;
    }

    updateBucket(subjectMap, q.subjectCode, q.subjectName, isAttempted, isCorrect, marksForQ, q.marks);
    updateBucket(topicMap, q.topicId, q.topicTitle, isAttempted, isCorrect, marksForQ, q.marks);
    updateBucket(diffMap, q.difficulty, q.difficulty.toUpperCase(), isAttempted, isCorrect, marksForQ, q.marks);
  }

  const attempted = correct + incorrect;
  const finalScore = Number((rawScore - negativeMarksDeducted).toFixed(2));
  const accuracyPercent =
    attempted > 0 ? Number(((correct / attempted) * 100).toFixed(1)) : 0;

  const bySubject = Array.from(subjectMap.values());
  const byTopic = Array.from(topicMap.values());
  const byDifficulty = Array.from(diffMap.values());

  const improvementPlan: string[] = [];
  const weakTopics = byTopic.filter((t) => t.incorrect > 0 || t.accuracyPercent < 60);
  if (weakTopics.length > 0) {
    improvementPlan.push(
      `Prioritize Quick Go & Master Notes for: ${weakTopics
        .slice(0, 3)
        .map((t) => t.label)
        .join(", ")}.`
    );
  }
  if (unattempted > Math.ceil(input.questions.length * 0.25)) {
    improvementPlan.push(
      "More than 25% of questions were left unattempted. Practice timed 15-minute Rapid Revision sprints."
    );
  }
  if (negativeMarksDeducted > 0) {
    improvementPlan.push(
      `Negative marking deducted ${negativeMarksDeducted.toFixed(2)} marks. Use Learning Mode to review elimination strategies.`
    );
  }
  if (improvementPlan.length === 0) {
    improvementPlan.push(
      "Strong accuracy across tested topics. Lock retention by scheduling FSRS flashcards and practicing descriptive LAQs."
    );
  }

  return {
    totalQuestions: input.questions.length,
    attempted,
    correct,
    incorrect,
    unattempted,
    rawScore,
    negativeMarksDeducted: Number(negativeMarksDeducted.toFixed(2)),
    finalScore,
    maxScore,
    accuracyPercent,
    timeSpentSeconds: input.timeSpentSeconds,
    bySubject,
    byTopic,
    byDifficulty,
    improvementPlan,
  };
}
