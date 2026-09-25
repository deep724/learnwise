import { seedResources } from "./resources";
import type { TopicId } from "../types";
export const suggestedPrompts = [
  "Explain INNER JOIN simply.",
  "Show INNER JOIN versus LEFT JOIN.",
  "Explain normalization with an example.",
  "Help me understand subqueries.",
  "Why was my quiz answer wrong?",
];
const simple: Record<TopicId, string> = {
  basics:
    "Think of a table as a spreadsheet. SELECT chooses the columns you want to see. WHERE keeps only the rows that fit your question. ORDER BY puts those rows in order.",
  joins:
    "Imagine a student list and a department list. A JOIN lines them up using department IDs. INNER JOIN keeps matched pairs. LEFT JOIN keeps every student, including students without a matching department.",
  normalization:
    "Store each fact in one sensible place. If a department name is repeated in 50 student rows, changing it 50 times is error-prone. Put departments in their own table and let student rows refer to a department ID.",
  subqueries:
    "A subquery answers a smaller question inside a bigger question. To find above-average scores, first ask “What is the average?” Then use that answer to filter students.",
};
const practice: Record<TopicId, string> = {
  basics:
    "Try this: students has Aanya (84) and Rohan (52). What does SELECT name FROM students WHERE score >= 60 return?\n\nAnswer: Aanya. WHERE keeps only rows satisfying the condition.",
  joins:
    "Try this: Aanya has department 10, Rohan has department 30, and the departments table contains only ID 10. How many rows does a LEFT JOIN from students return?\n\nAnswer: two. Aanya matches department 10; Rohan is kept with NULL in the right-side columns.",
  normalization:
    "Try this: Employee(employee_id, department_id, department_name) repeats the department name. What should you split out?\n\nAnswer: Departments(department_id, department_name). Employees keep the department ID as a reference. This prevents inconsistent copies of a department name.",
  subqueries:
    "Try this: why does EXISTS return each student once even if they have three enrollments?\n\nAnswer: EXISTS is a true/false test on each outer student row. It checks for at least one matching enrollment and does not join all matching pairs.",
};
export function inferTopic(prompt: string): TopicId | undefined {
  const s = prompt.toLowerCase();
  if (/join|left vs|inner vs/.test(s)) return "joins";
  if (/normal|anomal|1nf|2nf|3nf/.test(s)) return "normalization";
  if (/subquer|nested|exists/.test(s)) return "subqueries";
  if (/sql basics|select|where|order by|primary key/.test(s)) return "basics";
}
export function curatedResponse(
  prompt: string,
  context?: TopicId,
): { text: string; topic?: TopicId } {
  const followup = [
    "Simpler explanation",
    "Show an example",
    "Give me a practice question",
  ].includes(prompt);
  const topic = inferTopic(prompt) ?? (followup ? context : undefined);
  if (!topic)
    return {
      text: prompt.toLowerCase().includes("quiz")
        ? "Open “Explain this answer” beneath a reviewed quiz question so I can show the exact question and its curated explanation. I can also help with SQL Basics, SQL JOINs, Normalization, and Subqueries."
        : "This demo supports curated explanations for SQL Basics, SQL JOINs, Normalization, and Subqueries. Try “Explain INNER JOIN simply” or choose one of the suggested prompts. I can’t answer arbitrary questions.",
    };
  if (prompt === "Give me a practice question")
    return { text: practice[topic], topic };
  if (
    prompt === "Simpler explanation" ||
    prompt.toLowerCase().includes("simply")
  )
    return { text: simple[topic], topic };
  return {
    text: seedResources.find((r) => r.topic === topic && r.type === "Lesson")!
      .content,
    topic,
  };
}
