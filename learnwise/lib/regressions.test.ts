// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  createAttempt,
  draftKey,
  recordAttempt,
  selectQuestions,
} from "./quiz";
import {
  freshState,
  loadState,
  RECOVERY_KEY,
  saveState,
  STORAGE_KEY,
} from "./storage";
import { uid } from "./utils";
import { resourceErrors } from "./resources";
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("migrates legacy drafts without losing answers and preserves other assessments when submitting", () => {
  const state = freshState();
  const qs = selectQuestions("basics", 0);
  state.drafts["student-1"] = {
    id: "old",
    topic: "basics",
    questions: qs.map((q) => q.id),
    answers: { [qs[0].id]: 2 },
  };
  saveState(state);
  const migrated = loadState().state;
  expect(migrated.drafts[draftKey("student-1", "basics")].answers).toEqual({
    [qs[0].id]: 2,
  });
  expect(migrated.drafts["student-1"]).toBeUndefined();
  migrated.drafts[draftKey("student-1", "joins")] = {
    id: "another",
    topic: "joins",
    questions: selectQuestions("joins", 0).map((q) => q.id),
    answers: {},
  };
  const answers = Object.fromEntries(qs.map((q) => [q.id, q.correct]));
  const attempt = createAttempt("old", "student-1", qs, answers, "basics");
  const submitted = recordAttempt(recordAttempt(migrated, attempt), attempt);
  expect(submitted.attempts.filter((a) => a.id === "old")).toHaveLength(1);
  expect(submitted.drafts[draftKey("student-1", "basics")]).toBeUndefined();
  expect(submitted.drafts[draftKey("student-1", "joins")].id).toBe("another");
  expect(() => createAttempt("bad", "student-1", qs, {}, "basics")).toThrow(
    "Answer every question",
  );
  expect(() =>
    createAttempt(
      "bad",
      "student-1",
      qs,
      { ...answers, [qs[0].id]: 100 },
      "basics",
    ),
  ).toThrow();
});

it("preserves unreadable originals before saving recovered demo data", () => {
  localStorage.setItem(STORAGE_KEY, "{damaged-original");
  const recovered = loadState();
  expect(localStorage.getItem(STORAGE_KEY)).toBe("{damaged-original");
  saveState(recovered.state);
  expect(localStorage.getItem(RECOVERY_KEY)).toBe("{damaged-original");
  expect(loadState().notice).toBeUndefined();
});

it("does not overwrite unreadable originals when making a recovery backup fails", () => {
  localStorage.setItem(STORAGE_KEY, "{keep-me");
  const recovered = loadState();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Full", "QuotaExceededError");
  });
  expect(() => saveState(recovered.state)).toThrow();
  expect(localStorage.getItem(STORAGE_KEY)).toBe("{keep-me");
  vi.restoreAllMocks();
  saveState(recovered.state);
});

it("generates unique valid IDs when randomUUID is absent", () => {
  vi.stubGlobal("crypto", {
    getRandomValues: crypto.getRandomValues.bind(crypto),
  });
  const ids = Array.from({ length: 1000 }, uid);
  expect(new Set(ids).size).toBe(1000);
  expect(
    ids.every((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      ),
    ),
  ).toBe(true);
});

it("validates whitespace, bounds, and required resource values", () => {
  const resource = freshState().resources[0];
  expect(resourceErrors(resource)).toEqual({});
  expect(
    Object.keys(
      resourceErrors({
        ...resource,
        title: "  ",
        description: "\n",
        content: " ",
        minutes: 1.5,
      }),
    ),
  ).toEqual(["title", "description", "content", "minutes"]);
  expect(resourceErrors({ ...resource, minutes: 241 }).minutes).toBeTruthy();
});
