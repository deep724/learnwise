import { thresholds } from "./quiz";
import { latestResults } from "./quiz";
import { topics } from "../data/topics";
import type { DemoState, TopicId } from "../types";
export function classMetrics(
  state: DemoState,
  classId = "all",
  topicId = "all",
) {
  const students = state.students.filter(
    (s) => classId === "all" || s.classId === classId,
  );
  const rows = students.map((student) => ({
    student,
    results: latestResults(state.attempts, student.id).filter(
      (r) => topicId === "all" || r.topic === topicId,
    ),
  }));
  const assessed = rows.filter((r) => r.results.length).length;
  const needingSupport = rows.filter((r) =>
    r.results.some((t) => t.score < thresholds.support),
  ).length;
  const topicStats = topics
    .filter((t) => topicId === "all" || t.id === topicId)
    .map((t) => {
      const records = rows.flatMap((r) =>
        r.results.filter((r) => r.topic === t.id),
      );
      return {
        ...t,
        count: records.length,
        average: records.length
          ? Math.round(
              records.reduce((n, r) => n + r.score, 0) / records.length,
            )
          : undefined,
        support: records.filter((r) => r.score < thresholds.support).length,
      };
    });
  const all = rows.flatMap((r) => r.results);
  const average = all.length
    ? Math.round(all.reduce((n, r) => n + r.score, 0) / all.length)
    : undefined;
  return {
    students,
    rows,
    assessed,
    needingSupport,
    topicStats,
    average,
    assessmentCount: all.length,
  };
}
export type FacultyMetrics = ReturnType<typeof classMetrics>;
export const topicParam = (value: string): TopicId | undefined =>
  topics.find((t) => t.id === value)?.id;
