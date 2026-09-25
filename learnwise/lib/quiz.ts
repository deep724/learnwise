import { questions } from "../data/questions";
import { topics } from "../data/topics";
import type {
  Attempt,
  DemoState,
  Question,
  TopicId,
  TopicResult,
} from "../types";
export const draftKey = (studentId: string, topic?: TopicId) =>
  `${studentId}:${topic ?? "diagnostic"}`;

export function unansweredQuestions(
  selected: Question[],
  answers: Record<string, number>,
) {
  return selected.filter(
    (q) =>
      !Number.isInteger(answers[q.id]) ||
      answers[q.id] < 0 ||
      answers[q.id] >= q.options.length,
  );
}

export function createAttempt(
  id: string,
  studentId: string,
  selected: Question[],
  answers: Record<string, number>,
  topic?: TopicId,
): Attempt {
  if (!selected.length || unansweredQuestions(selected, answers).length)
    throw Error("Answer every question before submitting.");
  return {
    id,
    studentId,
    date: new Date().toISOString(),
    kind: topic ? "practice" : "diagnostic",
    questions: selected.map((q) => q.id),
    answers: { ...answers },
    ...analyze(selected, answers),
  };
}

export function recordAttempt(state: DemoState, attempt: Attempt): DemoState {
  const drafts = { ...state.drafts };
  const topic =
    attempt.kind === "practice" ? attempt.results[0].topic : undefined;
  delete drafts[draftKey(attempt.studentId, topic)];
  return {
    ...state,
    drafts,
    attempts: state.attempts.some((a) => a.id === attempt.id)
      ? state.attempts
      : [...state.attempts, attempt],
  };
}
export const thresholds = { support: 60, proficient: 80 };
export const statusFor = (score?: number) =>
  score === undefined
    ? "Not assessed"
    : score < thresholds.support
      ? "Needs support"
      : score < thresholds.proficient
        ? "Developing"
        : "Proficient";
export function analyze(
  selected: Question[],
  answers: Record<string, number>,
): { score: number; results: TopicResult[] } {
  const results = topics.flatMap((t) => {
    const qs = selected.filter((q) => q.topic === t.id);
    if (!qs.length) return [];
    const correct = qs.filter((q) => answers[q.id] === q.correct).length;
    return [
      {
        topic: t.id,
        correct,
        total: qs.length,
        score: Math.round((correct / qs.length) * 100),
      },
    ];
  });
  return {
    results,
    score: selected.length
      ? Math.round(
          (results.reduce((n, r) => n + r.correct, 0) / selected.length) * 100,
        )
      : 0,
  };
}
export function selectQuestions(
  topic: TopicId | undefined,
  attemptCount: number,
) {
  const pick = (id: TopicId, count: number) => {
    const pool = questions.filter((q) => q.topic === id);
    return Array.from(
      { length: count },
      (_, i) => pool[(attemptCount * 3 + i) % pool.length],
    );
  };
  return topic ? pick(topic, 5) : topics.flatMap((t) => pick(t.id, 3));
}
export function latestResults(
  attempts: Attempt[],
  studentId: string,
): TopicResult[] {
  const records = attempts
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date));
  const map = new Map<TopicId, TopicResult>();
  records.forEach((a) => a.results.forEach((r) => map.set(r.topic, r)));
  return topics.flatMap((t) => (map.has(t.id) ? [map.get(t.id)!] : []));
}
export function comparableAttempts(attempts: Attempt[], topic: TopicId) {
  return attempts
    .filter(
      (a) =>
        a.kind === "practice" &&
        a.results.length === 1 &&
        a.results[0].topic === topic &&
        a.results[0].total === 5,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}
