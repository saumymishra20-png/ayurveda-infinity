export type FsrsState = "new" | "learning" | "review" | "relearning";
export type FsrsRating = 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy

export interface FsrsCard {
  id: string;
  stability: number;
  difficulty: number;
  state: FsrsState;
  reps: number;
  lapses: number;
  dueAt: string; // ISO string
  lastReviewAt?: string | null;
}

export interface FsrsScheduleResult {
  card: FsrsCard;
  scheduledDays: number;
  elapsedDays: number;
  retrievability: number;
}

const DEFAULT_WEIGHTS = {
  w0: 0.4,
  w1: 0.6,
  w2: 2.4,
  w3: 5.8,
  w4: 4.93,
  w5: 0.94,
  w6: 0.86,
  w7: 0.01,
  w8: 1.49,
  w9: 0.14,
  w10: 0.94,
  requestRetention: 0.9,
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

export function scheduleFsrsCard(
  card: FsrsCard,
  rating: FsrsRating,
  now: Date = new Date()
): FsrsScheduleResult {
  const lastReview = card.lastReviewAt ? new Date(card.lastReviewAt) : null;
  const elapsedDays = lastReview
    ? Math.max(0, (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  let nextStability = card.stability;
  let nextDifficulty = card.difficulty;
  let nextState: FsrsState = card.state;
  let nextLapses = card.lapses;
  const nextReps = card.reps + 1;

  if (card.state === "new" || card.reps === 0) {
    const initialS = [
      DEFAULT_WEIGHTS.w0,
      DEFAULT_WEIGHTS.w1,
      DEFAULT_WEIGHTS.w2,
      DEFAULT_WEIGHTS.w3,
    ][rating - 1];
    nextStability = initialS;
    nextDifficulty = clamp(
      DEFAULT_WEIGHTS.w4 - DEFAULT_WEIGHTS.w5 * (rating - 3),
      1,
      10
    );
    nextState = rating === 1 ? "learning" : "review";
    if (rating === 1) nextLapses += 1;
  } else {
    const r = computeRetrievability(elapsedDays, card.stability);
    nextDifficulty = clamp(
      card.difficulty - DEFAULT_WEIGHTS.w6 * (rating - 3),
      1,
      10
    );

    if (rating === 1) {
      nextLapses += 1;
      nextState = "relearning";
      nextStability = Math.max(0.2, card.stability * 0.35);
    } else {
      nextState = "review";
      const hardPenalty = rating === 2 ? 0.8 : 1.0;
      const easyBonus = rating === 4 ? 1.3 : 1.0;
      const growthFactor =
        1 +
        Math.exp(DEFAULT_WEIGHTS.w8) *
          (11 - nextDifficulty) *
          Math.pow(Math.max(0.1, card.stability), -DEFAULT_WEIGHTS.w9) *
          (Math.exp((1 - r) * DEFAULT_WEIGHTS.w10) - 1) *
          hardPenalty *
          easyBonus;
      nextStability = Math.max(0.5, card.stability * growthFactor);
    }
  }

  const scheduledDays =
    rating === 1
      ? 0.01 // ~15 minutes for "Again"
      : Math.max(
          1,
          Math.round(
            nextStability *
              9 *
              (1 / DEFAULT_WEIGHTS.requestRetention - 1)
          )
        );

  const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

  return {
    card: {
      ...card,
      stability: Number(nextStability.toFixed(4)),
      difficulty: Number(nextDifficulty.toFixed(4)),
      state: nextState,
      reps: nextReps,
      lapses: nextLapses,
      lastReviewAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
    },
    scheduledDays: Number(scheduledDays.toFixed(2)),
    elapsedDays: Number(elapsedDays.toFixed(2)),
    retrievability: Number(
      computeRetrievability(elapsedDays, card.stability).toFixed(4)
    ),
  };
}

export function summarizeDeckStats(cards: FsrsCard[], now: Date = new Date()) {
  let newCount = 0;
  let dueCount = 0;
  let learningCount = 0;
  let matureCount = 0;

  for (const c of cards) {
    if (c.state === "new") newCount++;
    if (c.state === "learning" || c.state === "relearning") learningCount++;
    if (c.state === "review" && c.stability >= 21) matureCount++;
    if (new Date(c.dueAt).getTime() <= now.getTime()) dueCount++;
  }

  return {
    total: cards.length,
    newCount,
    dueCount,
    learningCount,
    matureCount,
  };
}
