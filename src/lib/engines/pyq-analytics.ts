export interface PyqRecord {
  id: string;
  question: string;
  subjectCode: string;
  subjectName: string;
  topicTitle: string;
  university: string;
  examYear: number;
  marks: number;
  qType: "LAQ" | "SAQ" | "Short Note" | "VSAQ" | "MCQ" | "Viva" | "Practical";
  conceptClusterKey: string;
  sourceDocument: string;
  verificationStatus: "verified" | "pending_review" | "demonstration";
  referenceAnswer?: string;
}

export interface ConceptRecurrenceSummary {
  conceptKey: string;
  topicTitle: string;
  subjectCode: string;
  appearanceCount: number;
  yearsAppeared: number[];
  universities: string[];
  sampleQuestions: string[];
  priorityBand: "High Recurrence" | "Moderate Recurrence" | "Single Appearance";
}

export interface YearTrendPoint {
  year: number;
  questionCount: number;
  totalMarks: number;
}

export function analyzePyqRecurrence(records: PyqRecord[]): {
  clusters: ConceptRecurrenceSummary[];
  yearTrends: YearTrendPoint[];
  disclaimer: string;
} {
  const clusterMap = new Map<string, PyqRecord[]>();
  const yearMap = new Map<number, { count: number; marks: number }>();

  for (const r of records) {
    const existing = clusterMap.get(r.conceptClusterKey) ?? [];
    existing.push(r);
    clusterMap.set(r.conceptClusterKey, existing);

    const y = yearMap.get(r.examYear) ?? { count: 0, marks: 0 };
    y.count += 1;
    y.marks += r.marks;
    yearMap.set(r.examYear, y);
  }

  const clusters: ConceptRecurrenceSummary[] = Array.from(clusterMap.entries())
    .map(([conceptKey, items]) => {
      const yearsAppeared = Array.from(new Set(items.map((i) => i.examYear))).sort(
        (a, b) => b - a
      );
      const universities = Array.from(new Set(items.map((i) => i.university)));
      const appearanceCount = items.length;
      const priorityBand: ConceptRecurrenceSummary["priorityBand"] =
        appearanceCount >= 3
          ? "High Recurrence"
          : appearanceCount === 2
          ? "Moderate Recurrence"
          : "Single Appearance";

      return {
        conceptKey,
        topicTitle: items[0].topicTitle,
        subjectCode: items[0].subjectCode,
        appearanceCount,
        yearsAppeared,
        universities,
        sampleQuestions: Array.from(new Set(items.map((i) => i.question))),
        priorityBand,
      };
    })
    .sort((a, b) => b.appearanceCount - a.appearanceCount);

  const yearTrends: YearTrendPoint[] = Array.from(yearMap.entries())
    .map(([year, stats]) => ({
      year,
      questionCount: stats.count,
      totalMarks: stats.marks,
    }))
    .sort((a, b) => a.year - b.year);

  return {
    clusters,
    yearTrends,
    disclaimer:
      "Recurrence counts reflect only the records currently stored in the question bank and indicate historical revision priority, not guaranteed future examination questions.",
  };
}
