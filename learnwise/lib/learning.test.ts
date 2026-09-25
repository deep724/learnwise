// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  analyze,
  comparableAttempts,
  latestResults,
  selectQuestions,
  statusFor,
} from "./quiz";
import {
  freshState,
  loadState,
  saveState,
  STORAGE_KEY,
  validateState,
} from "./storage";
import { recommendations } from "./recommendations";
import { classMetrics } from "./faculty";
import { questions } from "../data/questions";
import { topics } from "../data/topics";
import { curatedResponse } from "../data/assistantResponses";
import type { Attempt, DemoState } from "../types";
const practice = (
  studentId: string,
  correct: number,
  date = "2026-09-20T10:00:00Z",
): Attempt => {
  const qs = selectQuestions("joins", 0);
  const answers = Object.fromEntries(
    qs.map((q, i) => [q.id, i < correct ? q.correct : (q.correct + 1) % 4]),
  );
  return {
    id: date,
    studentId,
    date,
    kind: "practice",
    questions: qs.map((q) => q.id),
    answers,
    ...analyze(qs, answers),
  };
};
beforeEach(() => localStorage.clear());
describe("assessment rules", () => {
  it("builds a 12-question diagnostic with 3 questions per topic", () => {
    const qs = selectQuestions(undefined, 0);
    expect(qs).toHaveLength(12);
    for (const t of topics)
      expect(qs.filter((q) => q.topic === t.id)).toHaveLength(3);
  });
  it("varies five-question follow-up practice without duplicates", () => {
    const first = selectQuestions("joins", 0),
      second = selectQuestions("joins", 1);
    expect(first).toHaveLength(5);
    expect(new Set(first.map((q) => q.id)).size).toBe(5);
    expect(second.map((q) => q.id)).not.toEqual(first.map((q) => q.id));
  });
  it("keeps every question valid", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.options[q.correct]).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(20);
    });
  });
  it("scores answers per topic without inventing unassessed results", () => {
    const attempt = practice("student-1", 3);
    expect(attempt.score).toBe(60);
    expect(attempt.results).toEqual([
      { topic: "joins", correct: 3, total: 5, score: 60 },
    ]);
  });
  it("uses exact threshold boundaries", () => {
    expect([undefined, 0, 59, 60, 79, 80, 100].map(statusFor)).toEqual([
      "Not assessed",
      "Needs support",
      "Needs support",
      "Developing",
      "Developing",
      "Proficient",
      "Proficient",
    ]);
  });
  it("retains older topic results when a new attempt covers just one topic", () => {
    const s = freshState();
    const old = latestResults(s.attempts, "student-1").find(
      (r) => r.topic === "basics",
    );
    s.attempts.push(practice("student-1", 5, "2099-01-01T00:00:00Z"));
    const latest = latestResults(s.attempts, "student-1");
    expect(latest.find((r) => r.topic === "joins")?.score).toBe(100);
    expect(latest.find((r) => r.topic === "basics")).toEqual(old);
  });
  it("compares only five-question practice with matching coverage", () => {
    const s = freshState();
    s.attempts.push(practice("student-1", 3));
    expect(comparableAttempts(s.attempts, "joins")).toHaveLength(1);
    expect(comparableAttempts(s.attempts, "basics")).toHaveLength(0);
  });
});
describe("recommendations and class metrics", () => {
  it("requires unassessed and developing prerequisites, including transitive prerequisites", () => {
    const s = freshState();
    s.attempts = [practice(s.profileId, 5)];
    expect(
      recommendations(s, s.profileId).find((r) => r.topic.id === "subqueries")
        ?.target,
    ).toBe("basics");
    expect(
      recommendations(s, s.profileId).find(
        (r) => r.topic.id === "normalization",
      )?.reason,
    ).toContain("not assessed");
    const qs = selectQuestions("basics", 0);
    const answers = Object.fromEntries(
      qs.map((q, i) => [q.id, i < 3 ? q.correct : (q.correct + 1) % 4]),
    );
    s.attempts.push({
      id: "basics",
      studentId: s.profileId,
      date: new Date().toISOString(),
      kind: "practice",
      questions: qs.map((q) => q.id),
      answers,
      ...analyze(qs, answers),
    });
    expect(
      recommendations(s, s.profileId).find((r) => r.topic.id === "joins")
        ?.target,
    ).toBe("basics");
  });
  it("does not treat an unassessed topic as a weakness", () => {
    const s = freshState();
    s.attempts = [];
    expect(
      recommendations(s, s.profileId).every((r) => r.status === "Not assessed"),
    ).toBe(true);
    expect(classMetrics(s).average).toBeUndefined();
    expect(classMetrics(s).needingSupport).toBe(0);
  });
  it("uses only active resources and never promotes study activity to proficiency", () => {
    const s = freshState();
    const before = recommendations(s, s.profileId);
    s.studied.push({
      studentId: s.profileId,
      resourceId: "joins-1",
      date: new Date().toISOString(),
    });
    expect(recommendations(s, s.profileId)).toEqual(before);
    s.resources = s.resources.map((r) =>
      r.topic === "joins" ? { ...r, archived: true } : r,
    );
    expect(
      recommendations(s, s.profileId).find((r) => r.topic.id === "joins")
        ?.resource,
    ).toBeUndefined();
  });
  it("reviews a weak assessed prerequisite before progression", () => {
    const s = freshState();
    const attempt = s.attempts.find((a) => a.studentId === s.profileId)!;
    s.attempts = [
      {
        ...attempt,
        results: [
          { topic: "basics", correct: 0, total: 3, score: 0 },
          { topic: "joins", correct: 3, total: 3, score: 100 },
        ],
      },
    ];
    const rec = recommendations(s, s.profileId).find(
      (r) => r.topic.id === "joins",
    )!;
    expect(rec.target).toBe("basics");
    expect(rec.reason).toContain("Review SQL Basics first");
  });
  it("excludes unassessed students and respects class and topic filters", () => {
    const s = freshState();
    s.attempts = [practice("student-1", 3), practice("student-2", 5)];
    const m = classMetrics(s, "CE–A", "joins");
    expect(m.assessed).toBe(2);
    expect(m.average).toBe(80);
    expect(m.assessmentCount).toBe(2);
    expect(m.topicStats[0].count).toBe(2);
    expect(classMetrics(s, "CE–B").average).toBeUndefined();
  });
});
describe("browser persistence", () => {
  it("migrates existing version-one records without losing edits or attempts", () => {
    const s = freshState() as unknown as Record<string, unknown>;
    delete s.sessionActive;
    delete s.drafts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    const loaded = loadState();
    expect(loaded.notice).toBeUndefined();
    expect(loaded.state.drafts).toEqual({});
    expect(loaded.state.sessionActive).toBe(false);
    expect(loaded.state.attempts).toEqual(s.attempts);
  });
  it("validates drafts and rejects duplicate identities and incomplete submitted attempts", () => {
    const s = freshState();
    s.drafts[s.profileId] = {
      id: "draft",
      topic: "joins",
      questions: selectQuestions("joins", 0).map((q) => q.id),
      answers: {},
    };
    expect(validateState(s)).toBe(true);
    s.drafts[s.profileId].answers = { missing: 0 };
    expect(validateState(s)).toBe(false);
    s.drafts = {};
    s.attempts[0].answers = {};
    expect(validateState(s)).toBe(false);
    const duplicate = freshState();
    duplicate.students.push(duplicate.students[0]);
    expect(validateState(duplicate)).toBe(false);
  });
  it("seeds once and persists profile, role, assignment, bookmark and content changes", () => {
    const s = freshState();
    s.profileId = "student-2";
    s.role = "faculty";
    s.bookmarks["student-2"] = ["joins-1"];
    s.assignments.push({
      id: "a1",
      studentId: "student-2",
      resourceId: "joins-1",
      date: new Date().toISOString(),
    });
    s.resources[0].title = "Edited title";
    saveState(s);
    const loaded = loadState().state;
    expect(loaded.profileId).toBe("student-2");
    expect(loaded.role).toBe("faculty");
    expect(loaded.assignments).toEqual(s.assignments);
    expect(loaded.bookmarks["student-2"]).toEqual(["joins-1"]);
    expect(loaded.resources[0].title).toBe("Edited title");
  });
  it("recovers gracefully from malformed JSON and invalid nested values", () => {
    localStorage.setItem(STORAGE_KEY, "{bad");
    expect(loadState().notice).toBeTruthy();
    const s = freshState();
    (s as unknown as Record<string, unknown>).resources = [{}];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    expect(loadState().notice).toBeTruthy();
    expect(loadState().state.resources).toHaveLength(12);
  });
  it("recomputes saved scores from question answers", () => {
    const s = freshState();
    s.attempts[0].score = 900;
    s.attempts[0].results = [];
    saveState(s);
    const loaded = loadState().state;
    expect(loaded.attempts[0].score).toBeLessThanOrEqual(100);
    expect(loaded.attempts[0].results).toHaveLength(4);
  });
  it("restores fresh seed data on reset and rejects invalid profile IDs", () => {
    const s = freshState();
    s.resources[0].title = "Changed";
    saveState(freshState());
    expect(loadState().state.resources[0].title).not.toBe("Changed");
    expect(validateState({ ...s, profileId: "missing" } as DemoState)).toBe(
      false,
    );
  });
});
describe("curated assistant", () => {
  it("supports topic explanations and context-aware followups", () => {
    expect(curatedResponse("Explain INNER JOIN simply.").topic).toBe("joins");
    expect(curatedResponse("Show an example", "subqueries").text).toContain(
      "SELECT",
    );
  });
  it("does not turn unrelated prompts into invented answers", () => {
    expect(curatedResponse("Write a poem about Mars", "joins").text).toContain(
      "can’t answer arbitrary questions",
    );
  });
});
