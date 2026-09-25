import { topics } from "../data/topics";
import { latestResults, statusFor, thresholds } from "./quiz";
import type { DemoState, TopicId } from "../types";
export function recommendations(state: DemoState, studentId: string) {
  const results = latestResults(state.attempts, studentId);
  return topics
    .map((topic) => {
      const result = results.find((r) => r.topic === topic.id);
      let prerequisiteTopic = topic.prerequisite;
      let blockedTopic: TopicId | undefined;
      while (prerequisiteTopic) {
        const assessed = results.find((r) => r.topic === prerequisiteTopic);
        if (!assessed || assessed.score < thresholds.proficient)
          blockedTopic = prerequisiteTopic;
        prerequisiteTopic = topics.find(
          (t) => t.id === prerequisiteTopic,
        )?.prerequisite;
      }
      const prerequisite = results.find((r) => r.topic === blockedTopic);
      const needsPrerequisite = !!blockedTopic;
      const next = topics.find(
        (t) =>
          t.prerequisite === topic.id &&
          !results.some(
            (r) => r.topic === t.id && r.score >= thresholds.proficient,
          ),
      );
      const target: TopicId = needsPrerequisite
        ? blockedTopic!
        : result && result.score >= thresholds.proficient && next
          ? next.id
          : topic.id;
      const targetResult = results.find((r) => r.topic === target);
      const desiredType =
        targetResult &&
        targetResult.score >= thresholds.support &&
        targetResult.score < thresholds.proficient
          ? "Worked example"
          : "Lesson";
      const available = state.resources.filter(
        (r) =>
          !r.archived &&
          r.topic === target &&
          ((targetResult && targetResult.score >= thresholds.support) ||
            r.difficulty === "Beginner"),
      );
      const resource =
        available.find((r) => r.type === desiredType) ?? available[0];
      const reason = needsPrerequisite
        ? `Review ${topics.find((t) => t.id === blockedTopic)!.name} first: ${prerequisite ? `${prerequisite.correct} of ${prerequisite.total} correct in your latest assessment. Reach ${thresholds.proficient}% before progressing.` : "this prerequisite is not assessed. Study it and take its topic quiz first."}`
        : !result
          ? "Take a topic quiz to establish your starting point."
          : result.score >= thresholds.proficient
            ? next
              ? `You answered ${result.correct} of ${result.total} correctly. Explore ${next.name} next.`
              : `You answered ${result.correct} of ${result.total} correctly. Keep your understanding fresh with practice.`
            : `You answered ${result.correct} of ${result.total} correctly. ${result.score < thresholds.support ? "Start with a beginner lesson, then practice." : "Revise the worked example, then try another quiz."}`;
      return {
        topic,
        result,
        resource,
        reason,
        status: statusFor(result?.score),
        target,
      };
    })
    .sort((a, b) => (a.result?.score ?? 101) - (b.result?.score ?? 101));
}
