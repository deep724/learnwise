import { seedResources } from "../data/resources";
import { demoStudents, seedAttempts } from "../data/demoStudents";
import { questions } from "../data/questions";
import { analyze, draftKey } from "./quiz";
import type { DemoState } from "../types";
export const STORAGE_KEY = "learnwise-demo-v1";
export const RECOVERY_KEY = "learnwise-demo-recovery";
let pendingRecovery: string | undefined;
export function freshState(): DemoState {
  return {
    version: 1,
    sessionActive: false,
    drafts: {},
    role: "student",
    profileId: "student-1",
    students: structuredClone(demoStudents),
    resources: structuredClone(seedResources),
    attempts: seedAttempts(),
    bookmarks: { "student-1": ["joins-2", "normalization-1"] },
    studied: [
      {
        studentId: "student-1",
        resourceId: "basics-1",
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    assignments: [],
  };
}
const str = (v: unknown): v is string => typeof v === "string";
const topic = (v: unknown) =>
  ["basics", "joins", "normalization", "subqueries"].includes(String(v));
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const validDate = (v: unknown) => str(v) && Number.isFinite(Date.parse(v));
export function validateState(value: unknown): value is DemoState {
  if (
    !record(value) ||
    value.version !== 1 ||
    !["student", "faculty"].includes(String(value.role))
  )
    return false;
  if (
    !Array.isArray(value.students) ||
    !value.students.length ||
    !value.students.every(
      (s) =>
        record(s) &&
        ["id", "name", "initials", "program", "semester", "classId"].every(
          (k) => str(s[k]),
        ),
    )
  )
    return false;
  const ids = value.students.map((s) => s.id);
  if (new Set(ids).size !== ids.length) return false;
  if (
    value.sessionActive !== undefined &&
    typeof value.sessionActive !== "boolean"
  )
    return false;
  if (
    value.drafts !== undefined &&
    (!record(value.drafts) ||
      !Object.entries(value.drafts).every(
        ([id, d]) =>
          record(d) &&
          (ids.includes(id) ||
            ids.some(
              (studentId) =>
                id ===
                draftKey(
                  studentId,
                  d.topic as import("../types").TopicId | undefined,
                ),
            )) &&
          str(d.id) &&
          (d.topic === undefined || topic(d.topic)) &&
          Array.isArray(d.questions) &&
          d.questions.length === (d.topic ? 5 : 12) &&
          new Set(d.questions).size === d.questions.length &&
          d.questions.every((qid) =>
            questions.some(
              (q) => q.id === qid && (!d.topic || q.topic === d.topic),
            ),
          ) &&
          record(d.answers) &&
          Object.entries(d.answers).every(
            ([qid, answer]) =>
              (d.questions as unknown[]).includes(qid) &&
              Number.isInteger(answer) &&
              Number(answer) >= 0 &&
              Number(answer) < 4,
          ),
      ))
  )
    return false;
  if (!ids.includes(value.profileId)) return false;
  if (
    !Array.isArray(value.resources) ||
    !value.resources.every(
      (r) =>
        record(r) &&
        ["id", "title", "description", "content"].every((k) => str(r[k])) &&
        topic(r.topic) &&
        ["Lesson", "Worked example", "Practice exercise"].includes(
          String(r.type),
        ) &&
        ["Beginner", "Intermediate"].includes(String(r.difficulty)) &&
        Number.isInteger(r.minutes) &&
        Number(r.minutes) > 0 &&
        Array.isArray(r.takeaways) &&
        r.takeaways.every(str) &&
        (r.archived === undefined || typeof r.archived === "boolean"),
    )
  )
    return false;
  if (
    !Array.isArray(value.attempts) ||
    !value.attempts.every(
      (a) =>
        record(a) &&
        str(a.id) &&
        ids.includes(a.studentId) &&
        validDate(a.date) &&
        ["diagnostic", "practice"].includes(String(a.kind)) &&
        Array.isArray(a.questions) &&
        a.questions.length > 0 &&
        a.questions.every((id) => questions.some((q) => q.id === id)) &&
        new Set(a.questions).size === a.questions.length &&
        record(a.answers) &&
        Object.keys(a.answers).length === a.questions.length &&
        Object.entries(a.answers).every(
          ([key, v]) =>
            a.questions instanceof Array &&
            a.questions.includes(key) &&
            Number.isInteger(v) &&
            Number(v) >= 0 &&
            Number(v) < 4,
        ),
    )
  )
    return false;
  if (
    new Set(value.resources.map((r) => r.id)).size !== value.resources.length ||
    new Set(value.attempts.map((a) => a.id)).size !== value.attempts.length
  )
    return false;
  if (
    !record(value.bookmarks) ||
    !Object.values(value.bookmarks).every(
      (b) => Array.isArray(b) && b.every(str),
    )
  )
    return false;
  if (
    !Array.isArray(value.studied) ||
    !value.studied.every(
      (a) =>
        record(a) &&
        ids.includes(a.studentId) &&
        str(a.resourceId) &&
        validDate(a.date),
    )
  )
    return false;
  if (
    !Array.isArray(value.assignments) ||
    !value.assignments.every(
      (a) =>
        record(a) &&
        str(a.id) &&
        ids.includes(a.studentId) &&
        str(a.resourceId) &&
        validDate(a.date),
    )
  )
    return false;
  return true;
}
export function loadState(): { state: DemoState; notice?: string } {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { state: freshState() };
    const parsed: unknown = JSON.parse(saved);
    if (!validateState(parsed)) throw Error("Invalid data");
    parsed.sessionActive = parsed.sessionActive === true;
    parsed.drafts ??= {};
    parsed.drafts = Object.fromEntries(
      Object.entries(parsed.drafts).map(([key, draft]) => [
        parsed.students.some((s) => s.id === key)
          ? draftKey(key, draft.topic)
          : key,
        draft,
      ]),
    );
    parsed.attempts = parsed.attempts.map((a) => ({
      ...a,
      ...analyze(
        a.questions.map((id) => questions.find((q) => q.id === id)!),
        a.answers,
      ),
    }));
    return { state: parsed };
  } catch {
    pendingRecovery = saved ?? undefined;
    return {
      state: freshState(),
      notice:
        "Saved demo data could not be read. A fresh demo is shown; the original is retained for recovery.",
    };
  }
}
export function saveState(state: DemoState) {
  if (pendingRecovery !== undefined) {
    localStorage.setItem(RECOVERY_KEY, pendingRecovery);
    pendingRecovery = undefined;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
