import { NextRequest, NextResponse } from "next/server";
import { DEMO_PYQ_BANK } from "@/data/bams-ecosystem-data";
import { analyzePyqRecurrence } from "@/lib/engines/pyq-analytics";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  const subject = searchParams.get("subject") ?? "ALL";
  const qType = searchParams.get("type") ?? "ALL";
  const year = searchParams.get("year") ?? "ALL";

  const filtered = DEMO_PYQ_BANK.filter((item) => {
    if (subject !== "ALL" && item.subjectCode !== subject) return false;
    if (qType !== "ALL" && item.qType !== qType) return false;
    if (year !== "ALL" && String(item.examYear) !== year) return false;
    if (
      q &&
      !item.question.toLowerCase().includes(q) &&
      !item.topicTitle.toLowerCase().includes(q) &&
      !item.subjectName.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const analytics = analyzePyqRecurrence(filtered);
  return NextResponse.json({
    records: filtered,
    analytics,
  });
}
